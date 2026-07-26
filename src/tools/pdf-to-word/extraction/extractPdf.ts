// Stage A — Extraction. See ../SPEC.md and ../types.ts for the contract.
//
// Turns a PDF File into a RawDocumentModel: per-page text runs (position,
// font, size, color) plus embedded images, in the coordinate space
// {x, y in points, origin at the page's top-left, y increasing downward}.
//
// Scope notes (see SPEC.md "Stage A" for the full rationale):
// - Font family is resolved to a "nearest standard font" (serif/sans/mono),
//   not the exact embedded font — getting the literal embedded font family
//   into a .docx isn't practical without shipping the font itself.
// - Fill color is recovered by walking the page's operator list and
//   tracking `setFill*` ops, then mapping that timeline onto the text
//   items proportionally. This is a best-effort heuristic (documented
//   in trackFillColors below) — it can't be a byte-exact correlation
//   because pdf.js's text-content and operator-list extraction don't
//   share one canonical index space.
// - Inline images (`paintInlineImageXObject`) are not extracted, only
//   XObject images (`paintImageXObject`) — inline images are rare and
//   mostly used for small masks/patterns, not photos or figures.
// - A page with zero extractable text is treated as scanned and falls
//   back to OCR (see ./ocrFallback.ts).

import * as pdfjsLib from 'pdfjs-dist';
import type { PDFPageProxy } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import type { RawDocumentModel, RawPage, RawTextItem, RawImageItem } from '../types';
import { extractTextWithOcr } from './ocrFallback';

if (typeof window !== 'undefined') {
  // Self-hosted worker (bundled by webpack), not a CDN — keeps this fully
  // client-side/offline-capable like the rest of the site.
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

const { OPS, Util } = pdfjsLib;

export interface ExtractProgress {
  page: number;
  totalPages: number;
  stage: 'parsing' | 'ocr';
}

export async function extractPdf(
  file: File,
  onProgress?: (progress: ExtractProgress) => void
): Promise<RawDocumentModel> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const pages: RawPage[] = [];

  try {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      onProgress?.({ page: pageNum, totalPages: pdf.numPages, stage: 'parsing' });

      const page = await pdf.getPage(pageNum);
      let rawPage: RawPage;
      try {
        rawPage = await extractPage(page);
        if (rawPage.textItems.length === 0) {
          onProgress?.({ page: pageNum, totalPages: pdf.numPages, stage: 'ocr' });
          const ocrItems = await extractTextWithOcr(page);
          rawPage = { ...rawPage, textItems: ocrItems, isScanned: true };
        }
      } catch (err) {
        // Never let one broken page abort the whole document — ship it
        // as a blank page rather than failing the entire conversion.
        console.error(`pdf-to-word: failed to extract page ${pageNum}`, err);
        const viewport = page.getViewport({ scale: 1 });
        rawPage = {
          width: viewport.width,
          height: viewport.height,
          rotation: 0,
          isScanned: false,
          textItems: [],
          images: [],
        };
      } finally {
        page.cleanup();
      }

      pages.push(rawPage);
      // Yield to the browser between pages so progress UI can repaint and
      // the tab doesn't appear frozen on large documents.
      await new Promise(requestAnimationFrame);
    }
  } finally {
    await pdf.destroy();
  }

  return { pages };
}

async function extractPage(page: PDFPageProxy): Promise<RawPage> {
  // `rotation` defaults to the page's own /Rotate value, so the viewport
  // (and therefore every coordinate we derive from it below) is already
  // normalized to the page's correct visual orientation — nothing further
  // needs to be done with rotation downstream.
  const viewport = page.getViewport({ scale: 1 });

  const [textContent, operatorList] = await Promise.all([
    page.getTextContent(),
    page.getOperatorList(),
  ]);

  const colorTimeline = trackFillColors(operatorList);
  const images = extractImages(page, operatorList, viewport);

  const validItems = textContent.items.filter(
    (item): item is TextItem => 'str' in item && item.str.length > 0
  );

  const textItems: RawTextItem[] = validItems.map((item, index) => {
    const tx = Util.transform(viewport.transform, item.transform);
    const fontSize = Math.hypot(tx[2], tx[3]) || item.height || 1;
    const angle = Math.atan2(tx[1], tx[0]);
    const style = textContent.styles[item.fontName];
    const { fontFamily, bold, italic } = resolveFont(page, item.fontName, style);

    const colorIndex = colorTimeline.length
      ? Math.min(
          Math.floor((index * colorTimeline.length) / validItems.length),
          colorTimeline.length - 1
        )
      : -1;

    return {
      text: item.str,
      x: tx[4],
      y: tx[5],
      width: item.width,
      height: fontSize,
      fontFamily,
      fontSize,
      bold,
      italic,
      color: colorIndex >= 0 ? colorTimeline[colorIndex] : '#000000',
      rotation: Math.round((angle * 180) / Math.PI),
    };
  });

  return {
    width: viewport.width,
    height: viewport.height,
    rotation: 0,
    isScanned: false,
    textItems,
    images,
  };
}

function resolveFont(
  page: PDFPageProxy,
  fontName: string,
  style: { fontFamily: string } | undefined
): { fontFamily: string; bold: boolean; italic: boolean } {
  let generic = style?.fontFamily ?? 'sans-serif';
  let bold = false;
  let italic = false;

  try {
    // The resolved Font object (available once getTextContent/getOperatorList
    // have run) exposes real bold/italic flags and a generic fallback family —
    // far more reliable than guessing from the font's name string.
    const fontObj = page.commonObjs.get(fontName) as
      | { bold?: boolean; black?: boolean; italic?: boolean; fallbackName?: string }
      | undefined;
    if (fontObj) {
      bold = !!(fontObj.bold || fontObj.black);
      italic = !!fontObj.italic;
      if (fontObj.fallbackName) generic = fontObj.fallbackName;
    }
  } catch {
    // Font object not resolved yet (rare) — fall back to the TextStyle-only
    // generic family and assume regular weight/style.
  }

  return { fontFamily: genericToWordFont(generic), bold, italic };
}

function genericToWordFont(generic: string): string {
  if (generic.includes('monospace')) return 'Courier New';
  if (generic.includes('serif') && !generic.includes('sans')) return 'Times New Roman';
  return 'Arial';
}

/**
 * Walks the page's operator list tracking the active fill color, recording
 * one timeline entry per text-showing operation. Correlated to actual text
 * items proportionally in extractPage (see the module doc comment above) —
 * pdf.js doesn't expose a direct index mapping between the two, so an exact
 * op-index correlation would silently desync on documents where the text
 * layer's item count differs from the operator list's show-text op count.
 */
function trackFillColors(operatorList: { fnArray: number[]; argsArray: unknown[] }): string[] {
  const timeline: string[] = [];
  let current = '#000000';
  const { fnArray, argsArray } = operatorList;

  for (let i = 0; i < fnArray.length; i++) {
    const fn = fnArray[i];
    const args = argsArray[i] as number[];

    switch (fn) {
      case OPS.setFillGray:
        current = grayToHex(args[0]);
        break;
      case OPS.setFillRGBColor:
        current = rgbToHex(args[0], args[1], args[2]);
        break;
      case OPS.setFillCMYKColor:
        current = cmykToHex(args[0], args[1], args[2], args[3]);
        break;
      case OPS.setFillColorN:
      case OPS.setFillColor:
        if (Array.isArray(args) && args.every((a) => typeof a === 'number')) {
          if (args.length === 1) current = grayToHex(args[0]);
          else if (args.length === 3) current = rgbToHex(args[0], args[1], args[2]);
          else if (args.length === 4) current = cmykToHex(args[0], args[1], args[2], args[3]);
        }
        break;
      case OPS.showText:
      case OPS.nextLineShowText:
      case OPS.nextLineSetSpacingShowText:
        timeline.push(current);
        break;
    }
  }

  return timeline;
}

function extractImages(
  page: PDFPageProxy,
  operatorList: { fnArray: number[]; argsArray: unknown[] },
  viewport: { transform: number[]; width: number; height: number }
): RawImageItem[] {
  const images: RawImageItem[] = [];
  const { fnArray, argsArray } = operatorList;
  let ctm: number[] = [1, 0, 0, 1, 0, 0];
  const stack: number[][] = [];

  for (let i = 0; i < fnArray.length; i++) {
    const fn = fnArray[i];
    const args = argsArray[i];

    if (fn === OPS.save) {
      stack.push(ctm);
    } else if (fn === OPS.restore) {
      ctm = stack.pop() ?? ctm;
    } else if (fn === OPS.transform) {
      ctm = Util.transform(ctm, args as number[]);
    } else if (fn === OPS.paintImageXObject) {
      const objId = (args as [string])[0];
      try {
        const imgData = page.objs.get(objId) as
          | { bitmap?: CanvasImageSource; width: number; height: number }
          | undefined;
        if (!imgData?.bitmap) continue;

        const combined = Util.transform(viewport.transform, ctm);
        const corners = [
          applyMatrix(0, 0, combined),
          applyMatrix(1, 0, combined),
          applyMatrix(0, 1, combined),
          applyMatrix(1, 1, combined),
        ];
        const xs = corners.map((c) => c[0]);
        const ys = corners.map((c) => c[1]);
        const x = Math.min(...xs);
        const y = Math.min(...ys);
        const width = Math.max(...xs) - x;
        const height = Math.max(...ys) - y;

        if (width > 1 && height > 1) {
          const dataUrl = bitmapToDataUrl(imgData.bitmap, imgData.width, imgData.height);
          if (dataUrl) images.push({ x, y, width, height, dataUrl });
        }
      } catch {
        // Image object not resolved — skip this image rather than fail the page.
      }
    }
  }

  return images;
}

function applyMatrix(x: number, y: number, m: number[]): [number, number] {
  return [x * m[0] + y * m[2] + m[4], x * m[1] + y * m[3] + m[5]];
}

function bitmapToDataUrl(bitmap: CanvasImageSource, width: number, height: number): string | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

function grayToHex(gray: number): string {
  const v = clampByte(gray * 255);
  return toHex(v, v, v);
}

function rgbToHex(r: number, g: number, b: number): string {
  return toHex(clampByte(r * 255), clampByte(g * 255), clampByte(b * 255));
}

function cmykToHex(c: number, m: number, y: number, k: number): string {
  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);
  return toHex(clampByte(r), clampByte(g), clampByte(b));
}

function clampByte(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
