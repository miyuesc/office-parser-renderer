# @ai-space/xlsx

> Microsoft Excel (XLSX) 文件解析和渲染库

## 📝 简介

`@ai-space/xlsx` 是一个专门用于解析和渲染 Microsoft Excel XLSX 文件的库。它能够将 XLSX 文件转换为结构化数据，并将其渲染为高保真的 Web 表格，力求与 Microsoft Excel 的显示效果保持一致。

## ✨ 核心特性

- **完整的工作簿解析**：支持多工作表、单元格数据、公式、样式等
- **丰富的样式支持**：字体、填充、边框、对齐、数字格式等完全支持
- **高级功能**：图片、形状、连接线、图表渲染
- **主题颜色**：支持 Excel 主题颜色系统
- **精确布局**：基于行高列宽的精确布局计算
- **虚拟滚动**：大数据量下的高性能渲染

## 📦 安装

```bash
# 使用 pnpm
pnpm add @ai-space/xlsx

# 使用 npm
npm install @ai-space/xlsx

# 使用 yarn
yarn add @ai-space/xlsx
```

## 🚀 快速开始

```typescript
import { XlsxParser, XlsxRenderer } from '@ai-space/xlsx';

// 创建容器
const container = document.getElementById('xlsx-container');

// 创建解析器和渲染器
const parser = new XlsxParser();
const renderer = new XlsxRenderer(container);

// 加载并渲染工作簿
fetch('/path/to/workbook.xlsx')
  .then(res => res.arrayBuffer())
  .then(buffer => parser.parse(buffer))
  .then(workbook => {
    renderer.render(workbook);
    console.log(`渲染完成：共 ${workbook.sheets.length} 个工作表`);
  });
```

## 📖 核心 API

### XlsxParser

XLSX 文件解析器，负责将二进制 XLSX 文件解析为结构化数据。

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

XLSX 工作簿渲染器，负责将解析后的工作簿渲染到 DOM。

```typescript
class XlsxRenderer {
  constructor(container: HTMLElement);
  
  /**
   * 渲染工作簿
   * @param workbook - 解析后的工作簿对象
   */
  async render(workbook: XlsxWorkbook): Promise<void>;
  
  /**
   * 切换工作表
   * @param sheetIndex - 工作表索引
   */
  switchSheet(sheetIndex: number): void;
  
  /**
   * 滚动到指定单元格
   * @param row - 行索引 (0-based)
   * @param col - 列索引 (0-based)
   */
  scrollTo(row: number, col: number): void;
  
  /**
   * 获取单元格值
   * @param row - 行索引
   * @param col - 列索引
   */
  getCellValue(row: number, col: number): any;
}
```

## 🏗️ 项目结构

```
packages/xlsx/
├── src/
│   ├── parser/          # 解析器模块
│   │   ├── XlsxParser.ts          # 主解析器
│   │   ├── WorkbookParser.ts      # 工作簿解析
│   │   ├── WorksheetParser.ts     # 工作表解析
│   │   ├── StyleParser.ts         # 样式解析
│   │   ├── ThemeParser.ts         # 主题解析
│   │   ├── DrawingParser.ts       # 绘图解析
│   │   └── ChartParser.ts         # 图表解析
│   ├── renderer/        # 渲染器模块
│   │   ├── XlsxRenderer.ts        # 主渲染器
│   │   ├── ShapeRenderer.ts       # 形状渲染
│   │   ├── ImageRenderer.ts       # 图片渲染
│   │   ├── ConnectorRenderer.ts   # 连接线渲染
│   │   ├── ChartRenderer.ts       # 图表渲染
│   │   ├── StyleResolver.ts       # 样式解析器
│   │   ├── CellStyleUtils.ts      # 单元格样式工具
│   │   ├── LayoutCalculator.ts    # 布局计算器
│   │   ├── SheetLayoutManager.ts  # 工作表布局管理
│   │   ├── XlsxStyleInjector.ts   # 样式注入器
│   │   └── constants.ts           # 常量定义
│   ├── styles/          # 样式文件
│   │   └── xlsx.css               # XLSX 专用样式
│   ├── types/           # 类型定义
│   ├── utils/           # 工具函数
│   └── index.ts         # 入口文件
└── README.md
```

## 🎯 支持的功能

### 单元格和数据
- ✅ 文本数据
- ✅ 数字数据
- ✅ 布尔值
- ✅ 日期时间
- ✅ 公式（解析，不计算）
- ✅ 共享字符串表
- ✅ 单元格引用

### 样式
- ✅ 字体（名称、大小、颜色、粗体、斜体、下划线、删除线）
- ✅ 填充（纯色、渐变、图案）
- ✅ 边框（样式、颜色、粗细）
- ✅ 对齐（水平、垂直、文本旋转、自动换行）
- ✅ 数字格式（货币、百分比、日期等）
- ✅ 条件格式（基础支持）

### 布局
- ✅ 合并单元格
- ✅ 行高
- ✅ 列宽
- ✅ 隐藏行列
- ✅ 冻结窗格
- ✅ 网格线显示

### 工作表
- ✅ 多工作表支持
- ✅ 工作表标签
- ✅ 工作表切换
- ✅ 工作表可见性
- ✅ 选中状态

### 图形和绘图
- ✅ 图片 (Image)
- ✅ 形状 (Shape)
- ✅ 连接线 (Connector)
- ✅ DrawingML 图形
- ✅ 绝对定位
- ✅ 单元格定位

### 图表
- ✅ 柱状图 (Bar Chart)
- ✅ 折线图 (Line Chart)
- ✅ 饼图 (Pie Chart)
- ✅ 面积图 (Area Chart)
- ✅ 散点图 (Scatter Chart)
- ✅ 组合图表

### 主题和颜色
- ✅ Office 主题
- ✅ 主题颜色
- ✅ 颜色变换（明暗度、饱和度）
- ✅ RGB 颜色
- ✅ 索引颜色

## 📚 模块文档

详细的模块文档请参考各模块的 README：

- [Parser 模块](./src/parser/README.md) - 工作簿解析相关
- [Renderer 模块](./src/renderer/README.md) - 工作簿渲染相关
- [Types 模块](./src/types/README.md) - 类型定义
- [Utils 模块](./src/utils/README.md) - 工具函数

## 🎨 示例

### 自定义样式渲染

```typescript
const renderer = new XlsxRenderer(container);

// 渲染工作簿
await renderer.render(workbook);

// 切换到第二个工作表
renderer.switchSheet(1);

// 滚动到指定单元格
renderer.scrollTo(100, 5);
```

### 获取单元格数据

```typescript
// 获取 A1 单元格的值
const value = renderer.getCellValue(0, 0);
console.log('A1:', value);
```

## ⚡ 性能优化

- **虚拟滚动**：仅渲染可见区域的单元格，提高大数据量渲染性能
- **样式缓存**：缓存样式计算结果，避免重复计算
- **懒加载**：按需加载图片和图表资源
- **Web Worker**：支持在 Worker 中进行解析（可选）

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
