# @ai-space/shared

> Office 文档解析渲染的共享工具库

## 📝 简介

`@ai-space/shared` 是 `@ai-space/docx` 和 `@ai-space/xlsx` 的核心依赖库，提供了 Office 文档解析和渲染所需的通用功能和工具。它包含了 DrawingML 解析、形状生成、样式处理、数学公式渲染、字体管理等跨平台共享的核心模块。

## ✨ 核心特性

- **DrawingML 支持**：完整的 Office DrawingML 解析和渲染
- **形状库**：100+ 预设形状的 SVG 路径生成
- **样式工具**：颜色、单位、文本、边框等样式处理
- **数学公式**：Office Math (OMML) 解析和渲染
- **字体管理**：Office 字体到 Web 字体的映射和管理
- **ZIP 解析**：高性能的 Office 文档 ZIP 解压
- **XML 处理**：轻量级的 XML 解析工具

## 📦 安装

```bash
# 通常作为 docx 或 xlsx 的依赖自动安装
pnpm add @ai-space/shared
```

## 🏗️ 项目结构

```
packages/shared/
├── src/
│   ├── drawing/         # DrawingML 绘图模块
│   │   ├── parsers/             # DrawingML 解析器
│   │   │   ├── ColorParser.ts           # 颜色解析
│   │   │   ├── FillParser.ts            # 填充解析
│   │   │   ├── EffectParser.ts          # 效果解析
│   │   │   ├── ShapePropertiesParser.ts # 形状属性解析
│   │   │   ├── ShapeStyleParser.ts      # 形状样式解析
│   │   │   ├── TextBodyParser.ts        # 文本体解析
│   │   │   └── CustomGeometryParser.ts  # 自定义几何解析
│   │   ├── renderers/           # 绘图渲染器
│   │   │   ├── ShapeRenderer.ts         # 形状渲染
│   │   │   ├── ImageRenderer.ts         # 图片渲染
│   │   │   ├── ChartRenderer.ts         # 图表渲染
│   │   │   └── types.ts                 # 渲染器类型
│   │   ├── shapes/              # 形状库
│   │   │   ├── BasicShapes.ts           # 基础形状
│   │   │   ├── ArrowShapes.ts           # 箭头形状
│   │   │   ├── FlowchartShapes.ts       # 流程图形状
│   │   │   ├── CalloutShapes.ts         # 标注形状
│   │   │   ├── Stars.ts                 # 星形
│   │   │   ├── MathShapes.ts            # 数学形状
│   │   │   ├── ActionShapes.ts          # 动作按钮
│   │   │   ├── DecorationShapes.ts      # 装饰形状
│   │   │   ├── SpecialShapes.ts         # 特殊形状
│   │   │   ├── Connectors.ts            # 连接线
│   │   │   ├── Rectangles.ts            # 矩形变体
│   │   │   ├── SnipShapes.ts            # 剪切形状
│   │   │   ├── ShapeRegistry.ts         # 形状注册表
│   │   │   ├── GeoUtils.ts              # 几何工具
│   │   │   └── types.ts                 # 形状类型
│   │   ├── DrawingMLParser.ts   # DrawingML 主解析器
│   │   ├── ThemeEnums.ts        # 主题枚举
│   │   ├── PresetGeometries.ts  # 预设几何
│   │   └── types.ts             # DrawingML 类型
│   ├── styles/          # 样式工具模块
│   │   ├── UnitConverter.ts     # 单位转换器
│   │   ├── TextStyles.ts        # 文本样式工具
│   │   ├── AlignmentStyles.ts   # 对齐样式工具
│   │   ├── BorderStyles.ts      # 边框样式工具
│   │   ├── StyleUtils.ts        # 通用样式工具
│   │   ├── constants.ts         # 样式常量
│   │   ├── common.css           # 通用样式
│   │   └── index.ts
│   ├── fonts/           # 字体管理模块
│   │   ├── FontManager.ts       # 字体管理器
│   │   └── index.ts
│   ├── math/            # 数学公式模块
│   │   ├── OMathParser.ts       # Office Math 解析器
│   │   ├── OMathRenderer.ts     # Office Math 渲染器
│   │   ├── types.ts             # 公式类型
│   │   └── index.ts
│   ├── utils/           # 通用工具模块
│   │   ├── ColorUtils.ts        # 颜色工具
│   │   ├── PresetColorMap.ts    # 预设颜色映射
│   │   ├── geometry.ts          # 几何工具
│   │   └── index.ts
│   ├── xml/             # XML 处理模块
│   │   └── XmlParser.ts         # XML 解析器
│   ├── zip/             # ZIP 处理模块
│   │   └── ZipService.ts        # ZIP 服务
│   └── index.ts         # 入口文件
└── README.md
```

## 📖 核心模块

### 1. Drawing 模块

提供 Office DrawingML 的完整支持，包括形状、图片、图表的解析和渲染。

**主要功能：**
- 解析 DrawingML XML 结构
- 生成 SVG 路径
- 渲染形状、图片、图表
- 支持 100+ 预设形状
- 支持自定义几何形状
- 支持渐变、阴影、发光等效果

详见：[Drawing 模块文档](./src/drawing/README.md)

### 2. Styles 模块

提供样式处理的核心工具，包括单位转换、颜色处理、文本样式等。

**主要功能：**
- 单位转换（pt, px, cm, in, emu, twip 等）
- 颜色解析和转换（RGB, HSL, 主题颜色）
- 文本样式应用
- 边框样式处理
- 对齐样式计算

详见：[Styles 模块文档](./src/styles/README.md)

### 3. Fonts 模块

提供 Office 字体到 Web 字体的映射和管理。

**主要功能：**
- Office 字体名称映射
- Web 安全字体回退
- 字体 CSS 类生成
- 字体加载管理

详见：[Fonts 模块文档](./src/fonts/README.md)

### 4. Math 模块

提供 Office Math (OMML) 公式的解析和渲染。

**主要功能：**
- OMML 解析
- 数学公式渲染
- 支持分数、根式、上下标、积分、矩阵等
- 高保真的公式显示

详见：[Math 模块文档](./src/math/README.md)

### 5. Utils 模块

提供通用的工具函数。

**主要功能：**
- 颜色工具（颜色转换、预设颜色）
- 几何工具（点、线、路径计算）

详见：[Utils 模块文档](./src/utils/README.md)

### 6. ZIP 模块

提供 Office 文档的 ZIP 解压功能。

**主要功能：**
- 快速解压 OOXML 文档
- 文件提取
- 基于 `fflate` 的高性能实现

详见：[ZIP 模块文档](./src/zip/README.md)

### 7. XML 模块

提供轻量级的 XML 解析工具。

**主要功能：**
- DOM 解析
- 属性提取
- 命名空间处理

详见：[XML 模块文档](./src/xml/README.md)

## 🎨 使用示例

### 单位转换

```typescript
import { UnitConverter } from '@ai-space/shared';

// EMU 转 像素
const px = UnitConverter.emuToPx(914400); // 64px

// 点 转 像素
const px2 = UnitConverter.ptToPx(12); // 16px

// Twip 转 像素
const px3 = UnitConverter.twipToPx(240); // 16px
```

### 颜色处理

```typescript
import { ColorUtils } from '@ai-space/shared';

// 解析颜色
const rgb = ColorUtils.parseColor('FF0000'); // { r: 255, g: 0, b: 0 }

// 应用主题颜色
const themed = ColorUtils.applyThemeColor(themeColors, 'accent1', 0.5);

// 调整亮度
const lighter = ColorUtils.adjustBrightness('#FF0000', 0.2);
```

### 形状渲染

```typescript
import { ShapeRenderer } from '@ai-space/shared';

const renderer = new ShapeRenderer();
const element = renderer.render({
  type: 'rect',
  geometry: { type: 'roundRect' },
  width: 100,
  height: 50,
  fill: { type: 'solid', color: '#FF0000' },
  stroke: { color: '#000000', width: 1 }
});
```

### 数学公式

```typescript
import { OMathParser, OMathRenderer } from '@ai-space/shared';

const parser = new OMathParser();
const renderer = new OMathRenderer();

// 解析 OMML
const mathObj = parser.parse(ommlElement);

// 渲染为 HTML
const mathElement = renderer.render(mathObj);
```

## 🔧 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建
pnpm run build
```

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
