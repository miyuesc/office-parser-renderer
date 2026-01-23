---
name: VML 渲染参考
description: VML 元素的解析和渲染参考，用于处理 DOCX 中的旧式图形
trigger: context
---

# VML 渲染参考

## 📚 VML 概述

**VML (Vector Markup Language)** 用于 DOCX 中的旧式图形：封面背景、文本框、水印等。

## 🏷️ 命名空间

```xml
xmlns:v="urn:schemas-microsoft-com:vml"
xmlns:o="urn:schemas-microsoft-com:office:office"
```

## 📐 核心元素

### 基本形状

```xml
<v:shape type="#_x0000_t202" 
  style="position:absolute;left:0;top:0;width:100pt;height:50pt;z-index:251659264"
  fillcolor="#FF0000" stroked="t" strokecolor="#000000"/>

<v:rect style="width:595pt;height:842pt" fillcolor="#FFF2CC" stroked="f"/>
<v:oval style="width:100pt;height:50pt" fillcolor="blue"/>
<v:line from="0,0" to="100pt,50pt" strokecolor="black"/>
```

## 🎨 样式属性

| 属性 | 说明 | 示例 |
|------|------|------|
| `position` | 定位 | `absolute` |
| `left`, `top` | 位置 | `28.35pt` |
| `width`, `height` | 尺寸 | `538.6pt` |
| `margin-left/top` | 偏移 | `-10pt` |
| `z-index` | 层级 | `-251658240` |
| `rotation` | 旋转 | `45` |
| `flip` | 翻转 | `x`, `y` |

### 定位相关

| 属性 | 说明 |
|------|------|
| `mso-position-horizontal-relative` | `page`, `margin`, `column` |
| `mso-position-vertical-relative` | `page`, `margin`, `line` |

## 🔧 尺寸转换

```typescript
function vmlSizeToPixels(value: string): number {
  const num = parseFloat(value);
  if (value.endsWith('pt')) return num * 1.3333;
  if (value.endsWith('in')) return num * 96;
  if (value.endsWith('cm')) return num * 37.795;
  return num * 1.3333; // 默认 pt
}
```

## 🎯 子元素

```xml
<!-- 填充 -->
<v:fill type="solid" color="#FF0000" opacity="0.5"/>

<!-- 边框 -->
<v:stroke color="#000000" weight="2pt" dashstyle="dash"/>

<!-- 阴影 -->
<v:shadow on="t" color="#808080" offset="3pt,3pt"/>

<!-- 文本框 -->
<v:textbox><w:txbxContent>...</w:txbxContent></v:textbox>

<!-- 图片 -->
<v:imagedata r:id="rId1"/>
```

## ⚠️ 注意事项

1. **Z-Index**: 负值表示背景层
2. **负边距**: 需正确解析，不能 clamp 到 0
3. **坐标系**: 注意 `relativeTo` 参考对象
4. **封面页**: z-index < 0 时隐藏页眉页脚

## 📍 相关文件

- 解析器: `packages/docx/src/parser/VmlParser.ts`
- 渲染器: `packages/docx/src/renderer/DrawingRenderer.ts`
