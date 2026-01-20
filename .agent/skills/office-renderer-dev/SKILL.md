---
name: office-renderer-dev
description: 专门用于开发和调试 Office (XLSX/PPTX/DOCX) 文档解析与渲染工具，确保浏览器渲染效果与 Office 软件像素级一致。
---

# Office 文档解析渲染专家 (Office Renderer Developer)

本 Skill 旨在指导开发者实现一个高保真、基于浏览器端的 Office 文档解析与渲染引擎。

## 核心目标

1.  **像素级复刻 (Pixel-Perfect)**：渲染结果（位置、大小、颜色、特效、文本排版）必须与 Office 软件截图在肉眼层面无法区分。
2.  **严格遵循规范 (Spec-Compliant)**：基于 [ECMA-376 (OOXML)](https://www.ecma-international.org/publications-and-standards/standards/ecma-376/) 标准实现，而非猜测。
3.  **类型安全 (Type-Safe)**：全项目 TypeScript 严格模式，禁止 `any`，确保代码健壮性。

## 架构与工程规范

### 1. Monorepo 架构与目录结构
项目采用 Monorepo 结构，核心逻辑复用至 `packages/shared`，以支持 `xlsx`, `docx`, `pptx` 的多格式解析：

- **`packages/shared`**: 存放通用的 OOXML 解析与渲染逻辑，核心是 **DrawingML** 模块。
  - `src/drawing/DrawingMLParser.ts`: **Facade 入口**，统一调度具体解析逻辑，被 `xlsx/docx/pptx` 业务包调用。
  - `src/drawing/parsers/`: 存放具体属性解析器（如 `ShapePropertiesParser` 处理 `spPr`, `TextBodyParser` 处理 `txBody`）。
  - `src/drawing/shapes/`: 存放具体形状的几何定义和路径生成逻辑。
    - `PresetGeometries.ts`: 导出所有预设形状。
    - `ShapeRegistry.ts`: 注册形状名称到生成函数的映射。
  - `src/utils/`: 通用数学计算与颜色处理工具。

- **`packages/[xlsx|docx|pptx]`**: 各文档格式的专用解析器与渲染器。
  - 负责解析各自的文档结构（如 Workbook, Slide, Document）。
  - 调用 `shared` 中的 `DrawingMLParser` 处理文档内部的图形对象（Shapes, Charts, SmartArt）。

### 2. 代码风格
- **严格类型**：必须定义完整的 Interface，例如 `ShapeProps`, `AdjustmentValue`。
- **注释**：核心算法（特别是路径计算、坐标变换）必须添加详细的 **中文注释**。
- **工具函数**：优先使用 `GeoUtils` 等公共库处理数学计算（角度转换、距离计算）。

## 核心实现说明

### 1. 几何形状 (Preset Geometries)
Office 形状极其丰富，实现时需注意以下几类特殊情况：

#### A. 调节值 (Adjust Values)
形状的形态通常由 `adj1`, `adj2` 等变量控制（如箭头的头部大小、五角星的内径）。
- **解析**：从 `prstGeom -> avLst -> gd` 中提取，如果缺省则使用标准默认值。
- **应用**：在路径生成函数中，利用解析出的 adjust value 计算关键点坐标。
- **示例**：`star7` 需要处理内半径比例和旋转偏移；`roundRect` 需要处理圆角半径。

#### B. 开放路径 (Open Paths)
部分形状只有描边没有填充，且路径不闭合。
- **典型形状**：`leftBracket`, `rightBracket`, `leftBrace`, `rightBrace`, `arc`。
- **实现细节**：SVG `path` 字符串不应包含 `Z` (close path) 指令；强制设置 `fill="none"`。

#### C. 连接符 (Connectors)
连接符的路径生成复杂，依赖起始点和终止点的位置及相对方向。
- **Curved Connectors**：如 `curvedConnector3`, `curvedConnector4`，需要利用贝塞尔曲线 (Bezier Curves) 实现平滑过渡，控制点位置受 adjust values 影响。
- **Routing**：自动路由逻辑需避免穿过图形主体（除非设计如此）。

### 2. 样式与渲染 (Styles & Rendering)

#### A. 坐标与单位
- **EMU 转换**：所有尺寸计算使用 EMU (1in = 914400 EMU)，渲染时转为像素。
- **旋转 (Rotation)**：
  - Office 旋转中心通常是图形中心。
  - **图片旋转特殊性**：旋转后的 bounding box 计算需注意宽高交换问题，特别是 90/270 度旋转时，避免图片拉伸或位移。

#### B. 边框与填充
- **Paint Order**：为防止边框遮挡填充内容（这是 SVG 默认行为，与 Office 不同），应在 SVG 样式中设置 `paint-order: stroke fill`。
- **渐变 (Gradient)**：支持 Linear 和 Path (Radial, Rectangular) 渐变。注意 Office 的渐变角度与 CSS 标准的差异，通常需要转换。

#### C. 特效 (Effects)
- **阴影 (Shadows)**：
  - **Outer Shadow**: 使用 SVG `<feDropShadow>` 或 CSS `box-shadow`。需准确计算 `dist` (距离), `dir` (方向), `blurRad` (模糊)。
  - **Inner Shadow**: 使用 SVG `<feInsetShadow>` (自定义滤镜) 实现。
- **柔化边缘 (Soft Edges)** & **发光 (Glow)**：利用 SVG 高斯模糊滤镜实现。

### 3. 图表 (Charts)
- **布局冲突**：图表区往往与 Excel 表格数据区重叠。渲染时需计算图表 `from/to` 锚点，确保覆盖在单元格之上，但不影响底层数据交互。
- **元素对齐**：图例 (Legend)、轴标签 (Axis Labels) 的位置计算需考虑字体 metrics，避免截断或重叠。

### 4. 调试与排错 (Debugging)

- **NaN 检查**：路径计算中极易出现 `NaN`（分母为0、未定义变量）。必须在 core 渲染循环中加入 `isNaN` 检查卫语句。
- **空值保护**：XML 解析时大量字段是 Optional 的，必须做 `null/undefined` 检查（如 `querySelector` 结果）。
- **DOM 结构**：使用浏览器 DevTools 检查 SVG 结构。
  - 路径不对？ -> 检查 `d` 属性。
  - 颜色不对？ -> 检查 `fill`, `stroke`, `stop-color`。
  - 没显示？ -> 检查 `width/height` 是否为 0，`visibility` 属性。

## 参考资料

- **形状路径计算**：参考 [PPTX.js](https://raw.githubusercontent.com/meshesha/PPTXjs/refs/heads/master/js/pptxjs.js)。
- **Office 标准**：参考 [ECMA-376 (OOXML)](https://www.ecma-international.org/publications-and-standards/standards/ecma-376/)。
- **预设形状元素图形示例**：参考 [<ST_ShapeType> (Preset Shape Types)](https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_ST_ShapeType_topic_ID0EBTFOB.html)。
- **SVG 路径计算**：参考 [SVG Path](https://www.w3.org/TR/SVG/paths.html)。
- **SVG 滤镜**：参考 [SVG Filters](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/filter)。
- **SVG 线性渐变**：参考 [SVG Linear Gradient](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)。
- **SVG 径向渐变**：参考 [SVG Radial Gradient](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient)。
- **DOCX、PPTX、XLSX 文档解析**：参考 [officetohtml](https://raw.githubusercontent.com/meshesha/officetohtml/refs/heads/master/officeToHtml.js)。
- **OOXML 规范**：参考 [ooxml](https://ooxml.info/docs/)
- **Office Open XML**：参考 [Office Open XML](http://officeopenxml.com/)
- **OOXML XSD**：参考 [OOXML XSD](https://schemas.liquid-technologies.com/officeopenxml/2006/)

### 插入形状、图表参考代码

1. [Ziv-Barber/officegen](https://github.com/Ziv-Barber/officegen)
    - [pptxshapes.js](https://github.com/Ziv-Barber/officegen/blob/master/lib/pptx/pptxshapes.js)
    - [shapes.js](https://github.com/Ziv-Barber/officegen/blob/master/lib/pptx/shapes.js)
    - [charts.js](https://github.com/Ziv-Barber/officegen/blob/master/lib/pptx/charts.js)
    - [officechart.js](https://github.com/Ziv-Barber/officegen/blob/master/lib/pptx/officechart.js)
2. [Qihoo360/se-office](https://github.com/Qihoo360/se-office)
    - [Drawings](https://github.com/Qihoo360/se-office/tree/main/sdkjs/common/Drawings)
    - [Shape.js](https://github.com/Qihoo360/se-office/blob/main/sdkjs/common/Drawings/Format/Shape.js)
    - [Path.js](https://github.com/Qihoo360/se-office/blob/main/sdkjs/common/Drawings/Format/Path.js)
    - [Geometry.js](https://github.com/Qihoo360/se-office/blob/main/sdkjs/common/Drawings/Format/Geometry.js)
    - [Serialize.js](https://github.com/Qihoo360/se-office/blob/main/sdkjs/common/Shapes/Serialize.js)
3. [moneyinto/ppt-parse](https://github.com/moneyinto/ppt-parse)
    - [shape.js](https://github.com/moneyinto/ppt-parse/blob/master/src/shape.js)
    - [elements](https://github.com/moneyinto/ppt-parse/tree/master/src/components/elements)
4. [beautifulai/PptxGenJS](https://github.com/beautifulai/PptxGenJS)
    - [gen-objects.ts](https://github.com/beautifulai/PptxGenJS/blob/main/src/gen-objects.ts)
    - [gen-charts.ts](https://github.com/beautifulai/PptxGenJS/blob/main/src/gen-charts.ts)
    - [core-enums.ts](https://github.com/beautifulai/PptxGenJS/blob/main/src/core-enums.ts)
5. [heavysixer/node-pptx](https://github.com/heavysixer/node-pptx)
    - [shape-types.js](https://github.com/heavysixer/node-pptx/blob/master/lib/shape-types.js)

## 验证工作流 (Validation Workflow)

开发过程中严格遵循以下校验步骤：

1.  **Build & Lint**: `pnpm run build` (无类型错误), `tslint/eslint` 通过。
2.  **Server Start**: `pnpm run pg:dev` 启动本地预览。
3.  **Visual Diff (最为关键)**:
    - 准备测试用例文件 (test.xlsx)。
    - 打开浏览器渲染页面。
    - 打开 Office 软件显示同一文件。
    - **对比项**：
        - 形状轮廓是否完全重合？
        - 文字换行位置是否一致？
        - 渐变色过渡位置是否一致？
        - 图片是否被意外倒置或拉伸？
4.  **Auto Validation**: 运行 `/validation` 脚本（如有）。

---

> **核心原则**：如果代码写得很快但渲染结果和 Office 截图有一像素差距，那就是 Bug。
