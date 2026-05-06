# Office Parser Renderer

> A monorepo for Office OOXML parsing and preview-oriented rendering.

English | [简体中文](./README.md)

## Current Status

| Package | Status | Notes |
| --- | --- | --- |
| `@opr/shared` | in progress | OOXML package/rels/content-types, styles, drawing/chart/media/math/rendering foundations, plus initial layout anchor/z-index/coordinate and fidelity warning contracts |
| `@opr/xlsx` | usable, still under stabilization | the most mature path, with real parsing and canvas rendering |
| `@opr/docx` | Foundation MVP | parser/model/page layout/canvas renderer exist, but this is not Word-level one-to-one fidelity |
| `@opr/pptx` | Static preview MVP | presentation/slide/master/layout/theme basics and a single-slide static preview exist |

This README describes the repository as it exists today. `docx` and `pptx` are no longer empty shells, but they are still MVP preview paths. One-to-one fidelity is tracked through the roadmap and sample acceptance work.

## What Exists Today

### Shared

- OOXML loading layer:
  - `PackageReader`
  - `RelationshipsResolver`
  - `ContentTypesRegistry`
- namespace-insensitive XML helpers and `WarningCollector`
- unit conversion, color parsing, theme color, fonts, and cross-format style contracts
- drawing/chart/media/math/rendering foundations
- shared parsing entry points for images, shapes, connectors, groups, and charts
- `MediaRegistry` and OMML/math fallback model
- minimal layout anchor, coordinate space, and z-index/layer ordering contracts
- fidelity warning taxonomy: unsupported / degraded / clipped / fallback

### XLSX

- workbook / worksheet / shared strings / styles / theme parsing
- merges, frozen panes, multi-sheet behavior, hyperlinks, comments, formula metadata, and conditional formatting basics
- model-level `getCell`, `getCellByRef`, and covered-merge-cell access
- sheet tabs, zoom, drag, virtual scrollbars, headers, frozen panes, fills, rich text, borders, and formula display modes
- existing rendering paths for images, shapes, charts, comment hints, and hyperlinks

### DOCX

- `document.xml`, `styles.xml`, `numbering.xml`, and `settings.xml` basics
- paragraphs, runs, tables, sections, and header/footer references
- page layout MVP, canvas page renderer, and hidden semantic text layer
- heading tree, TOC entries, jump-to-heading/page, and stats
- inline images, floating drawing metadata, anchored charts, OMML/math fallback, symbols, and revision run model

### PPTX

- presentation main part, slide list, slide master, slide layout, and theme relationship basics
- basic text shape extraction
- single-slide static preview shell
- `jumpToSlide` / `nextSlide` / `previousSlide` / `initialSlide`

## What Is Still Missing

- Microsoft Office-level one-to-one visual fidelity
- complete font metrics, layout rules, cross-format viewport/layout core, and full format integration for the shared anchor/z-index/coordinate contract
- DOCX columns, complex pagination, floating object wrapping, backgrounds/watermarks, comments, and full revision display modes
- PPTX high-fidelity static rendering for shapes/images/charts/tables/backgrounds, plus transitions/animations/presentation mode
- XLSX large-workbook performance baseline, complex charts/shapes/WordArt, and complete formula/conditional-format coverage
- visual regression, performance baselines, and compatibility matrix
- package build and project-boundary cleanup

## Roadmap Documents

- active roadmap: [docs/office-preview-todo-list.md](./docs/office-preview-todo-list.md)
- `xlsx` gap list: [docs/xlsx-gap-list.md](./docs/xlsx-gap-list.md)
- development guide: [docs/DEVELOPING_GUIDE_ZH.md](./docs/DEVELOPING_GUIDE_ZH.md)
- sample corpus spec: [samples/README.md](./samples/README.md)

## Quick Start

All three formats have basic entry points. `xlsx` is currently the most stable path; `docx` and `pptx` should be treated as MVP preview paths.

```typescript
import { XlsxParser, XlsxRenderer } from '@opr/xlsx';

const container = document.getElementById('office-container');

fetch('/path/to/workbook.xlsx')
  .then(res => res.arrayBuffer())
  .then(buffer => XlsxParser.parse(buffer))
  .then(workbook => {
    const renderer = new XlsxRenderer(container);
    const firstSheet = workbook.worksheets.values().next().value;
    renderer.setWorksheet(firstSheet, workbook);
  });
```

## Repository Layout

```text
definitions/   generated OOXML typings
packages/
  shared/      shared infrastructure and reusable modules
  xlsx/        current implementation path
  docx/        DOCX foundation MVP
  pptx/        PPTX static preview MVP
playground/    local demo and manual verification
docs/          active roadmap, xlsx gap list, and development guide
samples/       sample corpus specification and future acceptance fixtures
```

## Development Order

- build shared infrastructure first
- stabilize `xlsx` and extract reusable behavior from it
- deepen `docx` high-fidelity pagination, wrapping, backgrounds, watermarks, comments, and revisions
- deepen `pptx` static preview before transitions and presentation playback
- treat README claims as a delivery artifact, not as a substitute for implementation
