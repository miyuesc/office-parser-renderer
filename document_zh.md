# Office Parser And Renderer - 产品与技术指南

## 1. 项目介绍

**Office Parser And Renderer** 是一个高性能的纯前端解决方案，用于解析和解释 Microsoft Office Open XML (OOXML) 文档——包括 **DOCX** (Word)、**XLSX** (Excel) 和 **PPTX** (PowerPoint)。

本项目的主要目标是解决基于 HTML-DOM 的渲染方案中经常出现的不一致性和性能瓶颈。通过利用 **Canvas API**，我们确保：

- **像素级的一致性**：渲染文档使其与 Microsoft Office 中的显示效果完全一致，独立于浏览器引擎。
- **高性能**：通过绕过 DOM，高效处理包含数千个元素的大型文档。
- **严格的高保真 (Strict High-Fidelity)**：
  - **OOXML 合规性**：完全实现 ECMA-376 标准。
  - **视觉精度**：精确复制页面布局、边距、分节符、分栏、主题颜色和字体样式。
  - **1:1 还原**：输出必须与原生 Office 渲染效果无异，尊重所有文档设置（页面设置、样式、默认值）。

本项目旨在作为独立的 **NPM 包** 发布，允许开发者轻松将专业的文档查看功能集成到他们的 Web 应用程序中。

---

## 2. 技术栈

我们要构建一个现代、类型安全且高效的技术栈：

- **语言**: **TypeScript** (严格模式)
  - 确保类型安全、可维护性以及更好的开发体验。
  - 使用接口 (Interfaces) 和类型 (Types) 严格定义虚拟文档对象模型 (VDOM)。
- **渲染引擎**: **HTML5 Canvas API** (2D Context)
  - 用于绘制文本、形状、图像和表格。
  - 提供像素级的控制，支持自定义字句间距、精确换行和复杂的图层处理等功能。
- **解析工具**:
  - **XML 解析**: 原生 `DOMParser` (浏览器端) 或轻量级 XML 解析器，用于提取 OOXML 内部结构内容。
  - **Zip 处理**: 轻量级库 (如 `fflate` 或 `jszip`) 用于解压 `.docx`, `.xlsx`, 或 `.pptx` 文件。
- **构建与打包**: **Vite** / **Rollup**
  - 针对库模式 (`lib` mode) 进行优化。
  - 输出格式: `ESM` (EcmaScript Modules) 和 `CJS` (CommonJS)。

---

## 3. 系统架构

本项目采用 **Monorepo** 结构，使用 **pnpm workspaces** 以确保模块化和关注点分离。

### 3.1. Monorepo 结构

```text
packages/
  ├── shared/        # 核心工具 (Zip 解析, XML 助手, 几何计算, 颜色引擎)
  ├── docx/          # Word 专用逻辑 (流式布局, 段落)
  ├── xlsx/          # Excel 专用逻辑 (网格布局, 单元格)
  └── pptx/          # PowerPoint 专用逻辑 (幻灯片布局, 形状)
```

### 3.2. 架构概览

每个包 (`docx`, `xlsx`, `pptx`) 都暴露其独立的 **Parser (解析器)** 和 **Renderer (渲染器)**，并利用 `shared` 库。

- **Parsers**: 将原始 OOXML 组件转换为清晰的 AST。
- **Renderers**: 将 AST 绘制到 Canvas 上，严格遵守文档的 `sectPr` (节属性) 和主题设置。

### 3.3. 详细流水线

#### A. 解析层 (原始文件 -> AST)

输入: 源文件的 `ArrayBuffer`。

1.  **通用工具**: `ArchiveLoader` 提取 zip 包。
2.  **格式专用解析**:
    - **DOCX**: 解析 `document.xml` + `styles.xml` + `settings.xml` + `theme1.xml`。
    - **XLSX**: 解析 `workbook.xml` + `worksheets/*.xml` + `styles.xml`。
    - **PPTX**: 解析 `presentation.xml` + `slides/*.xml` + `theme/*.xml`。
3.  **输出**: 包含 **内容**, **元数据**, 和 **全局设置** 的结构化 AST 对象。

#### B. 渲染层 (AST -> Canvas)

输入: AST 对象。

1.  **布局引擎 (Reflow)**:
    - **Docx**: 基于文件中定义的 **实际页面尺寸** (如 A4) 和 **边距** 计算换行、制表符和分页。
    - **Pptx/Xlsx**: 映射绝对坐标或单元格。
2.  **绘图引擎**:
    - 使用 `CanvasRenderingContext2D` 绘制元素。
    - 应用正确的 **主题颜色** (解析 `clrScheme` 映射)。
    - 渲染严格的边框、填充和效果。

---

## 4. 使用说明与 NPM 接口

该库旨在让使用者能够轻松上手，并尽可能与格式无关。

### 安装

```bash
npm install @ai-space/office-canvas-renderer
```

### React/原生 JS 基础用法

```typescript
// 1. 从特定包导入 (Monorepo 结构)
import { DocxParser } from "@ai-space/docx";
import { DocxRenderer } from "@ai-space/docx";
// 或者 import { PptxParser, PptxRenderer } from '@ai-space/pptx';

const canvas = document.getElementById("office-canvas") as HTMLCanvasElement;

// 2. 解析与渲染
fetch("/path/to/document.docx")
  .then((res) => res.arrayBuffer())
  .then(async (buffer) => {
    // A. 解析: 获取完整 AST 和设置
    const parser = new DocxParser();
    const doc = await parser.parse(buffer);

    // B. 渲染: 基于解析数据的可视化
    const renderer = new DocxRenderer(canvas);
    await renderer.render(doc);
  });
```

---

## 5. 主要功能与路线图

路线图按文档类型支持划分。

### 5.1. Word (DOCX)

- **第一阶段: 基础**
  - [x] 基础文本渲染与段落对齐。
  - [x] 换行与页面边距。
- **第二阶段: 结构**
  - [ ] 列表 (项目符号/编号)。
  - [ ] 表格与图像。

### 5.2. Excel (XLSX)

- **第一阶段: 网格系统**
  - [ ] 解析 `sheet.xml` 和 `sharedStrings.xml`。
  - [ ] 渲染网格线、列宽和行高。
- **第二阶段: 单元格内容**
  - [ ] 数据格式化 (日期, 货币, 颜色)。
  - [ ] 合并单元格。

### 5.3. PowerPoint (PPTX)

- **第一阶段: 幻灯片基础**
  - [ ] 解析 `slide.xml` 和 `layout.xml`。
  - [ ] 文本框和形状的绝对定位。
- **第二阶段: 视觉效果**
  - [ ] 图像渲染与形状样式。
  - [ ] 母版幻灯片背景继承。

## 6. Prompt 指南 (AI Agent 指令)

当要求 AI 为本项目做贡献时，请参考以下 **组件角色**：

1.  **高保真 (High Fidelity)**: "代码必须尊重 `sectPr` (节属性) 中的边距/尺寸。不要使用硬编码常量。"
2.  **结构 (Structure)**: "将通用逻辑放在 `packages/shared` 中。格式专用逻辑放在 `packages/{format}` 中。"
3.  **主题支持 (Theme Support)**: "确保颜色是针对 `theme1.xml` 解析的。"
