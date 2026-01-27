# Office Parser & Renderer 开发指南 (Development Guide)

## 1. 核心愿景 (Core Vision)

本项目旨在构建一个**高性能、严格类型、高复用性**的 Office 文档解析与渲染引擎，核心目标是**实现与原生 Office 软件 1:1 的像素级还原 (Pixel-Perfect)**。

我们的目标不仅是查看内容，更是完美复现文档的原始布局与视觉效果：
*   **Word (DOCX)**: 精确的纸张拆分、分页、分栏、复杂的数学公式及修订记录。
*   **Excel (XLSX)**: 完整的公式计算支持、多 Sheet 管理、复杂的图表可视化。
*   **PowerPoint (PPTX)**: 流畅的幻灯片播放、缩略图视图、从基础到高级的动画效果及多媒体支持。
*   **高级视觉**: 支持 VML/DrawingML 复杂形状、3D 效果、艺术字及视频嵌入。

---

## 2. 项目架构 (Project Architecture)

### 2.1 Monorepo 结构

本项目采用 **Monorepo** 架构，使用 pnpm workspace 进行包管理。整体目录结构如下：

```
officeParserRenderer/
├── definitions/          # OOXML 类型定义 (XSD → TypeScript)
│   ├── autogen/         # 自动生成的类型文件
│   ├── scripts/         # 类型生成脚本
│   └── README.md        # 类型定义说明
│
├── packages/             # 核心子项目
│   ├── shared/          # 公共基础模块
│   │   ├── core/        # 核心工具 (日志、单位转换、颜色解析)
│   │   ├── types/       # 公共类型定义
│   │   ├── drawing/     # DrawingML 解析与渲染
│   │   ├── fonts/       # 字体处理
│   │   ├── math/        # 数学公式 (OMath)
│   │   ├── styles/      # 样式系统
│   │   └── README.md    # 公共模块说明
│   │
│   ├── xlsx/            # Excel 解析与渲染
│   │   ├── parser/      # XLSX 解析器
│   │   ├── renderer/    # XLSX 渲染器
│   │   ├── __tests__/   # 测试用例
│   │   └── README.md    # XLSX 模块说明
│   │
│   ├── docx/            # Word 解析与渲染
│   │   ├── parser/      # DOCX 解析器
│   │   ├── renderer/    # DOCX 渲染器
│   │   ├── __tests__/   # 测试用例
│   │   └── README.md    # DOCX 模块说明
│   │
│   └── pptx/            # PowerPoint 解析与渲染
│       ├── parser/      # PPTX 解析器
│       ├── renderer/    # PPTX 渲染器
│       ├── __tests__/   # 测试用例
│       └── README.md    # PPTX 模块说明
│
├── playground/           # 测试演示项目
│   ├── src/             # 演示代码
│   ├── public/          # 测试文件 (docx/xlsx/pptx 样本)
│   └── README.md        # 演示项目说明
│
├── docs/                 # 项目文档
└── scripts/              # 构建与工具脚本
```

### 2.2 子项目职责

| 子项目 | 职责 | 依赖关系 |
|--------|------|----------|
| `definitions` | 基于 OOXML XSD 自动生成 TypeScript 类型定义 | 无依赖 |
| `packages/shared` | 提供公共工具、类型、样式解析等基础能力 | 依赖 `definitions` |
| `packages/xlsx` | Excel 文档的解析与渲染 | 依赖 `shared` |
| `packages/docx` | Word 文档的解析与渲染 | 依赖 `shared` |
| `packages/pptx` | PowerPoint 文档的解析与渲染 | 依赖 `shared` |
| `playground` | 集成测试与效果演示 | 依赖 `xlsx`, `docx`, `pptx` |

---

## 3. 核心处理流程 (Core Pipeline)

### 3.1 统一处理流程

所有 Office 文档均遵循 **三阶段处理流程**：

```
┌─────────────────────────────────────────────────────────────────┐
│                      Office 文档处理流程                          │
└─────────────────────────────────────────────────────────────────┘

  *.xlsx / *.docx / *.pptx
           │
           ▼
  ┌─────────────────┐
  │   1. 解压 Unzip  │  将 Office 文件 (本质是 ZIP 包) 解压
  │                 │  提取 XML 文件、媒体资源、关系文件等
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │  2. 解析 Parse   │  XML → AST (抽象语法树)
  │                 │  基于 definitions 类型定义进行强类型解析
  │   BaseParser    │  输出结构化的文档对象模型
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ 3. 渲染 Render   │  AST → DOM / Canvas
  │                 │  将抽象语法树转换为可视化元素
  │  BaseRenderer   │  支持 DOM 渲染和 Canvas 渲染两种模式
  └─────────────────┘
```

### 3.2 基类设计

#### BaseParser (基础解析器)

```typescript
/**
 * 基础解析器抽象类
 * 所有具体解析器 (XlsxParser, DocxParser, PptxParser) 必须继承此类
 */
abstract class BaseParser<TDocument, TOptions = ParserOptions> {
  protected options: TOptions;
  protected logger: Logger;
  
  constructor(options?: Partial<TOptions>);
  
  /**
   * 解析入口 - 从 ArrayBuffer 解析文档
   * @param buffer 文件二进制数据
   * @returns 解析结果 (成功返回 AST，失败返回错误信息)
   */
  abstract parse(buffer: ArrayBuffer): Promise<Result<TDocument, ParseError>>;
  
  /**
   * 解压 ZIP 文件
   * @param buffer 文件二进制数据
   * @returns 解压后的文件映射 { 路径: 内容 }
   */
  protected async unzip(buffer: ArrayBuffer): Promise<Map<string, Uint8Array>>;
  
  /**
   * 解析 XML 字符串为 DOM
   * @param xml XML 字符串
   * @returns XML 文档对象
   */
  protected parseXML(xml: string): Document;
  
  /**
   * 解析关系文件 (.rels)
   * @param relsXml 关系文件 XML 内容
   * @returns 关系映射
   */
  protected parseRelationships(relsXml: string): RelationshipMap;
}
```

#### BaseRenderer (基础渲染器)

```typescript
/**
 * 基础渲染器抽象类
 * 所有具体渲染器 (XlsxRenderer, DocxRenderer, PptxRenderer) 必须继承此类
 */
abstract class BaseRenderer<TDocument, TOptions = RendererOptions> {
  protected container: HTMLElement;
  protected options: TOptions;
  protected logger: Logger;
  
  constructor(container: HTMLElement, options?: Partial<TOptions>);
  
  /**
   * 渲染入口 - 将 AST 渲染到容器中
   * @param document 解析后的文档 AST
   */
  abstract render(document: TDocument): Promise<void>;
  
  /**
   * 销毁渲染器，清理资源
   */
  abstract destroy(): void;
  
  /**
   * 创建 DOM 元素
   * @param tag 标签名
   * @param attrs 属性
   * @param children 子元素
   */
  protected createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attrs?: Record<string, string>,
    children?: (HTMLElement | string)[]
  ): HTMLElementTagNameMap[K];
  
  /**
   * 应用样式到元素
   * @param element 目标元素
   * @param styles 样式对象
   */
  protected applyStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void;
}
```

---

## 4. 核心技术规范 (Technical Standards)

### 4.1 架构原则

*   **统一类型源 (Single Source of Truth)**：严格依赖 `definitions` 中基于 XSD 生成的 TypeScript 类型，严禁手动定义模糊类型。
*   **严格类型模式 (Strict Typing)**：核心逻辑禁止使用 `any`。解析层必须使用 Result 模式处理错误，而非抛出异常。
*   **高性能 (Performance First)**：
    *   **Web Worker**: 解析与繁重计算（如布局计算）必须在 Worker 中执行。
    *   **虚拟滚动 (Virtual Scroll)**: 针对 DOCX 长文档和 XLSX 大表格，必须实现虚拟渲染。
    *   **OffscreenCanvas**: 复杂图形渲染优先使用离屏 Canvas。

### 4.2 渲染策略

*   **DOM 与 Canvas 混合**: 
    *   基础文本与布局使用 DOM (HTML/CSS) 以利用浏览器原生的排版能力。
    *   复杂图表、3D 图形、ArtWord 使用 Canvas/SVG 绘制以保证还原度。
*   **布局引擎**: 需要自行实现一套 Layout Engine 来处理分页 (Pagination) 和分栏，不能完全依赖浏览器流式布局。

---

## 5. 开发顺序与优先级 (Development Order)

### 5.1 开发顺序

项目采用**渐进式开发**策略，按以下顺序实现：

```
┌─────────────────────────────────────────────────────────────┐
│                       开发优先级                              │
└─────────────────────────────────────────────────────────────┘

  Phase 0: 基础设施 (共享模块 shared)
     ↓
  Phase 1: Excel (XLSX) - 表格结构相对简单，快速验证核心流程
     ↓
  Phase 2: Word (DOCX) - 复杂的文本排版与分页逻辑
     ↓
  Phase 3: PowerPoint (PPTX) - 动画与多媒体，依赖前两者的基础
```

### 5.2 各阶段详细任务

#### Phase 0: 基础设施 (`shared`)

| 优先级 | 模块 | 任务 | 状态 |
|--------|------|------|------|
| P0 | `core` | 日志系统 (Logger) | [ ] |
| P0 | `core` | 单位转换 (EMU/Pt/Px/字符宽) | [ ] |
| P0 | `core` | 颜色解析工具 | [ ] |
| P0 | `types` | 公共类型定义与 Type Guards | [ ] |
| P1 | `styles` | 文本/段落样式解析 | [ ] |
| P1 | `styles` | 边框/填充/阴影解析 | [ ] |
| P1 | `styles` | 边框冲突解决算法 | [ ] |
| P2 | `drawing` | DrawingML 形状解析 | [ ] |
| P2 | `drawing` | 浮动定位引擎 (TwoCellAnchor/OneCellAnchor) | [ ] |
| P2 | `fonts` | 字体加载与管理 | [ ] |
| P2 | `rendering` | 富文本渲染器 (字符级样式) | [ ] |
| P2 | `rendering` | 数值格式化引擎 (numFmt) | [ ] |
| P3 | `rendering` | ChartML 图表引擎 | [ ] |
| P3 | `performance` | Web Worker 封装 | [ ] |
| P3 | `performance` | Virtual Scroll 引擎 | [ ] |
| P3 | `performance` | Document Fragment 工具 | [ ] |

#### Phase 1: Excel (`xlsx`) - 分级任务

| Level | 难度 | 功能模块 | 任务 | 状态 |
|-------|------|----------|------|------|
| L1 | ★☆☆☆☆ | 解析器 | Workbook 结构解析 | [ ] |
| L1 | ★☆☆☆☆ | 解析器 | SharedStrings 字符串索引 | [ ] |
| L1 | ★☆☆☆☆ | 解析器 | Worksheet 单元格解析 (稀疏矩阵处理) | [ ] |
| L1 | ★☆☆☆☆ | 渲染器 | 基础网格布局 | [ ] |
| L1 | ★☆☆☆☆ | 渲染器 | 多 Sheet 切换 UI | [ ] |
| L2 | ★★☆☆☆ | 解析器 | styles.xml 深度解析 (索引复用机制) | [ ] |
| L2 | ★★☆☆☆ | 渲染器 | 单元格样式 (字体/填充/对齐) | [ ] |
| L2 | ★★☆☆☆ | 渲染器 | 行列尺寸 (单位换算) | [ ] |
| L3 | ★★★☆☆ | 解析器 | 合并单元格 (mergeCells) | [ ] |
| L3 | ★★★☆☆ | 渲染器 | 合并单元格渲染与交互 | [ ] |
| L3 | ★★★☆☆ | 渲染器 | 数值格式化应用 | [ ] |
| L3 | ★★★☆☆ | 渲染器 | 冻结行列 (Freeze Panes) | [ ] |
| L4 | ★★★★☆ | 渲染器 | 复杂边框 (边框冲突解决) | [ ] |
| L4 | ★★★★☆ | 渲染器 | 富文本单元格 | [ ] |
| L4 | ★★★★☆ | 解析器 | 图片与图形 (Drawings) | [ ] |
| L4 | ★★★★☆ | 渲染器 | 浮动定位图片渲染 | [ ] |
| L5 | ★★★★★ | 解析器 | 公式预览 (读取缓存值) | [ ] |
| L5 | ★★★★★ | 计算 | 公式引擎 (可选) | [ ] |
| L5 | ★★★★★ | 图表 | ChartML 解析与渲染 | [ ] |
| L5 | ★★★★★ | 渲染器 | 条件格式 (数据条/色阶/图标集) | [ ] |

#### Phase 2: Word (`docx`) - 分级任务

| Level | 难度 | 功能模块 | 任务 | 状态 |
|-------|------|----------|------|------|
| L1 | ★☆☆☆☆ | 解析器 | Document 结构解析 (document.xml) | [ ] |
| L1 | ★☆☆☆☆ | 解析器 | 段落与文本解析 (w:p, w:r, w:t) | [ ] |
| L1 | ★☆☆☆☆ | 渲染器 | 基础文本渲染 | [ ] |
| L1 | ★☆☆☆☆ | 渲染器 | 基础段落样式 (对齐、缩进) | [ ] |
| L2 | ★★☆☆☆ | 解析器 | styles.xml 样式解析 (段落/字符样式) | [ ] |
| L2 | ★★☆☆☆ | 渲染器 | 字符样式 (粗体/斜体/下划线/删除线) | [ ] |
| L2 | ★★☆☆☆ | 渲染器 | 列表渲染 (有序/无序/多级列表) | [ ] |
| L2 | ★★☆☆☆ | 解析器 | numbering.xml 编号定义解析 | [ ] |
| L3 | ★★★☆☆ | 解析器 | 表格解析 (w:tbl, w:tr, w:tc) | [ ] |
| L3 | ★★★☆☆ | 渲染器 | 表格渲染 (合并单元格、边框) | [ ] |
| L3 | ★★★☆☆ | 解析器 | 图片解析 (w:drawing, a:blip) | [ ] |
| L3 | ★★★☆☆ | 渲染器 | 内联/浮动图片渲染 | [ ] |
| L4 | ★★★★☆ | 布局 | 纸张拆分 (分页逻辑) | [ ] |
| L4 | ★★★★☆ | 布局 | 分节处理 (w:sectPr) | [ ] |
| L4 | ★★★★☆ | 布局 | 分栏布局 | [ ] |
| L4 | ★★★★☆ | 渲染器 | 页眉页脚 (首页不同/奇偶页不同) | [ ] |
| L5 | ★★★★★ | 高级 | 数学公式 (m:oMath) | [ ] |
| L5 | ★★★★★ | 高级 | 修订记录 (Track Changes) | [ ] |
| L5 | ★★★★★ | 高级 | 批注 (Comments) | [ ] |
| L5 | ★★★★★ | 高级 | 艺术字 (WordArt) | [ ] |
| L5 | ★★★★★ | 兼容 | VML 矢量图 (旧版文档) | [ ] |

#### Phase 3: PowerPoint (`pptx`) - 分级任务

| Level | 难度 | 功能模块 | 任务 | 状态 |
|-------|------|----------|------|------|
| L1 | ★☆☆☆☆ | 解析器 | Presentation 结构解析 (presentation.xml) | [ ] |
| L1 | ★☆☆☆☆ | 解析器 | Slide 内容解析 (slideX.xml) | [ ] |
| L1 | ★☆☆☆☆ | 渲染器 | 基础 Slide 渲染 (背景色/尺寸) | [ ] |
| L1 | ★☆☆☆☆ | 渲染器 | Slide 列表导航 | [ ] |
| L2 | ★★☆☆☆ | 解析器 | 形状解析 (p:sp, 文本框) | [ ] |
| L2 | ★★☆☆☆ | 渲染器 | 文本框渲染 (段落/字符样式) | [ ] |
| L2 | ★★☆☆☆ | 解析器 | 图片解析 (p:pic) | [ ] |
| L2 | ★★☆☆☆ | 渲染器 | 图片渲染 (定位/裁剪) | [ ] |
| L3 | ★★★☆☆ | 解析器 | Master Slide 解析 (slideMasterX.xml) | [ ] |
| L3 | ★★★☆☆ | 解析器 | Layout Slide 解析 (slideLayoutX.xml) | [ ] |
| L3 | ★★★☆☆ | 渲染器 | 母版/布局继承机制 | [ ] |
| L3 | ★★★☆☆ | 渲染器 | 缩略图生成 | [ ] |
| L4 | ★★★★☆ | 解析器 | 动画时序解析 (p:timing) | [ ] |
| L4 | ★★★★☆ | 动画 | 进入/退出/强调动画 | [ ] |
| L4 | ★★★★☆ | 动画 | 路径动画 (Motion Path) | [ ] |
| L4 | ★★★★☆ | 播放 | 步骤播放控制 (On Click) | [ ] |
| L5 | ★★★★★ | 多媒体 | 视频嵌入与播放 | [ ] |
| L5 | ★★★★★ | 多媒体 | 音频嵌入与播放 | [ ] |
| L5 | ★★★★★ | 高级 | 切换效果 (Slide Transition) | [ ] |
| L5 | ★★★★★ | 高级 | 3D 形状与场景 | [ ] |
| L5 | ★★★★★ | 高级 | SmartArt 渲染 | [ ] |

---

## 6. 文档规范 (Documentation Standards)

### 6.1 README 文档要求

**每个目录**都必须包含独立的 `README.md` 文件，说明该目录的：

1. **职责**：该目录/模块的核心功能
2. **结构**：子目录与文件的组织方式
3. **使用**：如何使用该模块 (API 示例)
4. **依赖**：该模块的内部/外部依赖

**示例模板**：

```markdown
# [模块名称]

## 概述
简要说明该模块的核心功能与职责。

## 目录结构
/```
[模块名]/
├── index.ts          # 模块入口
├── [子模块]/         # 子模块说明
└── __tests__/        # 测试用例
/```

## 使用示例
/```typescript
import { xxx } from '@opr/[模块名]';

// 使用示例代码
/```

## API 文档
### [函数/类名]
- **描述**: ...
- **参数**: ...
- **返回**: ...

## 依赖关系
- 依赖: `@opr/shared`, `@opr/definitions`
- 被依赖: `@opr/docx`, `@opr/xlsx`
```

### 6.2 子项目文档要求

每个子项目 (`xlsx`, `docx`, `pptx`) 必须包含以下文档：

| 文档 | 内容 | 位置 |
|------|------|------|
| README.md | 模块概述、快速开始、API 概览 | `packages/[name]/` |
| ARCHITECTURE.md | 详细架构设计、数据流图 | `packages/[name]/docs/` |
| CHANGELOG.md | 版本变更记录 | `packages/[name]/` |

---

## 7. 测试规范 (Testing Standards)

### 7.1 测试要求

每个子项目必须包含独立的测试套件，存放于 `__tests__/` 目录：

```
packages/[name]/
├── __tests__/
│   ├── parser/           # 解析器测试
│   │   ├── unit/        # 单元测试
│   │   └── fixtures/    # 测试样本文件
│   ├── renderer/         # 渲染器测试
│   │   ├── unit/        # 单元测试
│   │   └── visual/      # 视觉回归测试快照
│   └── integration/      # 集成测试
```

### 7.2 测试类型

| 测试类型 | 目的 | 工具 |
|----------|------|------|
| **单元测试** | 验证单个函数/类的正确性 | Vitest |
| **集成测试** | 验证模块间协作 | Vitest |
| **视觉回归测试** | 确保渲染结果一致性 | Playwright + 截图对比 |
| **性能测试** | 监控解析/渲染性能 | Benchmark.js |

### 7.3 测试命令

```bash
# 运行单个子项目测试
pnpm --filter @opr/xlsx test

# 运行所有测试
pnpm test

# 运行视觉回归测试
pnpm test:visual

# 更新视觉快照
pnpm test:visual --update-snapshots
```

### 7.4 Playground 测试

`playground` 项目用于**可视化验证**解析渲染效果：

*   支持拖拽上传 `.docx`, `.xlsx`, `.pptx` 文件
*   实时展示解析后的 AST 结构
*   并排对比渲染结果与预期效果
*   提供性能监控面板

---

## 8. 渐进式开发路线图 (Progressive Roadmap)

我们采用分层迭代的方式，从通用基础开始，逐步攻克各个文档类型的核心难题。

### 阶段一：通用基础与架构 (Infrastructure & Commons)
**目标**：建立坚实的底层能力，实现跨应用共享模块。

1.  **基础设施**
    *   [ ] **工具库**: 统一的 `Logger` (性能打点), `Unit Conversion` (EMU/Pt/Px 转换), `Color Parsing`。
    *   [ ] **文件处理**: Zip 解压、XML 解析器封装、资源文件 (Media) 管理。
    *   [ ] **常量字典**: 单位转换因子、纸张、单位、颜色、边框、格式化及布局等常用常量定义。
    *   [ ] **类型系统**: 完善 `definitions`，建立公共 Type Guards。

2.  **公共样式系统 (`shared/styles`)**
    *   [ ] **字体管理**: 根据字体对应关系建立 office 与 css 字体管理。
    *   [ ] **文本/段落**: 字号、字体、行距、对齐、缩进的统一解析。
    *   [ ] **基础几何**: 边框 (复杂线型), 填充 (渐变/纹理), 阴影 (内外阴影/透视)。
    *   [ ] **边框冲突解决算法**: 相邻单元格共享边框时的优先级判定（XLSX/DOCX 表格通用）。

3.  **DrawingML 核心 (`shared/drawing`)**
    *   [ ] **形状引擎**: 解析 `prstGeom` (预设形状) 和 `custGeom` (自定义路径)。
    *   [ ] **图片处理**: 支持裁剪、着色、透明度处理。
    *   [ ] **变换系统**: 2D 变换 (旋转/翻转/缩放)。
    *   [ ] **浮动定位引擎**: 解析 `TwoCellAnchor`/`OneCellAnchor`，计算图片/图形的绝对坐标。

4.  **公共渲染引擎 (`shared/rendering`)**
    *   [ ] **富文本渲染器**: 单个容器内多样式文本渲染（字符级颜色/字体切换）。
    *   [ ] **数值格式化引擎**: 解析 `numFmt` 格式字符串（如 `#,##0.00`、日期格式等）。
    *   [ ] **ChartML 图表引擎**:
        *   基础图表: 柱状图、折线图、饼图
        *   复杂图表: 组合图 (Combo Charts)、散点图、雷达图
        *   图表元素: 趋势线、误差线、自定义坐标轴
        *   映射到 Web 图表库 (ECharts/Chart.js)

5.  **性能优化基础 (`shared/performance`)**
    *   [ ] **Web Worker 封装**:
        *   Worker 线程池管理，支持任务队列与优先级调度
        *   大文件解压/XML 解析移至 Worker 执行
        *   布局计算（分页、单元格尺寸）在 Worker 中预处理
        *   主线程与 Worker 间的 Transferable 对象传输
    *   [ ] **Document Fragment 工具**:
        *   批量 DOM 创建工具，减少重排重绘
        *   统一的 `createElements()` 批量节点生成
        *   离屏 DOM 构建后一次性挂载
    *   [ ] **Virtual Scroll 引擎**:
        *   可复用的虚拟滚动核心逻辑
        *   支持 XLSX 大表格（百万级单元格）虚拟化
        *   支持 DOCX 长文档按页/段落虚拟化
        *   动态行高/列宽计算与缓存
        *   滚动位置记忆与快速跳转
    *   [ ] **OffscreenCanvas 封装**:
        *   离屏 Canvas 绑定 Web Worker
        *   复杂图形（图表、形状）后台渲染
        *   渲染结果位图传输至主线程展示
    *   [ ] **资源优化策略**:
        *   对象池 (Object Pool) 复用 DOM 节点/Canvas Context
        *   图片/媒体资源懒加载 (Lazy Loading)
        *   LRU 缓存淘汰策略管理解析结果
        *   请求合并与防抖 (Debounce/Throttle)

---

### 阶段二：Excel (XLSX) 分级开发计划

XLSX 的开发按照**功能复杂度**和**实现难度**分为 5 个阶段 (Levels)，从 MVP 到完整功能逐步迭代。

#### Level 1: MVP - 基础数据展示 ★☆☆☆☆
**目标**：能把内容显示出来，不追求美观，保证数据可读。

| 功能 | 解析任务 | 渲染任务 | 难点 |
|------|----------|----------|------|
| **纯文本数据** | 读取 `sharedStrings.xml` 和 `sheetX.xml`，建立字符串索引映射 | 将 Cell 值渲染到对应位置 | 区分数字与字符串类型 |
| **基础网格布局** | 解析 `dimension` 确定表格范围 | 渲染行列网格 | 处理稀疏矩阵（空行/空单元格不存储），需补全占位 |
| **多 Sheet 切换** | 解析 `workbook.xml` 获取 Sheet 列表和顺序 | 底部 Tab 栏切换 UI | Sheet 间状态隔离 |

```
核心文件：
├── xl/workbook.xml          # Sheet 列表
├── xl/sharedStrings.xml     # 共享字符串池
├── xl/worksheets/sheet1.xml # 工作表数据
└── xl/_rels/workbook.xml.rels
```

#### Level 2: 基础样式还原 ★★☆☆☆
**目标**：还原用户最常用的视觉样式，看起来像个正经表格。

| 功能 | 解析任务 | 渲染任务 | 难点 |
|------|----------|----------|------|
| **单元格样式** | 深度解析 `styles.xml`，处理样式索引复用机制 | 应用字体颜色、背景填充、粗体/斜体/下划线 | 样式通过 ID 索引复用，需建立完整映射 |
| **对齐方式** | 解析 `alignment` 节点 | 水平/垂直对齐、自动换行 (Wrap Text) | 换行时动态计算行高 |
| **行列尺寸** | 解析 `cols`/`rows` 的自定义宽高 | 应用自定义列宽、行高 | **单位换算极其复杂** (磅/像素/字符宽需要精确转换) |

```
核心文件：
├── xl/styles.xml            # 样式定义 (字体、填充、边框、数字格式)
│   ├── fonts                # 字体定义
│   ├── fills                # 填充定义
│   ├── cellXfs              # 单元格格式组合 (通过索引引用)
│   └── numFmts              # 数字格式
```

**单位换算公式**：
```typescript
// Excel 列宽单位：以"0"字符宽度为基准
const pixelWidth = Math.floor((excelWidth * 7 + 5) / 7 * 256) / 256 * 7;
// Excel 行高单位：磅 (Points)
const pixelHeight = rowHeightInPoints * 96 / 72;
```

#### Level 3: 进阶布局与格式 ★★★☆☆
**目标**：处理破坏标准网格结构的特性，以及数据的语义化展示。

| 功能 | 解析任务 | 渲染任务 | 难点 |
|------|----------|----------|------|
| **合并单元格** | 解析 `mergeCells` 标签 | 多格合并渲染，只显示左上角内容 | 🔴 **渲染引擎噩梦**：鼠标点击、选区计算、边框渲染均需特殊处理 |
| **数值格式化** | 解析 `numFmt` 格式字符串 | 将数字显示为日期/货币/百分比等 | 🔴 **格式引擎**：需实现完整的格式解析器（如 `#,##0.00_);[Red](#,##0.00)`） |
| **冻结行列** | 解析 `pane` 和 `freezePane` | 固定首行/首列，滚动同步 | 需将 Grid 切分为多个独立渲染区域 |

**数值格式示例**：
| 原始值 | 格式字符串 | 显示结果 |
|--------|------------|----------|
| `44952` | `yyyy-mm-dd` | `2023-01-27` |
| `44952` | `$#,##0.00` | `$44,952.00` |
| `0.156` | `0.00%` | `15.60%` |

#### Level 4: 高保真视觉 ★★★★☆
**目标**：视觉上几乎和本地 Excel 软件一致，魔鬼在细节。

| 功能 | 解析任务 | 渲染任务 | 难点 |
|------|----------|----------|------|
| **复杂边框** | 解析 `border` 节点（上下左右、粗细、颜色、线型） | 渲染双线、虚线等复杂边框 | 🔴 **边框冲突算法**：相邻单元格共用边，需优先级判定 |
| **富文本单元格** | 解析 `si` 中的 `rPr` (Run Properties) | 同一单元格内多样式文本渲染 | Canvas 渲染需自行计算每个字符的绘制位置 |
| **图片与图形** | 解析 `drawings` 目录下的 XML | 按浮动定位渲染图片 | 🔴 **浮动定位**：`TwoCellAnchor`/`OneCellAnchor` 坐标转换 |

**边框冲突解决规则**（优先级从高到低）：
1. 更粗的边框优先
2. 深色优先于浅色
3. 实线优先于虚线
4. 当前单元格优先于相邻单元格

#### Level 5: 核心逻辑与高级特性 ★★★★★
**目标**：不仅是"看"，还能展示动态计算内容，达到商业级渲染标准。

| 功能 | 解析任务 | 渲染任务 | 难点 |
|------|----------|----------|------|
| **公式预览** | 读取 XML 中的 `<v>` (cached value) | 直接显示缓存结果 | 简单，仅展示 |
| **公式计算** | 解析 `<f>` 公式字符串 | 动态计算并更新 | 🔴 **公式引擎**：需实现 Excel 函数库 (SUM, VLOOKUP, INDEX...) |
| **图表渲染** | 解析 `chart` 目录下的 ChartML | 映射到 ECharts/Chart.js 渲染 | 🔴 配置复杂，难以 100% 还原原始样式 |
| **条件格式** | 解析 `conditionalFormatting` | 数据条、色阶、图标集渲染 | 🔴 **动态逻辑**：每行渲染时需执行条件判断 |
---

### 阶段三：Word (DOCX) 分级开发计划

DOCX 的开发按照**功能复杂度**和**实现难度**分为 5 个阶段 (Levels)，核心挑战在于**布局引擎**的实现。

#### Level 1: MVP - 基础文本展示 ★☆☆☆☆
**目标**：能把文档内容显示出来，保证文字可读。

| 功能 | 解析任务 | 渲染任务 | 难点 |
|------|----------|----------|------|
| **文档结构** | 解析 `document.xml`，提取 `w:body` 内容 | 顺序渲染段落 | 理解 Part 结构和关系文件 |
| **段落与文本** | 解析 `w:p` (段落)、`w:r` (Run)、`w:t` (Text) | 渲染纯文本内容 | Run 是最小样式单元 |
| **基础段落样式** | 解析 `w:pPr` 中的对齐、缩进 | 应用 CSS 对齐 | 缩进单位换算 (twip → px) |

```
核心文件：
├── word/document.xml       # 文档主体内容
├── word/styles.xml         # 样式定义
├── word/_rels/document.xml.rels  # 关系文件
└── [Content_Types].xml     # 内容类型声明
```

**单位说明**：
```typescript
// DOCX 使用 Twip (Twentieth of a Point) 作为基本单位
// 1 inch = 1440 twips = 72 points = 96 pixels (at 96 DPI)
const twipToPixel = (twip: number) => twip / 1440 * 96;
```

#### Level 2: 基础样式还原 ★★☆☆☆
**目标**：还原常用文本样式，看起来像正经文档。

| 功能 | 解析任务 | 渲染任务 | 难点 |
|------|----------|----------|------|
| **字符样式** | 解析 `w:rPr` (Run Properties) | 粗体/斜体/下划线/删除线/颜色/字号 | 样式继承链（默认→段落→字符） |
| **列表** | 解析 `numbering.xml` 编号定义 | 有序/无序/多级列表渲染 | 🔴 **列表编号计算**：需维护各级别计数器 |
| **样式系统** | 解析 `styles.xml` 中的段落样式和字符样式 | 按样式 ID 查找并应用 | 样式定义可嵌套继承 (`basedOn`) |

**样式继承链**：
```
默认样式 (docDefaults)
    ↓
段落样式 (styles.xml → w:style[@type='paragraph'])
    ↓
字符样式 (styles.xml → w:style[@type='character'])
    ↓
直接格式 (document.xml → w:rPr / w:pPr)
```

#### Level 3: 复杂内容支持 ★★★☆☆
**目标**：支持表格和图片，处理常见的图文混排。

| 功能 | 解析任务 | 渲染任务 | 难点 |
|------|----------|----------|------|
| **表格** | 解析 `w:tbl`、`w:tr`、`w:tc` | 渲染表格结构 | 🔴 **合并单元格**：`gridSpan`(列合并) 和 `vMerge`(行合并) |
| **表格样式** | 解析 `w:tblPr`、`w:tcPr` | 边框、背景、单元格边距 | 边框冲突解决（同 XLSX） |
| **内联图片** | 解析 `w:drawing` → `wp:inline` | 图片跟随文本流渲染 | 需通过 rId 查找 media 资源 |
| **浮动图片** | 解析 `w:drawing` → `wp:anchor` | 绝对定位渲染 | 🔴 **文字环绕**：square/tight/through 等模式 |

**表格合并示例**：
```xml
<!-- 列合并: 使用 gridSpan -->
<w:tc>
  <w:tcPr><w:gridSpan w:val="3"/></w:tcPr>
  <w:p>跨 3 列的单元格</w:p>
</w:tc>

<!-- 行合并: 使用 vMerge -->
<w:tc>
  <w:tcPr><w:vMerge w:val="restart"/></w:tcPr>  <!-- 合并起始 -->
</w:tc>
<w:tc>
  <w:tcPr><w:vMerge/></w:tcPr>  <!-- 被合并单元格 (值为空) -->
</w:tc>
```

#### Level 4: 布局引擎 - 分页与分栏 ★★★★☆
**目标**：实现打印预览级别的精确排版。

| 功能 | 解析任务 | 渲染任务 | 难点 |
|------|----------|----------|------|
| **纸张拆分** | 读取 `w:sectPr` 中的纸张尺寸和边距 | 将连续内容切割为离散 Page | 🔴 **布局引擎核心**：需自己计算内容高度 |
| **分节** | 解析多个 `w:sectPr`（连续/下一页/奇偶页） | 不同节应用不同页面设置 | 分节类型影响分页行为 |
| **分栏** | 解析 `w:cols` 配置 | 多栏布局渲染 | 内容在多栏间自动流动 |
| **页眉页脚** | 解析 `header1.xml` / `footer1.xml` | 首页不同、奇偶页不同 | 页眉页脚有独立的内容流 |

**分页计算核心逻辑**：
```typescript
interface PageLayout {
  pageWidth: number;   // 纸张宽度 (twips)
  pageHeight: number;  // 纸张高度 (twips)
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  contentHeight: number; // 可用内容高度 = pageHeight - marginTop - marginBottom
}

// 伪代码：分页算法
function paginate(paragraphs: Paragraph[], layout: PageLayout): Page[] {
  const pages: Page[] = [];
  let currentPage = createNewPage();
  let remainingHeight = layout.contentHeight;
  
  for (const para of paragraphs) {
    const paraHeight = measureParagraphHeight(para, layout.contentWidth);
    
    if (paraHeight > remainingHeight) {
      // 段落放不下，需要分页
      pages.push(currentPage);
      currentPage = createNewPage();
      remainingHeight = layout.contentHeight;
    }
    
    currentPage.addParagraph(para);
    remainingHeight -= paraHeight;
  }
  
  return pages;
}
```

#### Level 5: 高级特性 ★★★★★
**目标**：处理学术/商业文档中的高级元素。

| 功能 | 解析任务 | 渲染任务 | 难点 |
|------|----------|----------|------|
| **数学公式** | 解析 `m:oMath` (Office Math Markup) | 渲染积分、矩阵、根式、分数 | 🔴 **公式排版**：需实现类似 LaTeX 的排版算法 |
| **修订记录** | 解析 `w:ins`、`w:del`、`w:rPrChange` | 显示插入/删除标记 | 支持"显示/隐藏修订"视图切换 |
| **批注** | 解析 `comments.xml` 和 `w:commentRangeStart/End` | 侧边栏批注展示 | 批注与正文的定位关联 |
| **艺术字** | 解析 DrawingML 中的 `wps:wsp` | 文本变形、3D 效果 | 需 Canvas 自定义渲染 |
| **VML 兼容** | 解析 `v:shape`、`v:rect` 等旧版矢量图 | 转换为 SVG 或 Canvas | 旧版 Office 文档兼容 |

**数学公式结构示例**：
```xml
<!-- 分数: a/b -->
<m:f>
  <m:num><m:r><m:t>a</m:t></m:r></m:num>
  <m:den><m:r><m:t>b</m:t></m:r></m:den>
</m:f>

<!-- 根式: √x -->
<m:rad>
  <m:deg/>  <!-- 空表示平方根 -->
  <m:e><m:r><m:t>x</m:t></m:r></m:e>
</m:rad>
```

---

### 阶段四：PowerPoint (PPTX) 分级开发计划

PPTX 的开发按照**功能复杂度**和**实现难度**分为 5 个阶段 (Levels)，核心挑战在于**母版继承**和**动画引擎**。

#### Level 1: MVP - 基础幻灯片展示 ★☆☆☆☆
**目标**：能把幻灯片显示出来，保证内容可读。

| 功能 | 解析任务 | 渲染任务 | 难点 |
|------|----------|----------|------|
| **演示文稿结构** | 解析 `presentation.xml`，获取 Slide 列表 | 渲染 Slide 导航列表 | 理解 rId 关系映射 |
| **Slide 内容** | 解析 `slideX.xml` 中的 `p:spTree` | 渲染 Slide 背景和基本内容 | 坐标系理解 (EMU 单位) |
| **基础形状** | 解析 `p:sp` 中的位置和尺寸 | 渲染矩形占位符 | 暂不处理复杂形状 |

```
核心文件：
├── ppt/presentation.xml           # 演示文稿结构
├── ppt/slides/slide1.xml          # 幻灯片内容
├── ppt/slideLayouts/slideLayout1.xml  # 布局定义
├── ppt/slideMasters/slideMaster1.xml  # 母版定义
└── ppt/_rels/presentation.xml.rels
```

**坐标系说明**：
```typescript
// PPTX 使用 EMU (English Metric Units) 作为坐标单位
// 1 inch = 914400 EMU
// 1 point = 12700 EMU
// 1 cm = 360000 EMU
const emuToPixel = (emu: number, dpi = 96) => (emu / 914400) * dpi;
```

#### Level 2: 基础元素渲染 ★★☆☆☆
**目标**：支持常见的文本框和图片。

| 功能 | 解析任务 | 渲染任务 | 难点 |
|------|----------|----------|------|
| **文本框** | 解析 `p:txBody` 中的段落和文本 | 渲染多段落富文本 | 自动换行和文本溢出处理 |
| **文本样式** | 解析 `a:defRPr`、`a:rPr` | 字体/颜色/字号/对齐 | 样式优先级：Run > Paragraph > Default |
| **图片** | 解析 `p:pic` 和 `a:blip` | 渲染定位图片 | 通过 rId 查找 media 资源 |
| **预设形状** | 解析 `a:prstGeom` | 渲染矩形/圆形/箭头等 | 暂用 CSS/SVG 近似渲染 |

**文本样式优先级**：
```
Shape 级别 (p:txBody → a:lstStyle)
    ↓
Paragraph 级别 (a:pPr → a:defRPr)
    ↓
Run 级别 (a:r → a:rPr)
```

#### Level 3: 母版与布局继承 ★★★☆☆
**目标**：完整支持 PowerPoint 的三层继承机制。

| 功能 | 解析任务 | 渲染任务 | 难点 |
|------|----------|----------|------|
| **Slide Master** | 解析 `slideMaster1.xml` | 提取母版背景、占位符、样式 | 🔴 **继承机制**：Slide → Layout → Master |
| **Slide Layout** | 解析 `slideLayout1.xml` | 继承母版并定义占位符位置 | 占位符类型映射 (title, body, etc.) |
| **主题** | 解析 `theme1.xml` | 应用颜色方案和字体方案 | 主题颜色引用 (`schemeClr`) |
| **缩略图** | 读取 `docProps/thumbnail.jpeg` 或自行生成 | 高效展示幻灯片预览 | 大型 PPT 的性能优化 |

**三层继承结构**：
```
┌─────────────────────────────────────────┐
│           Slide Master                   │  ← 全局样式、背景、占位符
│   ┌─────────────────────────────────┐   │
│   │       Slide Layout              │   │  ← 特定布局（标题页、内容页等）
│   │   ┌─────────────────────────┐   │   │
│   │   │        Slide            │   │   │  ← 实际内容
│   │   └─────────────────────────┘   │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

样式查找顺序：Slide → Layout → Master → Theme
```

**占位符类型**：
| 类型 | 值 | 说明 |
|------|-----|------|
| `title` | 1 | 标题 |
| `body` | 2 | 正文 |
| `ctrTitle` | 3 | 居中标题 |
| `subTitle` | 4 | 副标题 |
| `dt` | 5 | 日期时间 |
| `sldNum` | 6 | 幻灯片编号 |
| `ftr` | 7 | 页脚 |

#### Level 4: 动画引擎 ★★★★☆
**目标**：实现基础的动画播放功能。

| 功能 | 解析任务 | 渲染任务 | 难点 |
|------|----------|----------|------|
| **动画时序** | 解析 `p:timing` 节点 | 构建动画时间轴 | 🔴 **时序模型**：seq/par 嵌套结构复杂 |
| **进入动画** | 解析 `p:anim`、`p:animEffect` | 淡入/飞入/缩放等效果 | 需映射到 CSS Animation / Web Animations API |
| **退出动画** | 同上 | 淡出/飞出等效果 | 动画结束后元素状态处理 |
| **强调动画** | 解析 `p:animClr`、`p:animScale` | 闪烁/放大/变色等 | 动画期间不改变元素最终状态 |
| **步骤播放** | 解析 `p:seq` 中的 `p:cTn[@nodeType='clickEffect']` | On Click 触发下一步 | 用户交互与动画队列同步 |

**动画时序结构**：
```xml
<p:timing>
  <p:tnLst>
    <p:par>  <!-- 并行容器 -->
      <p:cTn id="1" dur="indefinite">
        <p:childTnLst>
          <p:seq>  <!-- 序列容器 (通常对应点击步骤) -->
            <p:cTn nodeType="clickEffect">  <!-- 点击触发 -->
              <p:childTnLst>
                <p:par>
                  <p:cTn presetClass="entr" presetID="10">  <!-- 进入动画: 飞入 -->
                    <!-- 动画目标和参数 -->
                  </p:cTn>
                </p:par>
              </p:childTnLst>
            </p:cTn>
          </p:seq>
        </p:childTnLst>
      </p:cTn>
    </p:par>
  </p:tnLst>
</p:timing>
```

**常见预设动画 ID**：
| presetID | 效果 | 类型 |
|----------|------|------|
| 1 | Appear | 进入 |
| 2 | Fly In | 进入 |
| 10 | Fade | 进入/退出 |
| 16 | Zoom | 进入 |
| 22 | Wipe | 进入 |

#### Level 5: 高级特性 ★★★★★
**目标**：处理多媒体和复杂视觉效果。

| 功能 | 解析任务 | 渲染任务 | 难点 |
|------|----------|----------|------|
| **视频嵌入** | 解析 `p:video` 和媒体关系 | 使用 `<video>` 标签播放 | 🔴 格式兼容性：wmv → mp4 转码 |
| **音频嵌入** | 解析 `p:audio` | 背景音乐 / 音效播放 | 自动播放与跨页持续播放 |
| **切换效果** | 解析 `p:transition` | Slide 间切换动画 | 3D 切换效果需 WebGL |
| **路径动画** | 解析 `p:animMotion` | 按自定义路径移动元素 | SVG Path 数据解析 |
| **3D 形状** | 解析 `a:scene3d`、`a:sp3d` | 3D 旋转、透视、光照 | 🔴 需要 WebGL 或 CSS 3D Transform |
| **SmartArt** | 解析 `diagrams/` 目录 | 渲染组织结构图、流程图 | 🔴 布局算法复杂，需独立引擎 |

**视频嵌入结构**：
```xml
<p:pic>
  <p:nvPicPr>
    <p:nvPr>
      <a:videoFile r:link="rId2"/>  <!-- 视频文件引用 -->
    </p:nvPr>
  </p:nvPicPr>
  <p:blipFill>
    <a:blip r:embed="rId3"/>  <!-- 封面图片 -->
  </p:blipFill>
</p:pic>
```

---

### 阶段五：高级视觉与极致细节 (Advanced Visuals)
**目标**：处理最复杂的视觉效果，达到商业级渲染标准。

> **注意**：此阶段功能跨越 XLSX/DOCX/PPTX，需要在 `shared` 中实现通用能力。

1.  **3D 与特效**
    *   [ ] **3D 场景**: 解析 `Scene3D` 和 `Shape3D`，实现三维旋转、透视、相机视角。
    *   [ ] **3D 材质**: 实现倒角 (Bevel)、材质 (Material)、光照 (Lighting)效果。
    *   [ ] **高级特效**: 柔化边缘 (Soft Edges)、发光 (Glow)、倒影 (Reflection)。

2.  **复杂组合**
    *   [ ] **SmartArt**: 解析并渲染逻辑图表（流程图、循环图等）。
    *   [ ] **Group Shape**: 处理多层嵌套组合图形的坐标系变换与裁剪。

---

## 9. 验证与质量保证 (Validation)

*   **视觉回归测试 (Visual Regression)**: 建立截图对比流水线，确保新功能不破坏已有渲染效果。
*   **Badcase 驱动开发**: 收集解析失败或渲染错误的复杂文档建立 Case 库。
*   **Office 对比验收**: 每一个特性开发必须以原生 Office 渲染效果为标准答案，偏差即为 Bug。

---

## 10. 附录：代码风格与提交规范

### 10.1 文件命名

| 类型 | 命名规范 | 示例 |
|------|----------|------|
| 类/组件 | PascalCase | `XlsxParser.ts`, `CellRenderer.ts` |
| 工具函数 | camelCase | `parseColor.ts`, `convertUnits.ts` |
| 类型定义 | PascalCase + `.types.ts` | `Cell.types.ts` |
| 测试文件 | `*.test.ts` / `*.spec.ts` | `XlsxParser.test.ts` |

### 10.2 注释规范

*   所有导出的函数/类必须使用 **JSDoc** 格式注释
*   注释语言统一使用**中文**
*   关键算法必须添加详细解释

```typescript
/**
 * 将 EMU 单位转换为像素
 * @param emu EMU 值 (English Metric Units)
 * @param dpi 目标 DPI，默认 96
 * @returns 像素值
 * @example
 * emuToPixels(914400) // => 96 (1英寸)
 */
export function emuToPixels(emu: number, dpi = 96): number {
  // 1 英寸 = 914400 EMU
  return (emu / 914400) * dpi;
}
```

### 10.3 Git 提交规范

使用中文提交信息，格式：`类型: 简短描述`

*   `新增`: 添加新功能
*   `修复`: 修复 Bug
*   `优化`: 性能优化或代码改进
*   `重构`: 代码重构
*   `文档`: 文档更新
*   `测试`: 测试相关

**示例**：
```
新增: XLSX 单元格样式解析
修复: DOCX 分页边界计算错误
优化: Slide 缩略图生成性能
```

## 参考资料

### 字体数据

```
type FontFamily = {
  css_family: string;
  safe_css_family: string;
  type: string;
  category: string;
  description: string;
};

export const fonts: Record<string, FontFamily> = {
  微软雅黑: {
    css_family: 'Microsoft YaHei',
    safe_css_family:
      '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Sans-Serif',
    category: 'Modern Standard',
    description: 'Windows 现代标准中文字体，屏幕显示效果最佳。'
  },
  '微软雅黑 UI': {
    css_family: 'Microsoft YaHei UI',
    safe_css_family:
      '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei UI", "微软雅黑 UI", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Sans-Serif',
    category: 'UI Interface',
    description: '字间距比标准版略窄，专为 UI 界面设计。'
  },
  等线: {
    css_family: 'DengXian',
    safe_css_family: '"DengXian", "等线", "PingFang SC", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Sans-Serif',
    category: 'Office Modern',
    description: 'Office 2016+ 默认正文主题字体，较细。'
  },
  '等线 Light': {
    css_family: 'DengXian Light',
    safe_css_family:
      '"DengXian Light", "等线 Light", "PingFang SC", "Microsoft YaHei Light", "微软雅黑 Light", sans-serif',
    type: 'Sans-Serif',
    category: 'Office Modern',
    description: '细体版的等线。'
  },
  黑体: {
    css_family: 'SimHei',
    safe_css_family: '"Heiti SC", "SimHei", "黑体", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Sans-Serif',
    category: 'Legacy',
    description: '旧版 Windows 标准黑体，边缘较粗糙，仅作兼容使用。'
  },
  宋体: {
    css_family: 'SimSun',
    safe_css_family: '"Songti SC", "SimSun", "宋体", serif',
    type: 'Serif',
    category: 'Classic',
    description: 'Windows 最经典的衬线字体，适合正文印刷风格。'
  },
  新宋体: {
    css_family: 'NSimSun',
    safe_css_family: '"Songti SC", "NSimSun", "新宋体", "SimSun", "宋体", serif',
    type: 'Serif',
    category: 'Classic Monospace',
    description: '宋体的等宽版本。'
  },
  仿宋: {
    css_family: 'FangSong',
    safe_css_family: '"FangSong SC", "STFangsong", "FangSong", "仿宋", "FangSong_GB2312", "仿宋_GB2312", serif',
    type: 'Serif',
    category: 'Official Document',
    description: '公文标准字体。包含 GB2312 兼容名。'
  },
  楷体: {
    css_family: 'KaiTi',
    safe_css_family: '"Kaiti SC", "STKaiti", "KaiTi", "楷体", "KaiTi_GB2312", "楷体_GB2312", serif',
    type: 'Serif',
    category: 'Official Document',
    description: '教科书、公文标准字体。包含 GB2312 兼容名。'
  },
  微軟正黑體: {
    css_family: 'Microsoft JhengHei',
    safe_css_family: '"PingFang TC", "Microsoft JhengHei", "微軟正黑體", sans-serif',
    type: 'Sans-Serif',
    category: 'Traditional Chinese',
    description: '繁体版微软雅黑，Windows 繁体环境默认字体。'
  },
  '微軟正黑體 UI': {
    css_family: 'Microsoft JhengHei UI',
    safe_css_family:
      '"PingFang TC", "Microsoft JhengHei UI", "微軟正黑體 UI", "Microsoft JhengHei", "微軟正黑體", sans-serif',
    type: 'Sans-Serif',
    category: 'Traditional Chinese UI',
    description: '界面用繁体字。'
  },
  新細明體: {
    css_family: 'PMingLiU',
    safe_css_family: '"LiSong Pro", "PMingLiU", "新細明體", serif',
    type: 'Serif',
    category: 'Traditional Chinese',
    description: '繁体经典衬线体。'
  },
  細明體: {
    css_family: 'MingLiU',
    safe_css_family: '"LiSong Pro", "MingLiU", "細明體", serif',
    type: 'Serif',
    category: 'Traditional Chinese Monospace',
    description: '等宽版细明体。'
  },
  標楷體: {
    css_family: 'DFKai-SB',
    safe_css_family: '"BiauKai", "DFKai-SB", "標楷體", serif',
    type: 'Serif',
    category: 'Traditional Chinese',
    description: '台湾公文标准楷体。'
  },
  隶书: {
    css_family: 'LiSu',
    safe_css_family: '"LiSu", "隶书", "SimSun", "宋体", serif',
    type: 'Display',
    category: 'Art / Decorative',
    description: '扁平、古朴，常用于标题。'
  },
  幼圆: {
    css_family: 'YouYuan',
    safe_css_family: '"YouYuan", "幼圆", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Display',
    category: 'Art / Decorative',
    description: '笔画圆润，黑体的变种。'
  },
  华文细黑: {
    css_family: 'STXihei',
    safe_css_family: '"STXihei", "华文细黑", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Sans-Serif',
    category: 'Art / Decorative',
    description: '极细的黑体。'
  },
  华文楷体: {
    css_family: 'STKaiti',
    safe_css_family: '"STKaiti", "华文楷体", "KaiTi", "楷体", serif',
    type: 'Serif',
    category: 'Art / Decorative',
    description: '常用于排版，类似于 Office 楷体。'
  },
  华文宋体: {
    css_family: 'STSong',
    safe_css_family: '"STSong", "华文宋体", "SimSun", "宋体", serif',
    type: 'Serif',
    category: 'Art / Decorative',
    description: '常用于排版，类似于 Office 宋体。'
  },
  华文仿宋: {
    css_family: 'STFangsong',
    safe_css_family: '"STFangsong", "华文仿宋", "FangSong", "仿宋", serif',
    type: 'Serif',
    category: 'Art / Decorative',
    description: '常用于排版，类似于 Office 仿宋。'
  },
  华文彩云: {
    css_family: 'STCaiyun',
    safe_css_family: '"STCaiyun", "华文彩云", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Display',
    category: 'Art / Decorative',
    description: '双钩空心，极其夸张。缺失回退到黑体。'
  },
  华文琥珀: {
    css_family: 'STHupo',
    safe_css_family: '"STHupo", "华文琥珀", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Display',
    category: 'Art / Decorative',
    description: '笔画粗大重叠。缺失回退到黑体。'
  },
  华文隶书: {
    css_family: 'STLiti',
    safe_css_family: '"STLiti", "华文隶书", "LiSu", "隶书", "SimSun", "宋体", serif',
    type: 'Display',
    category: 'Art / Decorative',
    description: '书法感较强的隶书。缺失回退到隶书或宋体。'
  },
  华文行楷: {
    css_family: 'STXingkai',
    safe_css_family: '"STXingkai", "华文行楷", cursive, serif',
    type: 'Display',
    category: 'Calligraphy',
    description: '飘逸的手写书法风格。缺失回退到 cursive。'
  },
  华文新魏: {
    css_family: 'STXinwei',
    safe_css_family: '"STXinwei", "华文新魏", serif',
    type: 'Display',
    category: 'Calligraphy',
    description: '庄重、有力的魏碑风格。缺失回退到 serif。'
  }
};
```