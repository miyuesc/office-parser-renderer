# Office Parser And Renderer - Product & Technical Guidelines

## 1. Project Introduction

**Office Parser And Renderer** is a high-performance, pure front-end solution for parsing and interpreting Microsoft Office Open XML (OOXML) documents—including **DOCX** (Word), **XLSX** (Excel), and **PPTX** (PowerPoint).

The primary goal of this project is to solve the inconsistencies and performance bottlenecks often found in HTML-DOM-based rendering approaches. By leveraging the **Canvas API**, we ensure:

- **Pixel-perfect consistency**: Render documents exactly as they appear in Microsoft Office, independent of browser engines.
- **High performance**: Handle large documents efficiently by bypassing the DOM.
- **Strict High-Fidelity**:
  - **OOXML Compliance**: Fully implement ECMA-376 standards.
  - **Visual Precision**: Replicate exact page layouts, margins, section breaks, columns, theme colors, and font styles.
  - **1:1 Rendering**: The output must indistinguishably match the native Office rendering, respecting all document settings (Page Setup, Styles, Defaults).

This project is designed to be published as a standalone **NPM package**, allowing developers to easily integrate professional document viewing capabilities into their web applications.

---

## 2. Technology Stack

We rely on a modern, type-safe, and efficient stack:

- **Language**: **TypeScript** (Strict Mode)
  - Ensures type safety, maintainability, and better developer experience.
  - Use of Interfaces and Types to strictly define the Virtual Document Object Model (VDOM).
- **Rendering Engine**: **HTML5 Canvas API** (2D Context)
  - Used for drawing text, shapes, images, and tables.
  - Provides granular control over pixels, enabling features like custom kerning, precise line breaks, and complex layering.
- **Parsing Utilities**:
  - **XML Parsing**: Native `DOMParser` (browser) or a lightweight XML parser for extracting content from the internal OOXML structure.
  - **Zip Handling**: A lightweight library (e.g., `fflate` or `jszip`) to decompress `.docx`, `.xlsx`, or `.pptx` files.
- **Build & Bundling**: **Vite` / **Rollup\*\*
  - Optimized for libraries (`lib` mode).
  - Output formats: `ESM` (EcmaScript Modules) and `CJS` (CommonJS).

---

## 3. System Architecture

The project is structured as a **Monorepo** using **pnpm workspaces** to ensure modularity and separation of concerns.

### 3.1. Monorepo Structure

```text
packages/
  ├── shared/        # Core utilities (Zip parsing, XML helpers, Geometry, Color engines)
  ├── docx/          # Logic specific to Word (Flow Layout, Paragraphs)
  ├── xlsx/          # Logic specific to Excel (Grid Layout, Cells)
  └── pptx/          # Logic specific to PowerPoint (Slide Layout, Shapes)
```

### 3.2. Architecture Overview

Each package (`docx`, `xlsx`, `pptx`) exposes its own **Parser** and **Renderer**, leveraging the `shared` library.

- **Parsers**: Transform raw OOXML components into a clean AST.
- **Renderers**: Paint the AST onto the Canvas, strictly adhering to the document's `sectPr` (Section Properties) and Theme settings.

### 3.3. Detailed Pipeline

#### A. The Parsing Layer (Raw File -> AST)

Input: `ArrayBuffer` of the source file.

1.  **Shared Utils**: `ArchiveLoader` extracts the zip.
2.  **Format-Specific Parsing**:
    - **DOCX**: Parses `document.xml` + `styles.xml` + `settings.xml` + `theme1.xml`.
    - **XLSX**: Parses `workbook.xml` + `worksheets/*.xml` + `styles.xml`.
    - **PPTX**: Parses `presentation.xml` + `slides/*.xml` + `theme/*.xml`.
3.  **Output**: A structured AST object containing **Content**, **Metadata**, and **Global Settings**.

#### B. The Rendering Layer (AST -> Canvas)

Input: The AST object.

1.  **Layout Engine (Reflow)**:
    - **Docx**: Calculates line breaks, tabs, and pagination based on **actual page size** (e.g., A4) and **margins** defined in the file.
    - **Pptx/Xlsx**: Maps absolute coordinates or cells.
2.  **Paint Engine**:
    - Uses `CanvasRenderingContext2D` to draw elements.
    - Applies correct **Theme Colors** (resolving `clrScheme` maps).
    - Renders strict borders, fills, and effects.

---

## 4. Usage & NPM Interface

The library is designed to be effortless to use and format-agnostic where possible.

### Installation

```bash
npm install @ai-space/office-canvas-renderer
```

### Basic Usage with React/Vanilla JS

```typescript
// 1. Import from specific packages (Monorepo structure)
import { DocxParser } from "@ai-space/docx";
import { DocxRenderer } from "@ai-space/docx";
// OR import { PptxParser, PptxRenderer } from '@ai-space/pptx';

const canvas = document.getElementById("office-canvas") as HTMLCanvasElement;

// 2. Parse & Render
fetch("/path/to/document.docx")
  .then((res) => res.arrayBuffer())
  .then(async (buffer) => {
    // A. Parse: Get the full AST and Settings
    const parser = new DocxParser();
    const doc = await parser.parse(buffer);

    // B. Render: Visualize based on the parsed data
    const renderer = new DocxRenderer(canvas);
    await renderer.render(doc);
  });
```

---

## 5. Key Features & Roadmap

The roadmap is divided by document type support.

### 5.1. Word (DOCX)

- **Phase 1: Foundation**
  - [x] Basic Text Rendering & Paragraph Alignment.
  - [x] Line Breaking & Page Margins.
- **Phase 2: Structure**
  - [ ] Lists (Bullets/Numbering).
  - [ ] Tables & Images.

### 5.2. Excel (XLSX)

- **Phase 1: Grid System**
  - [x] Parsing `sheet.xml` and `sharedStrings.xml`.
  - [x] Rendering grid lines, column widths, and row heights.
- **Phase 2: Cell Content**
  - [x] Formatting (Dates, Currency, Colors).
  - [x] Merged Cells.

### 5.3. PowerPoint (PPTX)

- **Phase 1: Slide Basics**
  - [x] Parsing `slide.xml` and `layout.xml`.
  - [x] Absolute positioning of text boxes and shapes.
- **Phase 2: Visuals**
  - [ ] Image rendering & Shape styling.
  - [ ] Master Slides background inheritance.

## 6. Prompting Guide (AI Agent Instructions)

When asking an AI to contribute to this project, refer to the **component roles**:

1.  **High Fidelity**: "Code must respect `sectPr` (Section Properties) for margins/size. Do not use hardcoded constants."
2.  **Structure**: "Put common logic in `packages/shared`. Format-specific logic goes to `packages/{format}`."
3.  **Theme Support**: "Ensure colors are resolved against `theme1.xml`."
