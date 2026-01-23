# 架构文档

[English](./ARCHITECTURE.en.md) | 简体中文

## 项目概述

Office Parser Renderer 是一个高性能的 Office 文档解析和渲染库，采用 **Monorepo** 架构，使用 pnpm workspaces 管理多个子包。项目的核心目标是提供高保真的 Office 文档渲染能力，确保渲染结果与 Microsoft Office 原生应用尽可能一致。

## 项目结构

```
officeParserRenderer/
├── packages/                        # 子包目录
│   ├── shared/                      # 共享模块
│   │   ├── src/
│   │   │   ├── drawing/             # 绘图相关模块
│   │   │   │   ├── renderers/       # 绘图渲染器（图片、形状、图表）
│   │   │   │   ├── shapes/          # 形状定义和路径生成
│   │   │   │   ├── charts/          # 图表渲染逻辑
│   │   │   │   └── types.ts         # 绘图相关类型
│   │   │   ├── styles/              # 样式工具
│   │   │   │   ├── ColorUtils.ts    # 颜色处理工具
│   │   │   │   ├── UnitConverter.ts  # 单位转换工具
│   │   │   │   ├── AlignmentStyles.ts # 对齐样式工具
│   │   │   │   ├── BorderStyles.ts   # 边框样式工具
│   │   │   │   └── TextStyles.ts     # 文本样式工具
│   │   │   ├── utils/               # 通用工具函数
│   │   │   │   ├── ColorUtils.ts    # 颜色处理
│   │   │   │   └── geometry.ts      # 几何计算
│   │   │   ├── math/                # 数学公式渲染
│   │   │   │   ├── OMathRenderer.ts  # 公式渲染器
│   │   │   │   └── types.ts         # 公式相关类型
│   │   │   ├── fonts/               # 字体管理
│   │   │   │   └── FontManager.ts   # 字体映射和管理
│   │   │   ├── xml/                 # XML 解析工具
│   │   │   └── zip/                 # ZIP 压缩处理
│   │   ├── dist/                    # 构建输出
│   │   └── package.json
│   ├── docx/                        # DOCX 文档处理模块
│   │   ├── src/
│   │   │   ├── parser/              # DOCX 解析器
│   │   │   │   ├── DocxParser.ts     # 主解析器
│   │   │   │   ├── DocumentParser.ts  # 文档结构解析
│   │   │   │   ├── ParagraphParser.ts # 段落解析
│   │   │   │   ├── RunParser.ts      # 文本运行解析
│   │   │   │   ├── TableParser.ts    # 表格解析
│   │   │   │   ├── DrawingParser.ts  # 绘图元素解析
│   │   │   │   ├── VmlParser.ts      # VML 图形解析
│   │   │   │   ├── StylesParser.ts   # 样式解析
│   │   │   │   ├── NumberingParser.ts # 列表编号解析
│   │   │   │   └── ...               # 其他解析器
│   │   │   ├── renderer/            # DOCX 渲染器
│   │   │   │   ├── DocxRenderer.ts   # 主渲染器
│   │   │   │   ├── ParagraphRenderer.ts # 段落渲染
│   │   │   │   ├── RunRenderer.ts    # 文本运行渲染
│   │   │   │   ├── TableRenderer.ts  # 表格渲染
│   │   │   │   ├── DrawingRenderer.ts # 绘图元素渲染
│   │   │   │   ├── HeaderFooterRenderer.ts # 页眉页脚渲染
│   │   │   │  ├── PageCalculator.ts # 分页计算
│   │   │   │   └── ListCounter.ts    # 列表计数器
│   │   │   ├── types.ts             # DOCX 类型定义
│   │   │   ├── utils/               # DOCX 工具函数
│   │   │   │   ├── UnitConverter.ts  # 单位转换（将迁移到 shared）
│   │   │   │   └── Logger.ts        # 日志工具
│   │   │   └── index.ts             # 导出入口
│   │   ├── dist/                    # 构建输出
│   │   └── package.json
│   └── xlsx/                        # XLSX 表格处理模块
│       ├── src/
│       │   ├── parser/              # XLSX 解析器
│       │   │   ├── XlsxParser.ts     # 主解析器
│       │   │   ├── WorkbookParser.ts # 工作簿解析
│       │   │   ├── WorksheetParser.ts # 工作表解析
│       │   │   ├── StyleParser.ts    # 样式解析
│       │   │   ├── DrawingParser.ts  # 绘图解析
│       │   │   ├── ChartParser.ts    # 图表解析
│       │   │   └── ThemeParser.ts    # 主题解析
│       │   ├── renderer/            # XLSX 渲染器
│       │   │   ├── XlsxRenderer.ts   # 主渲染器
│       │   │   ├── CellStyleUtils.ts # 单元格样式工具
│       │   │   ├── StyleResolver.ts  # 样式解析器
│       │   │   ├── ChartRenderer.ts  # 图表渲染
│       │   │   ├── ShapeRenderer.ts  # 形状渲染
│       │   │   ├── ImageRenderer.ts  # 图片渲染
│       │   │   └── ConnectorRenderer.ts # 连接符渲染
│       │   ├── types.ts             # XLSX 类型定义
│       │   ├── utils/               # XLSX 工具函数
│       │   └── index.ts             # 导出入口
│       ├── dist/                    # 构建输出
│       └── package.json
├── docs/                            # 文档目录
│   ├── ARCHITECTURE.md              # 中文架构文档
│   ├── ARCHITECTURE.en.md           # 英文架构文档
│   ├── DEVELOPMENT.md               # 中文开发指南
│   ├── DEVELOPMENT.en.md            # 英文开发指南
│   └── progressive_development_plan.md # 渐进式开发计划
├── spec/                            # 测试文件和规范
├── README.md                        # 中文项目说明
├── README.en.md                     # 英文项目说明
├── package.json                     # 根package.json
├── pnpm-workspace.yaml              # pnpm工作空间配置
└── tsconfig.base.json               # TypeScript 基础配置
```

## 核心模块

### 1. Shared 模块

**职责**：提供所有格式通用的功能，包括绘图、样式处理、工具函数等。

**关键组件**：

#### 绘图模块 (`drawing/`)
- **形状渲染器** (`shapes/`)：支持矩形、圆形、星形、箭头等预设形状的路径生成
- **图表渲染器** (`charts/`)：柱状图、折线图、饼图、混合图等图表类型的渲染
- **图片渲染器**：处理图片的插入和变换
- **通用渲染器**：提供 SVG 元素创建、样式应用等通用功能

#### 样式模块 (`styles/`)
- **颜色处理**：RGB/HEX 转换、主题颜色解析、色调调整
- **单位转换**：Twips、EMU、Points、Pixels 之间的转换
- **样式工具**：对齐、边框、文本样式的 CSS 生成

#### 数学公式模块 (`math/`)
- **公式渲染器**：支持 Office Math 公式的 HTML 渲染
- **公式元素**：分数、根式、上下标、矩阵等数学元素

#### 字体管理 (`fonts/`)
- **字体映射**：Office 字体名称到 Web 字体的映射
- **字体样式注入**：动态生成字体 CSS 类

---

### 2. DOCX 模块

**职责**：解析和渲染 Microsoft Word (.docx) 文档。

**工作流程**：

#### DOCX 解析流程

```
ArrayBuffer (DOCX 文件)
    ↓
ZIP 解压缩
    ↓
XML 文件提取
├── document.xml          (主文档内容)
├── styles.xml            (样式定义)
├── numbering.xml         (列表编号)
├── settings.xml          (文档设置)
├── theme1.xml            (主题颜色)
├── header*.xml           (页眉)
├── footer*.xml           (页脚)
├── _rels/*.xml.rels      (关系映射)
└── media/*               (图片等媒体文件)
    ↓
DocxParser 解析
├── DocumentParser        → 解析主文档结构
├── ParagraphParser       → 解析段落和文本运行
├── TableParser           → 解析表格
├── DrawingParser         → 解析绘图元素
├── StylesParser          → 解析样式定义
├── NumberingParser       → 解析列表编号
└── ...
    ↓
生成 DocxDocument AST (抽象语法树)
```

#### DOCX 渲染流程

```
DocxDocument AST
    ↓
DocxRenderer.render()
    ↓
页面配置解析
├── 页面尺寸（A4、Letter等）
├── 页边距
├── 分节设置
└── 主题颜色
    ↓
渲染模式判断
├── 单页模式（enablePagination: false）
│   └── 所有内容渲染到一个容器
└── 分页模式（enablePagination: true）
    └── 基于高度计算分页
    ↓
元素渲染
├── ParagraphRenderer    → 渲染段落
│   ├── 段落样式（对齐、缩进、间距）
│   ├── RunRenderer      → 渲染文本运行
│   │   └── 字符样式（字体、大小、颜色、粗体等）
│   └── FieldRenderer    → 渲染域代码（页码、日期等）
├── TableRenderer        → 渲染表格
│   ├── 表格边框、间距
│   ├── 单元格合并
│   └── 单元格背景、边框
├── DrawingRenderer      → 渲染绘图元素
│   ├── 图片
│   ├── 形状
│   └── 图表
└── HeaderFooterRenderer → 渲染页眉页脚
    ↓
分页计算（如果启用分页）
└── PageCalculator.calculateWithMeasurement()
    ├── 测量元素高度
    ├── 计算分页点
    └── 生成页面范围
    ↓
最终 HTML DOM 输出
```

**关键类**：

- **DocxParser**：主解析器，协调所有子解析器
- **DocxRenderer**：主渲染器，管理页面布局和元素渲染
- **ParagraphRenderer**：段落渲染器，处理段落样式和子元素
- **TableRenderer**：表格渲染器，处理表格结构和单元格样式
- **DrawingRenderer**：绘图渲染器，委托给 shared 的通用渲染器
- **PageCalculator**：分页计算器，基于元素高度计算分页

---

### 3. XLSX 模块

**职责**：解析和渲染 Microsoft Excel (.xlsx) 电子表格。

**工作流程**：

#### XLSX 解析流程

```
ArrayBuffer (XLSX 文件)
    ↓
ZIP 解压缩
    ↓
XML 文件提取
├── workbook.xml          (工作簿结构)
├── worksheets/sheet*.xml (工作表内容)
├── styles.xml            (样式定义)
├── sharedStrings.xml     (共享字符串)
├── theme/theme1.xml      (主题颜色)
├── drawings/*.xml        (绘图元素)
├── charts/*.xml          (图表定义)
└── media/*               (图片等媒体文件)
    ↓
XlsxParser 解析
├── WorkbookParser        → 解析工作簿结构
├── WorksheetParser       → 解析工作表数据
├── StyleParser           → 解析样式定义
├── DrawingParser         → 解析绘图元素
├── ChartParser           → 解析图表
└── ThemeParser           → 解析主题颜色
    ↓
生成 XlsxWorkbook AST
```

#### XLSX 渲染流程

```
XlsxWorkbook AST
    ↓
XlsxRenderer.render()
    ↓
布局结构渲染
├── 工作表内容区域（可滚动）
└── 工作表标签栏（底部）
    ↓
当前工作表渲染
├── 计算布局指标
│   ├── 列宽数组
│   ├── 行高数组
│   └── 最大行列范围
├── 渲染HTML表格
│   ├── 生成 <colgroup>（列宽）
│   ├── 生成 <tr>（行）
│   │   └── 生成 <td>（单元格）
│   │       ├── 单元格值（文本、数字、日期）
│   │       ├── 数字格式化
│   │       └── 单元格样式（字体、边框、填充）
│   └── 处理合并单元格
└── 渲染绘图层（SVG）
    ├── 创建 SVG 覆盖层
    ├── ShapeRenderer      → 渲染形状
    ├── ImageRenderer      → 渲染图片
    ├── ConnectorRenderer  → 渲染连接符
    └── ChartRenderer      → 渲染图表
    ↓
最终 HTML DOM 输出
```

**关键类**：

- **XlsxParser**：主解析器
- **XlsxRenderer**：主渲染器
- **StyleResolver**：样式解析器，处理颜色、填充、边框等
- **CellStyleUtils**：单元格样式工具，生成单元格 CSS
- **ChartRenderer**：图表渲染器
- **ShapeRenderer**：形状渲染器
- **ImageRenderer**：图片渲染器

---

## 设计原则

### 1. 模块化与职责分离

- **单一职责**：每个模块、每个类只负责一个明确的功能
- **清晰边界**：shared 提供通用功能，docx/xlsx 提供格式特定逻辑
- **松耦合**：模块间通过接口交互，减少直接依赖

### 2. 类型安全

- **TypeScript 严格模式**：启用所有严格检查
- **完整类型定义**：为所有 AST 节点、配置选项定义精确类型
- **避免 any**：尽可能使用具体类型或泛型

### 3. 高性能

- **减少 DOM 操作**：批量创建和插入元素
- **复用对象**：缓存计算结果，避免重复计算
- **按需渲染**：仅渲染可见区域（未来优化）

### 4. 可扩展性

- **插件化设计**：渲染器可替换、可扩展
- **配置驱动**：通过配置而非硬编码来控制行为
- **开放架构**：支持自定义解析器和渲染器

### 5. 标准遵循

- **OOXML 标准**：严格遵循 ECMA-376 规范
- **Web 标准**：使用标准 DOM API 和 CSS
- **最佳实践**：遵循 TypeScript 和 JavaScript 最佳实践

---

## 数据流

### 文档解析数据流

```
原始文件 (ArrayBuffer)
    ↓
ZIP 库解压 (@ai-space/shared/zip)
    ↓
XML 文件 (字符串)
    ↓
XML 解析器 (DOMParser)
    ↓
XML DOM 树
    ↓
格式特定解析器 (DocxParser / XlsxParser)
    ↓
中间 AST (DocxDocument / XlsxWorkbook)
    ↓
渲染器 (DocxRenderer / XlsxRenderer)
    ↓
HTML DOM 树
    ↓
浏览器渲染
```

### 样式处理数据流

```
OOXML 样式定义 (styles.xml)
    ↓
StylesParser / StyleParser
    ↓
样式对象 (DocxStyles / XlsxStyles)
    ↓
样式解析器 (StyleResolver)
├── 颜色解析 (主题颜色 → RGB)
├── 单位转换 (Twips/EMU → Pixels)
└── 样式生成 (对象 → CSS)
    ↓
CSS 样式字符串 / DOM 样式对象
    ↓
应用到 DOM 元素
```

---

## 扩展指南

### 添加新的 DOCX 元素支持

1. **定义类型**：在 `docx/types.ts` 中添加元素类型定义
2. **实现解析器**：在 `docx/parser/` 中创建解析器
3. **实现渲染器**：在 `docx/renderer/` 中创建渲染器
4. **集成到主流程**：在 `DocxParser` 和 `DocxRenderer` 中集成新解析器和渲染器
5. **添加测试**：创建测试用例验证功能

### 添加新的 XLSX 功能

1. **定义类型**：在 `xlsx/types.ts` 中添加类型定义
2. **实现解析器**：在 `xlsx/parser/` 中扩展解析逻辑
3. **实现渲染逻辑**：在 `xlsx/renderer/` 中添加渲染功能
4. **测试验证**：使用真实 XLSX 文件测试

### 添加新的通用功能

1. **评估通用性**：确保功能被多个格式使用
2. **在 shared 中实现**：实现于 `shared/src/` 相应目录
3. **更新依赖**：在 docx/xlsx 中引用新功能
4. **文档更新**：更新 API 文档和示例

---

## 技术栈

- **语言**：TypeScript (严格模式)
- **构建工具**：Vite / Rollup
- **包管理**：pnpm workspaces
- **ZIP 处理**：fflate
- **XML 解析**：浏览器原生 DOMParser
- **渲染目标**：HTML5 + CSS3

---

## 性能优化策略

### 已实施的优化

1. **DOM 批量操作**：使用 DocumentFragment 批量插入元素
2. **样式复用**：通过 CSS 类名复用样式
3. **计算缓存**：缓存单位转换、颜色计算结果
4. **按需解析**：仅解析当前需要的工作表

### 未来优化方向

1. **虚拟滚动**：大文档仅渲染可见区域
2. **Web Worker**：将解析放到 Worker 线程
3. **增量渲染**：分批渲染大文档
4. **Canvas 渲染**：对性能要求极高的场景使用 Canvas

---

## 总结

Office Parser Renderer 采用清晰的模块化架构，将通用功能抽取到 shared 模块，格式特定逻辑放在各自的子包中。通过严格的类型定义、职责分离和标准遵循，项目实现了高性能、高保真的 Office 文档渲染能力。

未来的重构和优化将进一步提升代码质量、减少重复代码、优化渲染性能，使项目更加健壮和易于维护。
