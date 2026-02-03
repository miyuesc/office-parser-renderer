---
name: CSS 样式约定
description: 项目中使用的 CSS 类名约定、样式工具和最佳实践
trigger: context
---

# CSS 样式约定

## 🏷️ 命名规范

### 前缀约定

| 前缀 | 用途 | 示例 |
|------|------|------|
| `.docx-` | DOCX 特定样式 | `.docx-page`, `.docx-content` |
| `.xlsx-` | XLSX 特定样式 | `.xlsx-sheet`, `.xlsx-cell` |
| `.omath-` | 数学公式样式 | `.omath-frac`, `.omath-root` |
| `.chart-` | 图表样式 | `.chart-bar`, `.chart-legend` |

### 常用类名

```css
/* DOCX 结构 */
.docx-wrapper         /* 文档容器 */
.docx-page            /* 单页容器 */
.docx-content         /* 内容区域 */
.docx-header          /* 页眉 */
.docx-footer          /* 页脚 */

/* XLSX 结构 */
.xlsx-wrapper         /* 工作簿容器 */
.xlsx-sheet           /* 工作表 */
.xlsx-table           /* 表格 */
.xlsx-cell            /* 单元格 */
.xlsx-svg-layer       /* 绘图层 */

/* 绘图元素 */
.drawing-anchor       /* 绘图锚点 */
.drawing-shape        /* 形状 */
.drawing-image        /* 图片 */
.drawing-chart        /* 图表 */
```

## 🔧 样式工具类

### StyleUtils 类

位置: `packages/shared/src/styles/StyleUtils.ts`

```typescript
import { StyleUtils } from '@opr/shared';

// 设置绝对定位
StyleUtils.setAbsolutePosition(element, left, top);

// 设置尺寸
StyleUtils.setSize(element, width, height);

// 设置 Flex 布局
StyleUtils.setFlex(element, 'center', 'center');

// 设置边框
StyleUtils.setBorder(element, '1px solid #000');
```

### 边框样式映射

```typescript
const BORDER_STYLE_MAP: Record<string, string> = {
  'single': 'solid',
  'double': 'double',
  'dotted': 'dotted',
  'dashed': 'dashed',
  'dashDot': 'dashed',
  'dashDotDot': 'dashed',
  'triple': 'double',
  'thinThickSmallGap': 'double',
  'thickThinSmallGap': 'double',
  'nil': 'none',
  'none': 'none'
};
```

### 对齐方式映射

```typescript
const ALIGNMENT_MAP: Record<string, string> = {
  'left': 'left',
  'center': 'center',
  'right': 'right',
  'both': 'justify',
  'distribute': 'justify'
};

const VALIGN_MAP: Record<string, string> = {
  'top': 'top',
  'center': 'middle',
  'bottom': 'bottom'
};
```

## 📄 CSS 文件组织

```
packages/
├── shared/src/styles/
│   ├── common.css          # 通用样式
│   └── omath.css           # 公式样式
├── docx/src/styles/
│   └── docx.css            # DOCX 样式
└── xlsx/src/styles/
    └── xlsx.css            # XLSX 样式
```

## 🎨 样式注入

### 自动注入（开发）

```typescript
import { StyleInjector } from '@opr/docx';
StyleInjector.inject(); // 注入到 <head>
```

### 外部引入（生产）

```html
<link rel="stylesheet" href="docx.css">
<link rel="stylesheet" href="xlsx.css">
```

## ⚡ 动态样式生成

```typescript
// 生成单元格样式
function generateCellStyle(cell: CellData): string {
  const styles: string[] = [];
  
  if (cell.fill) {
    styles.push(`background-color: ${cell.fill}`);
  }
  if (cell.font?.bold) {
    styles.push('font-weight: bold');
  }
  if (cell.font?.size) {
    const px = UnitConverter.pointsToPixels(cell.font.size);
    styles.push(`font-size: ${px}px`);
  }
  
  return styles.join('; ');
}
```

## 📐 Z-Index 层级

```css
/* 层级约定 */
--z-background: -1;    /* 背景层 */
--z-content: 0;        /* 内容层 */
--z-drawing: 10;       /* 绘图层 */
--z-header-footer: 20; /* 页眉页脚 */
--z-watermark: 30;     /* 水印层 */
--z-modal: 100;        /* 弹窗层 */
```

## 📍 相关文件

- 样式常量: `packages/shared/src/styles/constants.ts`
- 单位转换: `packages/shared/src/styles/UnitConverter.ts`
- 样式工具: `packages/shared/src/styles/StyleUtils.ts`
- 边框样式: `packages/shared/src/styles/BorderStyles.ts`
- 文本样式: `packages/shared/src/styles/TextStyles.ts`
