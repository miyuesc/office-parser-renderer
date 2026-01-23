---
name: 颜色处理参考
description: OOXML 颜色格式、主题颜色解析和色调调整的参考
trigger: context
---

# 颜色处理参考

## 🎨 颜色格式

### 1. RGB 十六进制

```xml
<a:srgbClr val="FF0000"/>  <!-- 红色 -->
<w:color w:val="0000FF"/>  <!-- 蓝色 -->
```

### 2. 主题颜色

```xml
<a:schemeClr val="accent1"/>  <!-- 主题强调色1 -->
```

**主题颜色名称**:
| 名称 | 说明 | 默认值 |
|------|------|--------|
| `dk1` | 深色1 | #000000 |
| `lt1` | 浅色1 | #FFFFFF |
| `dk2` | 深色2 | #44546A |
| `lt2` | 浅色2 | #E7E6E6 |
| `accent1-6` | 强调色 | 见下方 |
| `hlink` | 超链接 | #0563C1 |
| `folHlink` | 已访问链接 | #954F72 |

**默认强调色**:
- accent1: #4472C4
- accent2: #ED7D31
- accent3: #A5A5A5
- accent4: #FFC000
- accent5: #5B9BD5
- accent6: #70AD47

### 3. 系统颜色

```xml
<a:sysClr val="windowText"/>
```

## 🔄 颜色调整

### Tint/Shade (色调/阴影)

```xml
<a:schemeClr val="accent1">
  <a:tint val="50000"/>   <!-- 变亮 50% -->
</a:schemeClr>

<a:srgbClr val="FF0000">
  <a:shade val="75000"/>  <!-- 变暗 25% -->
</a:srgbClr>
```

**计算公式**:
```typescript
// Tint (变亮): L' = L * (1 - tint) + tint
// Shade (变暗): L' = L * shade
```

### 饱和度/亮度调整

```xml
<a:satMod val="120000"/>  <!-- 饱和度 120% -->
<a:lumMod val="80000"/>   <!-- 亮度 80% -->
<a:lumOff val="20000"/>   <!-- 亮度偏移 +20% -->
```

### Alpha 透明度

```xml
<a:alpha val="50000"/>    <!-- 50% 透明 -->
```

## 🛠️ 使用 ColorUtils

```typescript
import { ColorUtils, resolveThemeColor } from '@ai-space/shared';

// Hex → RGB
const rgb = ColorUtils.hexToRgb('#FF0000');
// { r: 255, g: 0, b: 0 }

// RGB → Hex
const hex = ColorUtils.rgbToHex(255, 0, 0);
// '#ff0000'

// 应用 Tint
const lighter = ColorUtils.applyTint('#FF0000', 0.5);
// 变亮后的颜色

// 解析主题颜色
const color = resolveThemeColor('accent1', themeColors);
// '#4472C4'
```

## 📍 相关文件

- 颜色工具: `packages/shared/src/utils/ColorUtils.ts`
- 颜色解析器: `packages/shared/src/drawing/parsers/ColorParser.ts`
