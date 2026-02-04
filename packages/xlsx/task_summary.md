# Shape & Connector Parsing Implementation Summary

## 1. Shared Types (`@opr/shared`)
- Added `OfficeShape` interface to represent shapes, connectors, and groups.
- Unified `OfficeImage` and `OfficeShape` usage where appropriate.

## 2. Parsing Logic (`@opr/xlsx`)
- **DrawingParser**:
    - Extended to parse `<xdr:sp>` (Shapes) and `<xdr:cxnSp>` (Connectors).
    - Extracts:
        - Geometry (preset)
        - Transform (position, size, rotation, flip)
        - Style (Solid Fill, Stroke, Line Width)
        - Text Body (Basic text content)
- **Worksheet Interface**:
    - Renamed `images` to `drawings`.
    - Typed as `(OfficeImage | OfficeShape)[]`.

## 3. Rendering Logic (`@opr/shared` & `@opr/xlsx`)
- **ShapeRenderer**:
    - New renderer for shapes.
    - Supports:
        - SVG Path generation for presets (rect, ellipse, triangle, line).
        - Fill and Stroke rendering.
        - Basic Text centering.
        - Transformations (Rotation, Flip).
- **GridRenderer**:
    - Updated to iterate `drawings`.
    - Dispatches to `ImageRenderer` or `ShapeRenderer` based on object type.

## 4. Verification
- Verified build success.
- Ready for visual verification in Playground.
