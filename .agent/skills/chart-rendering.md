---
name: 图表渲染参考
description: OOXML 图表类型、数据结构和渲染逻辑参考
trigger: context
---

# 图表渲染参考

## 📊 支持的图表类型

| XML 元素 | 类型 | 说明 |
|----------|------|------|
| `c:barChart` | 柱状图/条形图 | `barDir`: col(柱)/bar(条) |
| `c:lineChart` | 折线图 | 支持平滑线 |
| `c:pieChart` | 饼图 | 单系列 |
| `c:doughnutChart` | 圆环图 | 支持空心比例 |
| `c:areaChart` | 面积图 | 支持堆叠 |
| `c:scatterChart` | 散点图 | X/Y 独立数据 |
| `c:radarChart` | 雷达图 | 支持填充 |
| `c:stockChart` | 股票图 | 高低开收 |
| `c:surface3DChart` | 曲面图 | 3D |

## 🏗️ 图表结构

```xml
<c:chartSpace>
  <c:chart>
    <c:title><c:tx>...</c:tx></c:title>
    <c:plotArea>
      <c:barChart>
        <c:barDir val="col"/>
        <c:grouping val="clustered"/>
        <c:ser>
          <c:idx val="0"/>
          <c:tx><c:strRef>...</c:strRef></c:tx>
          <c:cat><c:strRef>...</c:strRef></c:cat>
          <c:val><c:numRef>...</c:numRef></c:val>
          <c:spPr>...</c:spPr>
        </c:ser>
      </c:barChart>
      <c:catAx>...</c:catAx>
      <c:valAx>...</c:valAx>
    </c:plotArea>
    <c:legend>...</c:legend>
  </c:chart>
</c:chartSpace>
```

## 📈 数据引用

```xml
<!-- 字符串引用（分类） -->
<c:strRef>
  <c:f>Sheet1!$A$2:$A$5</c:f>
  <c:strCache>
    <c:pt idx="0"><c:v>项目A</c:v></c:pt>
  </c:strCache>
</c:strRef>

<!-- 数值引用（数据） -->
<c:numRef>
  <c:f>Sheet1!$B$2:$B$5</c:f>
  <c:numCache>
    <c:pt idx="0"><c:v>100</c:v></c:pt>
  </c:numCache>
</c:numRef>
```

## 🎨 图表默认颜色

```typescript
const CHART_COLORS = [
  '#4F81BD', // 蓝
  '#C0504D', // 红
  '#9BBB59', // 绿
  '#8064A2', // 紫
  '#4BACC6', // 青
  '#F79646'  // 橙
];
```

## 📐 坐标轴

```xml
<c:catAx>
  <c:axId val="1"/>
  <c:scaling><c:orientation val="minMax"/></c:scaling>
  <c:axPos val="b"/>  <!-- b/l/r/t -->
  <c:majorTickMark val="out"/>
  <c:minorTickMark val="none"/>
  <c:tickLblPos val="nextTo"/>
</c:catAx>

<c:valAx>
  <c:axId val="2"/>
  <c:scaling>
    <c:min val="0"/>
    <c:max val="100"/>
  </c:scaling>
  <c:majorGridlines/>
</c:valAx>
```

## 🔄 混合图表

```xml
<c:plotArea>
  <c:barChart>
    <c:ser><c:idx val="0"/>...</c:ser>
  </c:barChart>
  <c:lineChart>
    <c:ser><c:idx val="1"/>...</c:ser>
  </c:lineChart>
  <c:catAx>...</c:catAx>
  <c:valAx axId="1">...</c:valAx>
  <c:valAx axId="2">...</c:valAx>  <!-- 次坐标轴 -->
</c:plotArea>
```

## 📍 相关文件

- 解析器: `packages/shared/src/drawing/renderers/ChartRenderer.ts`
- XLSX 适配: `packages/xlsx/src/renderer/ChartRenderer.ts`
- DOCX 集成: `packages/docx/src/renderer/DrawingRenderer.ts`
