# @ai-space/docx

> Microsoft Word (DOCX) 文件解析和渲染库

## 📝 简介

`@ai-space/docx` 是一个专门用于解析和渲染 Microsoft Word DOCX 文件的库。它能够将 DOCX 文件转换为结构化数据，并将其渲染为高保真的 Web 页面，力求与 Microsoft Word 的显示效果保持一致。

## ✨ 核心特性

- **完整的文档解析**：支持段落、文本运行、表格、列表等所有基本元素
- **丰富的样式支持**：字体、颜色、边框、阴影、对齐等样式完全支持
- **高级功能**：页眉页脚、分节分页、图片形状、图表、数学公式
- **修订追踪**：支持显示文档修订内容（插入、删除）
- **VML 图形**：支持传统 VML 格式的图形元素
- **精确布局**：基于页面的精确布局计算和渲染

## 📦 安装

```bash
# 使用 pnpm
pnpm add @ai-space/docx

# 使用 npm
npm install @ai-space/docx

# 使用 yarn
yarn add @ai-space/docx
```

## 🚀 快速开始

```typescript
import { DocxParser, DocxRenderer } from '@ai-space/docx';

// 创建容器
const container = document.getElementById('docx-container');

// 创建解析器和渲染器
const parser = new DocxParser();
const renderer = new DocxRenderer(container, {
  pageSize: 'A4',
  scale: 1.0,
  showHeaderFooter: true
});

// 加载并渲染文档
fetch('/path/to/document.docx')
  .then(res => res.arrayBuffer())
  .then(buffer => parser.parse(buffer))
  .then(doc => renderer.render(doc))
  .then(result => {
    console.log(`渲染完成：共 ${result.totalPages} 页`);
  });
```

## 📖 核心 API

### DocxParser

DOCX 文件解析器，负责将二进制 DOCX 文件解析为结构化数据。

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

DOCX 文档渲染器，负责将解析后的文档渲染到 DOM。

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
  setPageSize(pageSize: PageSize): void;
  setMargins(margins: Margins): void;
  setScale(scale: number): void;
  setShowHeaderFooter(show: boolean): void;
}
```

## 🎨 渲染选项

```typescript
interface DocxRenderOptions {
  // 纸张大小
  pageSize: 'A4' | 'A5' | 'A3' | 'Letter' | 'Legal' | { width: number; height: number };
  
  // 页边距（点 pt）
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
  
  // 是否使用文档背景
  useDocumentBackground: boolean;
  
  // 是否使用文档水印
  useDocumentWatermark: boolean;
  
  // 自定义背景色
  backgroundColor?: string;
  
  // 页面渲染回调
  onPageRender?: (pageIndex: number, pageElement: HTMLElement) => void;
}
```

## 🏗️ 项目结构

```
packages/docx/
├── src/
│   ├── parser/          # 解析器模块
│   │   ├── DocxParser.ts          # 主解析器
│   │   ├── DocumentParser.ts      # 文档解析
│   │   ├── ParagraphParser.ts     # 段落解析
│   │   ├── RunParser.ts           # 文本运行解析
│   │   ├── TableParser.ts         # 表格解析
│   │   ├── DrawingParser.ts       # 绘图解析
│   │   ├── NumberingParser.ts     # 列表编号解析
│   │   ├── StylesParser.ts        # 样式解析
│   │   ├── SectionParser.ts       # 分节解析
│   │   ├── HeaderFooterParser.ts  # 页眉页脚解析
│   │   ├── VmlParser.ts           # VML 解析
│   │   ├── ChartParser.ts         # 图表解析
│   │   ├── MediaParser.ts         # 媒体解析
│   │   └── RelationshipsParser.ts # 关系解析
│   ├── renderer/        # 渲染器模块
│   │   ├── DocxRenderer.ts        # 主渲染器
│   │   ├── ParagraphRenderer.ts   # 段落渲染
│   │   ├── RunRenderer.ts         # 文本运行渲染
│   │   ├── TableRenderer.ts       # 表格渲染
│   │   ├── DrawingRenderer.ts     # 绘图渲染
│   │   ├── HeaderFooterRenderer.ts # 页眉页脚渲染
│   │   ├── WatermarkRenderer.ts   # 水印渲染
│   │   ├── PageCalculator.ts      # 页面计算
│   │   ├── PageConfigManager.ts   # 页面配置管理
│   │   ├── PageLayoutManager.ts   # 页面布局管理
│   │   ├── ListCounter.ts         # 列表计数器
│   │   └── StyleInjector.ts       # 样式注入器
│   ├── styles/          # 样式文件
│   │   └── docx.css               # DOCX 专用样式
│   ├── types/           # 类型定义
│   ├── utils/           # 工具函数
│   └── index.ts         # 入口文件
└── README.md
```

## 🎯 支持的功能

### 文本和段落
- ✅ 段落 (Paragraph)
- ✅ 文本运行 (Run)
- ✅ 字体样式（字体、大小、颜色、粗体、斜体、下划线、删除线等）
- ✅ 段落样式（对齐、缩进、间距、行距等）
- ✅ 高亮、着重号、上标、下标

### 表格
- ✅ 表格结构
- ✅ 单元格合并（横向、纵向）
- ✅ 边框样式
- ✅ 背景填充
- ✅ 单元格内边距
- ✅ 表格阴影

### 列表和编号
- ✅ 有序列表
- ✅ 无序列表
- ✅ 多级列表
- ✅ 自定义编号格式

### 页面和布局
- ✅ 分节 (Section)
- ✅ 分页符
- ✅ 页眉页脚
- ✅ 页码
- ✅ 纸张大小
- ✅ 页边距
- ✅ 页面方向

### 图形和绘图
- ✅ 图片 (Image)
- ✅ 形状 (Shape)
- ✅ DrawingML 图形
- ✅ VML 图形
- ✅ 文本框
- ✅ 绝对定位
- ✅ 相对定位

### 图表
- ✅ 柱状图 (Bar Chart)
- ✅ 折线图 (Line Chart)
- ✅ 饼图 (Pie Chart)
- ✅ 面积图 (Area Chart)
- ✅ 散点图 (Scatter Chart)
- ✅ 混合图表

### 数学公式
- ✅ Office Math (OMML)
- ✅ 分数
- ✅ 根式
- ✅ 上下标
- ✅ 积分
- ✅ 矩阵

### 其他功能
- ✅ 超链接
- ✅ 书签
- ✅ 域代码（页码、日期等）
- ✅ 修订追踪（插入、删除）
- ✅ 水印
- ✅ 背景色

## 📚 模块文档

详细的模块文档请参考各模块的 README：

- [Parser 模块](./src/parser/README.md) - 文档解析相关
- [Renderer 模块](./src/renderer/README.md) - 文档渲染相关
- [Types 模块](./src/types/README.md) - 类型定义
- [Utils 模块](./src/utils/README.md) - 工具函数

## 🔧 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建
pnpm run build
```

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
