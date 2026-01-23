# Fonts 模块

> Office 字体管理和映射模块

## 📝 简介

Fonts 模块提供了 Office 字体到 Web 字体的映射和管理功能。由于 Office 文档中使用的字体名称可能在 Web 环境中不可用，本模块负责将 Office 字体映射到 Web 安全字体，并提供字体 CSS 类的生成。

## ✨ 核心特性

- **字体映射**：将 Office 字体名称映射到 Web 安全字体
- **CSS 类生成**：为每种字体生成对应的 CSS 类
- **字体回退**：提供合理的字体回退链
- **中文字体支持**：特别处理中文字体映射

## 🏗️ 模块结构

```
fonts/
├── FontManager.ts      # 字体管理器
└── index.ts            # 导出文件
```

## 📖 FontManager

字体管理器，负责字体映射和 CSS 类生成。

### 字体映射表

#### 英文字体

| Office 字体 | Web 字体 | 备用字体 |
|------------|---------|---------|
| Calibri | Calibri, Arial, sans-serif | |
| Arial | Arial, Helvetica, sans-serif | |
| Times New Roman | "Times New Roman", Times, serif | |
| Courier New | "Courier New", Courier, monospace | |
| Georgia | Georgia, serif | |
| Verdana | Verdana, Geneva, sans-serif | |
| Tahoma | Tahoma, Geneva, sans-serif | |
| Comic Sans MS | "Comic Sans MS", cursive | |
| Impact | Impact, Charcoal, sans-serif | |

#### 中文字体

| Office 字体 | Web 字体 | 备用字体 |
|------------|---------|---------|
| 宋体 / SimSun | SimSun, "Microsoft YaHei", STSong, sans-serif | |
| 黑体 / SimHei | SimHei, "Microsoft YaHei", STHeiti, sans-serif | |
| 微软雅黑 / Microsoft YaHei | "Microsoft YaHei", STHeiti, sans-serif | |
| 楷体 / KaiTi | KaiTi, STKaiti, serif | |
| 仿宋 / FangSong | FangSong, STFangsong, serif | |

### 关键方法

```typescript
class FontManager {
  /**
   * 获取 Web 字体名称
   * @param officeFontName - Office 字体名称
   * @returns Web 字体 CSS 值
   */
  static getWebFont(officeFontName: string): string;
  
  /**
   * 生成字体 CSS 类名
   * @param officeFontName - Office 字体名称
   * @returns CSS 类名
   */
  static getFontClassName(officeFontName: string): string;
  
  /**
   * 生成所有字体的 CSS 规则
   * @returns CSS 字符串
   */
  static generateFontCSS(): string;
  
  /**
   * 注册自定义字体映射
   * @param officeFontName - Office 字体名称
   * @param webFontFamily - Web 字体 CSS 值
   */
  static registerFont(officeFontName: string, webFontFamily: string): void;
}
```

## 🎨 字体 CSS 类

### 类名规则

Office 字体名称转换为 CSS 类名的规则：

1. 转换为小写
2. 替换空格为连字符
3. 添加 `font-` 前缀

**示例：**
```
"Times New Roman" → "font-times-new-roman"
"Microsoft YaHei" → "font-microsoft-yahei"
"Calibri" → "font-calibri"
```

### 生成的 CSS

```css
.font-calibri {
  font-family: Calibri, Arial, sans-serif;
}

.font-arial {
  font-family: Arial, Helvetica, sans-serif;
}

.font-times-new-roman {
  font-family: "Times New Roman", Times, serif;
}

.font-simsun {
  font-family: SimSun, "Microsoft YaHei", STSong, sans-serif;
}

.font-microsoft-yahei {
  font-family: "Microsoft YaHei", STHeiti, sans-serif;
}
```

## 🔧 使用示例

### 获取 Web 字体

```typescript
import { FontManager } from '@ai-space/shared';

// 获取 Web 字体
const webFont1 = FontManager.getWebFont('Calibri');
// 返回：'Calibri, Arial, sans-serif'

const webFont2 = FontManager.getWebFont('微软雅黑');
// 返回：'"Microsoft YaHei", STHeiti, sans-serif'
```

### 应用字体类

```typescript
import { FontManager } from '@ai-space/shared';

const element = document.createElement('span');
element.textContent = 'Hello World';

// 获取字体类名
const className = FontManager.getFontClassName('Arial');
element.classList.add(className);  // 添加 'font-arial'
```

### 注入字体 CSS

```typescript
import { FontManager } from '@ai-space/shared';

// 生成并注入字体 CSS
const css = FontManager.generateFontCSS();
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);
```

### 注册自定义字体

```typescript
import { FontManager } from '@ai-space/shared';

// 注册自定义字体映射
FontManager.registerFont(
  'MyCustomFont',
  '"My Custom Font", Arial, sans-serif'
);

// 使用自定义字体
const webFont = FontManager.getWebFont('MyCustomFont');
// 返回：'"My Custom Font", Arial, sans-serif'
```

## 🌏 中文字体处理

### 字体别名

中文字体通常有多个名称，FontManager 会自动处理这些别名：

```typescript
// 以下都会映射到相同的 Web 字体
FontManager.getWebFont('宋体');
FontManager.getWebFont('SimSun');
FontManager.getWebFont('simsun');
// 都返回：'SimSun, "Microsoft YaHei", STSong, sans-serif'
```

### 字体回退策略

中文字体的回退策略：

1. **首选**：Office 中指定的字体
2. **次选**：通用的中文字体（如微软雅黑）
3. **备用**：系统默认中文字体
4. **最后**：sans-serif 或 serif

**示例：**
```
宋体 → SimSun → Microsoft YaHei → STSong → sans-serif
楷体 → KaiTi → STKaiti → serif
```

## 🎯 设计原则

1. **兼容性优先**：确保在各种环境下都有合理的字体显示
2. **性能考虑**：使用静态映射表，避免运行时计算
3. **中文支持**：特别处理中文字体的别名和回退
4. **可扩展**：支持自定义字体注册

## ⚠️ 注意事项

1. **字体可用性**：Web 字体的可用性取决于用户系统
2. **许可问题**：某些字体可能有许可限制，不能直接嵌入
3. **加载性能**：使用 Web Font Loader 可以优化字体加载
4. **优先级**：CSS 类的优先级可能被其他样式覆盖

## 🚀 最佳实践

### 在渲染器中使用

```typescript
import { FontManager } from '@ai-space/shared';

// 在渲染开始时注入字体 CSS
const css = FontManager.generateFontCSS();
injectCSS(css);

// 在渲染文本时应用字体
function renderText(text: string, fontName: string): HTMLElement {
  const span = document.createElement('span');
  span.textContent = text;
  
  // 方法 1：使用 CSS 类
  const className = FontManager.getFontClassName(fontName);
  span.classList.add(className);
  
  // 方法 2：直接设置 style（优先级更高）
  // span.style.fontFamily = FontManager.getWebFont(fontName);
  
  return span;
}
```

### Web Font Loader 集成（可选）

```typescript
import WebFont from 'webfontloader';
import { FontManager } from '@ai-space/shared';

// 加载 Google Fonts
WebFont.load({
  google: {
    families: ['Roboto', 'Open Sans']
  },
  active: () => {
    // 字体加载完成后的回调
    console.log('字体加载完成');
  }
});

// 注册加载的字体
FontManager.registerFont('Roboto', 'Roboto, sans-serif');
```

## 📚 相关文档

- [TextStyles](../styles/README.md#textstyles) - 文本样式工具
- [DOCX RunRenderer](../../docx/src/renderer/README.md#runrenderer) - DOCX 文本渲染
- [XLSX CellStyleUtils](../../xlsx/src/renderer/README.md#cellstyleutils) - XLSX 单元格样式
