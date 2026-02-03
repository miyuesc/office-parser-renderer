---
name: 单位转换完整参考
description: OOXML 文档中所有单位（EMU、Twips、Points、DXA、Pica、毫米、厘米、英寸、角度、百分比等）的完整转换参考
trigger: context
---

# 单位转换完整参考

## 📐 单位体系概览

Office 文档使用多种单位体系，理解它们之间的关系对于精确渲染至关重要。

### 单位关系图

```
                    ┌─────────────┐
                    │   英寸 (in)  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ EMU (914400)  │  │ Twips (1440)  │  │ Points (72)   │
└───────────────┘  └───────────────┘  └───────────────┘
        │                  │                  │
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ mm (25.4)     │  │ DXA (= Twips) │  │ Half Pt (2x)  │
│ cm (2.54)     │  │               │  │ 8th Pt (8x)   │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## 🔢 基础单位常量

### 每英寸的单位数量

| 单位 | 每英寸数量 | 说明 |
|------|-----------|------|
| **EMU** | 914,400 | English Metric Unit，DrawingML 基础单位 |
| **Twips** | 1,440 | 1/20 点，WordprocessingML 常用 |
| **DXA** | 1,440 | Twips 的别名 |
| **Points** | 72 | 印刷行业标准单位 |
| **Pica** | 6 | 1 Pica = 12 Points |
| **毫米 (mm)** | 25.4 | 公制长度单位 |
| **厘米 (cm)** | 2.54 | 公制长度单位 |
| **像素 (px)** | 96 (DPI) | 屏幕显示单位 |

### EMU 相关常量

| 描述 | 常量名 | 值 |
|------|--------|-----|
| 每英寸 EMU | `EMU_PER_INCH` | 914,400 |
| 每毫米 EMU | `EMU_PER_MM` | 36,000 |
| 每厘米 EMU | `EMU_PER_CM` | 360,000 |
| 每点 EMU | `EMU_PER_POINT` | 12,700 |
| 每 Twip EMU | `EMU_PER_TWIP` | 635 |

### Twips 相关常量

| 描述 | 常量名 | 值 |
|------|--------|-----|
| 每英寸 Twips | `TWIPS_PER_INCH` | 1,440 |
| 每毫米 Twips | `TWIPS_PER_MM` | ≈56.69 |
| 每厘米 Twips | `TWIPS_PER_CM` | ≈566.93 |
| 每点 Twips | `TWIPS_PER_POINT` | 20 |

### 点相关常量

| 描述 | 常量名 | 值 |
|------|--------|-----|
| 每英寸点数 | `POINTS_PER_INCH` | 72 |
| 点到像素 | `PT_TO_PX` | 1.333... (96/72) |
| 半点到点 | `HALF_POINT_TO_POINT` | 0.5 |
| 八分之一点到点 | `EIGHTH_POINT_TO_POINT` | 0.125 |

### 角度常量

| 描述 | 常量名 | 值 | 说明 |
|------|--------|-----|------|
| OOXML 角度单位 | `OOXML_ANGLE_UNIT` | 60,000 | 1° = 60000 |
| VML 角度单位 | `VML_ANGLE_UNIT` | 65,536 | 1° = 65536 |
| 最大角度值 | `MAX_ANGLE_UNITS` | 21,600,000 | 360° |

### 百分比常量

| 描述 | 常量名 | 值 | 说明 |
|------|--------|-----|------|
| OOXML 百分比基数 | `OOXML_PERCENT_BASE` | 100,000 | 100% = 100000 |
| 千分比基数 | `PERMILLE_BASE` | 1,000 | 100% = 1000 |

### 行距常量

| 描述 | 常量名 | 值 | 说明 |
|------|--------|-----|------|
| 行距单位 | `LINE_SPACING_UNIT` | 240 | 单倍行距 = 240 |

---

## 📊 转换公式速查表

### EMU 转换

```typescript
// EMU → 像素 (96 DPI)
pixels = emu / 914400 * 96;  // 或 emu / 9525

// EMU → 点
points = emu / 12700;

// EMU → Twips
twips = emu / 635;

// EMU → 毫米
mm = emu / 36000;

// EMU → 厘米
cm = emu / 360000;

// EMU → 英寸
inches = emu / 914400;
```

### Twips / DXA 转换

```typescript
// Twips → 像素 (96 DPI)
pixels = twips / 1440 * 96;  // 或 twips / 15

// Twips → 点
points = twips / 20;

// Twips → EMU
emu = twips * 635;

// Twips → 毫米
mm = twips / 56.69;

// Twips → 厘米
cm = twips / 566.93;

// Twips → 英寸
inches = twips / 1440;
```

### 点转换

```typescript
// 点 → 像素 (96 DPI)
pixels = points * 96 / 72;  // 或 points * 1.333

// 点 → Twips
twips = points * 20;

// 点 → EMU
emu = points * 12700;

// 点 → 毫米
mm = points * 25.4 / 72;

// 点 → 英寸
inches = points / 72;
```

### 分数点转换

```typescript
// 半点 → 点 (用于字号 w:sz)
points = halfPoints / 2;

// 八分之一点 → 点 (用于边框 w:szCs)
points = eighthPoints / 8;

// 百分之一点 → 点
points = hundredthPoints / 100;
```

### Pica 转换

```typescript
// Pica → 点
points = picas * 12;

// Pica → 像素 (96 DPI)
pixels = picas * 16;  // 96 / 6

// Pica → 英寸
inches = picas / 6;
```

### 物理单位互转

```typescript
// 毫米 → 像素 (96 DPI)
pixels = mm / 25.4 * 96;

// 厘米 → 像素 (96 DPI)
pixels = cm / 2.54 * 96;

// 英寸 → 像素 (96 DPI)
pixels = inches * 96;

// 毫米 → 厘米
cm = mm / 10;

// 厘米 → 英寸
inches = cm / 2.54;
```

### 角度转换

```typescript
// OOXML 角度 → 度
degrees = ooxmlAngle / 60000;
// 例: 5400000 → 90°

// OOXML 角度 → 弧度
radians = ooxmlAngle / 60000 * Math.PI / 180;

// VML 角度 → 度
degrees = vmlAngle / 65536;

// 度 → 弧度
radians = degrees * Math.PI / 180;
```

### 百分比转换

```typescript
// OOXML 百分比 → 小数 (100% = 100000)
decimal = percent / 100000;
// 例: 50000 → 0.5

// 千分比 → 小数 (100% = 1000)
decimal = permille / 1000;
// 例: 500 → 0.5

// 普通百分比 → 小数 (100% = 100)
decimal = percent / 100;
```

---

## 🛠️ UnitConverter API

项目提供了完整的 `UnitConverter` 类，位于 `packages/shared/src/styles/UnitConverter.ts`。

### EMU 转换方法

```typescript
import { UnitConverter } from '@opr/shared';

// EMU 与像素
UnitConverter.emuToPixels(914400);      // 96
UnitConverter.pixelsToEmu(96);          // 914400

// EMU 与点
UnitConverter.emuToPoints(12700);       // 1
UnitConverter.pointsToEmu(1);           // 12700

// EMU 与 Twips
UnitConverter.emuToTwips(635);          // 1
UnitConverter.twipsToEmu(1);            // 635

// EMU 与物理单位
UnitConverter.emuToMm(36000);           // 1
UnitConverter.mmToEmu(1);               // 36000
UnitConverter.emuToCm(360000);          // 1
UnitConverter.cmToEmu(1);               // 360000
UnitConverter.emuToInches(914400);      // 1
UnitConverter.inchesToEmu(1);           // 914400
```

### Twips / DXA 转换方法

```typescript
// Twips 与像素
UnitConverter.twipsToPixels(1440);      // 96
UnitConverter.pixelsToTwips(96);        // 1440

// Twips 与点
UnitConverter.twipsToPoints(20);        // 1
UnitConverter.pointsToTwips(1);         // 20

// Twips 与物理单位
UnitConverter.twipsToMm(56.69);         // ≈1
UnitConverter.mmToTwips(1);             // ≈57
UnitConverter.twipsToCm(566.93);        // ≈1
UnitConverter.cmToTwips(1);             // ≈567
UnitConverter.twipsToInches(1440);      // 1
UnitConverter.inchesToTwips(1);         // 1440

// DXA (Twips 别名)
UnitConverter.dxaToPixels(1440);        // 96
UnitConverter.pixelsToDxa(96);          // 1440
```

### 点转换方法

```typescript
// 点与像素
UnitConverter.pointsToPixels(72);       // 96
UnitConverter.pixelsToPoints(96);       // 72

// 点与物理单位
UnitConverter.pointsToMm(72);           // 25.4
UnitConverter.mmToPoints(25.4);         // 72
UnitConverter.pointsToCm(72);           // 2.54
UnitConverter.cmToPoints(2.54);         // 72
UnitConverter.pointsToInches(72);       // 1
UnitConverter.inchesToPoints(1);        // 72
```

### 分数点转换方法

```typescript
// 半点 (用于字号)
UnitConverter.halfPointsToPoints(24);   // 12
UnitConverter.pointsToHalfPoints(12);   // 24
UnitConverter.halfPointsToPixels(24);   // 16

// 八分之一点 (用于边框)
UnitConverter.eighthPointsToPoints(8);  // 1
UnitConverter.pointsToEighthPoints(1);  // 8
UnitConverter.eighthPointsToPixels(8);  // 1.333

// 百分之一点
UnitConverter.hundredthPointsToPoints(100); // 1
UnitConverter.pointsToHundredthPoints(1);   // 100
```

### Pica 转换方法

```typescript
UnitConverter.picasToPoints(1);         // 12
UnitConverter.pointsToPicas(12);        // 1
UnitConverter.picasToPixels(1);         // 16
UnitConverter.picasToInches(6);         // 1
```

### 物理单位互转方法

```typescript
// 毫米
UnitConverter.mmToPixels(25.4);         // 96
UnitConverter.pixelsToMm(96);           // 25.4
UnitConverter.mmToCm(10);               // 1
UnitConverter.mmToInches(25.4);         // 1

// 厘米
UnitConverter.cmToPixels(2.54);         // 96
UnitConverter.pixelsToCm(96);           // 2.54
UnitConverter.cmToMm(1);                // 10
UnitConverter.cmToInches(2.54);         // 1

// 英寸
UnitConverter.inchesToPixels(1);        // 96
UnitConverter.pixelsToInches(96);       // 1
UnitConverter.inchesToMm(1);            // 25.4
UnitConverter.inchesToCm(1);            // 2.54
```

### 角度转换方法

```typescript
// OOXML 角度
UnitConverter.ooxmlAngleToDegrees(5400000); // 90
UnitConverter.degreesToOoxmlAngle(90);      // 5400000
UnitConverter.ooxmlAngleToRadians(5400000); // Math.PI / 2

// VML 角度
UnitConverter.vmlAngleToDegrees(5898240);   // 90
UnitConverter.degreesToVmlAngle(90);        // 5898240

// 度与弧度
UnitConverter.degreesToRadians(180);        // Math.PI
UnitConverter.radiansToDegrees(Math.PI);    // 180
```

### 百分比转换方法

```typescript
// OOXML 百分比 (100% = 100000)
UnitConverter.percentToDecimal(50000);      // 0.5
UnitConverter.decimalToPercent(0.5);        // 50000

// 千分比 (100% = 1000)
UnitConverter.permilleToDecimal(500);       // 0.5
UnitConverter.decimalToPermille(0.5);       // 500

// 普通百分比 (100% = 100)
UnitConverter.normalPercentToDecimal(50);   // 0.5
UnitConverter.decimalToNormalPercent(0.5);  // 50
```

### 行距计算

```typescript
// 自动行距 (240 = 单倍)
UnitConverter.calculateLineHeight(360, 'auto');    // '1.5' (1.5倍行距)
UnitConverter.calculateLineHeight(480, 'auto');    // '2' (双倍行距)

// 固定行距 (Twips)
UnitConverter.calculateLineHeight(300, 'exact');   // '20px'

// 最小行距 (Twips)
UnitConverter.calculateLineHeight(300, 'atLeast'); // '20px'
```

### Excel 列宽转换

```typescript
UnitConverter.excelCharWidthToPixels(10);          // 80 (10*7.5+5)
UnitConverter.pixelsToExcelCharWidth(80);          // 10
```

### 通用解析方法

```typescript
// 解析带单位的字符串
UnitConverter.parseToPixels('12pt');     // 16
UnitConverter.parseToPixels('2.54cm');   // 96
UnitConverter.parseToPixels('25.4mm');   // 96
UnitConverter.parseToPixels('1in');      // 96
UnitConverter.parseToPixels('1pc');      // 16 (Pica)
UnitConverter.parseToPixels('2em', 96, 16); // 32

// 限制数值范围
UnitConverter.clamp(150, 0, 100);        // 100
UnitConverter.clamp(-10, 0, 100);        // 0
```

---

## 📝 常见应用场景

### 1. DrawingML 元素定位 (DOCX/XLSX/PPTX)

```xml
<a:xfrm rot="2700000">
  <a:off x="914400" y="457200"/>
  <a:ext cx="2743200" cy="1828800"/>
</a:xfrm>
```

```typescript
const left = UnitConverter.emuToPixels(914400);     // 96px
const top = UnitConverter.emuToPixels(457200);      // 48px
const width = UnitConverter.emuToPixels(2743200);   // 288px
const height = UnitConverter.emuToPixels(1828800);  // 192px
const rotation = UnitConverter.ooxmlAngleToDegrees(2700000); // 45°
```

### 2. DOCX 页面设置

```xml
<w:sectPr>
  <w:pgSz w:w="11906" w:h="16838"/>
  <w:pgMar w:top="1440" w:left="1440"/>
</w:sectPr>
```

```typescript
const pageWidth = UnitConverter.twipsToPixels(11906);  // ≈793px (A4)
const pageHeight = UnitConverter.twipsToPixels(16838); // ≈1122px
const margin = UnitConverter.twipsToPixels(1440);      // 96px (1 inch)
```

### 3. DOCX 字号

```xml
<w:rPr>
  <w:sz w:val="24"/>  <!-- 半点，12pt -->
</w:rPr>
```

```typescript
const fontSize = UnitConverter.halfPointsToPoints(24);   // 12pt
const fontSizePx = UnitConverter.halfPointsToPixels(24); // 16px
```

### 4. DOCX 边框

```xml
<w:bdr w:sz="12"/>  <!-- 八分之一点 -->
```

```typescript
const borderWidth = UnitConverter.eighthPointsToPixels(12); // 2px
```

### 5. 渐变角度

```xml
<a:lin ang="5400000"/>  <!-- 90° -->
```

```typescript
const angle = UnitConverter.ooxmlAngleToDegrees(5400000); // 90
// CSS: linear-gradient(90deg, ...)
```

### 6. 透明度

```xml
<a:alpha val="50000"/>  <!-- 50% -->
```

```typescript
const opacity = UnitConverter.percentToDecimal(50000); // 0.5
// CSS: opacity: 0.5
```

---

## ⚠️ 常见陷阱

### 1. 混淆 OOXML 百分比格式

```xml
<!-- 100000 = 100%，不是 100 = 100% -->
<a:tint val="50000"/>  <!-- 这是 50%，不是 500% -->
```

### 2. 字号单位是半点

```xml
<!-- w:sz 的值是半点，不是点 -->
<w:sz w:val="24"/>  <!-- 这是 12pt，不是 24pt -->
```

### 3. 角度单位差异

```typescript
// OOXML: 1° = 60000
// VML: 1° = 65536 (某些属性)
// 不要混淆！
```

### 4. DXA ≠ OOXML 特有

```
DXA 只是 Twips 的别名，没有额外的转换系数
```

### 5. 注意 DPI 依赖

```typescript
// 转换到像素时要考虑 DPI
// 默认使用 96 DPI，高分屏可能需要调整
UnitConverter.emuToPixels(914400, 144); // 144 DPI 结果不同
```

---

## 📁 相关文件

- 常量定义: `packages/shared/src/styles/constants.ts`
- 转换器: `packages/shared/src/styles/UnitConverter.ts`
- 导出入口: `packages/shared/src/styles/index.ts`
