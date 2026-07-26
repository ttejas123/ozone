// Scanned-page fallback for Stage A. Reuses the tesseract.js worker pattern
// already established in src/tools/ocr-tool/index.tsx. Renders the PDF page
// to a canvas via pdf.js, then OCRs that canvas and turns tesseract's
// word-level bounding boxes into RawTextItem entries in the same
// {points, top-left origin} coordinate space as the rest of extraction.

import type { PDFPageProxy } from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import type { RawTextItem } from '../types';

// ~144 DPI (72 * 2): enough resolution for solid OCR accuracy without
// making the render/recognize step unreasonably slow on large pages.
const OCR_SCALE = 2;

export async function extractTextWithOcr(page: PDFPageProxy): Promise<RawTextItem[]> {
  const viewport = page.getViewport({ scale: OCR_SCALE });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  await page.render({ canvas, canvasContext: ctx, viewport }).promise;

  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(canvas, {}, { blocks: true });
    const items: RawTextItem[] = [];

    for (const block of data.blocks ?? []) {
      for (const paragraph of block.paragraphs ?? []) {
        for (const line of paragraph.lines ?? []) {
          for (const word of line.words ?? []) {
            const text = word.text?.trim();
            if (!text) continue;
            const { bbox } = word;
            const height = (bbox.y1 - bbox.y0) / OCR_SCALE;
            if (height <= 0) continue;

            items.push({
              text,
              x: bbox.x0 / OCR_SCALE,
              y: bbox.y1 / OCR_SCALE,
              width: (bbox.x1 - bbox.x0) / OCR_SCALE,
              height,
              // No real font/color data exists for OCR'd text — see
              // RawPage.isScanned in ../types.ts.
              fontFamily: 'Arial',
              fontSize: height,
              bold: false,
              italic: false,
              color: '#000000',
              rotation: 0,
            });
          }
        }
      }
    }

    return items;
  } finally {
    await worker.terminate();
  }
}
