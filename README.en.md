# Office Parser Renderer

> High-performance Office document parser and renderer library, supporting DOCX and XLSX formats

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

English | [简体中文](./README.md)

## ✨ Features

- 🚀 **High Performance** - Efficient DOM-based rendering engine
- 📄 **Multiple Formats** - Full support for DOCX and XLSX formats
- 🎨 **High Fidelity** - Accurate reproduction of Office document styles and layouts
- 📦 **Modular Design** - Clear module separation, easy to extend
- 🌐 **Zero Dependencies** - Core parsing modules have no external dependencies
- 💪 **TypeScript** - Complete type definitions and type safety

## 📦 Installation

```bash
# Using npm
npm install @opr/office-parser-renderer

# Using pnpm
pnpm add @opr/office-parser-renderer

# Using yarn
yarn add @opr/office-parser-renderer
```

Or install sub-packages individually:

```bash
# Install DOCX support only
pnpm add @opr/docx

# Install XLSX support only
pnpm add @opr/xlsx
```

## 🚀 Quick Start

### DOCX Document Rendering

```typescript
import { DocxParser, DocxRenderer } from '@opr/docx';

// Create container element
const container = document.getElementById('docx-container');

// Create parser and renderer
const parser = new DocxParser();
const renderer = new DocxRenderer(container);

// Load and render document
fetch('/path/to/document.docx')
  .then(res => res.arrayBuffer())
  .then(buffer => parser.parse(buffer))
  .then(doc => renderer.render(doc))
  .then(result => {
    console.log('Rendering complete:', result.totalPages, 'pages');
  });
```

### XLSX Spreadsheet Rendering

```typescript
import { XlsxParser, XlsxRenderer } from '@opr/xlsx';

// Create container element
const container = document.getElementById('xlsx-container');

// Create parser and renderer
const parser = new XlsxParser();
const renderer = new XlsxRenderer(container);

// Load and render workbook
fetch('/path/to/workbook.xlsx')
  .then(res => res.arrayBuffer())
  .then(buffer => parser.parse(buffer))
  .then(workbook => renderer.render(workbook));
```

## 📖 Core API

### DocxParser

```typescript
class DocxParser {
  /**
   * Parse DOCX file
   * @param buffer - ArrayBuffer of DOCX file
   * @returns Parsed document object
   */
  async parse(buffer: ArrayBuffer): Promise<DocxDocument>;
}
```

### DocxRenderer

```typescript
class DocxRenderer {
  constructor(container: HTMLElement, options?: Partial<DocxRenderOptions>);
  
  /**
   * Render document
   * @param doc - Parsed document object
   * @returns Rendering result
   */
  async render(doc: DocxDocument): Promise<DocxRenderResult>;
  
  // Configuration methods
  setPageSize(pageSize: 'A4' | 'A5' | 'A3' | 'Letter' | 'Legal'): void;
  setMargins(margins: { top?: number; right?: number; bottom?: number; left?: number }): void;
  setScale(scale: number): void;
  setShowHeaderFooter(show: boolean): void;
}
```

### XlsxParser

```typescript
class XlsxParser {
  /**
   * Parse XLSX file
   * @param buffer - ArrayBuffer of XLSX file
   * @returns Parsed workbook object
   */
  async parse(buffer: ArrayBuffer): Promise<XlsxWorkbook>;
}
```

### XlsxRenderer

```typescript
class XlsxRenderer {
  constructor(container: HTMLElement);
  
  /**
   * Render workbook
   * @param workbook - Parsed workbook object
   */
  async render(workbook: XlsxWorkbook): Promise<void>;
  
  /**
   * Scroll to specified cell
   * @param row - Row index (0-based)
   * @param col - Column index (0-based)
   */
  scrollTo(row: number, col: number): void;
}
```

## 🎨 Rendering Options

### DOCX Rendering Options

```typescript
interface DocxRenderOptions {
  // Paper size
  pageSize: 'A4' | 'A5' | 'A3' | 'Letter' | 'Legal' | { width: number; height: number };
  
  // Page margins (in points)
  margins?: { top?: number; right?: number; bottom?: number; left?: number };
  
  // Use document's built-in settings
  useDocumentSettings: boolean;
  
  // Scale ratio (0.5 - 2.0)
  scale: number;
  
  // Show header and footer
  showHeaderFooter: boolean;
  
  // Show page numbers
  showPageNumber: boolean;
  
  // Enable pagination
  enablePagination: boolean;
  
  // Debug mode
  debug: boolean;
  
  // Use document background
  useDocumentBackground: boolean;
  
  // Use document watermark
  useDocumentWatermark: boolean;
  
  // Custom background color
  backgroundColor?: string;
  
  // Custom watermark configuration
  watermark?: WatermarkConfig;
  
  // Page render callback
  onPageRender?: (pageIndex: number, pageElement: HTMLElement) => void;
}
```

### Usage Example

```typescript
const renderer = new DocxRenderer(container, {
  pageSize: 'A4',
  scale: 0.8,
  showHeaderFooter: true,
  enablePagination: true,
  watermark: {
    type: 'text',
    text: 'Confidential',
    color: '#cccccc',
    opacity: 0.3,
    rotation: -45
  }
});
```

## 🏗️ Project Structure

```
officeParserRenderer/
├── packages/
│   ├── shared/          # Shared modules
│   │   ├── src/
│   │   │   ├── drawing/     # Drawing related (shapes, images, charts)
│   │   │   ├── styles/      # Style utilities (colors, unit conversion)
│   │   │   ├── utils/       # Common utilities
│   │   │   ├── math/        # Math formula rendering
│   │   │   └── fonts/       # Font management
│   │   └── dist/
│   ├── docx/            # DOCX module
│   │   ├── src/
│   │   │   ├── parser/      # DOCX parser
│   │   │   ├── renderer/    # DOCX renderer
│   │   │   ├── types.ts     # Type definitions
│   │   │   └── utils/       # Utility functions
│   │   └── dist/
│   └── xlsx/            # XLSX module
│       ├── src/
│       │   ├── parser/      # XLSX parser
│       │   ├── renderer/    # XLSX renderer
│       │   ├── types.ts     # Type definitions
│       │   └── utils/       # Utility functions
│       └── dist/
└── docs/                # Documentation
```

## 📚 Documentation

- [📐 Architecture](./docs/ARCHITECTURE.en.md) - Detailed architecture design documentation
- [🛠️ Development Guide](./docs/DEVELOPMENT.en.md) - Guide for project development
- [📋 Progressive Development Plan](./docs/progressive_development_plan.md) - Feature development roadmap

## 🎯 Supported Features

### DOCX

- ✅ Text paragraphs, character runs
- ✅ Font styles (font family, size, color, bold, italic, underline, etc.)
- ✅ Paragraph styles (alignment, indentation, spacing, line height, etc.)
- ✅ Tables (borders, merged cells, background colors, shading)
- ✅ Lists (ordered lists, unordered lists, multi-level lists)
- ✅ Headers and footers
- ✅ Sections and page breaks
- ✅ Images, shapes, drawings
- ✅ Charts (bar, line, pie, mixed charts, etc.)
- ✅ Math equations (Office Math)
- ✅ Hyperlinks
- ✅ Field codes (page numbers, dates, etc.)
- ✅ Track changes (insertions, deletions)
- ✅ Watermarks, background colors
- ✅ VML graphics

### XLSX

- ✅ Cell data (text, numbers, booleans, dates)
- ✅ Cell styles (font, fill, borders, alignment)
- ✅ Number formatting
- ✅ Merged cells
- ✅ Column widths, row heights
- ✅ Worksheet tabs
- ✅ Images, shapes, connectors
- ✅ Charts (bar, line, pie, etc.)
- ✅ Theme colors

## 🔧 Development

### Requirements

- Node.js >= 18
- pnpm >= 8

### Install Dependencies

```bash
pnpm install
```

### Development Server

```bash
pnpm run dev
```

### Build

```bash
pnpm run build
```

### Type Checking

```bash
pnpm run type-check
```

## 🤝 Contributing

Contributions are welcome! Please see the [Development Guide](./docs/DEVELOPMENT.en.md) for details on how to participate in project development.

Contribution workflow:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 📄 License

[MIT](./LICENSE)

## 🙏 Acknowledgements

This project references the following excellent projects:

- [docx-preview](https://github.com/VolodymyrBaydalka/docxjs) - DOCX rendering reference implementation
- [exceljs](https://github.com/exceljs/exceljs) - XLSX parsing reference
- [Office Open XML Specification](https://www.ecma-international.org/publications-and-standards/standards/ecma-376/) - OOXML standard documentation
