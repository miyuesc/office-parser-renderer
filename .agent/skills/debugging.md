---
name: 调试与问题排查
description: 常见渲染问题的排查方法和调试技巧
trigger: context
---

# 调试与问题排查

## 🔍 调试工具

### 1. 浏览器开发者工具

```javascript
// 在控制台检查元素属性
document.querySelector('.docx-page').style
document.querySelector('.xlsx-cell').getBoundingClientRect()
```

### 2. 启用调试模式

```typescript
const renderer = new DocxRenderer(container, {
  debug: true  // 启用调试输出
});
```

### 3. 日志记录

```typescript
import { Logger } from '@ai-space/docx/utils';
Logger.setLevel('debug');
```

## 🐛 常见问题

### 1. 元素位置偏移

**症状**: 元素显示位置与预期不符

**排查**:
1. 检查单位转换 (EMU/Twips → px)
2. 检查坐标系参考对象
3. 检查容器的 padding/margin

```typescript
// 验证转换结果
console.log('EMU:', emuValue, '→ px:', UnitConverter.emuToPixels(emuValue));
```

### 2. 尺寸不正确

**症状**: 元素大小与 Office 不一致

**排查**:
1. 检查 `box-sizing` 设置
2. 检查缩放比例
3. 检查边框是否计入尺寸

### 3. 颜色不匹配

**症状**: 颜色显示与 Office 不同

**排查**:
1. 检查主题颜色解析
2. 检查 tint/shade 计算
3. 使用颜色提取工具对比

```typescript
// 调试颜色解析
console.log('原始:', colorValue, '→ 解析后:', resolvedColor);
```

### 4. 图片不显示

**症状**: 图片区域空白

**排查**:
1. 检查关系文件 (.rels)
2. 检查 base64 编码
3. 检查 MIME 类型

```typescript
// 验证图片数据
console.log('图片关系ID:', relationId, '→ 路径:', imagePath);
```

### 5. 文字换行异常

**症状**: 文字换行位置与 Office 不同

**排查**:
1. 检查容器宽度
2. 检查 word-break 设置
3. 检查 white-space 设置

## 📊 性能问题

### 渲染慢

1. 检查 DOM 节点数量
2. 减少不必要的样式计算
3. 使用 DocumentFragment 批量插入

### 内存占用高

1. 及时清理不需要的对象
2. 避免循环引用
3. 使用虚拟滚动（大文档）

## 🔧 常用调试代码

```typescript
// 输出元素边界
function logBounds(el: HTMLElement, label: string) {
  const rect = el.getBoundingClientRect();
  console.log(`${label}:`, {
    x: rect.x, y: rect.y,
    width: rect.width, height: rect.height
  });
}

// 高亮元素（调试用）
function highlight(el: HTMLElement) {
  el.style.outline = '2px solid red';
}

// 输出样式
function logStyles(el: HTMLElement) {
  const computed = getComputedStyle(el);
  console.log({
    position: computed.position,
    left: computed.left,
    top: computed.top,
    width: computed.width,
    height: computed.height
  });
}
```

## 📁 日志文件位置

调试日志会输出到浏览器控制台，可通过以下方式过滤：

- `[DocxParser]` - DOCX 解析日志
- `[DocxRenderer]` - DOCX 渲染日志
- `[XlsxParser]` - XLSX 解析日志
- `[XlsxRenderer]` - XLSX 渲染日志
