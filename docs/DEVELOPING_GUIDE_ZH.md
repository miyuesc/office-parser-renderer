# Office Parser Renderer 开发指南

> 更新时间：2026-04-30
>
> 本指南只保留长期有效的工程规则。路线图、当前缺口和验收状态请以 [office-preview-todo-list.md](./office-preview-todo-list.md) 为准。

## 1. 目标

项目目标是完整解析 `xlsx`、`docx`、`pptx`，并尽量实现与 Microsoft Office 一比一的预览效果。

当前必须明确区分：

- `已完成`：有代码、样本或测试验证，可作为稳定能力使用。
- `MVP`：链路已通，但视觉或行为仍有明显降级。
- `降级`：遇到复杂 Office 构造时用可解释 fallback 显示。
- `未支持`：不应在 README、demo 或计划中描述为可用。

## 2. 仓库结构

```text
definitions/   OOXML 自动生成类型
packages/
  shared/      OOXML package、样式、drawing、chart、media、math、layout、rendering 公共层
  xlsx/        SpreadsheetML parser/model/renderer
  docx/        WordprocessingML parser/model/layout/navigation/renderer
  pptx/        PresentationML parser/model/renderer
playground/    多格式本地预览入口
samples/       样本库与验收素材
docs/          当前计划、专项 gap、开发指南
```

## 3. 分层规则

- `packages/shared/src/ooxml` 只处理 ZIP、part、content type、relationship、路径、XML helper、warning，不写格式语义。
- `packages/shared/src/styles` 只放跨格式可复用的 theme、font、color、text、paragraph、fill、stroke contract。
- `packages/shared/src/drawing`、`chart`、`media`、`math`、`layout`、`rendering` 优先承载可被两个以上格式复用的视觉和模型能力。
- `packages/xlsx` 只处理 workbook、worksheet、cell、sheet viewport 和 SpreadsheetML 语义。
- `packages/docx` 只处理 document、paragraph、run、table、section、header/footer、pagination 和 WordprocessingML 语义。
- `packages/pptx` 只处理 presentation、slide、master、layout、placeholder、animation/player 和 PresentationML 语义。

## 4. Parser / Model / Renderer 边界

- Parser 输出中间模型，不直接生成 DOM 或 canvas 绘制命令。
- Model 保存文档结构、样式、资源引用、warning 和导航信息。
- Renderer 只消费模型，不反向解析 XML。
- 视图控制如 zoom、scroll、drag、jump、thumbnail 不应混入 parser。
- DOCX 必须保持 page preview 路线，不能退回单一 flow article。
- PPTX 必须分离静态 slide render state 和 animation/player state。

## 5. 开发顺序

默认优先级：

1. 修 shared 公共能力。
2. 稳定 xlsx，因为它是当前最成熟的真实路径。
3. 深化 docx 高保真分页、绕排、背景、水印、批注和修订。
4. 深化 pptx 静态预览，再做动画与演示模式。
5. 建立样本、视觉回归、性能基线和兼容性矩阵。

如果任务看似属于 `docx` 或 `pptx`，但缺口实际是 package/rels/theme/media/drawing/chart/layout，应先在 `shared` 处理。

## 6. 验证规则

功能关闭前至少满足一种验证：

- focused unit test。
- sample parser assertion。
- Playwright smoke 或截图归档。
- benchmark 或性能报告。
- 明确的手工验收记录。

涉及一比一视觉保真的能力，优先用样本和截图验证；仅 parser test 不能证明视觉完成。

## 7. 样本规则

- 样本放在 `samples/{format}/{feature}/{case}/`。
- 每个样本至少包含 `source.*`、`case.json`、`notes.md`。
- 结构稳定的样本应补 `expected/parser.json`。
- 视觉稳定的样本应补 `expected/screenshots/` 或记录到 `output/playwright/`。
- 重要 unsupported 构造也应有样本，用于后续计划和 warning 验收。

## 8. 文档规则

- 当前事实、路线和优先级写入 [office-preview-todo-list.md](./office-preview-todo-list.md)。
- XLSX 专项缺口写入 [xlsx-gap-list.md](./xlsx-gap-list.md)。
- 长期工程规则写入本文件。
- 不再新增独立阶段计划、临时 WBS、专项草案文件；完成后应合并进主清单。
- 每次实现改变能力边界时，同步 README、主清单、专项 gap 和样本说明。
