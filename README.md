# Office Parser Renderer

> 面向预览场景的 Office OOXML 解析与渲染 monorepo。

[English](./README.en.md) | 简体中文

## 当前状态

| 模块 | 状态 | 说明 |
| --- | --- | --- |
| `@opr/shared` | 进行中 | 已有基础工具、drawing/chart/rendering 模块，以及第一版 `shared/ooxml` 公共加载层 |
| `@opr/xlsx` | 可用但待稳定化 | 具备基础解析与渲染能力，是当前唯一可运行的格式路径 |
| `@opr/docx` | 未实现 | 目前只有包骨架，还没有 `DocxParser` / `DocxRenderer` |
| `@opr/pptx` | 未实现 | 当前仓库中尚未落地 |

这份 README 只描述仓库的**当前实现状态**。`docx`/`pptx` 的目标能力请看路线图，而不是把它们视为已完成能力。

## 已落地能力

### Shared

- ZIP 解压与 XML 解析
- 单位转换、颜色解析、基础 drawing/chart/rendering 工具
- OOXML 公共加载层：
  - `PackageReader`
  - `RelationshipsResolver`
  - `ContentTypesRegistry`

### XLSX

- workbook / worksheet / shared strings / styles 解析
- merges、冻结窗格、多 sheet 元数据解析
- sheet tab 切换、缩放、拖拽、滚动条
- 行列头显示
- 图片、形状、图表的现有渲染通路

## 未完成或仍在演进中的部分

- `docx` 与 `pptx` 解析/渲染主链路
- shared Theme / Font / Color 统一模型
- `xlsx` 的稳定对外 API：`scrollToRow`、`scrollToCol`、`scrollToCell`、`getCell`、`getCellByRef`
- 样本库、视觉回归、性能基线
- 构建配置与包边界清理

## 路线图与基线文档

- 总路线图：[docs/docx_task.md](./docs/docx_task.md)
- M0 重构设计：[docs/ooxml-refactor-design.md](./docs/ooxml-refactor-design.md)
- `xlsx` 问题清单：[docs/xlsx-gap-list.md](./docs/xlsx-gap-list.md)
- 样本库规范：[samples/README.md](./samples/README.md)

## 快速开始

当前只建议把 `xlsx` 作为可运行入口。

```typescript
import { XlsxParser, XlsxRenderer } from '@opr/xlsx';

const container = document.getElementById('xlsx-container');
const parser = new XlsxParser();
const renderer = new XlsxRenderer(container);

fetch('/path/to/workbook.xlsx')
  .then(res => res.arrayBuffer())
  .then(buffer => parser.parse(buffer))
  .then(workbook => renderer.render(workbook));
```

## 仓库结构

```text
definitions/   OOXML 类型定义
packages/
  shared/      公共基础设施与复用模块
  xlsx/        当前主实现路径
  docx/        预留骨架
  pptx/        预留骨架
playground/    本地演示与手工验证
docs/          路线图、设计说明、阶段文档
samples/       样本库规范与后续验收样本
```

## 开发原则

- 先做 `shared` 基础设施，再做格式功能
- `xlsx` 先稳定化，再以其提炼共享能力
- `docx` 必须按“解析 -> 样式 -> 分页 -> 插入元素”顺序推进
- 不以 README 愿景替代源码现状
