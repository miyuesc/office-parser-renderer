# Styles 模块

> Office 文档样式处理工具模块

## 📝 简介

Styles 模块提供了 Office 文档样式处理的核心工具，包括单位转换、颜色处理、文本样式、对齐样式、边框样式等。这些工具被 DOCX 和 XLSX 渲染器广泛使用，用于将 Office 样式转换为 CSS 样式。

## ✨ 核心特性

- **全面的单位转换**：支持 pt, px, cm, in, mm, emu, twip, dxa 等多种单位
- **颜色处理**：支持 RGB、HSL、主题颜色、颜色变换
- **文本样式**：字体、大小、颜色、粗体、斜体等
- **对齐样式**：水平对齐、垂直对齐、文本方向
- **边框样式**：边框样式、宽度、颜色
- **样式工具**：通用的样式应用和计算工具

## 🏗️ 模块结构

```
styles/
├── UnitConverter.ts        # 单位转换器
├── TextStyles.ts           # 文本样式工具
├── AlignmentStyles.ts      # 对齐样式工具
├── BorderStyles.ts         # 边框样式工具
├── StyleUtils.ts           # 通用样式工具
├── constants.ts            # 样式常量
├── common.css              # 通用样式
└── index.ts                # 导出文件
```

## 📖 核心工具

### UnitConverter

单位转换器，提供各种 Office 单位与像素之间的转换。

**支持的单位：**

| 单位 | 全称 | 说明 | 示例 |
|------|------|------|------|
| px | Pixels | 像素 | 屏幕基本单位 |
| pt | Points | 点 | 字体常用单位，1pt = 1/72 inch |
| cm | Centimeters | 厘米 | 公制单位 |
| mm | Millimeters | 毫米 | 公制单位 |
| in | Inches | 英寸 | 英制单位，1in = 2.54cm |
| emu | English Metric Units | 英制公制单位 | DrawingML 基本单位 |
| twip | Twentieth of a Point | 1/20 点 | Word 常用单位 |
| dxa | Twentieth of a Point | 1/20 点 | 等同于 twip |
| hps | Half Points | 半点 | 字体大小单位，1hps = 0.5pt |

**转换公式：**

```typescript
// 基础转换比率（以 96 DPI 为基准）
const DPI = 96;
const PT_PER_INCH = 72;
const CM_PER_INCH = 2.54;
const MM_PER_INCH = 25.4;
const EMU_PER_INCH = 914400;
const TWIP_PER_INCH = 1440;

// 转换为像素
ptToPx(pt) = pt * DPI / PT_PER_INCH
cmToPx(cm) = cm * DPI / CM_PER_INCH
mmToPx(mm) = mm * DPI / MM_PER_INCH  
inToPx(inch) = inch * DPI
emuToPx(emu) = emu * DPI / EMU_PER_INCH
twipToPx(twip) = twip * DPI / TWIP_PER_INCH
```

**关键方法：**

```typescript
class UnitConverter {
  // 点 (pt) 转换
  static ptToPx(pt: number): number;
  static pxToPt(px: number): number;
  
  // 厘米 (cm) 转换
  static cmToPx(cm: number): number;
  static pxToCm(px: number): number;
  
  // 毫米 (mm) 转换
  static mmToPx(mm: number): number;
  static pxToMm(px: number): number;
  
  // 英寸 (in) 转换
  static inToPx(inch: number): number;
  static pxToIn(px: number): number;
  
  // EMU 转换
  static emuToPx(emu: number): number;
  static pxToEmu(px: number): number;
  
  // Twip/DXA 转换
  static twipToPx(twip: number): number;
  static pxToTwip(px: number): number;
  static dxaToPx(dxa: number): number;
  
  // Half Points 转换
  static hpsToPx(hps: number): number;
  
  // 通用转换
  static convert(value: number, from: Unit, to: Unit): number;
}
```

**使用示例：**

```typescript
import { UnitConverter } from '@ai-space/shared';

// 点转像素
const px1 = UnitConverter.ptToPx(12);  // 16px (12pt)

// EMU 转像素
const px2 = UnitConverter.emuToPx(914400);  // 64px (1 inch)

// Twip 转像素
const px3 = UnitConverter.twipToPx(240);  // 16px (12pt)

// 通用转换
const cm = UnitConverter.convert(96, 'px', 'cm');  // 2.54cm (1 inch)
```

### TextStyles

文本样式工具，提供文本相关的样式应用。

**功能：**
- 字体样式应用
- 字号转换
- 颜色应用
- 文本装饰（粗体、斜体、下划线、删除线）
- 上下标
- 高亮

**关键方法：**

```typescript
class TextStyles {
  /**
   * 应用字体样式
   */
  static applyFont(element: HTMLElement, fontName: string): void;
  
  /**
   * 应用字号
   * @param size - 字号（以半点为单位，hps）
   */
  static applyFontSize(element: HTMLElement, size: number): void;
  
  /**
   * 应用文本颜色
   */
  static applyColor(element: HTMLElement, color: string): void;
  
  /**
   * 应用文本装饰
   */
  static applyBold(element: HTMLElement): void;
  static applyItalic(element: HTMLElement): void;
  static applyUnderline(element: HTMLElement, style: UnderlineStyle): void;
  static applyStrikethrough(element: HTMLElement): void;
  
  /**
   * 应用上下标
   */
  static applyVerticalAlign(element: HTMLElement, align: 'superscript' | 'subscript'): void;
  
  /**
   * 应用高亮
   */
  static applyHighlight(element: HTMLElement, color: string): void;
}
```

**下划线样式：**
- single - 单下划线
- double - 双下划线
- thick - 粗下划线
- dotted - 点状下划线
- dashed - 虚线下划线
- wave - 波浪线

**使用示例：**

```typescript
import { TextStyles } from '@ai-space/shared';

const span = document.createElement('span');
span.textContent = 'Hello World';

// 应用字体和字号
TextStyles.applyFont(span, 'Arial');
TextStyles.applyFontSize(span, 24);  // 12pt (24 hps)

// 应用颜色和装饰
TextStyles.applyColor(span, '#FF0000');
TextStyles.applyBold(span);
TextStyles.applyItalic(span);
TextStyles.applyUnderline(span, 'single');
```

### AlignmentStyles

对齐样式工具，提供对齐相关的样式应用。

**功能：**
- 水平对齐
- 垂直对齐
- 文本方向
- 缩进

**关键方法：**

```typescript
class AlignmentStyles {
  /**
   * 应用水平对齐
   */
  static applyHorizontalAlign(
    element: HTMLElement, 
    align: 'left' | 'center' | 'right' | 'justify'
  ): void;
  
  /**
   * 应用垂直对齐
   */
  static applyVerticalAlign(
    element: HTMLElement,
    align: 'top' | 'middle' | 'bottom'
  ): void;
  
  /**
   * 应用文本方向
   */
  static applyTextDirection(
    element: HTMLElement,
    direction: 'ltr' | 'rtl'
  ): void;
  
  /**
   * 应用缩进
   * @param indent - 缩进值（twip）
   */
  static applyIndent(element: HTMLElement, indent: number): void;
  
  /**
   * 应用首行缩进
   */
  static applyFirstLineIndent(element: HTMLElement, indent: number): void;
}
```

**使用示例：**

```typescript
import { AlignmentStyles } from '@ai-space/shared';

const p = document.createElement('p');
p.textContent = '这是一段文本';

// 应用居中对齐
AlignmentStyles.applyHorizontalAlign(p, 'center');

// 应用缩进（720 twip = 0.5 inch）
AlignmentStyles.applyIndent(p, 720);
```

### BorderStyles

边框样式工具，提供边框相关的样式应用。

**功能：**
- 边框样式
- 边框宽度
- 边框颜色
- 边框位置（上、下、左、右）

**关键方法：**

```typescript
class BorderStyles {
  /**
   * 应用边框
   */
  static applyBorder(
    element: HTMLElement,
    position: 'top' | 'right' | 'bottom' | 'left' | 'all',
    style: BorderStyle,
    width: number,
    color: string
  ): void;
  
  /**
   * 应用边框样式
   */
  static getBorderStyleCSS(style: BorderStyle): string;
  
  /**
   * 应用边框宽度
   * @param width - 宽度（eighths of a point, 1/8 pt）
   */
  static getBorderWidthCSS(width: number): string;
}
```

**边框样式：**
- single - 单线
- double - 双线
- dotted - 点状线
- dashed - 虚线
- dashDot - 点划线
- dashDotDot - 双点划线
- triple - 三线
- thick - 粗线
- ...

**使用示例：**

```typescript
import { BorderStyles } from '@ai-space/shared';

const div = document.createElement('div');

// 应用所有边框
BorderStyles.applyBorder(div, 'all', 'single', 8, '#000000');

// 应用上边框
BorderStyles.applyBorder(div, 'top', 'double', 16, '#FF0000');
```

### StyleUtils

通用样式工具，提供常用的样式应用方法。

**功能：**
- 设置绝对定位
- 设置尺寸
- 设置 Flex 布局
- 设置 Grid 布局
- 设置变换
- 设置过渡
- 设置阴影

**关键方法：**

```typescript
class StyleUtils {
  /**
   * 设置绝对定位
   */
  static setAbsolutePosition(
    element: HTMLElement,
    left: number,
    top: number
  ): void;
  
  /**
   * 设置尺寸
   */
  static setSize(
    element: HTMLElement,
    width: number,
    height: number
  ): void;
  
  /**
   * 设置 Flex 布局
   */
  static setFlex(
    element: HTMLElement,
    direction: 'row' | 'column',
    justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between',
    align?: 'flex-start' | 'center' | 'flex-end' | 'stretch'
  ): void;
  
  /**
   * 设置变换
   */
  static setTransform(
    element: HTMLElement,
    transforms: {
      rotate?: number;
      scale?: number | { x: number; y: number };
      translate?: { x: number; y: number };
    }
  ): void;
  
  /**
   * 设置阴影
   */
  static setBoxShadow(
    element: HTMLElement,
    offsetX: number,
    offsetY: number,
    blur: number,
    color: string
  ): void;
}
```

**使用示例：**

```typescript
import { StyleUtils } from '@ai-space/shared';

const div = document.createElement('div');

// 设置绝对定位和尺寸
StyleUtils.setAbsolutePosition(div, 100, 50);
StyleUtils.setSize(div, 200, 100);

// 设置 Flex 布局
StyleUtils.setFlex(div, 'row', 'center', 'center');

// 设置变换
StyleUtils.setTransform(div, {
  rotate: 45,
  scale: 1.5,
  translate: { x: 10, y: 20 }
});

// 设置阴影
StyleUtils.setBoxShadow(div, 2, 2, 4, 'rgba(0,0,0,0.3)');
```

## 📊 常量定义

### 纸张大小 (constants.ts)

```typescript
export const PAGE_SIZES = {
  A4: { width: 210, height: 297 },      // mm
  A5: { width: 148, height: 210 },
  A3: { width: 297, height: 420 },
  Letter: { width: 8.5, height: 11 },   // inch
  Legal: { width: 8.5, height: 14 }
};
```

### 默认样式

```typescript
export const DEFAULT_FONT_SIZE = 11;  // pt
export const DEFAULT_FONT_NAME = 'Calibri';
export const DEFAULT_LINE_HEIGHT = 1.15;
export const DEFAULT_PARAGRAPH_SPACING = 0;  // pt
```

### DPI 设置

```typescript
export const DPI = 96;  // 默认 DPI
```

## 🎨 通用样式 (common.css)

提供跨项目共享的基础 CSS 样式：

```css
/* 通用容器样式 */
.office-container {
  position: relative;
  overflow: auto;
  font-family: 'Calibri', sans-serif;
  font-size: 11pt;
  line-height: 1.15;
}

/* 绝对定位填充 */
.office-abs-fill {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

/* SVG 图层 */
.office-svg-layer {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
}

/* ... */
```

## 🔧 完整示例

```typescript
import {
  UnitConverter,
  TextStyles,
  AlignmentStyles,
  BorderStyles,
  StyleUtils
} from '@ai-space/shared';

// 创建一个带样式的段落
const p = document.createElement('p');
p.textContent = 'Hello, Office!';

// 应用文本样式
TextStyles.applyFont(p, 'Arial');
TextStyles.applyFontSize(p, 24);  // 12pt
TextStyles.applyColor(p, '#336699');
TextStyles.applyBold(p);

// 应用对齐和缩进
AlignmentStyles.applyHorizontalAlign(p, 'justify');
AlignmentStyles.applyIndent(p, UnitConverter.cmToPx(2));

// 应用边框
BorderStyles.applyBorder(p, 'bottom', 'single', 8, '#CCCCCC');

// 应用布局
StyleUtils.setSize(p, UnitConverter.cmToPx(16), UnitConverter.cmToPx(1));
p.style.padding = `${UnitConverter.ptToPx(6)}px`;

// 应用阴影
StyleUtils.setBoxShadow(p, 2, 2, 4, 'rgba(0,0,0,0.1)');

document.body.appendChild(p);
```

## 📚 相关文档

- [Drawing 模块](../drawing/README.md) - 绘图相关
- [DOCX Renderer](../../docx/src/renderer/README.md) - DOCX 渲染器
- [XLSX Renderer](../../xlsx/src/renderer/README.md) - XLSX 渲染器
