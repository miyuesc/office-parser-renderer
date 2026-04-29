# Playwright Output

Generated browser verification artifacts for local preview-engine checks.

## Current Artifacts

- `xlsx-scroll-to-b20-frozen.png`
  - Source sample: `samples/xlsx/frozen-panes/row-and-column-freeze/source.xlsx`
  - Flow: upload sample, run `scrollToCell("B20")`, assert `renderer.getCellInfo(20, 2)` is inside the canvas viewport.
  - Captured: 2026-04-28
- `xlsx-rich-text-fills.png`
  - Source sample: `samples/xlsx/rich-text-and-fills/basic-rich-text-fills/source.xlsx`
  - Flow: upload sample, assert `A1` has two rich text runs and `B2` uses style `1`, then capture the rendered canvas.
  - Captured: 2026-04-28
