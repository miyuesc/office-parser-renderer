# Office Parser Renderer

> 高性能的 Office 文档解析和渲染库，支持 DOCX 和 XLSX 格式

[![TypeScript](https://img.shields.io/badge/TypeScript-严格模式-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

[English](./README.en.md) | 简体中文

## ✨ 特性

- 🚀 **高性能渲染** - 基于 DOM 的高效渲染引擎
- 📄 **多格式支持** - 完整支持 DOCX、XLSX 格式
- 🎨 **高保真还原** - 精确还原 Office 文档样式和布局
- 📦 **模块化设计** - 清晰的模块划分，易于扩展
- 🌐 **零依赖核心** - 核心解析模块无外部依赖
- 💪 **TypeScript** - 完整的类型定义和类型安全

## 📦 安装

```bash
# 使用 npm
npm install @opr/office-parser-renderer

# 使用 pnpm
pnpm add @opr/office-parser-renderer

# 使用 yarn
yarn add @opr/office-parser-renderer
```

或者单独安装子包：

```bash
# 仅安装 DOCX 支持
pnpm add @opr/docx

# 仅安装 XLSX 支持
pnpm add @opr/xlsx
```

## 🚀 快速开始

### DOCX 文档渲染

```typescript
import { DocxParser, DocxRenderer } from '@opr/docx';

// 创建容器元素
const container = document.getElementById('docx-container');

// 创建解析器和渲染器
const parser = new DocxParser();
const renderer = new DocxRenderer(container);

// 加载并渲染文档
fetch('/path/to/document.docx')
  .then(res => res.arrayBuffer())
  .then(buffer => parser.parse(buffer))
  .then(doc => renderer.render(doc))
  .then(result => {
    console.log('渲染完成', result.totalPages, '页');
  });
```

### XLSX 表格渲染

```typescript
import { XlsxParser, XlsxRenderer } from '@opr/xlsx';

// 创建容器元素
const container = document.getElementById('xlsx-container');

// 创建解析器和渲染器
const parser = new XlsxParser();
const renderer = new XlsxRenderer(container);

// 加载并渲染工作簿
fetch('/path/to/workbook.xlsx')
  .then(res => res.arrayBuffer())
  .then(buffer => parser.parse(buffer))
  .then(workbook => renderer.render(workbook));
```

## 📖 核心 API

### DocxParser

```typescript
class DocxParser {
  /**
   * 解析 DOCX 文件
   * @param buffer - DOCX 文件的 ArrayBuffer
   * @returns 解析后的文档对象
   */
  async parse(buffer: ArrayBuffer): Promise<DocxDocument>;
}
```

### DocxRenderer

```typescript
class DocxRenderer {
  constructor(container: HTMLElement, options?: Partial<DocxRenderOptions>);
  
  /**
   * 渲染文档
   * @param doc - 解析后的文档对象
   * @returns 渲染结果
   */
  async render(doc: DocxDocument): Promise<DocxRenderResult>;
  
  // 配置方法
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
   * 解析 XLSX 文件
   * @param buffer - XLSX 文件的 ArrayBuffer
   * @returns 解析后的工作簿对象
   */
  async parse(buffer: ArrayBuffer): Promise<XlsxWorkbook>;
}
```

### XlsxRenderer

```typescript
class XlsxRenderer {
  constructor(container: HTMLElement);
  
  /**
   * 渲染工作簿
   * @param workbook - 解析后的工作簿对象
   */
  async render(workbook: XlsxWorkbook): Promise<void>;
  
  /**
   * 滚动到指定单元格
   * @param row - 行索引 (0-based)
   * @param col - 列索引 (0-based)
   */
  scrollTo(row: number, col: number): void;
}
```

## 🎨 渲染选项

### DOCX 渲染选项

```typescript
interface DocxRenderOptions {
  // 纸张大小
  pageSize: 'A4' | 'A5' | 'A3' | 'Letter' | 'Legal' | { width: number; height: number };
  
  // 页边距（点）
  margins?: { top?: number; right?: number; bottom?: number; left?: number };
  
  // 是否使用文档内置设置
  useDocumentSettings: boolean;
  
  // 缩放比例 (0.5 - 2.0)
  scale: number;
  
  // 是否显示页眉页脚
  showHeaderFooter: boolean;
  
  // 是否显示页码
  showPageNumber: boolean;
  
  // 是否启用分页
  enablePagination: boolean;
  
  // 调试模式
  debug: boolean;
  
  // 是否使用文档背景
  useDocumentBackground: boolean;
  
  // 是否使用文档水印
  useDocumentWatermark: boolean;
  
  // 自定义背景色
  backgroundColor?: string;
  
  // 自定义水印配置
  watermark?: WatermarkConfig;
  
  // 页面渲染回调
  onPageRender?: (pageIndex: number, pageElement: HTMLElement) => void;
}
```

### 使用示例

```typescript
const renderer = new DocxRenderer(container, {
  pageSize: 'A4',
  scale: 0.8,
  showHeaderFooter: true,
  enablePagination: true,
  watermark: {
    type: 'text',
    text: '机密文档',
    color: '#cccccc',
    opacity: 0.3,
    rotation: -45
  }
});
```

## 🏗️ 项目结构

```
officeParserRenderer/
├── packages/
│   ├── shared/          # 共享模块
│   │   ├── src/
│   │   │   ├── drawing/     # 绘图相关（形状、图片、图表）
│   │   │   ├── styles/      # 样式工具（颜色、单位转换）
│   │   │   ├── utils/       # 通用工具
│   │   │   ├── math/        # 数学公式渲染
│   │   │   └── fonts/       # 字体管理
│   │   └── dist/
│   ├── docx/            # DOCX 模块
│   │   ├── src/
│   │   │   ├── parser/      # DOCX 解析器
│   │   │   ├── renderer/    # DOCX 渲染器
│   │   │   ├── types.ts     # 类型定义
│   │   │   └── utils/       # 工具函数
│   │   └── dist/
│   └── xlsx/            # XLSX 模块
│       ├── src/
│       │   ├── parser/      # XLSX 解析器
│       │   ├── renderer/    # XLSX 渲染器
│       │   ├── types.ts     # 类型定义
│       │   └── utils/       # 工具函数
│       └── dist/
└── docs/                # 文档
```

## 📚 文档

- [📐 架构文档](./docs/ARCHITECTURE.md) - 详细的架构设计说明
- [🛠️ 开发指南](./docs/DEVELOPMENT.md) - 参与项目开发的指南
- [📋 渐进式开发计划](./docs/progressive_development_plan.md) - 功能开发路线图

## 🎯 支持的功能

### DOCX

- ✅ 文本段落、字符运行
- ✅ 字体样式（字体、大小、颜色、粗体、斜体、下划线等）
- ✅ 段落样式（对齐、缩进、间距、行距等）
- ✅ 表格（边框、合并单元格、背景色、阴影）
- ✅ 列表（有序列表、无序列表、多级列表）
- ✅ 页眉页脚
- ✅ 分节、分页
- ✅ 图片、形状、绘图
- ✅ 图表（柱状图、折线图、饼图、混合图等）
- ✅ 数学公式（Office Math）
- ✅ 超链接
- ✅ 域代码（页码、日期等）
- ✅ 修订追踪（插入、删除）
- ✅ 水印、背景色
- ✅ VML 图形

### XLSX

- ✅ 单元格数据（文本、数字、布尔值、日期）
- ✅ 单元格样式（字体、填充、边框、对齐）
- ✅ 数字格式化
- ✅ 合并单元格
- ✅ 列宽、行高
- ✅ 工作表标签
- ✅ 图片、形状、连接符
- ✅ 图表（柱状图、折线图、饼图等）
- ✅ 主题颜色

## 🔧 开发

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 开发服务器

```bash
pnpm run dev
```

### 构建

```bash
pnpm run build
```

### 类型检查

```bash
pnpm run type-check
```

## 🤝 贡献

欢迎贡献！请查看 [开发指南](./docs/DEVELOPMENT.md) 了解如何参与项目开发。

贡献流程：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

[MIT](./LICENSE)

## 🙏 致谢

本项目参考了以下优秀项目：

- [docx-preview](https://github.com/VolodymyrBaydalka/docxjs) - DOCX 渲染参考实现
- [exceljs](https://github.com/excel js/exceljs) - XLSX 解析参考
- [Office Open XML 规范](https://www.ecma-international.org/publications-and-standards/standards/ecma-376/) - OOXML 标准文档
