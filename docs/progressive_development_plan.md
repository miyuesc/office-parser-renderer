# 渐进式开发计划 (Progressive Development Plan)

本计划旨在通过分阶段迭代，逐步消除渲染差异，最终实现与截图一致的 Pixel-Perfect 渲染效果。计划内容基于对 `@packages/playground/public/测试docx.docx` 及其解压 XML 内容的深度分析制定。

## 第一阶段：布局与基础样式修正 (Layout & Styling Baseline)
**目标**：确保文档“骨架”准确，文字、表格、页面的空间位置与 Office 高度一致。

1.  **页面模型校准 (Page Model Calibration)**
    - [ ] 实现精准的 A4/Letter 纸张尺寸控制与页边距 (Page Margins) 渲染 (`w:pgSz`, `w:pgMar`)。
    - [ ] 修正行高 (Line Height) 与字符间距计算算法 (`w:spacing` line/lineRule)，减少分页位置误差。
    - [ ] 支持分节符 (`w:sectPr`) 定义的多栏布局 (`w:cols`)，特别是文档中的双栏布局。
2.  **页眉页脚增强 (Header/Footer Enhancement)**
    - [ ] 支持页眉页脚中的图片/Logo 渲染 (`w:headerReference`, `w:footerReference`)。
    - [ ] 实现奇偶页不同、首页不同等分节配置。
    - [ ] 修正页眉页脚的绝对定位布局及 VML 元素的定位 (`v:shape` in headers)。
3.  **表格精细化 (Table Refinement)**
    - [ ] 修复单元格边框合并逻辑 (Border Collapse)。
    - [ ] 实现单元格底纹 (Shading) 与背景色 (`w:shd`, `w:shd` fill)
    - [ ] **支持表格对角线边框** (`tl2br`, `tr2bl`)，这在测试文档头部表格中出现。
    - [ ] 修正单元格内边距 (Cell Padding)，优化文本对齐。

## 第二阶段：形状与绘图修复 (Shape & Drawing Fixes)
**目标**：解决“黑块”、形状丢失及样式渲染错误，提升可视元素的完整性。

1.  **VML 遗留图形支持 (VML Support)** (重点)
    - [ ] 解析并渲染 `v:shape`, `v:rect` 等 VML 标签（测试文档封面包含大量 VML 形状）。
    - [ ] 支持 VML 中的文本框 (`v:textbox`) 及其内部的图文混排。
    - [ ] 处理 VML 的坐标系 (`coordsize`) 与绝对定位 (`position:absolute`)。
2.  **DrawingML 形状与几何路径 (DrawingML Shapes)**
    - [ ] **复杂预设几何体**：实现 `snip2DiagRect` (剪去对角的矩形) 等不规则形状。
    - [ ] **连接符支持**：实现 `bentConnector3` (肘形连接符) 和 `curvedConnector3` (曲线连接符) 的路径渲染。
    - [ ] **流程图支持**：实现 `flowChartDocument` (流程图元素) 的解析与绘制。
3.  **高级样式效果 (Advanced Styling)**
    - [ ] **渐变填充**：支持 `a:gradFill` 及其子元素 `gsLst` (Gradient Stop List) 的渲染。
    - [ ] **描边样式**：支持虚线描边 (`prstDash="sysDot"` 等) 及箭头端点 (`headEnd`/`tailEnd`) 样式。
    - [ ] **文本效果**：支持文本轮廓 (`w14:textOutline`) 和文本填充 (`w14:textFill`)。

## 第三阶段：数学公式与高级文本 (Math & Advanced Text)
**目标**：实现 Office Math 与复杂的文本修订、域功能。

1.  **Office Math 公式渲染 (OMath)**
    - [ ] 解析 `m:oMath` 及 `m:oMathPara` 容器。
    - [ ] 实现基础运算符与结构：分数 (`m:f`)、上下标 (`m:sSup`, `m:sSub`)、定界符/括号 (`m:d`)。
    - [ ] 实现复杂数学结构：求和/积分 (`m:nary`)、矩阵 (`m:m`)、根式 (`m:rad`)。
    - [ ] 确保公式字体 (`Cambria Math`) 的正确加载与度量。
2.  **修订与批注 (Revisions & Comments)**
    - [ ] **修订模式**：解析并渲染插入 (`w:ins`) 和删除 (`w:del`) 标记，实现红/绿色背景或删除线效果。
    - [ ] **属性修订**：支持 `w:rPrChange` 和 `w:pPrChange` 造成的样式变更显示。
3.  **域与书签 (Fields & Bookmarks)**
    - [ ] **超链接**：解析 `w:fldChar` 中的 `HYPERLINK` 指令，渲染为可点击链接。
    - [ ] **书签**：处理 `w:bookmarkStart` 和 `w:bookmarkEnd`，虽然不直接渲染，但需保证不破坏布局。

## 第四阶段：核心图表实现 (Chart Implementation)
**目标**：移除 `[图表]` 占位符，实现原生图表渲染（基于 `drawing1.xml` 等）。

1.  **ChartML 解析器 (Chart Parser)**
    - [ ] 开发 `ChartParser`，解析 `word/charts/chartX.xml`。
    - [ ] 提取数据系列 (Series)、分类 (Categories) 与图例信息。
2.  **Canvas 图表绘制 (Chart Rendering)**
    - [ ] 实现**柱状图 (Bar Chart)** 渲染器。
    - [ ] 实现**折线图 (Line Chart)** 渲染器。
    - [ ] 实现**饼图 (Pie Chart)** 渲染器。
    - [ ] 集成坐标轴 (Axis) 与网格线绘制。

## 第五阶段：细节打磨与性能优化 (Polishing & Optimization)
**目标**：处理边缘情况，达到截图级的视觉效果。

1.  **图文混排优化**
    - [ ] 优化浮动对象 (`wp:anchor`) 与嵌入对象 (`wp:inline`) 的布局算法，防止遮挡文字。
    - [ ] 精确计算 `z-index`，处理 VML 与 DrawingML 元素的堆叠顺序。
2.  **性能与兼容性**
    - [ ] 优化 Canvas 绘制指令，减少重绘区域。
    - [ ] 针对大文件 (如包含大量 VML/Math 的文档) 进行解析性能优化。

## 验证计划 (Verification Plan)
- **自动化测试**：建立截图对比测试 (Visual Regression Testing)，每次提交对比基准截图。
- **人工验收**：使用 `测试docx.docx` 对照提供的 2 张截图及 Office 软件显示效果，重点检查：
    1.  封面 VML 图形组合是否错位。
    2.  第二页数学公式显示是否正常。
    3.  表格对角线和边框细节。
    4.  修订内容的显示样式。
