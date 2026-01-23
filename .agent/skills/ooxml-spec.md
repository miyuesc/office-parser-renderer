---
name: OOXML 规范参考
description: Office Open XML (OOXML/ECMA-376) 标准中常用元素、属性和命名空间的快速参考
trigger: context
---

# OOXML 规范参考

## 📚 命名空间

### DOCX 命名空间

| 前缀 | 命名空间 URI | 用途 |
|------|-------------|------|
| `w` | `http://schemas.openxmlformats.org/wordprocessingml/2006/main` | WordprocessingML 主文档 |
| `r` | `http://schemas.openxmlformats.org/officeDocument/2006/relationships` | 关系引用 |
| `wp` | `http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing` | 绘图定位 |
| `a` | `http://schemas.openxmlformats.org/drawingml/2006/main` | DrawingML 核心 |
| `pic` | `http://schemas.openxmlformats.org/drawingml/2006/picture` | 图片 |
| `c` | `http://schemas.openxmlformats.org/drawingml/2006/chart` | 图表 |
| `v` | `urn:schemas-microsoft-com:vml` | VML 图形 |
| `o` | `urn:schemas-microsoft-com:office:office` | Office 扩展 |
| `m` | `http://schemas.openxmlformats.org/officeDocument/2006/math` | 数学公式 |

### XLSX 命名空间

| 前缀 | 命名空间 URI | 用途 |
|------|-------------|------|
| (默认) | `http://schemas.openxmlformats.org/spreadsheetml/2006/main` | SpreadsheetML |
| `r` | `http://schemas.openxmlformats.org/officeDocument/2006/relationships` | 关系引用 |
| `xdr` | `http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing` | 绘图定位 |
| `a` | `http://schemas.openxmlformats.org/drawingml/2006/main` | DrawingML 核心 |
| `c` | `http://schemas.openxmlformats.org/drawingml/2006/chart` | 图表 |

---

## 📄 DOCX 核心元素

### 文档结构

```xml
<w:document>
  <w:body>
    <w:p>...</w:p>           <!-- 段落 -->
    <w:tbl>...</w:tbl>       <!-- 表格 -->
    <w:sectPr>...</w:sectPr> <!-- 分节属性 -->
  </w:body>
</w:document>
```

### 段落 (`w:p`)

```xml
<w:p>
  <w:pPr>                    <!-- 段落属性 -->
    <w:pStyle w:val="Heading1"/>
    <w:jc w:val="center"/>   <!-- 对齐: left/center/right/both -->
    <w:ind w:left="720" w:firstLine="360"/>  <!-- 缩进 (twips) -->
    <w:spacing w:before="240" w:after="120" w:line="360"/>  <!-- 间距 -->
  </w:pPr>
  <w:r>...</w:r>             <!-- 文本运行 -->
</w:p>
```

### 文本运行 (`w:r`)

```xml
<w:r>
  <w:rPr>                    <!-- 运行属性 -->
    <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="宋体"/>
    <w:sz w:val="24"/>       <!-- 字号 (半点) -->
    <w:b/>                   <!-- 粗体 -->
    <w:i/>                   <!-- 斜体 -->
    <w:u w:val="single"/>    <!-- 下划线 -->
    <w:color w:val="FF0000"/><!-- 颜色 -->
    <w:highlight w:val="yellow"/> <!-- 高亮 -->
  </w:rPr>
  <w:t>文本内容</w:t>
</w:r>
```

### 表格 (`w:tbl`)

```xml
<w:tbl>
  <w:tblPr>                  <!-- 表格属性 -->
    <w:tblW w:w="5000" w:type="pct"/>  <!-- 宽度 -->
    <w:tblBorders>           <!-- 边框 -->
      <w:top w:val="single" w:sz="4" w:color="000000"/>
    </w:tblBorders>
  </w:tblPr>
  <w:tblGrid>                <!-- 列定义 -->
    <w:gridCol w:w="2880"/>
  </w:tblGrid>
  <w:tr>                     <!-- 行 -->
    <w:tc>                   <!-- 单元格 -->
      <w:tcPr>               <!-- 单元格属性 -->
        <w:tcW w:w="2880" w:type="dxa"/>
        <w:vMerge w:val="restart"/>  <!-- 垂直合并 -->
        <w:gridSpan w:val="2"/>      <!-- 水平合并 -->
        <w:shd w:val="clear" w:fill="FFFF00"/>  <!-- 背景 -->
      </w:tcPr>
      <w:p>...</w:p>
    </w:tc>
  </w:tr>
</w:tbl>
```

### 绘图 (`w:drawing`)

```xml
<w:drawing>
  <wp:anchor|wp:inline>      <!-- 浮动/嵌入 -->
    <wp:extent cx="914400" cy="914400"/>  <!-- 尺寸 (EMU) -->
    <wp:positionH relativeFrom="column">  <!-- 水平定位 -->
      <wp:posOffset>0</wp:posOffset>
    </wp:positionH>
    <wp:positionV relativeFrom="paragraph">
      <wp:posOffset>0</wp:posOffset>
    </wp:positionV>
    <a:graphic>
      <a:graphicData>
        <pic:pic>...</pic:pic>   <!-- 图片 -->
        <!-- 或 -->
        <wsp:wsp>...</wsp:wsp>   <!-- 形状 -->
        <!-- 或 -->
        <c:chart>...</c:chart>   <!-- 图表 -->
      </a:graphicData>
    </a:graphic>
  </wp:anchor>
</w:drawing>
```

### VML 图形 (`w:pict`)

```xml
<w:pict>
  <v:shape type="#_x0000_t202" 
           style="position:absolute;left:0;top:0;width:100pt;height:50pt">
    <v:fill color="#FF0000"/>
    <v:stroke color="#000000"/>
    <v:textbox>
      <w:txbxContent>
        <w:p>...</w:p>
      </w:txbxContent>
    </v:textbox>
  </v:shape>
</w:pict>
```

---

## 📊 XLSX 核心元素

### 工作表 (`worksheet`)

```xml
<worksheet>
  <sheetViews>
    <sheetView tabSelected="1"/>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>
    <col min="1" max="1" width="10" customWidth="1"/>
  </cols>
  <sheetData>
    <row r="1" ht="20" customHeight="1">
      <c r="A1" s="1" t="s">
        <v>0</v>  <!-- 共享字符串索引 -->
      </c>
    </row>
  </sheetData>
  <mergeCells>
    <mergeCell ref="A1:B2"/>
  </mergeCells>
  <drawing r:id="rId1"/>  <!-- 绘图引用 -->
</worksheet>
```

### 单元格 (`c`)

```xml
<c r="A1" s="1" t="s">  <!-- s: 样式索引, t: 类型 -->
  <v>0</v>
</c>
```

**类型 (t) 值**：
- `s` - 共享字符串
- `n` - 数字（默认）
- `b` - 布尔值
- `e` - 错误
- `str` - 内联字符串
- `inlineStr` - 富文本

### 绘图定位 (`xdr:twoCellAnchor`)

```xml
<xdr:twoCellAnchor>
  <xdr:from>
    <xdr:col>0</xdr:col>        <!-- 起始列 -->
    <xdr:colOff>0</xdr:colOff>  <!-- 列偏移 (EMU) -->
    <xdr:row>0</xdr:row>
    <xdr:rowOff>0</xdr:rowOff>
  </xdr:from>
  <xdr:to>
    <xdr:col>5</xdr:col>
    <xdr:colOff>0</xdr:colOff>
    <xdr:row>10</xdr:row>
    <xdr:rowOff>0</xdr:rowOff>
  </xdr:to>
  <xdr:sp>...</xdr:sp>           <!-- 形状 -->
  <!-- 或 -->
  <xdr:pic>...</xdr:pic>         <!-- 图片 -->
  <!-- 或 -->
  <xdr:graphicFrame>             <!-- 图表 -->
    <a:graphic>
      <a:graphicData>
        <c:chart r:id="rId1"/>
      </a:graphicData>
    </a:graphic>
  </xdr:graphicFrame>
</xdr:twoCellAnchor>
```

---

## 🎨 DrawingML 通用元素

### 变换 (`a:xfrm`)

```xml
<a:xfrm rot="2700000" flipH="1">  <!-- 旋转角度: 1/60000 度 -->
  <a:off x="914400" y="914400"/>  <!-- 偏移 (EMU) -->
  <a:ext cx="1828800" cy="914400"/>  <!-- 尺寸 (EMU) -->
</a:xfrm>
```

### 填充

```xml
<!-- 纯色填充 -->
<a:solidFill>
  <a:srgbClr val="FF0000">
    <a:alpha val="50000"/>  <!-- 透明度 50% -->
  </a:srgbClr>
</a:solidFill>

<!-- 主题颜色填充 -->
<a:solidFill>
  <a:schemeClr val="accent1">
    <a:tint val="50000"/>
    <a:satMod val="120000"/>
  </a:schemeClr>
</a:solidFill>

<!-- 渐变填充 -->
<a:gradFill rotWithShape="1">
  <a:gsLst>
    <a:gs pos="0">
      <a:srgbClr val="FF0000"/>
    </a:gs>
    <a:gs pos="100000">
      <a:srgbClr val="0000FF"/>
    </a:gs>
  </a:gsLst>
  <a:lin ang="5400000" scaled="1"/>  <!-- 角度 90° -->
</a:gradFill>

<!-- 图案填充 -->
<a:pattFill prst="pct10">
  <a:fgClr><a:srgbClr val="000000"/></a:fgClr>
  <a:bgClr><a:srgbClr val="FFFFFF"/></a:bgClr>
</a:pattFill>
```

### 线条 (`a:ln`)

```xml
<a:ln w="9525" cap="rnd" cmpd="sng">  <!-- 宽度 (EMU), 端点, 复合类型 -->
  <a:solidFill>
    <a:srgbClr val="000000"/>
  </a:solidFill>
  <a:prstDash val="dash"/>  <!-- 虚线类型 -->
  <a:headEnd type="arrow"/>
  <a:tailEnd type="triangle"/>
</a:ln>
```

### 效果 (`a:effectLst`)

```xml
<a:effectLst>
  <a:outerShdw blurRad="50800" dist="38100" dir="2700000">
    <a:srgbClr val="000000">
      <a:alpha val="40000"/>
    </a:srgbClr>
  </a:outerShdw>
  <a:reflection blurRad="6350" stA="52000" endA="300" endPos="35000"/>
  <a:glow rad="63500">
    <a:schemeClr val="accent1"/>
  </a:glow>
</a:effectLst>
```

### 预设形状 (`a:prstGeom`)

```xml
<a:prstGeom prst="rect">      <!-- 矩形 -->
  <a:avLst/>
</a:prstGeom>

<a:prstGeom prst="roundRect"> <!-- 圆角矩形 -->
  <a:avLst>
    <a:gd name="adj" fmla="val 16667"/>  <!-- 调整参数 -->
  </a:avLst>
</a:prstGeom>
```

**常用预设形状**：
- `rect`, `roundRect`, `ellipse`, `triangle`, `diamond`
- `rightArrow`, `leftArrow`, `upArrow`, `downArrow`
- `star4`, `star5`, `star6`
- `flowChartProcess`, `flowChartDecision`
- `line`, `straightConnector1`, `bentConnector3`

---

## 📈 图表元素

```xml
<c:chartSpace>
  <c:chart>
    <c:title>...</c:title>
    <c:plotArea>
      <c:layout>...</c:layout>
      <c:barChart>           <!-- 或 lineChart, pieChart, etc. -->
        <c:barDir val="col"/>
        <c:ser>
          <c:idx val="0"/>
          <c:order val="0"/>
          <c:tx>...</c:tx>   <!-- 系列名称 -->
          <c:cat>...</c:cat> <!-- 分类数据 -->
          <c:val>...</c:val> <!-- 数值数据 -->
          <c:spPr>...</c:spPr> <!-- 形状属性 -->
        </c:ser>
      </c:barChart>
      <c:catAx>...</c:catAx> <!-- 分类轴 -->
      <c:valAx>...</c:valAx> <!-- 数值轴 -->
    </c:plotArea>
    <c:legend>...</c:legend>
  </c:chart>
</c:chartSpace>
```

---

## 🔗 关系文件 (.rels)

```xml
<Relationships>
  <Relationship 
    Id="rId1" 
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
    Target="../media/image1.png"/>
  <Relationship
    Id="rId2"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart"
    Target="../charts/chart1.xml"/>
</Relationships>
```

---

## 📖 参考资源

1. **ECMA-376 规范**：[https://www.ecma-international.org/publications-and-standards/standards/ecma-376/](https://www.ecma-international.org/publications-and-standards/standards/ecma-376/)
2. **Office Open XML 在线浏览**：[http://officeopenxml.com/](http://officeopenxml.com/)
3. **项目 definitions 包**：`packages/definitions/` 包含类型定义
