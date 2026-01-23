---
name: 项目架构与模块结构
description: 描述 Office Parser Renderer 项目的整体架构、模块职责、关键文件位置和依赖关系
trigger: context
---

# 项目架构概览

## 📦 Monorepo 结构

本项目采用 **pnpm workspaces** 管理的 Monorepo 架构。

```
officeParserRenderer/
├── packages/
│   ├── shared/         # 共享模块（必须先了解）
│   ├── docx/           # DOCX 文档处理
│   ├── xlsx/           # XLSX 表格处理
│   ├── pptx/           # PPTX 演示文稿处理（开发中）
│   ├── playground/     # 开发测试环境
│   └── definitions/    # OOXML 类型定义
├── docs/               # 项目文档
├── .agent/             # AI 辅助配置
└── tsconfig.base.json  # TypeScript 基础配置
```

---

## 🔧 核心模块职责

### 1. `packages/shared` - 共享模块

**核心职责**：提供跨格式通用的功能组件。

| 目录 | 职责 | 关键文件 |
|------|------|----------|
| `drawing/` | 绘图渲染 | `ShapeRenderer.ts`, `ChartRenderer.ts`, `ImageRenderer.ts` |
| `drawing/shapes/` | 预设形状路径 | `ShapeRegistry.ts`, `BasicShapes.ts`, `ArrowShapes.ts` |
| `drawing/parsers/` | 绘图属性解析 | `ColorParser.ts`, `FillParser.ts`, `EffectParser.ts` |
| `styles/` | 样式工具 | `UnitConverter.ts`, `ColorUtils.ts`, `constants.ts` |
| `math/` | 公式渲染 | `OMathParser.ts`, `OMathRenderer.ts` |
| `fonts/` | 字体管理 | `FontManager.ts` |
| `utils/` | 通用工具 | `ColorUtils.ts`, `geometry.ts` |

### 2. `packages/docx` - DOCX 模块

**核心职责**：解析和渲染 Microsoft Word 文档。

| 目录 | 职责 | 关键文件 |
|------|------|----------|
| `parser/` | XML 解析 | `DocxParser.ts`, `ParagraphParser.ts`, `TableParser.ts` |
| `renderer/` | HTML 渲染 | `DocxRenderer.ts`, `DrawingRenderer.ts`, `PageCalculator.ts` |
| `utils/` | 工具函数 | `Logger.ts` |

**关键解析器**：
- `DocumentParser.ts` - 主文档结构
- `ParagraphParser.ts` - 段落和文本
- `TableParser.ts` - 表格
- `DrawingParser.ts` - 绘图元素
- `VmlParser.ts` - VML 图形（封面、水印等）
- `StylesParser.ts` - 样式定义
- `NumberingParser.ts` - 列表编号

**关键渲染器**：
- `DocxRenderer.ts` - 主渲染器
- `ParagraphRenderer.ts` - 段落渲染
- `TableRenderer.ts` - 表格渲染
- `DrawingRenderer.ts` - 绘图元素渲染
- `HeaderFooterRenderer.ts` - 页眉页脚
- `PageCalculator.ts` - 分页计算

### 3. `packages/xlsx` - XLSX 模块

**核心职责**：解析和渲染 Microsoft Excel 电子表格。

| 目录 | 职责 | 关键文件 |
|------|------|----------|
| `parser/` | XML 解析 | `XlsxParser.ts`, `WorksheetParser.ts`, `ChartParser.ts` |
| `renderer/` | HTML 渲染 | `XlsxRenderer.ts`, `ChartRenderer.ts`, `ShapeRenderer.ts` |

**关键解析器**：
- `XlsxParser.ts` - 主解析器
- `WorkbookParser.ts` - 工作簿结构
- `WorksheetParser.ts` - 工作表数据
- `StyleParser.ts` - 样式定义
- `DrawingParser.ts` - 绘图元素
- `ChartParser.ts` - 图表
- `ThemeParser.ts` - 主题颜色

**关键渲染器**：
- `XlsxRenderer.ts` - 主渲染器
- `StyleResolver.ts` - 样式解析
- `CellStyleUtils.ts` - 单元格样式
- `ShapeRenderer.ts` - 形状渲染
- `ImageRenderer.ts` - 图片渲染
- `ChartRenderer.ts` - 图表渲染
- `ConnectorRenderer.ts` - 连接符渲染

---

## 📊 数据流

### 解析流程

```
ArrayBuffer (DOCX/XLSX 文件)
    ↓
ZIP 解压缩 (fflate)
    ↓
XML 文件提取
    ↓
XML 解析 (DOMParser)
    ↓
格式特定解析器
    ↓
AST 对象 (DocxDocument / XlsxWorkbook)
```

### 渲染流程

```
AST 对象
    ↓
主渲染器
    ↓
子渲染器（段落/表格/绘图等）
    ↓
HTML DOM 元素
    ↓
样式应用（CSS 类 + 内联样式）
    ↓
最终渲染结果
```

---

## 🔗 模块依赖关系

```
docx ──────────────┐
                   ├──────→ shared
xlsx ──────────────┤
                   │
pptx ──────────────┘

playground ────→ docx, xlsx, pptx

shared ← 不依赖其他 packages
```

---

## 📁 关键配置文件

| 文件 | 用途 |
|------|------|
| `pnpm-workspace.yaml` | 工作空间配置 |
| `tsconfig.base.json` | TypeScript 基础配置 |
| `packages/*/package.json` | 各包的依赖和脚本 |
| `packages/*/tsconfig.json` | 各包的 TypeScript 配置 |
| `packages/*/vite.config.ts` | 各包的构建配置 |

---

## 🚀 常用命令

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm run build

# 启动开发服务器（playground）
pnpm run pg:dev

# 类型检查
pnpm run type-check
```

---

## ⚡ 开发指南

### 修改共享模块时：
1. 修改 `packages/shared/src/` 下的文件
2. 运行 `pnpm run build` 重新构建
3. 在 `packages/playground` 中验证效果

### 修复 DOCX 渲染问题时：
1. 检查 `packages/docx/src/parser/` 是否正确解析 XML
2. 检查 `packages/docx/src/renderer/` 是否正确生成 HTML
3. 使用浏览器开发者工具检查 DOM 结构和样式

### 修复 XLSX 渲染问题时：
1. 检查 `packages/xlsx/src/parser/` 是否正确解析 XML
2. 检查单位转换是否使用了正确的转换函数
3. 检查绘图层（SVG）的坐标计算

---

## 🎯 设计原则

1. **高保真还原** - 渲染结果需与 Office 原生显示保持像素级一致
2. **模块化设计** - 清晰的职责划分，易于扩展
3. **类型安全** - TypeScript 严格模式，避免 any
4. **零依赖核心** - 核心解析模块无外部依赖
5. **标准遵循** - 严格遵循 ECMA-376 OOXML 规范
