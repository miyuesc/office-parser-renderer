# Math 模块

> Office Math (OMML) 数学公式解析和渲染模块

## 📝 简介

Math 模块提供了 Office Math (OMML) 数学公式的解析和渲染功能。OMML 是 Microsoft Office 用于表示数学公式的 XML 格式，广泛应用于 Word、PowerPoint 等应用。

## ✨ 核心特性

- **完整的 OMML 支持**：支持所有常见的数学结构
- **高保真渲染**：使用 HTML/CSS 渲染，力求与 Office 一致
- **结构化解析**：将 OMML 解析为易于处理的对象模型
- **样式支持**：支持数学公式的字体、大小、颜色等样式

## 🏗️ 模块结构

```
math/
├── OMathParser.ts      # Office Math 解析器
├── OMathRenderer.ts    # Office Math 渲染器
├── types.ts            # 数学公式类型定义
└── index.ts            # 导出文件
```

## 📖 支持的数学结构

### 基础结构

#### 分数 (Fraction)
```xml
<m:f>
  <m:num><m:r><m:t>1</m:t></m:r></m:num>
  <m:den><m:r><m:t>2</m:t></m:r></m:den>
</m:f>
```
渲染为：1/2

#### 根式 (Radical)
```xml
<m:rad>
  <m:deg><m:r><m:t>2</m:t></m:r></m:deg>
  <m:e><m:r><m:t>x</m:t></m:r></m:e>
</m:rad>
```
渲染为：²√x

#### 上标/下标 (Superscript/Subscript)
```xml
<m:sSup>
  <m:e><m:r><m:t>x</m:t></m:r></m:e>
  <m:sup><m:r><m:t>2</m:t></m:r></m:sup>
</m:sSup>
```
渲染为：x²

### 高级结构

#### 积分 (Integral)
```xml
<m:nary>
  <m:naryPr>
    <m:chr m:val="∫"/>
  </m:naryPr>
  <m:sub><m:r><m:t>0</m:t></m:r></m:sub>
  <m:sup><m:r><m:t>1</m:t></m:r></m:sup>
  <m:e><m:r><m:t>x dx</m:t></m:r></m:e>
</m:nary>
```
渲染为：∫₀¹ x dx

#### 矩阵 (Matrix)
```xml
<m:m>
  <m:mPr>
    <m:mcs><m:mc><m:mcPr><m:count m:val="2"/></m:mcPr></m:mc></m:mcs>
  </m:mPr>
  <m:mr>
    <m:e><m:r><m:t>1</m:t></m:r></m:e>
    <m:e><m:r><m:t>2</m:t></m:r></m:e>
  </m:mr>
  <m:mr>
    <m:e><m:r><m:t>3</m:t></m:r></m:e>
    <m:e><m:r><m:t>4</m:t></m:r></m:e>
  </m:mr>
</m:m>
```
渲染为：[1 2]
       [3 4]

#### 括号 (Delimiters)
```xml
<m:d>
  <m:dPr>
    <m:begChr m:val="("/>
    <m:endChr m:val=")"/>
  </m:dPr>
  <m:e><m:r><m:t>x+y</m:t></m:r></m:e>
</m:d>
```
渲染为：(x+y)

## 🔧 使用示例

### 解析 OMML

```typescript
import { OMathParser } from '@ai-space/shared';

const parser = new OMathParser();
const mathElement = /* XML element containing m:oMath */;

const mathObj = parser.parse(mathElement);
console.log('数学结构:', mathObj.type);
```

### 渲染公式

```typescript
import { OMathRenderer } from '@ai-space/shared';

const renderer = new OMathRenderer();
const mathObj = /* parsed math object */;

const element = renderer.render(mathObj);
document.body.appendChild(element);
```

## 🎨 渲染策略

### DOM 结构

每个数学元素都被渲染为特定的 DOM 结构：

```html
<!-- 分数 -->
<span class="omath-frac">
  <span class="omath-num">1</span>
  <span class="omath-frac-line"></span>
  <span class="omath-den">2</span>
</span>

<!-- 根式 -->
<span class="omath-rad">
  <span class="omath-rad-deg">2</span>
  <span class="omath-rad-symbol">√</span>
  <span class="omath-rad-base">x</span>
</span>

<!-- 上标 -->
<span class="omath-ssup">
  <span class="omath-base">x</span>
  <span class="omath-sup">2</span>
</span>
```

### CSS 样式

使用 CSS 实现公式的精确布局：

```css
.omath-frac {
  display: inline-flex;
  flex-direction: column;
  vertical-align: middle;
  text-align: center;
}

.omath-frac-line {
  border-top: 1px solid currentColor;
  margin: 2px 0;
}

.omath-sup {
  font-size: 0.7em;
  vertical-align: super;
}

.omath-sub {
  font-size: 0.7em;
  vertical-align: sub;
}
```

## 📚 类型定义

```typescript
// 数学对象基础类型
interface MathObject {
  type: MathType;
}

// 数学类型
type MathType =
  | 'run'        // 文本运行
  | 'frac'       // 分数
  | 'rad'        // 根式
  | 'sSup'       // 上标
  | 'sSub'       // 下标
  | 'sSubSup'    // 上下标
  | 'nary'       // N元运算（积分、求和等）
  | 'func'       // 函数
  | 'd'          // 括号
  | 'm'          // 矩阵
  | 'eqArr'      // 等式数组
  | 'acc'        // 重音
  | 'bar'        // 上划线/下划线
  | 'box'        // 边框
  | 'borderBox'  // 带边框的框
  | 'groupChr'   // 组合字符
  | 'limLow'     // 下限
  | 'limUpp';    // 上限

// 分数
interface Fraction extends MathObject {
  type: 'frac';
  numerator: MathObject[];
  denominator: MathObject[];
}

// 根式
interface Radical extends MathObject {
  type: 'rad';
  degree?: MathObject[];  // 开方次数
  base: MathObject[];     // 被开方数
}

// 上标
interface Superscript extends MathObject {
  type: 'sSup';
  base: MathObject[];
  superscript: MathObject[];
}

// ... 更多类型定义
```

## 🎯 设计原则

1. **结构化解析**：将 OMML 转换为清晰的对象模型
2. **递归渲染**：数学结构可以嵌套，使用递归处理
3. **CSS 优先**：尽量使用 CSS 实现布局，减少 JavaScript 计算
4. **字体支持**：使用 Cambria Math 或其他数学字体
5. **紧凑显示**：控制间距，使公式紧凑美观

## ⚠️ 已知限制

1. **复杂嵌套**：极其复杂的嵌套公式可能显示不佳
2. **字体依赖**：需要支持数学符号的字体
3. **MathML**：不直接支持 MathML，仅支持 OMML
4. **编辑功能**：仅支持显示，不支持编辑

## 📚 相关文档

- [DOCX Parser](../../docx/src/parser/README.md) - DOCX 中的公式解析
- [Office Math 规范](https://www.ecma-international.org/publications-and-standards/standards/ecma-376/) - Part 1, Section 22.1.2
