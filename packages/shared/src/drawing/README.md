# Drawing 模块

> Office DrawingML 解析和渲染模块

## 📝 简介

Drawing 模块提供了 Office DrawingML (DrawingML) 的完整支持，包括形状、图片、图表的解析和渲染。DrawingML 是 Office Open XML 中用于定义图形内容的标准规范，被 Word、Excel、PowerPoint 等应用广泛使用。

## ✨ 核心特性

- **100+ 预设形状**：支持所有 Office 预设形状的 SVG 路径生成
- **自定义几何**：支持自定义几何路径的解析和渲染
- **丰富的样式**：支持填充、边框、阴影、发光、反射等效果
- **图表支持**：完整的图表渲染，包括柱状图、折线图、饼图等
- **主题颜色**：支持 Office 主题颜色系统
- **变换支持**：支持旋转、翻转、缩放等变换

## 🏗️ 模块结构

```
drawing/
├── parsers/                # DrawingML 解析器
│   ├── ColorParser.ts              # 颜色解析
│   ├── FillParser.ts               # 填充解析
│   ├── EffectParser.ts             # 效果解析
│   ├── ShapePropertiesParser.ts    # 形状属性解析
│   ├── ShapeStyleParser.ts         # 形状样式解析
│   ├── TextBodyParser.ts           # 文本体解析
│   ├── CustomGeometryParser.ts     # 自定义几何解析
│   └── index.ts
├── renderers/              # 绘图渲染器
│   ├── ShapeRenderer.ts            # 形状渲染
│   ├── ImageRenderer.ts            # 图片渲染
│   ├── ChartRenderer.ts            # 图表渲染
│   ├── types.ts                    # 渲染器类型
│   └── index.ts
├── shapes/                 # 形状库
│   ├── BasicShapes.ts              # 基础形状（矩形、圆形、三角形等）
│   ├── ArrowShapes.ts              # 箭头形状
│   ├── FlowchartShapes.ts          # 流程图形状
│   ├── CalloutShapes.ts            # 标注形状
│   ├── Stars.ts                    # 星形
│   ├── MathShapes.ts               # 数学形状
│   ├── ActionShapes.ts             # 动作按钮
│   ├── DecorationShapes.ts         # 装饰形状
│   ├── SpecialShapes.ts            # 特殊形状
│   ├── Connectors.ts               # 连接线
│   ├── Rectangles.ts               # 矩形变体
│   ├── SnipShapes.ts               # 剪切形状
│   ├── ShapeRegistry.ts            # 形状注册表
│   ├── GeoUtils.ts                 # 几何工具
│   ├── types.ts                    # 形状类型
│   └── allShapes.md                # 形状目录
├── DrawingMLParser.ts      # DrawingML 主解析器
├── ThemeEnums.ts           # 主题枚举
├── PresetGeometries.ts     # 预设几何
├── types.ts                # DrawingML 类型
└── index.ts                # 导出文件
```

## 📖 核心组件

### Parsers 解析器

#### ColorParser

解析 DrawingML 颜色定义。

**支持的颜色类型：**
- `a:srgbClr` - RGB 颜色
- `a:schemeClr` - 主题颜色
- `a:sysClr` - 系统颜色
- `a:prstClr` - 预设颜色

**颜色变换：**
- `a:alpha` - 透明度
- `a:lumMod` - 亮度调制
- `a:lumOff` - 亮度偏移
- `a:satMod` - 饱和度调制
- `a:shade` - 阴影
- `a:tint` - 色调

**示例：**
```xml
<a:schemeClr val="accent1">
  <a:lumMod val="75000"/>
  <a:lumOff val="25000"/>
</a:schemeClr>
```

#### FillParser

解析填充样式。

**支持的填充类型：**
- 纯色填充 (solidFill)
- 渐变填充 (gradFill)
  - 线性渐变 (lin)
  - 路径渐变 (path)
- 图案填充 (pattFill)
- 图片填充 (blipFill)
- 无填充 (noFill)

**示例：**
```xml
<a:gradFill>
  <a:gsLst>
    <a:gs pos="0">
      <a:schemeClr val="accent1"/>
    </a:gs>
    <a:gs pos="100000">
      <a:schemeClr val="accent2"/>
    </a:gs>
  </a:gsLst>
  <a:lin ang="2700000"/>
</a:gradFill>
```

#### EffectParser

解析效果样式。

**支持的效果：**
- 阴影 (shadow, outerShdw, innerShdw)
- 发光 (glow)
- 反射 (reflection)
- 柔化边缘 (softEdge)

#### ShapePropertiesParser

解析形状属性。

**解析内容：**
- 变换 (xfrm) - 位置、尺寸、旋转、翻转
- 几何 (prstGeom, custGeom)
- 填充 (solidFill, gradFill, etc.)
- 边框 (ln)
- 效果 (effectLst)

#### TextBodyParser

解析文本体内容。

**解析内容：**
- 段落 (a:p)
- 文本运行 (a:r)
- 文本属性 (a:rPr)
- 段落属性 (a:pPr)

### Renderers 渲染器

#### ShapeRenderer

渲染形状元素。

**功能：**
- 查询形状注册表获取 SVG 路径
- 应用填充样式
- 应用边框样式
- 应用效果（阴影、发光等）
- 处理变换（旋转、翻转）

**关键方法：**
```typescript
render(shape: Shape): SVGElement
renderPath(pathData: string, fill: Fill, stroke: Stroke): SVGPathElement
applyEffects(element: SVGElement, effects: Effect[]): void
```

#### ImageRenderer

渲染图片元素。

**功能：**
- 加载图片资源
- 应用裁剪
- 应用效果
- 处理变换

**关键方法：**
```typescript
render(image: Image): HTMLImageElement
applyCrop(img: HTMLImageElement, crop: Crop): void
```

#### ChartRenderer

渲染图表元素。

**支持的图表类型：**
- 柱状图 (Bar Chart)
- 折线图 (Line Chart)
- 饼图 (Pie Chart)
- 面积图 (Area Chart)
- 散点图 (Scatter Chart)
- 组合图表 (Combo Chart)

**功能：**
- 渲染图表容器
- 渲染坐标轴
- 渲染系列数据
- 渲染图例
- 渲染数据标签

**关键方法：**
```typescript
render(chart: Chart): HTMLElement
renderBarChart(chart: BarChart): HTMLElement
renderLineChart(chart: LineChart): HTMLElement
renderPieChart(chart: PieChart): HTMLElement
```

### Shapes 形状库

#### 形状分类

**基础形状 (BasicShapes)**
- rect - 矩形
- ellipse - 椭圆
- triangle - 三角形
- rtTriangle - 直角三角形
- parallelogram - 平行四边形
- trapezoid - 梯形
- diamond - 菱形
- pentagon - 五边形
- hexagon - 六边形
- octagon - 八边形
- plus - 加号
- ...

**箭头形状 (ArrowShapes)**
- rightArrow - 右箭头
- leftArrow - 左箭头
- upArrow - 上箭头
- downArrow - 下箭头
- leftRightArrow - 左右箭头
- upDownArrow - 上下箭头
- quadArrow - 四向箭头
- ...

**流程图形状 (FlowchartShapes)**
- flowChartProcess - 流程
- flowChartDecision - 判断
- flowChartInputOutput - 输入输出
- flowChartPredefinedProcess - 预定义流程
- flowChartInternalStorage - 内部存储
- flowChartDocument - 文档
- flowChartTerminator - 终止符
- ...

**标注形状 (CalloutShapes)**
- wedgeRectCallout - 矩形标注
- wedgeRoundRectCallout - 圆角矩形标注
- wedgeEllipseCallout - 椭圆标注
- cloudCallout - 云形标注
- ...

**星形 (Stars)**
- star4 - 四角星
- star5 - 五角星
- star6 - 六角星
- ...

#### ShapeRegistry

形状注册表，管理所有预设形状的路径生成函数。

**关键方法：**
```typescript
register(name: string, generator: ShapePathGenerator): void
get(name: string): ShapePathGenerator | undefined
has(name: string): boolean
getAll(): string[]
```

**使用示例：**
```typescript
import { ShapeRegistry } from '@ai-space/shared';

// 获取形状路径
const pathData = ShapeRegistry.get('rect')?.(100, 100);

// 列出所有形状
const allShapes = ShapeRegistry.getAll();
console.log(`支持 ${allShapes.length} 种形状`);
```

#### GeoUtils

几何计算工具。

**功能：**
- 贝塞尔曲线计算
- 路径点计算
- 角度转换
- 调整值 (adj) 处理

**关键方法：**
```typescript
arcTo(x1, y1, x2, y2, rx, ry): string
quadBezier(x1, y1, cx, cy, x2, y2): string
cubicBezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2): string
normalizeAdj(adj: number, min: number, max: number, def: number): number
```

## 🎨 DrawingML 坐标系统

### EMU 单位

DrawingML 使用 EMU (English Metric Unit) 作为基本单位：

- 1 英寸 = 914,400 EMU
- 1 厘米 = 360,000 EMU
- 1 点 (pt) = 12,700 EMU

**转换：**
```typescript
import { UnitConverter } from '@ai-space/shared';

const px = UnitConverter.emuToPx(914400);  // 64px
```

### 形状坐标系统

形状路径使用 100,000 × 100,000 的归一化坐标系统：

```
(0, 0)                    (100000, 0)
    ┌────────────────────────┐
    │                        │
    │      Shape Path        │
    │                        │
    └────────────────────────┘
(0, 100000)          (100000, 100000)
```

**缩放到实际尺寸：**
```typescript
const scaleX = actualWidth / 100000;
const scaleY = actualHeight / 100000;
```

## 🎯 形状调整值 (Adjustment Values)

许多形状支持调整值 (adj)，用于自定义形状的外观：

```xml
<a:prstGeom prst="roundRect">
  <a:avLst>
    <a:gd name="adj" fmla="val 16667"/>  <!-- 圆角半径 -->
  </a:avLst>
</a:prstGeom>
```

**常见调整值：**
- roundRect: adj - 圆角半径
- arrow: adj1, adj2 - 箭头宽度和长度
- triangle: adj - 顶点位置
- trapezoid: adj - 上底宽度

## 🔧 使用示例

### 渲染形状

```typescript
import { ShapeRenderer } from '@ai-space/shared';

const renderer = new ShapeRenderer();
const shape = {
  type: 'shape',
  geometry: { type: 'roundRect', adj: [16667] },
  width: 200,
  height: 100,
  fill: {
    type: 'solid',
    color: { r: 255, g: 0, b: 0 }
  },
  stroke: {
    color: { r: 0, g: 0, b: 0 },
    width: 2
  }
};

const svgElement = renderer.render(shape);
document.body.appendChild(svgElement);
```

### 渲染图表

```typescript
import { ChartRenderer } from '@ai-space/shared';

const renderer = new ChartRenderer();
const chart = {
  type: 'bar',
  series: [
    { name: '系列1', data: [10, 20, 30, 40] },
    { name: '系列2', data: [15, 25, 35, 45] }
  ],
  categories: ['A', 'B', 'C', 'D']
};

const chartElement = renderer.render(chart);
document.body.appendChild(chartElement);
```

### 解析 DrawingML

```typescript
import { DrawingMLParser } from '@ai-space/shared';

const parser = new DrawingMLParser();
const drawing = parser.parse(drawingElement, context);

console.log('形状类型:', drawing.type);
console.log('宽度:', drawing.width);
console.log('高度:', drawing.height);
```

## 📚 相关文档

- [Styles 模块](../styles/README.md) - 样式工具
- [DOCX Drawing](../../docx/src/parser/README.md#drawingparser) - DOCX 中的绘图
- [XLSX Drawing](../../xlsx/src/parser/README.md#drawingparser) - XLSX 中的绘图
- [DrawingML 规范](https://www.ecma-international.org/publications-and-standards/standards/ecma-376/) - Part 1, Section 20
