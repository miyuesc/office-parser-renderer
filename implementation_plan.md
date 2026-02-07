# Implementation Plan - XlsxRenderer Enhancements

## 目标
优化 `XlsxRenderer` (主要为 `GridRenderer`)，增加对冻结行列渲染的配置支持，并新增滚动定位和获取单元格信息的公共方法。

## 变更范围
- `packages/xlsx/src/renderer/GridRenderer.ts`

## 步骤详解

### 1. 配置项增强
- 修改 `GridRendererOptions` 接口，增加可选参数：
    - `renderFrozenRows?: boolean` (默认 true)
    - `renderFrozenCols?: boolean` (默认 true)
- 在 `GridRenderer.ts` 的构造函数中初始化这些默认值。
- 修改 `render()` 方法，在计算 `frozenCols` 和 `frozenRows` 时结合以上配置项进行判断。

### 2. 新增公共方法
- **scrollTo(row?: number, col?: number)**:
    - 接受行号和列号（1-based）。
    - 计算目标行/列的像素位置（利用现有的 `getColWidth` 和 `getRowHeight`）。
    - 更新 `scrollX` 和 `scrollY`，并确保不越界。
    - 触发 `render()`。
- **getCellInfo(row: number, col: number)**:
    - 接受行号和列号。
    - 返回该单元格的相信信息，包括：
        - 内容 (value)
        - 样式 (style)
        - 屏幕坐标/尺寸 (rect: x, y, width, height) - 需考虑滚动偏移和缩放。
- **zoomTo(scale: number)**:
    - 作为 `setScale` 的别名或封装，提供明确的缩放接口。

### 3. 验证
- 这是一个纯逻辑修改，无法通过截图直接验证（除非建立特定 Demo）。
- 将通过代码审查和逻辑推演确保正确性。

## 注意事项
- 滚动定位需要考虑冻结区域的影响吗？通常 `scrollTo` 是将目标单元格移动到可视区域。如果被冻结区域遮挡，可能需要偏移。简单起见，先定位到该行/列的起始位置。
- `getPixelPos` 目前是 `private`，可以考虑复用或将其逻辑提取。
