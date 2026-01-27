# OfficeParserRenderer 项目优化方案

## 📊 项目概览

### 项目简介

这是一个 **Monorepo** 架构的 Office 文档解析渲染库，使用 **pnpm workspaces** 管理多个子包，目标是提供与 Microsoft Office 原生应用一致的高保真文档渲染能力。

### 当前包结构

```
packages/
├── definitions/     # OOXML 类型定义 (87个自动生成的类型文件)
├── shared/          # 共享模块 (绘图、样式、字体、数学公式等)
├── docx/            # Word 文档解析渲染
├── xlsx/            # Excel 文档解析渲染
├── pptx/            # PowerPoint 文档解析渲染 (开发中)
└── playground/      # 示例演示项目
```

### 现有优势

| 优势 | 说明 |
|------|------|
| ✅ 清晰的模块化架构 | 职责分离明确，parser/renderer 分层清晰 |
| ✅ 完善的文档体系 | README、skills、workflows 文档齐全 |
| ✅ 丰富的功能支持 | DOCX/XLSX 大部分功能已实现 |
| ✅ 类型安全 | 使用 TypeScript 严格模式 |
| ✅ 代码注释规范 | 使用中文 JSDoc 注释 |

---

## 🔍 问题分析

本章节整合了项目中发现的所有待优化问题，按类别进行组织。

### 一、工程化问题

| 问题 | 影响 | 优先级 |
|------|------|--------|
| 缺少单元测试框架 | 代码质量难以保证 | 🔴 高 |
| 缺少 ESLint/Prettier 配置 | 代码风格不统一 | 🟡 中 |
| 缺少 CI/CD 流程 | 自动化验证缺失 | 🟡 中 |
| 缺少版本管理策略 | 发布流程不规范 | 🟢 低 |

### 二、代码架构问题

#### 2.1 功能模块冲突

| 问题 | 位置 | 相似度/影响 | 优先级 |
|------|------|-------------|--------|
| **Logger 工具缺失** | docx 有完整 Logger（258行），xlsx 无 | xlsx 日志不规范 | 🔴 高 |
| **ChartParser 重复实现** | docx/xlsx 各有独立实现（~195行） | ~85% 相似 | 🔴 高 |
| **ImageRenderer 设计混乱** | shared 静态类 vs xlsx 实例类 | 接口完全不同 | 🟡 中 |
| **StyleResolverAdapter 重复** | xlsx/ShapeRenderer.ts 和 ChartRenderer.ts | 几乎相同 | 🟡 中 |
| **DrawingParser 职责不清** | docx(485行) / xlsx(330行) / shared(64行) | 命名混淆 | 🟡 中 |

**Logger 工具冲突详情**：
- `docx/utils/Logger.ts` 定义了完整的 Logger 类，输出格式 `[DOCX]:${tag}]`
- xlsx 没有对应的 Logger，只使用原生 `console.log`/`console.group`

**ChartParser 核心差异**：
- docx 返回 `DrawingChart`（包含 rId, cx, cy），支持 `comboChart`
- xlsx 返回 `OfficeChart`（包含 anchor 信息），使用 `console.group` 调试

#### 2.2 类型系统问题

| 问题 | 冲突位置 | 优先级 |
|------|----------|--------|
| **图表类型命名不一致** | docx `DrawingChart` vs xlsx `OfficeChart` | 🔴 高 |
| **图片类型命名不一致** | docx `DrawingImage` vs xlsx `OfficeImage` | 🔴 高 |
| **形状类型命名不一致** | docx `DrawingShape` vs xlsx `OfficeShape` | 🔴 高 |
| **RenderRect 多处定义** | shared/types.ts, xlsx 局部接口 | 🟢 低 |
| **RenderContext 多处定义** | shared, docx, xlsx 各有不同定义 | 🟡 中 |

#### 2.3 目录结构问题

**各子项目目录对比**：

| 模块 | docx | xlsx | shared | 问题 |
|------|------|------|--------|------|
| **parser/** | ✅ 16个文件 | ✅ 8个文件 | ❌ 分散在 drawing/parsers/ | 位置不统一 |
| **renderer/** | ✅ 14个文件 | ✅ 13个文件 | ❌ 分散在 drawing/renderers/ | 位置不统一 |
| **types/** | ✅ 8个文件 | ✅ 5个文件 | ❌ 分散在各模块 types.ts | 碎片化 |
| **utils/** | ⚠️ 3个文件 | ⚠️ 2个文件 | ⚠️ 3个文件 | 重复定义 |

**shared 包结构混乱**：`parsers/` 和 `renderers/` 嵌套在 `drawing/` 下，与 docx/xlsx 的平铺结构不一致。

#### 2.4 模块导出问题

| 包 | 导出项数量 | 问题 |
|-----|------------|------|
| shared | ~20+ (桶导出) | 有重复导出（FontManager） |
| docx | 22 个具名导出 | ✅ 粒度适中 |
| xlsx | 5 个通配导出 | ⚠️ 导出过少，缺失 ChartParser/ChartRenderer/StyleResolver 等 |
| pptx | 2 个导出 | 尚未开发 |

#### 2.5 包依赖问题

```
playground → docx/xlsx → shared → definitions
```

| 问题 | 影响 | 优先级 |
|------|------|--------|
| definitions 包未被充分使用 | 类型约束较弱 | 🟢 低 |
| linkedom 仅在 xlsx 使用 | 若 shared 需服务端测试则缺失 | 🟢 低 |
| 部分工具类未抽取到 shared | docx/xlsx 代码重复 | 🟡 中 |

### 三、性能问题

| 问题 | 影响 | 优先级 |
|------|------|--------|
| 缺少虚拟滚动实现 | 大文档渲染卡顿 | 🟡 中 |
| Web Worker 未使用 | 解析阻塞主线程 | 🟡 中 |
| 频繁 DOM 回流 (Layout Thrashing) | 渲染性能低下 | 🔴 高 |
| 缺少 CSS 渲染隔离 | 局部变更触发全局重排 | 🟡 中 |
| 主线程渲染阻塞 | 长文档导致界面假死 | 🟡 中 |
| 缺少性能监控指标 | 性能问题难定位 | 🟢 低 |

### 四、文档和开发体验

| 问题 | 影响 | 优先级 |
|------|------|--------|
| PPTX 模块开发中，代码量极少 | 功能不完整 | 🔴 高 |
| API 文档不够详细 | 上手门槛高 | 🟡 中 |
| 缺少 CHANGELOG | 版本变更不透明 | 🟢 低 |
| playground 功能单一 | 调试体验差 | 🟢 低 |

---

## 🎯 优先级矩阵

### 按重要性和紧迫性分类

| 紧迫性 \ 重要性 | 高 | 低 |
|-----------------|-----|-----|
| **高** | 🔴 测试框架、Logger 抽取、ChartParser 合并、类型命名统一、PPTX 开发 | 🟢 xlsx 导出补全、StyleResolver 适配器消重 |
| **低** | 🟡 目录结构重构、ImageRenderer 统一、RenderContext 统一、虚拟滚动 | ⚪ 重复导出清理、命名风格统一、linkedom 移动 |

### 完整问题汇总表

| # | 问题 | 类别 | 优先级 | 影响范围 | 预估工时 |
|---|------|------|--------|----------|----------|
| 1 | 缺少单元测试框架 | 工程化 | 🔴 高 | 全项目 | 4h |
| 2 | Logger 工具只在 docx 定义 | 代码重复 | 🔴 高 | docx, xlsx | 2h |
| 3 | ChartParser 重复实现 | 代码重复 | 🔴 高 | docx, xlsx, shared | 4h |
| 4 | 类型命名不一致（图表/图片/形状） | 类型系统 | 🔴 高 | 全项目 | 8h |
| 5 | PPTX 模块功能缺失 | 功能完整性 | 🔴 高 | pptx | 40h+ |
| 6 | 缺少 ESLint 配置 | 工程化 | 🟡 中 | 全项目 | 2h |
| 7 | ImageRenderer 设计混乱 | 架构问题 | 🟡 中 | docx, xlsx, shared | 6h |
| 8 | DrawingParser 命名冲突 | 命名规范 | 🟡 中 | docx, xlsx | 2h |
| 9 | RenderContext 类型冲突 | 类型系统 | 🟡 中 | docx, xlsx, shared | 4h |
| 10 | StyleResolverAdapter 重复 | 代码重复 | 🟡 中 | xlsx | 1h |
| 11 | xlsx 导出不完整 | 导出规范 | 🟡 中 | xlsx | 0.5h |
| 12 | 缺少虚拟滚动实现 | 性能 | 🟡 中 | xlsx | 8h |
| 13 | Web Worker 未使用 | 性能 | 🟡 中 | 全项目 | 8h |
| 14 | shared 目录结构混乱 | 目录结构 | 🟢 低 | shared | 4h |
| 15 | StyleInjector 重复模式 | 代码重复 | 🟢 低 | docx, xlsx | 2h |
| 16 | definitions 未充分使用 | 依赖问题 | 🟢 低 | 全项目 | 8h |
| 17 | shared 重复导出 | 导出规范 | 🟢 低 | shared | 0.5h |
| 18 | 缺少 CHANGELOG | 文档 | 🟢 低 | 全项目 | 1h |
| 19 | 缺少性能监控 | 性能 | 🟢 低 | 全项目 | 4h |
| 20 | 频繁 DOM 回流 (Fragment) | 性能 | 🔴 高 | docx, xlsx | 2h |
| 21 | 缺少 CSS 渲染隔离 | 性能 | 🟢 低 | shared | 0.5h |
| 22 | 主线程渲染阻塞 (Time Slicing) | 性能 | 🟡 中 | docx, xlsx | 6h |

---

## 🛠️ 解决方案

本章节按优先级组织解决方案，高优先级问题排在前面。

### 一、高优先级方案

#### 1.1 添加测试框架

**目标**：建立完整的单元测试和集成测试体系

**安装依赖**：
```bash
pnpm add -Dw vitest @vitest/coverage-v8 @vitest/ui jsdom
```

**配置文件**（vitest.config.ts）：
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/*.d.ts', '**/types.ts'],
    },
  },
});
```

**测试目录结构**：
```
packages/
├── shared/__tests__/
│   ├── styles/UnitConverter.test.ts
│   └── drawing/ShapeRenderer.test.ts
├── docx/__tests__/
│   ├── parser/DocxParser.test.ts
│   └── renderer/DocxRenderer.test.ts
└── xlsx/__tests__/
```

**覆盖率目标**：核心模块 80%+，解析器 70%+，渲染器 60%+

---

#### 1.2 抽取 Logger 到 shared

**目标**：统一日志输出格式，支持多模块前缀

**实现代码**（packages/shared/src/utils/Logger.ts）：
```typescript
export type LoggerPrefix = 'DOCX' | 'XLSX' | 'PPTX' | 'Shared';

export class Logger {
  private prefix: LoggerPrefix;
  private enabled: boolean;

  constructor(prefix: LoggerPrefix, enabled = true) {
    this.prefix = prefix;
    this.enabled = enabled;
  }

  log(tag: string, message: string, ...data: unknown[]): void {
    if (this.enabled) {
      console.log(`[${this.prefix}:${tag}] ${message}`, ...data);
    }
  }

  warn(tag: string, message: string, ...data: unknown[]): void {
    if (this.enabled) {
      console.warn(`[${this.prefix}:${tag}] ${message}`, ...data);
    }
  }

  error(tag: string, message: string, ...data: unknown[]): void {
    console.error(`[${this.prefix}:${tag}] ${message}`, ...data);
  }

  group(tag: string): void {
    if (this.enabled) console.group(`[${this.prefix}:${tag}]`);
  }

  groupEnd(): void {
    if (this.enabled) console.groupEnd();
  }
}
```

**使用方式**：
```typescript
// packages/docx
import { Logger } from '@ai-space/shared';
const log = new Logger('DOCX');
log.log('Parser', 'Parsing document...');

// packages/xlsx
import { Logger } from '@ai-space/shared';
const log = new Logger('XLSX');
log.log('Parser', 'Parsing workbook...');
```

---

#### 1.3 合并 ChartParser 核心逻辑

**目标**：将 docx/xlsx 的 ChartParser 公共逻辑抽取到 shared

**shared 中的通用解析器**（packages/shared/src/drawing/parsers/ChartParser.ts）：
```typescript
export interface ChartParseResult {
  type: ChartType;
  title?: string;
  series: ChartSeries[];
  barDirection?: 'col' | 'bar';
  grouping?: 'clustered' | 'stacked' | 'percentStacked';
}

export class ChartParser {
  /**
   * 解析图表 XML (通用方法)
   */
  static parse(chartXml: string): ChartParseResult {
    // 公共解析逻辑：图表类型识别、系列解析、标题解析等
  }
}
```

**docx 特化实现**：
```typescript
import { ChartParser as SharedChartParser } from '@ai-space/shared';

export class DocxChartParser {
  static parse(chartXml: string, cx: number, cy: number, rId: string): DrawingChart {
    const result = SharedChartParser.parse(chartXml);
    return { rId, cx, cy, ...result };
  }
}
```

---

#### 1.4 统一类型命名

**目标**：统一 docx/xlsx 中的绘图元素类型命名

**建议的统一类型**（packages/shared/src/types/office.ts）：
```typescript
/** Office 图表数据（解析结果） */
export interface OfficeChart {
  type: ChartType;
  title?: string;
  series: ChartSeries[];
}

/** Office 图片数据（解析结果） */
export interface OfficeImage {
  id: string;
  src: string;
  cx: number;
  cy: number;
}

/** Office 形状数据（解析结果） */
export interface OfficeShape {
  id: string;
  geometry: string;
  fill?: OfficeFill;
  stroke?: OfficeStroke;
}

// docx/xlsx 如需扩展，继承基础类型：
export interface DocxDrawingChart extends OfficeChart {
  rId: string;  // DOCX 特有属性
}

export interface XlsxOfficeChart extends OfficeChart {
  anchor?: AnchorInfo;  // XLSX 特有属性
}
```

---

#### 1.5 PPTX 模块开发路线图

**Phase 1: 基础结构（2周）**
- 定义类型系统：Slide, SlideLayout, SlideMaster, Animation, Transition
- 实现解析器：PresentationParser, SlideParser, SlideLayoutParser, SlideMasterParser

**Phase 2: 渲染功能（3周）**
- 实现渲染器：PptxRenderer, SlideRenderer
- 复用 shared 的形状/图片/图表渲染器
- 支持功能：基本幻灯片、形状文本、图片图表、母版布局

**Phase 3: 高级功能（2周）**
- 幻灯片导航
- 动画支持（基础）
- 切换效果
- 演讲者备注

---

#### 1.6 渲染性能优化：离线 DOM 构建 (Fragment)

**问题**：当前在 `DocxRenderer` 中直接向已挂载的容器 `appendChild`，导致严重的 Layout Thrashing（O(N)次重排）。

**解决方案**：使用 `DocumentFragment` 进行批量插入。

```typescript
// 优化前：频繁重排
// this.container.appendChild(pageContainer);
// for (const el of elements) pageContainer.appendChild(el);

// 优化后：1次重排
const fragment = document.createDocumentFragment();
for (const element of doc.body) {
  const rendered = this.renderElement(element, context);
  if (rendered) fragment.appendChild(rendered);
}
// 最后一次性挂载
pageContainer.appendChild(fragment);
this.container.appendChild(pageContainer);
```

**收益**：大文档渲染性能提升 5-10 倍。

---

### 二、中优先级方案

#### 2.1 配置 ESLint 和 Git Hooks

**安装依赖**：
```bash
pnpm add -Dw eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier husky lint-staged
```

**ESLint 配置**（.eslintrc.cjs）：
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./packages/*/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

**lint-staged 配置**（package.json）：
```json
{
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint packages/*/src --ext .ts,.tsx",
    "format": "prettier --write \"packages/*/src/**/*.{ts,tsx,css}\""
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

---

#### 2.2 统一 ImageRenderer 接口

**目标**：统一 shared 和 xlsx 的 ImageRenderer 接口

```typescript
// packages/shared/src/drawing/renderers/ImageRenderer.ts
export class ImageRenderer {
  constructor(private styleResolver: StyleResolverInterface) {}
  
  /** SVG 渲染 */
  renderToSVG(options: ImageRenderOptions, container: SVGElement, rect: RenderRect, ctx: RenderContext): void {
    // 统一实现
  }
  
  /** HTML 渲染 */
  render(options: ImageRenderOptions, rect: RenderRect, ctx: RenderContext): HTMLElement {
    // 统一实现
  }
}
```

---

#### 2.3 统一 RenderContext 类型

```typescript
// packages/shared/src/types/rendering.ts
export interface RenderRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BaseRenderContext {
  defs: SVGDefsElement;
  counter?: number;
}

export interface DocxRenderContext extends BaseRenderContext {
  document?: DocxDocument;
  images?: Record<string, string>;
  section?: SectionProperties;
}

export interface XlsxRenderContext extends BaseRenderContext {
  theme: ThemeData;
  cellWidths?: number[];
  cellHeights?: number[];
}
```

---

#### 2.4 消除 StyleResolverAdapter 重复

**目标**：创建统一的适配器工厂

```typescript
// packages/shared/src/drawing/renderers/StyleResolverAdapterFactory.ts
export function createStyleResolverAdapter(
  resolver: XlsxStyleResolver | DocxStyleResolver,
  type: 'xlsx' | 'docx'
): StyleResolverInterface {
  // 统一适配逻辑
}
```

---

#### 2.5 补全 xlsx 导出

```typescript
// packages/xlsx/src/index.ts
// 解析器
export { XlsxParser } from './parser/XlsxParser';
export { WorksheetParser } from './parser/WorksheetParser';
export { DrawingParser } from './parser/DrawingParser';
export { ChartParser } from './parser/ChartParser';
export { StyleParser } from './parser/StyleParser';
export { ThemeParser } from './parser/ThemeParser';

// 渲染器
export { XlsxRenderer } from './renderer/XlsxRenderer';
export { ChartRenderer } from './renderer/ChartRenderer';
export { ShapeRenderer } from './renderer/ShapeRenderer';
export { ImageRenderer } from './renderer/ImageRenderer';
export { StyleResolver } from './renderer/StyleResolver';

// 工具
export { NumberFormatUtils } from './utils/NumberFormatUtils';

// 类型
export * from './types';
```

---

#### 2.6 实现虚拟滚动

**适用场景**：XLSX 大表格渲染

```typescript
// packages/xlsx/src/renderer/VirtualScroller.ts
export class VirtualScroller {
  private container: HTMLElement;
  private rowHeight: number;
  private visibleRows: number;
  private totalRows: number;
  private renderRow: (index: number) => HTMLElement;

  /**
   * 渲染可见区域的行
   */
  renderVisibleRange(scrollTop: number): void {
    const startIndex = Math.floor(scrollTop / this.rowHeight);
    const endIndex = Math.min(startIndex + this.visibleRows + 1, this.totalRows);
    for (let i = startIndex; i < endIndex; i++) {
      this.renderRow(i);
    }
  }
}
```

---

#### 2.7 Web Worker 解析

**目标**：将文档解析移至 Worker 线程

```typescript
// packages/shared/src/workers/ParserWorker.ts
self.onmessage = async (event) => {
  const { type, buffer } = event.data;
  let result;
  switch (type) {
    case 'docx': result = await parseDocx(buffer); break;
    case 'xlsx': result = await parseXlsx(buffer); break;
  }
  self.postMessage({ success: true, data: result });
};
```

---

#### 2.8 渲染性能优化：CSS 遏制与时间分片

**1. CSS Containment (渲染隔离)**

在页面容器上应用 `contain` 属性，限制重排范围。

```css
/* packages/shared/styles/index.css */
.docx-page {
  contain: content; /* 布局、绘制限制在盒子内部 */
}
```

**2. 时间分片 (Time Slicing)**

使用 `requestAnimationFrame` 分批渲染，避免主线程假死。

```typescript
async renderWithSlicing(doc: DocxDocument) {
  const elements = doc.body;
  let index = 0;
  
  const processChunk = () => {
    const fragment = document.createDocumentFragment();
    const endTime = performance.now() + 16; // 每帧 16ms
    
    while (index < elements.length && performance.now() < endTime) {
      const rendered = this.renderElement(elements[index], context);
      if (rendered) fragment.appendChild(rendered);
      index++;
    }
    this.container.appendChild(fragment);
    
    if (index < elements.length) requestAnimationFrame(processChunk);
  };
  
  processChunk();
}
```

---

### 三、低优先级方案

#### 3.1 重构 shared 目录结构

**建议结构**：
```
shared/src/
├── core/                 # 核心工具
│   ├── xml/
│   ├── zip/
│   └── utils/
├── drawing/              # 绘图相关
│   ├── parsers/
│   ├── renderers/
│   └── shapes/
├── styles/               # 样式相关
├── fonts/                # 字体相关
├── math/                 # 数学公式
├── types/                # 统一类型定义
│   ├── drawing.ts
│   ├── rendering.ts
│   └── index.ts
└── index.ts
```

---

#### 3.2 抽取 BaseStyleInjector

```typescript
// packages/shared/src/styles/BaseStyleInjector.ts
export abstract class BaseStyleInjector {
  protected abstract readonly STYLE_ID: string;
  protected abstract getStyleContent(): string;
  
  ensureStyles(): void {
    if (document.getElementById(this.STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = this.STYLE_ID;
    style.textContent = this.getStyleContent();
    document.head.appendChild(style);
  }
}
```

---

#### 3.3 增强 Playground

**新增功能**：
- 文件拖拽上传
- 多种文档格式支持 (DOCX/XLSX/PPTX)
- 缩放控制
- 渲染性能显示
- AST 结构查看器

---

#### 3.4 生成 API 文档

```bash
pnpm add -Dw typedoc typedoc-plugin-markdown
```

```json
// typedoc.json
{
  "entryPoints": [
    "packages/shared/src/index.ts",
    "packages/docx/src/index.ts",
    "packages/xlsx/src/index.ts"
  ],
  "out": "docs/api",
  "plugin": ["typedoc-plugin-markdown"]
}
```

---

#### 3.5 添加 CHANGELOG

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

---

#### 3.6 添加性能监控

```typescript
// packages/shared/src/utils/PerformanceMonitor.ts
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  start(name: string): void {
    this.marks.set(name, performance.now());
  }

  end(name: string): number {
    const startTime = this.marks.get(name);
    if (!startTime) return 0;
    const duration = performance.now() - startTime;
    this.marks.delete(name);
    return duration;
  }

  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      return await fn();
    } finally {
      const duration = this.end(name);
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }
  }
}
```

---

## 📋 实施计划

### 立即执行（1-2 天）

| 任务 | 预估工时 | 状态 |
|------|----------|------|
| 添加 Vitest 测试框架配置 | 2h | ⬜ |
| 抽取 Logger 到 shared | 2h | ⬜ |
| 添加 ESLint 配置 | 2h | ⬜ |
| 配置 Husky + lint-staged | 1h | ⬜ |
| 补全 xlsx/index.ts 导出 | 0.5h | ⬜ |
| 移除 shared 重复导出 | 0.5h | ⬜ |

### 短期计划（1-2 周）

| 任务 | 预估工时 | 状态 |
|------|----------|------|
| 编写 shared 模块核心测试 | 8h | ⬜ |
| 合并 ChartParser 核心逻辑 | 4h | ⬜ |
| 统一类型命名（图表/图片/形状） | 8h | ⬜ |
| 消除 StyleResolverAdapter 重复 | 1h | ⬜ |
| 统一 RenderContext 类型 | 4h | ⬜ |
| 开始 PPTX 基础结构开发 | 16h | ⬜ |

### 中期计划（1-2 月）

| 任务 | 预估工时 | 状态 |
|------|----------|------|
| 完成 PPTX Phase 1 & 2 | 40h | ⬜ |
| 统一 ImageRenderer 接口 | 6h | ⬜ |
| 实现 XLSX 虚拟滚动 | 8h | ⬜ |
| 添加 Web Worker 支持 | 8h | ⬜ |
| 重构 shared 目录结构 | 4h | ⬜ |
| 增强 Playground 功能 | 8h | ⬜ |

### 长期计划（3-6 月）

| 任务 | 预估工时 | 状态 |
|------|----------|------|
| 完成 PPTX Phase 3 | 16h | ⬜ |
| 完善测试覆盖率至目标 | 24h | ⬜ |
| 生成完整 API 文档 | 4h | ⬜ |
| 添加 CI/CD 流程 | 8h | ⬜ |
| 性能优化和监控 | 8h | ⬜ |
| 抽取 BaseStyleInjector | 2h | ⬜ |

---

## 📊 优化效果预期

| 指标 | 当前状态 | 优化后预期 |
|------|----------|------------|
| 测试覆盖率 | 0% | 60-80% |
| 代码重复率 | ~15% | <5% |
| 大文档渲染时间 | 5-10s | 1-3s |
| 首次加载时间 | 3-5s | <2s |
| PPTX 功能完成度 | 5% | 80% |

---

## 🚀 快速开始

如果你想立即开始优化，执行以下命令：

```bash
# 安装测试和 lint 依赖
pnpm add -Dw vitest @vitest/coverage-v8 jsdom eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier husky lint-staged

# 初始化 husky
pnpm exec husky install
```

然后按照"实施计划"中的"立即执行"任务逐步实施。

---

## 📎 附录

### A. 文件对照表

| 功能 | docx 文件 | xlsx 文件 | shared 文件 | 状态 |
|------|-----------|-----------|-------------|------|
| 主解析器 | DocxParser.ts | XlsxParser.ts | - | ✅ |
| 绘图解析 | DrawingParser.ts | DrawingParser.ts | DrawingMLParser.ts | ⚠️ 重名 |
| 图表解析 | ChartParser.ts | ChartParser.ts | - | ❌ 待合并 |
| 图表渲染 | (在 DrawingRenderer 中) | ChartRenderer.ts | ChartRenderer.ts | ✅ 已复用 |
| 形状渲染 | (在 DrawingRenderer 中) | ShapeRenderer.ts | ShapeRenderer.ts | ✅ 已复用 |
| 图片渲染 | (在 DrawingRenderer 中) | ImageRenderer.ts | ImageRenderer.ts | ⚠️ 未复用 |
| 样式注入 | StyleInjector.ts | XlsxStyleInjector.ts | - | ❌ 待抽取基类 |
| 日志工具 | Logger.ts | - | - | ❌ 待抽取 |

### B. 重构影响评估

| 重构项 | 影响文件数 | 破坏性变更 | 测试覆盖要求 |
|--------|------------|------------|--------------|
| Logger 抽取 | 15+ | 低 | 单元测试 |
| ChartParser 合并 | 4 | 中 | 集成测试 |
| 类型命名统一 | 20+ | 高 | 全面测试 |
| 目录结构重构 | 50+ | 高 | 回归测试 |

### C. 相关文档

- [📚 packages/shared/README.md](../packages/shared/README.md) - 共享模块文档
- [📚 packages/docx/README.md](../packages/docx/README.md) - DOCX 模块文档
- [📚 packages/xlsx/README.md](../packages/xlsx/README.md) - XLSX 模块文档


