---
name: 列表与编号完整参考
description: OOXML 列表、编号、多级编号、标题样式的完整解析与渲染参考
trigger: context
---

# 列表与编号完整参考

## 📋 编号系统概览

OOXML 中的编号系统由两部分组成：

1. **抽象编号定义 (abstractNum)** - 定义编号的样式和格式
2. **编号实例 (num)** - 引用抽象编号，可覆盖某些设置

```
word/numbering.xml
  └── abstractNum (抽象定义)
        └── lvl (0-8 共 9 级)
  └── num (实例)
        └── abstractNumId (引用抽象定义)
        └── lvlOverride (级别覆盖，可选)

word/document.xml
  └── w:p (段落)
        └── w:pPr
              └── w:numPr
                    ├── w:numId (引用编号实例)
                    └── w:ilvl (级别索引)
```

---

## 📄 编号文件结构 (numbering.xml)

```xml
<w:numbering>
  <!-- 抽象编号定义 -->
  <w:abstractNum w:abstractNumId="0">
    <w:name w:val="MyList"/>
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="decimal"/>
      <w:lvlText w:val="%1."/>
      <w:lvlJc w:val="left"/>
      <w:pPr>
        <w:ind w:left="720" w:hanging="360"/>
      </w:pPr>
      <w:rPr>
        <w:rFonts w:hint="default"/>
      </w:rPr>
    </w:lvl>
    <!-- 更多级别 lvl 0-8 -->
  </w:abstractNum>
  
  <!-- 编号实例 -->
  <w:num w:numId="1">
    <w:abstractNumId w:val="0"/>
    <!-- 可选：级别覆盖 -->
    <w:lvlOverride w:ilvl="0">
      <w:startOverride w:val="5"/>
    </w:lvlOverride>
  </w:num>
</w:numbering>
```

---

## 🔢 编号级别属性 (w:lvl)

### 基本属性

| 元素 | 属性 | 说明 |
|------|------|------|
| `w:start` | `w:val` | 起始值，默认为 1 |
| `w:numFmt` | `w:val` | 编号格式 |
| `w:lvlText` | `w:val` | 编号文本模板，如 `%1.`、`(%1)` |
| `w:lvlJc` | `w:val` | 编号对齐 (left/center/right) |
| `w:suff` | `w:val` | 后缀类型 (tab/space/nothing) |
| `w:isLgl` | - | 法律格式（阿拉伯数字代替罗马） |

### 编号格式 (w:numFmt)

#### 数字格式

| 值 | 说明 | 示例 |
|----|------|------|
| `decimal` | 阿拉伯数字 | 1, 2, 3, 4... |
| `decimalZero` | 带前导零 | 01, 02, 03... |
| `upperRoman` | 大写罗马数字 | I, II, III, IV... |
| `lowerRoman` | 小写罗马数字 | i, ii, iii, iv... |
| `upperLetter` | 大写字母 | A, B, C, D... |
| `lowerLetter` | 小写字母 | a, b, c, d... |
| `ordinal` | 序数词 | 1st, 2nd, 3rd... |
| `cardinalText` | 基数文本 | one, two, three... |
| `ordinalText` | 序数文本 | first, second... |

#### 中文格式

| 值 | 说明 | 示例 |
|----|------|------|
| `chineseCounting` | 中文小写 | 一, 二, 三... |
| `chineseCountingThousand` | 中文大写 | 壹, 贰, 叁... |
| `ideographDigital` | 全角数字 | １, ２, ３... |
| `ideographTraditional` | 天干 | 甲, 乙, 丙... |
| `ideographLegalTraditional` | 法律中文 | 壹, 贰, 叁... |
| `taiwaneseCountingThousand` | 台湾中文 | 一, 二, 三... |
| `japaneseCounting` | 日文数字 | 一, 二, 三... |
| `japaneseDigitalTenThousand` | 日文万进制 | 〇, 一, 二... |

#### 符号格式

| 值 | 说明 | 符号 |
|----|------|------|
| `bullet` | 项目符号 | • |
| `none` | 无编号 | (空) |

### 编号文本模板 (w:lvlText)

占位符 `%n` 表示第 n 级的编号值：

| 模板 | 显示效果 | 说明 |
|------|----------|------|
| `%1.` | `1.` | 简单编号 |
| `%1)` | `1)` | 带括号 |
| `(%1)` | `(1)` | 全括号 |
| `%1.%2` | `1.1` | 多级编号 |
| `%1.%2.%3` | `1.1.1` | 三级编号 |
| `第%1条` | `第1条` | 中文格式 |
| `%1、` | `一、` | 中文顿号 |

### 后缀类型 (w:suff)

| 值 | 说明 | 效果 |
|----|------|------|
| `tab` | 制表符 (默认) | 编号后插入 Tab |
| `space` | 空格 | 编号后插入空格 |
| `nothing` | 无 | 编号后直接跟内容 |

---

## 📊 常用列表样式

### 无序列表 (项目符号)

```xml
<w:abstractNum w:abstractNumId="0">
  <w:lvl w:ilvl="0">
    <w:numFmt w:val="bullet"/>
    <w:lvlText w:val=""/>
    <w:rPr>
      <w:rFonts w:ascii="Symbol" w:hAnsi="Symbol" w:hint="default"/>
    </w:rPr>
  </w:lvl>
  <w:lvl w:ilvl="1">
    <w:numFmt w:val="bullet"/>
    <w:lvlText w:val="o"/>
    <w:rPr>
      <w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:hint="default"/>
    </w:rPr>
  </w:lvl>
  <w:lvl w:ilvl="2">
    <w:numFmt w:val="bullet"/>
    <w:lvlText w:val=""/>
    <w:rPr>
      <w:rFonts w:ascii="Wingdings" w:hAnsi="Wingdings" w:hint="default"/>
    </w:rPr>
  </w:lvl>
</w:abstractNum>
```

#### 常用项目符号

| 字体 | 字符 | 显示 |
|------|------|------|
| Symbol | ● (F0B7) | ● 实心圆 |
| Courier New | o | ○ 空心圆 |
| Wingdings | ■ (F06E) | ■ 实心方块 |
| Wingdings | □ (F06F) | □ 空心方块 |
| Wingdings | ➤ (F0E0) | ➤ 箭头 |
| Wingdings | ✓ (F0FC) | ✓ 对勾 |

### 有序列表 (编号)

```xml
<w:abstractNum w:abstractNumId="1">
  <w:lvl w:ilvl="0">
    <w:start w:val="1"/>
    <w:numFmt w:val="decimal"/>
    <w:lvlText w:val="%1."/>
    <w:lvlJc w:val="left"/>
    <w:pPr>
      <w:ind w:left="720" w:hanging="360"/>
    </w:pPr>
  </w:lvl>
  <w:lvl w:ilvl="1">
    <w:start w:val="1"/>
    <w:numFmt w:val="lowerLetter"/>
    <w:lvlText w:val="%2)"/>
    <w:lvlJc w:val="left"/>
    <w:pPr>
      <w:ind w:left="1440" w:hanging="360"/>
    </w:pPr>
  </w:lvl>
  <w:lvl w:ilvl="2">
    <w:start w:val="1"/>
    <w:numFmt w:val="lowerRoman"/>
    <w:lvlText w:val="%3."/>
    <w:lvlJc w:val="right"/>
    <w:pPr>
      <w:ind w:left="2160" w:hanging="180"/>
    </w:pPr>
  </w:lvl>
</w:abstractNum>
```

### 多级列表 (大纲)

```xml
<w:abstractNum w:abstractNumId="2">
  <!-- 1. 一级标题 -->
  <w:lvl w:ilvl="0">
    <w:start w:val="1"/>
    <w:numFmt w:val="decimal"/>
    <w:lvlText w:val="%1."/>
    <w:pPr><w:ind w:left="360" w:hanging="360"/></w:pPr>
  </w:lvl>
  <!-- 1.1 二级标题 -->
  <w:lvl w:ilvl="1">
    <w:start w:val="1"/>
    <w:numFmt w:val="decimal"/>
    <w:lvlText w:val="%1.%2"/>
    <w:pPr><w:ind w:left="792" w:hanging="432"/></w:pPr>
  </w:lvl>
  <!-- 1.1.1 三级标题 -->
  <w:lvl w:ilvl="2">
    <w:start w:val="1"/>
    <w:numFmt w:val="decimal"/>
    <w:lvlText w:val="%1.%2.%3"/>
    <w:pPr><w:ind w:left="1224" w:hanging="504"/></w:pPr>
  </w:lvl>
</w:abstractNum>
```

---

## 📑 标题与列表绑定

在 DOCX 中，标题样式（Heading 1-9）通常与编号绑定，形成文档大纲。

### styles.xml 中的标题样式

```xml
<w:style w:type="paragraph" w:styleId="Heading1">
  <w:name w:val="heading 1"/>
  <w:basedOn w:val="Normal"/>
  <w:next w:val="Normal"/>
  <w:link w:val="Heading1Char"/>
  <w:uiPriority w:val="9"/>
  <w:qFormat/>
  <w:pPr>
    <w:keepNext/>
    <w:keepLines/>
    <w:numPr>
      <w:numId w:val="1"/>               <!-- 绑定编号实例 -->
    </w:numPr>
    <w:spacing w:before="480" w:after="0"/>
    <w:outlineLvl w:val="0"/>            <!-- 大纲级别 -->
  </w:pPr>
  <w:rPr>
    <w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorEastAsia"/>
    <w:b/>
    <w:sz w:val="32"/>
  </w:rPr>
</w:style>
```

### 大纲级别 (w:outlineLvl)

| 值 | 对应标题 |
|----|----------|
| 0 | Heading 1 |
| 1 | Heading 2 |
| 2 | Heading 3 |
| ... | ... |
| 8 | Heading 9 |

### 标题编号的隐式级别

当段落使用标题样式且样式绑定了编号时，`w:ilvl` 可能不显式出现。
此时应使用 `w:outlineLvl` 的值作为编号级别。

```xml
<!-- 文档中的标题段落 -->
<w:p>
  <w:pPr>
    <w:pStyle w:val="Heading1"/>   <!-- 使用标题样式 -->
    <!-- numPr 可能不出现，因为样式已定义 -->
  </w:pPr>
  <w:r><w:t>章节标题</w:t></w:r>
</w:p>
```

---

## 🔗 段落编号引用 (w:numPr)

### 完整引用

```xml
<w:p>
  <w:pPr>
    <w:numPr>
      <w:ilvl w:val="0"/>    <!-- 级别索引 (0-based) -->
      <w:numId w:val="1"/>   <!-- 编号实例 ID -->
    </w:numPr>
  </w:pPr>
  <w:r><w:t>列表项内容</w:t></w:r>
</w:p>
```

### 通过样式引用

```xml
<w:p>
  <w:pPr>
    <w:pStyle w:val="ListParagraph"/>  <!-- 列表段落样式 -->
    <w:numPr>
      <w:ilvl w:val="1"/>              <!-- 仅指定级别 -->
      <!-- numId 从样式继承 -->
    </w:numPr>
  </w:pPr>
</w:p>
```

### 取消编号

```xml
<w:numPr>
  <w:numId w:val="0"/>  <!-- numId=0 表示取消编号 -->
</w:numPr>
```

---

## 📐 缩进与对齐

### 列表缩进 (w:ind)

```xml
<w:lvl w:ilvl="0">
  <w:pPr>
    <w:ind 
      w:left="720"      <!-- 整体左缩进 (Twips) -->
      w:hanging="360"   <!-- 悬挂缩进 (编号占用的宽度) -->
    />
  </w:pPr>
</w:lvl>
```

#### 缩进计算

```
│←── left ──→│
│            │
│  ●  │ 内容 │
│←hang→│     │
```

- **left**: 段落文本的左边距
- **hanging**: 编号与文本之间的间距（从 left 向左偏移）
- **编号位置**: left - hanging

### 常用缩进值 (Twips)

| 级别 | left | hanging | 编号位置 |
|------|------|---------|----------|
| 0 | 720 | 360 | 360 |
| 1 | 1440 | 360 | 1080 |
| 2 | 2160 | 180 | 1980 |
| 3 | 2880 | 360 | 2520 |

### 编号对齐 (w:lvlJc)

| 值 | 说明 | 效果 |
|----|------|------|
| `left` | 左对齐 | `1.  文本` |
| `center` | 居中对齐 | ` 1. 文本` |
| `right` | 右对齐 | `  1.文本` |

通常 `right` 用于罗马数字等宽度不一的编号格式。

---

## 📥 级别覆盖 (w:lvlOverride)

允许在实例级别覆盖抽象定义的某些属性：

```xml
<w:num w:numId="2">
  <w:abstractNumId w:val="0"/>
  <!-- 覆盖起始值 -->
  <w:lvlOverride w:ilvl="0">
    <w:startOverride w:val="10"/>  <!-- 从 10 开始 -->
  </w:lvlOverride>
  <!-- 完全覆盖级别定义 -->
  <w:lvlOverride w:ilvl="1">
    <w:lvl w:ilvl="1">
      <w:start w:val="1"/>
      <w:numFmt w:val="upperLetter"/>
      <w:lvlText w:val="%2)"/>
    </w:lvl>
  </w:lvlOverride>
</w:num>
```

---

## 🛠️ 解析与渲染

### NumberingParser 类

位于 `packages/docx/src/parser/NumberingParser.ts`

```typescript
import { NumberingParser } from '@docx/parser';

// 解析 numbering.xml
const numbering = NumberingParser.parse(xmlContent);

// 获取级别定义
const level = NumberingParser.getLevel(numbering, '1', '0');

// 格式化编号
const text = NumberingParser.formatNumber(level, 3);
// 例: "3." 或 "III" 或 "三"
```

### ListCounter 类

位于 `packages/docx/src/renderer/ListCounter.ts`

```typescript
import { ListCounter } from '@docx/renderer';

// 创建计数器
const counter = new ListCounter(numbering);

// 获取下一个编号
const text1 = counter.getNextNumber('1', 0);  // "1."
const text2 = counter.getNextNumber('1', 0);  // "2."
const text3 = counter.getNextNumber('1', 1);  // "a)"
const text4 = counter.getNextNumber('1', 0);  // "3." (重置子级别)

// 重置计数器
counter.reset('1');
counter.resetLevel('1', 0, 5);  // 从 5 开始
```

---

## 📦 TypeScript 类型定义

### NumberingDefinition

```typescript
interface NumberingDefinition {
  abstractNums: Record<string, AbstractNumbering>;
  nums: Record<string, NumberingInstance>;
}

interface AbstractNumbering {
  id: string;
  name?: string;
  levels: Record<string, NumberingLevel>;
}

interface NumberingLevel {
  start: number;           // 起始值
  format: string;          // 编号格式
  text: string;            // 文本模板
  alignment: 'left' | 'center' | 'right';
  indent: number;          // 缩进 (Twips)
  hanging?: number;        // 悬挂缩进
  suffix?: 'tab' | 'space' | 'nothing';
  isLgl?: boolean;         // 法律格式
  pPr?: ParagraphProperties;
  rPr?: RunProperties;
}

interface NumberingInstance {
  id: string;
  abstractNumId: string;
  levelOverrides?: Record<string, NumberingLevelOverride>;
}

interface NumberingLevelOverride {
  startOverride?: number;
  level?: NumberingLevel;
}
```

### NumberingReference

段落中的编号引用：

```typescript
interface NumberingReference {
  numId: string;   // 编号实例 ID
  ilvl: string;    // 级别索引 (0-8)
}
```

---

## 🎨 CSS 渲染

### 列表容器

```css
.docx-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.docx-list-item {
  display: flex;
  align-items: flex-start;
}

.docx-list-marker {
  flex-shrink: 0;
  text-align: right;
  min-width: var(--marker-width, 2em);
  margin-right: 0.5em;
}

.docx-list-content {
  flex: 1;
}
```

### 分级缩进

```css
.docx-list-item[data-level="0"] { margin-left: 0; }
.docx-list-item[data-level="1"] { margin-left: 2em; }
.docx-list-item[data-level="2"] { margin-left: 4em; }
.docx-list-item[data-level="3"] { margin-left: 6em; }
/* ... */
```

### 渲染示例

```html
<div class="docx-list">
  <div class="docx-list-item" data-level="0">
    <span class="docx-list-marker">1.</span>
    <span class="docx-list-content">第一项</span>
  </div>
  <div class="docx-list-item" data-level="1">
    <span class="docx-list-marker">a)</span>
    <span class="docx-list-content">子项 A</span>
  </div>
  <div class="docx-list-item" data-level="1">
    <span class="docx-list-marker">b)</span>
    <span class="docx-list-content">子项 B</span>
  </div>
  <div class="docx-list-item" data-level="0">
    <span class="docx-list-marker">2.</span>
    <span class="docx-list-content">第二项</span>
  </div>
</div>
```

---

## ⚠️ 常见问题

### 1. 编号不连续

**原因**: 多个段落使用相同的 `numId` 但计数器被重置

**解决**: 确保使用同一个 `ListCounter` 实例遍历所有段落

### 2. 编号格式错误

**原因**: 未正确解析 `w:numFmt` 或 `w:lvlText`

**检查**:
```typescript
const level = NumberingParser.getLevel(numbering, numId, ilvl);
console.log('格式:', level.format);  // 如 'decimal'
console.log('模板:', level.text);    // 如 '%1.'
```

### 3. 标题无编号

**原因**: 标题样式的编号定义在 styles.xml 中，未正确合并

**解决**: 解析样式时提取 `w:numPr` 并与段落属性合并

### 4. 中文编号显示为数字

**原因**: 未实现 `chineseCounting` 等格式的转换

**解决**: 使用 `NumberingParser.toChinese()` 或 `ListCounter.formatSingleNumber()`

### 5. 多级编号父级别值错误

**原因**: `%1.%2` 模板需要各级别的当前值

**解决**: `ListCounter` 会自动追踪各级别计数，确保依次调用 `getNextNumber`

---

## 📁 相关文件

| 文件 | 说明 |
|------|------|
| `packages/docx/src/parser/NumberingParser.ts` | 编号解析器 |
| `packages/docx/src/renderer/ListCounter.ts` | 列表计数器 |
| `packages/docx/src/parser/ParagraphParser.ts` | 段落解析（含 numPr） |
| `packages/docx/src/renderer/ParagraphRenderer.ts` | 段落渲染 |
| `packages/docx/src/parser/StylesParser.ts` | 样式解析 |
| `packages/docx/src/types/styles.ts` | 类型定义 |
