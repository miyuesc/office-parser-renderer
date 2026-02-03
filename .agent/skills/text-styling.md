---
name: 文本样式完整参考
description: OOXML 文本格式化的完整参考，包括字体、字号、装饰、段落格式、行距、缩进等
trigger: context
---

# 文本样式完整参考

## 📝 文本结构概览

在 OOXML 中，文本由以下层级组成：

```
文档 (w:document)
  └── 段落 (w:p)
        ├── 段落属性 (w:pPr)    ← 段落级格式
        └── 运行 (w:r)
              ├── 运行属性 (w:rPr)  ← 字符级格式
              └── 文本 (w:t)
```

---

## 🔤 字体设置 (w:rFonts)

### 字体属性

OOXML 支持为不同语言脚本指定不同字体：

```xml
<w:rFonts 
  w:ascii="Arial"           <!-- ASCII 字符 (拉丁字母) -->
  w:eastAsia="微软雅黑"      <!-- 东亚字符 (中日韩) -->
  w:hAnsi="Arial"           <!-- 高 ANSI 字符 -->
  w:cs="Times New Roman"    <!-- 复杂脚本 (阿拉伯、希伯来) -->
  w:hint="eastAsia"         <!-- 首选脚本 -->
/>
```

### 主题字体引用

```xml
<w:rFonts 
  w:asciiTheme="minorHAnsi"    <!-- ASCII 主题字体 -->
  w:eastAsiaTheme="minorEastAsia"  <!-- 东亚主题字体 -->
  w:hAnsiTheme="minorHAnsi"    <!-- 高 ANSI 主题字体 -->
  w:csTheme="minorBidi"        <!-- 复杂脚本主题字体 -->
/>
```

### 主题字体值

| 值 | 说明 |
|----|------|
| `majorHAnsi` | 标题字体 (拉丁) |
| `minorHAnsi` | 正文字体 (拉丁) |
| `majorEastAsia` | 标题字体 (东亚) |
| `minorEastAsia` | 正文字体 (东亚) |
| `majorBidi` | 标题字体 (双向) |
| `minorBidi` | 正文字体 (双向) |

### hint 属性

| 值 | 说明 |
|----|------|
| `default` | 默认脚本 |
| `eastAsia` | 优先东亚字体 |
| `cs` | 优先复杂脚本字体 |

---

## 📏 字号设置 (w:sz)

### 字号属性

```xml
<w:sz w:val="24"/>    <!-- 字号，单位：半点 (12pt) -->
<w:szCs w:val="24"/>  <!-- 复杂脚本字号 -->
```

### 单位转换

```typescript
// 半点 → 点
const points = halfPoints / 2;
// 例: val="24" → 12pt

// 半点 → 像素 (96 DPI)
const pixels = halfPoints / 2 * 96 / 72;
// 例: val="24" → 16px
```

### 常用字号对照

| w:sz 值 | 点数 | 中文称呼 |
|---------|------|----------|
| 10 | 5pt | 八号 |
| 11 | 5.5pt | 七号 |
| 12 | 6pt | 小六号 |
| 13 | 6.5pt | 六号 |
| 15 | 7.5pt | 小五号 |
| 18 | 9pt | 五号 |
| 21 | 10.5pt | 小四号 |
| 24 | 12pt | 四号 |
| 26 | 13pt | 小三号 |
| 30 | 15pt | 三号 |
| 32 | 16pt | 小二号 |
| 36 | 18pt | 二号 |
| 44 | 22pt | 小一号 |
| 52 | 26pt | 一号 |
| 72 | 36pt | 小初号 |
| 84 | 42pt | 初号 |

---

## 🎨 文字颜色 (w:color)

```xml
<w:color w:val="FF0000"/>           <!-- RGB 十六进制 -->
<w:color w:val="auto"/>             <!-- 自动颜色 (黑色) -->
<w:color w:themeColor="accent1"/>   <!-- 主题颜色 -->
<w:color w:themeColor="accent1" w:themeTint="99"/>  <!-- 主题色 + 色调 -->
<w:color w:themeColor="accent1" w:themeShade="BF"/> <!-- 主题色 + 阴影 -->
```

---

## ✨ 文字装饰

### 粗体 (w:b)

```xml
<w:b/>                <!-- 粗体 -->
<w:b w:val="1"/>      <!-- 粗体 (显式) -->
<w:b w:val="0"/>      <!-- 取消粗体 -->
<w:bCs/>              <!-- 复杂脚本粗体 -->
```

### 斜体 (w:i)

```xml
<w:i/>                <!-- 斜体 -->
<w:i w:val="1"/>      <!-- 斜体 (显式) -->
<w:iCs/>              <!-- 复杂脚本斜体 -->
```

### 下划线 (w:u)

```xml
<w:u w:val="single"/>                 <!-- 单下划线 -->
<w:u w:val="double"/>                 <!-- 双下划线 -->
<w:u w:val="single" w:color="FF0000"/> <!-- 带颜色下划线 -->
```

#### 下划线类型 (w:val)

| 值 | 说明 | CSS |
|----|------|-----|
| `none` | 无 | `none` |
| `single` | 单线 | `underline` |
| `words` | 仅单词 | `underline` |
| `double` | 双线 | `underline` |
| `thick` | 粗线 | `underline` |
| `dotted` | 点线 | `underline dotted` |
| `dottedHeavy` | 粗点线 | `underline dotted` |
| `dash` | 短划线 | `underline dashed` |
| `dashedHeavy` | 粗短划线 | `underline dashed` |
| `dashLong` | 长划线 | `underline dashed` |
| `dashLongHeavy` | 粗长划线 | `underline dashed` |
| `dotDash` | 点划线 | `underline dashed` |
| `dashDotHeavy` | 粗点划线 | `underline dashed` |
| `dotDotDash` | 双点划线 | `underline dashed` |
| `dashDotDotHeavy` | 粗双点划线 | `underline dashed` |
| `wave` | 波浪线 | `underline wavy` |
| `wavyHeavy` | 粗波浪线 | `underline wavy` |
| `wavyDouble` | 双波浪线 | `underline wavy` |

### 删除线 (w:strike / w:dstrike)

```xml
<w:strike/>           <!-- 单删除线 -->
<w:dstrike/>          <!-- 双删除线 -->
```

### 着重号 (w:em)

```xml
<w:em w:val="dot"/>       <!-- 着重点 -->
<w:em w:val="comma"/>     <!-- 着重逗号 -->
<w:em w:val="circle"/>    <!-- 着重圈 -->
<w:em w:val="underDot"/>  <!-- 下着重点 -->
```

---

## 📐 上标与下标 (w:vertAlign)

```xml
<w:vertAlign w:val="superscript"/>  <!-- 上标 -->
<w:vertAlign w:val="subscript"/>    <!-- 下标 -->
<w:vertAlign w:val="baseline"/>     <!-- 基线 (取消) -->
```

### CSS 对应

```css
/* 上标 */
vertical-align: super;
font-size: 0.8em;

/* 下标 */
vertical-align: sub;
font-size: 0.8em;
```

---

## 🎭 文字效果

### 阴影 (w:shadow)

```xml
<w:shadow/>           <!-- 文字阴影 -->
```

### 浮雕 (w:emboss)

```xml
<w:emboss/>           <!-- 浮雕效果 -->
```

### 印记/阴文 (w:imprint)

```xml
<w:imprint/>          <!-- 印记效果 -->
```

### 轮廓 (w:outline)

```xml
<w:outline/>          <!-- 轮廓效果 -->
```

### 隐藏文字 (w:vanish)

```xml
<w:vanish/>           <!-- 隐藏文字 -->
```

### 小型大写字母 (w:smallCaps)

```xml
<w:smallCaps/>        <!-- 小型大写 -->
```

### 全大写 (w:caps)

```xml
<w:caps/>             <!-- 全部大写 -->
```

---

## 🖍️ 高亮与底纹

### 高亮 (w:highlight)

```xml
<w:highlight w:val="yellow"/>   <!-- 黄色高亮 -->
<w:highlight w:val="green"/>    <!-- 绿色高亮 -->
```

#### 高亮颜色值

| 值 | 颜色 | 十六进制 |
|----|------|----------|
| `yellow` | 黄色 | #FFFF00 |
| `green` | 绿色 | #00FF00 |
| `cyan` | 青色 | #00FFFF |
| `magenta` | 品红 | #FF00FF |
| `blue` | 蓝色 | #0000FF |
| `red` | 红色 | #FF0000 |
| `darkBlue` | 深蓝 | #000080 |
| `darkCyan` | 深青 | #008080 |
| `darkGreen` | 深绿 | #008000 |
| `darkMagenta` | 深品红 | #800080 |
| `darkRed` | 深红 | #800000 |
| `darkYellow` | 深黄 | #808000 |
| `darkGray` | 深灰 | #808080 |
| `lightGray` | 浅灰 | #C0C0C0 |
| `black` | 黑色 | #000000 |
| `white` | 白色 | #FFFFFF |

### 底纹 (w:shd)

```xml
<w:shd w:val="clear" w:fill="FFFF00"/>           <!-- 纯色背景 -->
<w:shd w:val="pct25" w:fill="000000" w:color="FFFFFF"/>  <!-- 25% 图案 -->
<w:shd w:val="clear" w:themeFill="accent1"/>     <!-- 主题填充 -->
```

---

## 📊 字距与间距

### 字符间距 (w:spacing)

```xml
<w:spacing w:val="20"/>   <!-- 字间距，单位：Twips (1pt) -->
<w:spacing w:val="-10"/>  <!-- 紧缩 -->
```

### 字距调整 (w:kern)

```xml
<w:kern w:val="24"/>      <!-- 字距调整阈值，半点 (12pt) -->
```

### 字符缩放 (w:w)

```xml
<w:w w:val="150"/>        <!-- 字符宽度 150% -->
<w:w w:val="50"/>         <!-- 字符宽度 50% (压缩) -->
```

### 位置偏移 (w:position)

```xml
<w:position w:val="6"/>   <!-- 上移 6 半点 (3pt) -->
<w:position w:val="-6"/>  <!-- 下移 6 半点 -->
```

---

## 📄 段落属性 (w:pPr)

### 对齐方式 (w:jc)

```xml
<w:jc w:val="left"/>        <!-- 左对齐 -->
<w:jc w:val="center"/>      <!-- 居中 -->
<w:jc w:val="right"/>       <!-- 右对齐 -->
<w:jc w:val="both"/>        <!-- 两端对齐 -->
<w:jc w:val="distribute"/>  <!-- 分散对齐 -->
```

### 缩进 (w:ind)

```xml
<w:ind 
  w:left="720"           <!-- 左缩进，Twips (0.5 inch) -->
  w:right="720"          <!-- 右缩进 -->
  w:firstLine="360"      <!-- 首行缩进 -->
  w:hanging="360"        <!-- 悬挂缩进 -->
  w:leftChars="100"      <!-- 左缩进，字符数 -->
  w:rightChars="100"     <!-- 右缩进，字符数 -->
  w:firstLineChars="200" <!-- 首行缩进，字符数 (2字符) -->
/>
```

#### 单位说明

- **Twips**: 1 inch = 1440 twips, 1 pt = 20 twips
- **字符数 (chars)**: 以 100 为单位 (100 = 1个字符宽度)

### 间距 (w:spacing)

```xml
<w:spacing 
  w:before="240"         <!-- 段前间距，Twips (12pt) -->
  w:after="200"          <!-- 段后间距，Twips (10pt) -->
  w:line="360"           <!-- 行距值 -->
  w:lineRule="auto"      <!-- 行距规则 -->
  w:beforeLines="100"    <!-- 段前，行数 (100 = 1行) -->
  w:afterLines="100"     <!-- 段后，行数 -->
/>
```

#### 行距规则 (w:lineRule)

| 值 | 说明 | line 值含义 |
|----|------|-------------|
| `auto` | 倍数行距 | 240 = 单倍，360 = 1.5倍，480 = 双倍 |
| `exact` | 固定值 | Twips 值 |
| `atLeast` | 最小值 | Twips 值 |

#### 常用行距对照

| line 值 | 倍数 | 说明 |
|---------|------|------|
| 240 | 1.0 | 单倍行距 |
| 276 | 1.15 | Office 默认 |
| 300 | 1.25 | |
| 360 | 1.5 | 1.5 倍行距 |
| 480 | 2.0 | 双倍行距 |
| 600 | 2.5 | |
| 720 | 3.0 | 三倍行距 |

---

## 📑 分页与换行控制

### 换行符 (w:br)

```xml
<w:br/>                     <!-- 普通换行 -->
<w:br w:type="page"/>       <!-- 分页符 -->
<w:br w:type="column"/>     <!-- 分栏符 -->
<w:br w:type="textWrapping" w:clear="all"/>  <!-- 换行并清除浮动 -->
```

### 段落换行控制

```xml
<w:keepNext/>               <!-- 与下段同页 -->
<w:keepLines/>              <!-- 段中不分页 -->
<w:pageBreakBefore/>        <!-- 段前分页 -->
<w:widowControl/>           <!-- 孤行控制 -->
```

---

## 🏷️ 制表位 (w:tabs)

```xml
<w:tabs>
  <w:tab w:val="left" w:pos="1440"/>      <!-- 左对齐，1 inch -->
  <w:tab w:val="center" w:pos="4320"/>    <!-- 居中，3 inch -->
  <w:tab w:val="right" w:pos="8640"/>     <!-- 右对齐，6 inch -->
  <w:tab w:val="decimal" w:pos="5760"/>   <!-- 小数点对齐 -->
  <w:tab w:val="clear" w:pos="720"/>      <!-- 清除制表位 -->
</w:tabs>
```

### 制表位类型 (w:val)

| 值 | 说明 |
|----|------|
| `left` | 左对齐 |
| `center` | 居中 |
| `right` | 右对齐 |
| `decimal` | 小数点对齐 |
| `bar` | 竖线 |
| `clear` | 清除 |

### 制表位前导符 (w:leader)

| 值 | 说明 |
|----|------|
| `none` | 无 |
| `dot` | 点线 ...... |
| `hyphen` | 连字符 ------ |
| `underscore` | 下划线 ______ |
| `heavy` | 粗线 |
| `middleDot` | 中点 ······ |

---

## 🎨 字体管理器 (FontManager)

项目提供了 `FontManager` 类来处理 Office 字体到 Web 字体的映射，
位于 `packages/shared/src/fonts/FontManager.ts`。

### 使用方法

```typescript
import { FontManager } from '@opr/shared';

// 获取 CSS font-family
const family = FontManager.getFontFamily('微软雅黑');
// 返回: '-apple-system, BlinkMacSystemFont, "PingFang SC", ...'

// 获取 CSS 类名
const className = FontManager.getFontClassName('微软雅黑');
// 返回: 'font-microsoft-yahei'

// 根据字体属性获取 font-family
const family = FontManager.getFontFamilyFromProps({
  ascii: 'Arial',
  eastAsia: '微软雅黑'
});

// 注入字体样式到文档
FontManager.injectFontStyles();

// 获取默认字体
const defaultFont = FontManager.getDefaultFontFamily();
```

### 已定义的字体映射

项目在 `packages/shared/src/fonts/index.ts` 中定义了以下字体映射：

| Office 字体名 | CSS 字体名 | 类型 |
|---------------|------------|------|
| 微软雅黑 | Microsoft YaHei | Sans-Serif |
| 等线 | DengXian | Sans-Serif |
| 黑体 | SimHei | Sans-Serif |
| 宋体 | SimSun | Serif |
| 新宋体 | NSimSun | Serif |
| 仿宋 | FangSong | Serif |
| 楷体 | KaiTi | Serif |
| 隶书 | LiSu | Display |
| 幼圆 | YouYuan | Display |
| 华文细黑 | STXihei | Sans-Serif |
| 华文楷体 | STKaiti | Serif |
| 华文宋体 | STSong | Serif |
| 华文仿宋 | STFangsong | Serif |
| 华文彩云 | STCaiyun | Display |
| 华文琥珀 | STHupo | Display |
| 华文隶书 | STLiti | Display |
| 华文行楷 | STXingkai | Display |
| 华文新魏 | STXinwei | Display |
| 微軟正黑體 | Microsoft JhengHei | Sans-Serif |
| 新細明體 | PMingLiU | Serif |
| 標楷體 | DFKai-SB | Serif |

---

## 🛠️ TextStyles 工具类

项目提供了 `TextStyles` 类来处理文本样式，
位于 `packages/shared/src/styles/TextStyles.ts`。

### 使用方法

```typescript
import { TextStyles } from '@opr/shared';

// 获取下划线样式
const decoration = TextStyles.getTextDecoration('single');
// 返回: 'underline'

// 获取高亮颜色
const color = TextStyles.getHighlightColor('yellow');
// 返回: '#FFFF00'

// 构建完整的文本装饰
const decoration = TextStyles.buildTextDecoration('single', true, false);
// 返回: 'underline line-through'

// 获取垂直对齐
const align = TextStyles.getVerticalAlign('superscript');
// 返回: 'super'

// 获取文字效果
const effects = TextStyles.getTextEffects({ shadow: true, emboss: true });
// 返回: '1px 1px 2px rgba(0,0,0,0.3), -1px -1px 0 #fff, 1px 1px 0 #000'
```

---

## 📦 TypeScript 类型定义

### RunProperties 接口

```typescript
interface RunProperties {
  // 样式引用
  styleId?: string;
  
  // 字体
  fonts?: FontConfig;
  
  // 字号（半点）
  size?: number;
  
  // 颜色
  color?: string;
  
  // 格式
  bold?: boolean;
  italic?: boolean;
  underline?: UnderlineStyle;
  strike?: boolean;
  dstrike?: boolean;
  
  // 上下标
  vertAlign?: 'superscript' | 'subscript' | 'baseline';
  
  // 效果
  shadow?: boolean;
  emboss?: boolean;
  imprint?: boolean;
  outline?: boolean;
  
  // 大小写
  smallCaps?: boolean;
  caps?: boolean;
  
  // 间距
  spacing?: number;    // 字符间距 (Twips)
  kern?: number;       // 字距调整阈值
  position?: number;   // 位置偏移
  w?: number;          // 字符缩放 (%)
  
  // 高亮/底纹
  highlight?: string;
  shading?: Shading;
  
  // 隐藏
  vanish?: boolean;
  
  // 语言
  lang?: LanguageConfig;
}
```

### ParagraphProperties 接口

```typescript
interface ParagraphProperties {
  // 样式引用
  styleId?: string;
  
  // 对齐
  alignment?: 'left' | 'center' | 'right' | 'both' | 'distribute';
  
  // 缩进
  indentation?: ParagraphIndentation;
  
  // 间距
  spacing?: ParagraphSpacing;
  
  // 边框
  borders?: ParagraphBorders;
  
  // 底纹
  shading?: Shading;
  
  // 制表位
  tabs?: TabStop[];
  
  // 分页控制
  keepNext?: boolean;
  keepLines?: boolean;
  pageBreakBefore?: boolean;
  widowControl?: boolean;
  
  // 列表
  numberingReference?: NumberingReference;
}

interface ParagraphSpacing {
  before?: number;      // 段前 (Twips)
  after?: number;       // 段后 (Twips)
  line?: number;        // 行距值
  lineRule?: 'auto' | 'exact' | 'atLeast';
  beforeLines?: number; // 段前 (行数)
  afterLines?: number;  // 段后 (行数)
}

interface ParagraphIndentation {
  left?: number;        // 左缩进 (Twips)
  right?: number;       // 右缩进 (Twips)
  firstLine?: number;   // 首行缩进 (Twips)
  hanging?: number;     // 悬挂缩进 (Twips)
  leftChars?: number;   // 左缩进 (字符)
  rightChars?: number;  // 右缩进 (字符)
  firstLineChars?: number; // 首行缩进 (字符)
}
```

---

## 📁 相关文件

| 文件 | 说明 |
|------|------|
| `packages/shared/src/fonts/index.ts` | 字体映射定义 |
| `packages/shared/src/fonts/FontManager.ts` | 字体管理器 |
| `packages/shared/src/styles/TextStyles.ts` | 文本样式工具 |
| `packages/docx/src/parser/RunParser.ts` | 运行属性解析 |
| `packages/docx/src/parser/ParagraphParser.ts` | 段落属性解析 |
| `packages/docx/src/renderer/RunRenderer.ts` | 运行渲染 |
| `packages/docx/src/renderer/ParagraphRenderer.ts` | 段落渲染 |
| `packages/docx/src/types.ts` | 类型定义 |
