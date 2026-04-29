# Office Parser Renderer

> A monorepo for Office OOXML parsing and preview-oriented rendering.

English | [简体中文](./README.md)

## Current Status

| Package | Status | Notes |
| --- | --- | --- |
| `@opr/shared` | in progress | core utilities, drawing/chart/rendering helpers, and the first `shared/ooxml` extraction exist |
| `@opr/xlsx` | usable, still under stabilization | the only format path with real parser and renderer behavior today |
| `@opr/docx` | not implemented | package shell only, no `DocxParser` or `DocxRenderer` yet |
| `@opr/pptx` | not implemented | no real package path has landed yet |

This README describes the repository as it exists today.
Roadmap targets for `docx` and `pptx` should not be read as already shipped features.

## What Exists Today

### Shared

- ZIP loading and XML parsing
- unit conversion, color parsing, and shared drawing/chart/rendering helpers
- shared OOXML loading layer:
  - `PackageReader`
  - `RelationshipsResolver`
  - `ContentTypesRegistry`

### XLSX

- workbook / worksheet / shared strings / styles parsing
- merge metadata, frozen panes, and multi-sheet metadata parsing
- sheet tabs, zoom, drag, and scrollbar interactions
- row and column header rendering
- current image, shape, and chart rendering flow

## What Is Still Missing

- real `docx` and `pptx` parser/renderer pipelines
- shared Theme / Font / Color models
- stable `xlsx` public navigation APIs such as `scrollToRow`, `scrollToCol`, `scrollToCell`, `getCell`, and `getCellByRef`
- sample corpus, visual regression, and performance baselines
- package build and project-boundary cleanup

## Roadmap Documents

- roadmap: [docs/docx_task.md](./docs/docx_task.md)
- M0 refactor design: [docs/ooxml-refactor-design.md](./docs/ooxml-refactor-design.md)
- `xlsx` gap list: [docs/xlsx-gap-list.md](./docs/xlsx-gap-list.md)
- sample corpus spec: [samples/README.md](./samples/README.md)

## Quick Start

Only the `xlsx` path should be treated as runnable today.

```typescript
import { XlsxParser, XlsxRenderer } from '@opr/xlsx';

const container = document.getElementById('xlsx-container');
const parser = new XlsxParser();
const renderer = new XlsxRenderer(container);

fetch('/path/to/workbook.xlsx')
  .then(res => res.arrayBuffer())
  .then(buffer => parser.parse(buffer))
  .then(workbook => renderer.render(workbook));
```

## Repository Layout

```text
definitions/   generated OOXML typings
packages/
  shared/      shared infrastructure and reusable modules
  xlsx/        current implementation path
  docx/        reserved shell
  pptx/        reserved shell
playground/    local demo and manual verification
docs/          roadmap, design, and phase artifacts
samples/       sample corpus specification and future acceptance fixtures
```

## Development Order

- build shared infrastructure first
- stabilize `xlsx` and extract reusable behavior from it
- start `docx` only after package loading, styles, and layout contracts are explicit
- treat README claims as a delivery artifact, not as a substitute for implementation
