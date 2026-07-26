# PDF → Word: modular build spec

Goal: convert a PDF into a `.docx` that looks as close to identical as
possible — text position, font, size, color, images — entirely client-side
(no server calls, consistent with the rest of freetool.shop).

**Honest framing up front:** "100% identical" and "a normally-editable Word
document" are in tension. PDF is fixed/absolute-positioned; DOCX is a
flowing format. The way commercial tools (Adobe's Export to Word) square
this is by dropping each paragraph into an absolutely-positioned floating
text box at its exact PDF coordinates — visually exact, but editing it
afterward means dragging boxes around, not reflowing text. That's the
trade we're making too (see "Fixed layout" mode in Stage C). We are not
using a server-side AI model — layout inference is done with heuristics in
the browser (see Stage B), and OCR (also in-browser, via `tesseract.js`,
already used by `ocr-tool`) is the only "AI" component, and only for
scanned/image-only pages.

## Pipeline

```
File (PDF)
  │
  ▼
[Stage A: Extraction]      pdf.js → per-page text runs (position/font/size/color) + images
  │
  ▼  RawDocumentModel (JSON)
  │
[Stage B: Structure]       heuristics → group runs into paragraphs/tables, detect alignment
  │
  ▼  DocumentModel (JSON)
  │
[Stage C: Generation]      docx.js → paragraphs/runs/images/tables → .docx Blob
  │
  ▼
Blob (.docx)
```

`Stage D` is the tool's UI/orchestration layer (upload, progress, mode
toggle, download) — it depends on the *types*, not the implementations, so
it can be built in parallel against the fixtures below.

**Why this split works for parallel work:** the only thing every
contributor needs to agree on up front is [`types.ts`](./types.ts) — the
two JSON contracts (`RawDocumentModel`, `DocumentModel`). Once that's
settled, all four stages can start on day one:

- Stage A person writes against `RawDocumentModel` as their output type.
- Stage B person writes against `RawDocumentModel` as input, `DocumentModel`
  as output — using [`fixtures/sample-raw.json`](./fixtures/sample-raw.json)
  as a stand-in for Stage A's real output until it exists.
- Stage C person writes against `DocumentModel` as input — using
  [`fixtures/sample-document.json`](./fixtures/sample-document.json) as a
  stand-in for Stage B's real output.
- Stage D person wires the three together and can fake all of them with
  the fixtures while building the UI.

## Module boundaries

### Stage A — Extraction (`extraction/extractPdf.ts`)

```ts
export async function extractPdf(file: File): Promise<RawDocumentModel>
```

- **Library:** `pdfjs-dist` (not yet a dependency — needs adding; `pdf-lib`,
  which the repo already has for `merge-pdf`, is for creating/editing PDFs,
  not for this kind of granular text extraction).
- Per page: `page.getTextContent()` gives text items with a transform
  matrix (→ x/y/rotation) and an internal font ref.
- Font family/bold/italic: resolve via `page.commonObjs`/font descriptor.
  Getting the *exact* embedded font is hard and out of scope for v1 — map
  to a "nearest standard font" (serif/sans/mono + bold/italic flags)
  instead. Flag this as the biggest scope-control decision for this stage.
- Fill color: not exposed directly by `getTextContent()`. Walk
  `page.getOperatorList()` and track `setFillRGBColor`/`setFillColorN` ops
  interleaved with text-showing ops, correlated by operator index. This is
  the trickiest part of this stage — budget extra time for it.
- Images: from `getOperatorList()`, find `paintImageXObject` ops, resolve
  via `page.objs.get(id)` for bitmap data, use the CTM at that point for
  position/size.
- **Scanned-page fallback:** if a page has ~0 text items relative to its
  image coverage, treat it as scanned — render the page to a canvas via
  pdf.js, run it through `tesseract.js` (reuse the wrapper pattern from
  `src/tools/ocr-tool/index.tsx`) to get text + bounding boxes. Mark
  `isScanned: true`; there's no real font/color data here, so default
  `fontFamily` to something generic and `color` to `#000000`.
- Run this off the main thread (see "Performance" below) — parsing +
  OCR on a multi-page PDF is exactly the kind of work that freezes a tab if
  left on the UI thread.

### Stage B — Structure inference (`structure/inferStructure.ts`)

```ts
export function inferStructure(raw: RawDocumentModel): DocumentModel
```

Pure, synchronous, no I/O — easiest stage to unit test.

- **Lines:** cluster text items by similar baseline `y` (tolerance relative
  to font size), sort by `x`.
- **Paragraphs:** group consecutive lines with similar left `x` and small
  line-gaps; break on a larger vertical gap or an indentation change.
- **Alignment:** compare each paragraph's line start/end offsets against
  page margins → `left` / `center` / `right` / `justify`.
- **Tables — deliberately descoped for v1:** real grid/table detection
  (repeated column x-positions across rows) is a hard, separate problem.
  Because Stage C's "fixed layout" mode positions every paragraph at its
  exact coordinates anyway, a table *looks* correct even when it's encoded
  as a bunch of independently-positioned paragraph blocks rather than a
  semantic `TableBlock`. Ship v1 without table detection; treat it as a
  clearly-scoped v2 module once the pipeline is working end to end.
- **Images:** pass through as `ImageBlock`s at their extracted position.

### Stage C — DOCX generation (`generate/generateDocx.ts`)

```ts
export async function generateDocx(
  doc: DocumentModel,
  opts: { layoutMode: 'flowing' | 'fixed' }
): Promise<Blob>
```

- **Library:** `docx` (dolanmiu/docx) — not yet a dependency, needs adding.
  It packages the `.docx` zip internally; the repo already has `jszip` for
  other tools, so there's no new zip-handling concept being introduced.
- **Two render modes — expose as a user-facing toggle, default to `fixed`:**
  - `flowing`: normal Word paragraphs with the detected alignment. Best
    editability, best for simple text-only documents, will drift from the
    original for anything with precise layout.
  - `fixed`: every paragraph/image goes into an absolutely-positioned
    floating text frame at its extracted `x`/`y`. This is what "100%
    identical" actually means in practice — matches the Adobe-style
    approach — at the cost of Word-editing convenience afterward.
- Map `TextRun` → docx `Run` (font family/size/bold/italic/color).
- Map `ImageBlock` → docx `ImageRun` with a floating/absolute anchor.
- Output a `Blob`; follow the existing tool convention for the download
  link (`URL.createObjectURL` + revoke — see the pattern in
  `image-to-gif/index.tsx`, and make sure to revoke once the download
  fires, unlike the bug we just fixed in a few other tools).

### Stage D — UI / orchestration (`index.tsx`)

- Upload UI, per-stage progress (extraction % complete, OCR page X of Y,
  etc.), the flowing/fixed mode toggle, error states, download button.
- Calls Stage A → B → C. While the other stages are in progress, this can
  be built entirely against the fixture JSON files, so it does not block
  on anyone else.
- Add the `toolRegistry.ts` entry (`category: 'Document'`, `inputType:
  ['pdf']`, `outputType: ['word']`, `type: 'heavy'`, lazy-loaded component)
  once the tool is functional — follow the `merge-pdf`/`word-to-pdf`
  entries as the template.

## Performance

PDF parsing, OCR, and docx generation are all CPU-heavy. Don't run them on
the main thread — the codebase already has ad hoc per-tool Web Workers for
exactly this reason (`image-compressor/compression.worker.ts`,
`json-formatter/jsonWorker.ts`); follow that pattern rather than
introducing a new shared worker abstraction. Whoever builds Stage D should
decide whether extraction+structure run in one worker and generation in
another, or all three are chained inside a single worker to avoid
transferring large intermediate JSON across worker boundaries more than
once.

## New dependencies to add (not yet in `package.json`)

- `pdfjs-dist` — Stage A
- `docx` — Stage C

(`pdf-lib`, `jszip`, and `tesseract.js` are already present and get reused
as noted above.)

## Suggested folder layout

```
src/tools/pdf-to-word/
  types.ts                    # the shared contract — read this first
  SPEC.md                     # this file
  index.tsx                   # Stage D
  extraction/
    extractPdf.ts              # Stage A
    extractPdf.worker.ts
    ocrFallback.ts              # scanned-page path, reuses tesseract.js
  structure/
    inferStructure.ts           # Stage B
  generate/
    generateDocx.ts              # Stage C
    generateDocx.worker.ts
  fixtures/
    sample-raw.json              # example RawDocumentModel, for Stage B/D dev
    sample-document.json         # example DocumentModel, for Stage C/D dev
```
