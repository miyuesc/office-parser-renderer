# Office Parser Renderer

> 面向预览场景的 Office OOXML 解析与渲染 monorepo。

[English](./README.en.md) | 简体中文

## 当前状态

| 模块 | 状态 | 说明 |
| --- | --- | --- |
| `@opr/shared` | 进行中 | 已有 OOXML package/rels/content-types、样式、drawing/chart/media/math/rendering 基础层，并开始沉淀 layout anchor/z-index/coordinate 与 fidelity warning contract |
| `@opr/xlsx` | 可用，继续稳定化 | 当前最成熟，具备真实解析与 canvas 渲染链路 |
| `@opr/docx` | Foundation MVP | 已有 parser/model/page layout/canvas renderer，不等同于 Word 一比一高保真 |
| `@opr/pptx` | Static preview MVP | 已有 presentation/slide/master/layout/theme 基础解析与单页静态预览 |

这份 README 只描述仓库的**当前实现状态**。`docx`/`pptx` 已经不是空壳，但仍处在 MVP 阶段；一比一预览能力以路线图和样本验收为准。

## 已落地能力

### Shared

- OOXML 公共加载层：
  - `PackageReader`
  - `RelationshipsResolver`
  - `ContentTypesRegistry`
  - `XmlHelper`
  - `WarningCollector`
- 单位转换、颜色解析、主题色、字体和跨格式样式 contract
- drawing/chart/media/math/rendering 基础工具
- 图片、shape、connector、group、chart 的共享解析入口
- `MediaRegistry` 与 OMML/math fallback 基础模型
- layout anchor、coordinate space、z-index/layer ordering 的最小 contract
- fidelity warning taxonomy：unsupported / degraded / clipped / fallback

### XLSX

- workbook / worksheet / shared strings / styles / theme 解析
- merges、冻结窗格、多 sheet、hyperlinks、comments、formula metadata、conditional formatting 基础解析
- 模型级 `getCell`、`getCellByRef`、合并覆盖单元格访问
- sheet tab 切换、缩放、拖拽、滚动条
- 行列头、冻结区域、背景色、富文本、边框、公式显示策略
- 图片、形状、图表、批注提示、超链接的现有渲染通路

### DOCX

- `document.xml`、`styles.xml`、`numbering.xml`、`settings.xml` 基础解析
- paragraphs、runs、tables、sections、header/footer references
- page layout MVP、canvas page renderer、隐藏语义文本层
- heading tree、TOC entry、jump to heading/page、stats
- inline image、floating drawing metadata、anchored chart、OMML/math fallback、symbols、revision run 基础模型

### PPTX

- presentation main part、slide list、slide master、slide layout、theme relationship 基础解析
- 基础 text shape 提取
- 单页静态预览 shell
- `jumpToSlide` / `nextSlide` / `previousSlide` / `initialSlide`

## 未完成或仍在演进中的部分

- Microsoft Office 级一比一视觉还原
- 完整字体度量、排版规则、跨格式 viewport/layout 内核，以及各格式对 shared anchor/z-index/coordinate contract 的完整接入
- DOCX 分栏、复杂分页、浮动对象绕排、背景/水印、批注、完整修订显示模式
- PPTX shape/image/chart/table/background 高保真静态渲染，以及 transition/animation/presentation mode
- XLSX 大工作簿性能基线、复杂图表/形状/WordArt、完整公式/条件格式覆盖
- 视觉回归、性能基线、兼容性矩阵
- 构建配置与包边界清理

## 路线图与基线文档

- 当前执行清单：[docs/office-preview-todo-list.md](./docs/office-preview-todo-list.md)
- `xlsx` 问题清单：[docs/xlsx-gap-list.md](./docs/xlsx-gap-list.md)
- 开发指南：[docs/DEVELOPING_GUIDE_ZH.md](./docs/DEVELOPING_GUIDE_ZH.md)
- 样本库规范：[samples/README.md](./samples/README.md)

## 快速开始

三种格式都有基础入口；`xlsx` 当前最稳定，`docx`/`pptx` 仍按 MVP 能力使用。

```typescript
import { XlsxParser, XlsxRenderer } from '@opr/xlsx';

const container = document.getElementById('office-container');

fetch('/path/to/workbook.xlsx')
  .then(res => res.arrayBuffer())
  .then(buffer => XlsxParser.parse(buffer))
  .then(workbook => {
    const renderer = new XlsxRenderer(container);
    const firstSheet = workbook.worksheets.values().next().value;
    renderer.setWorksheet(firstSheet, workbook);
  });
```

## 仓库结构

```text
definitions/   OOXML 类型定义
packages/
  shared/      公共基础设施与复用模块
  xlsx/        当前主实现路径
  docx/        DOCX foundation MVP
  pptx/        PPTX static preview MVP
playground/    本地演示与手工验证
docs/          主路线图、xlsx gap 和开发指南
samples/       样本库规范与后续验收样本
```

## 开发原则

- 先做 `shared` 基础设施，再做格式功能
- `xlsx` 先稳定化，再以其提炼共享能力
- `docx` 必须按“解析 -> 样式 -> 分页 -> 插入元素 -> 修订/批注/背景”顺序推进
- `pptx` 必须分离静态预览与播放/动画状态
- 不以 README 愿景替代源码现状
