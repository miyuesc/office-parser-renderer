# 形状与连接符解析实现总结

## 1. 共享类型 (`@opr/shared`)
- 新增 `OfficeShape` 接口，用于表示形状、连接符和组合。
- 在适当位置统一了 `OfficeImage` 和 `OfficeShape` 的用法。

## 2. 解析逻辑 (`@opr/xlsx`)
- **DrawingParser**:
    - 扩展了解析 `<xdr:sp>` (形状) 和 `<xdr:cxnSp>` (连接符) 的功能。
    - 提取内容:
        - 几何形状 (预设)
        - 变换 (位置、大小、旋转、翻转)
        - 样式 (纯色填充、描边、线宽)
        - 文本主体 (基础文本内容)
- **Worksheet Interface**:
    - 将 `images` 重命名为 `drawings`。
    - 类型定义为 `(OfficeImage | OfficeShape)[]`。

## 3. 渲染逻辑 (`@opr/shared` & `@opr/xlsx`)
- **ShapeRenderer**:
    - 新增形状渲染器。
    - 支持:
        - 预设形状 (矩形、椭圆、三角形、线条) 的 SVG 路径生成。
        - 填充和描边渲染。
        - 基础文本居中。
        - 变换 (旋转、翻转)。
- **GridRenderer**:
    - 更新为遍历 `drawings`。
    - 根据对象类型分发给 `ImageRenderer` 或 `ShapeRenderer` 处理。

## 4. 验证
- 验证构建成功。
- 已准备好在 Playground 中进行视觉验证。

## 5. 视图控制 (缩放)
- **GridRenderer**:
    - 在标签栏实现了缩放控件。
    - 添加了 `+`/`-` 按钮和滑块。
    - 支持 `Ctrl + 滚轮` 缩放。
    - 缩放范围: 20% 至 400%。
    - 更新了 `CellRenderer` 以适配缩放比例。
