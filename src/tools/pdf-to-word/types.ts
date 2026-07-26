// Shared contract for the pdf-to-word pipeline. See SPEC.md in this folder
// for the full design. Every stage imports only from this file — it is the
// one thing all contributors need to agree on before writing any stage code.
//
// Pipeline:
//   File (PDF)
//     -> [Stage A: extraction]     -> RawDocumentModel
//     -> [Stage B: structure]      -> DocumentModel
//     -> [Stage C: docx generation] -> Blob (.docx)

// ─────────────────────────────────────────────────────────────────────────
// Stage A -> B contract: raw, page-level data straight out of the PDF.
// No paragraph/table grouping yet — just positioned text runs and images.
// ─────────────────────────────────────────────────────────────────────────

export interface RawDocumentModel {
  pages: RawPage[];
}

export interface RawPage {
  /** Page size in points (72pt = 1in), matching the PDF page box. */
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
  /**
   * True when the page had no (or a near-empty) text layer and textItems
   * were produced by OCR (tesseract.js) instead of the PDF content stream.
   * Stage B and Stage C can use this to lower confidence in font/color data.
   */
  isScanned: boolean;
  textItems: RawTextItem[];
  images: RawImageItem[];
}

export interface RawTextItem {
  text: string;
  /** Left edge, in points, measured from the page's top-left corner. */
  x: number;
  /** Baseline, in points, measured from the page's top-left corner. */
  y: number;
  width: number;
  height: number;
  /** Best-effort resolved family name (e.g. "Helvetica", "Times New Roman"). */
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  /** Hex color, e.g. "#1a1a1a". OCR fallback defaults to "#000000". */
  color: string;
  /** Degrees, for rotated text runs. */
  rotation: number;
}

export interface RawImageItem {
  x: number;
  y: number;
  width: number;
  height: number;
  /** data: URL (PNG or JPEG) of the extracted bitmap. */
  dataUrl: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Stage B -> C contract: semantic blocks ready to render into a docx.
// ─────────────────────────────────────────────────────────────────────────

export interface DocumentModel {
  sections: DocSection[];
}

export interface DocSection {
  pageWidth: number;
  pageHeight: number;
  blocks: DocBlock[];
}

export type DocBlock = ParagraphBlock | TableBlock | ImageBlock;

export interface ParagraphBlock {
  type: 'paragraph';
  alignment: 'left' | 'center' | 'right' | 'justify';
  /** Absolute position on the page, in points. Used by "fixed layout" render mode. */
  x: number;
  y: number;
  runs: TextRun[];
}

export interface TextRun {
  text: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  color: string;
}

export interface TableBlock {
  type: 'table';
  x: number;
  y: number;
  /** rows -> cells -> runs */
  rows: TextRun[][][];
}

export interface ImageBlock {
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Stage function signatures (each stage is one pure-ish async function).
// ─────────────────────────────────────────────────────────────────────────

export type ExtractPdf = (file: File) => Promise<RawDocumentModel>;
export type InferStructure = (raw: RawDocumentModel) => DocumentModel;
export type GenerateDocx = (
  doc: DocumentModel,
  opts: { layoutMode: 'flowing' | 'fixed' }
) => Promise<Blob>;
