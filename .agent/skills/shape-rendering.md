---
name: 形状渲染完整参考
description: DrawingML 形状、线条、填充、效果的完整渲染参考，包括复合线、虚线、渐变、阴影等
trigger: context
---

# 形状渲染完整参考

## � 形状属性结构 (a:spPr)

形状属性是 DrawingML 中最核心的概念，定义了形状的几何、填充、线条、效果等。

```xml
<a:spPr>
  <a:xfrm rot="5400000" flipH="1">        <!-- 变换 -->
    <a:off x="914400" y="914400"/>        <!-- 偏移 -->
    <a:ext cx="1828800" cy="914400"/>     <!-- 尺寸 -->
  </a:xfrm>
  <a:prstGeom prst="roundRect">           <!-- 预设几何 -->
    <a:avLst>...</a:avLst>
  </a:prstGeom>
  <a:solidFill>...</a:solidFill>          <!-- 填充 -->
  <a:ln>...</a:ln>                         <!-- 线条 -->
  <a:effectLst>...</a:effectLst>          <!-- 效果 -->
</a:spPr>
```

---

## �🔷 预设形状类型

### 基本形状

| 预设名称 | 说明 | 调整参数 |
|----------|------|----------|
| `rect` | 矩形 | - |
| `roundRect` | 圆角矩形 | `adj` (圆角半径) |
| `snip1Rect` | 单角剪切矩形 | `adj` |
| `snip2DiagRect` | 对角剪切矩形 | `adj1`, `adj2` |
| `snipRoundRect` | 剪切圆角矩形 | `adj1`, `adj2` |
| `round1Rect` | 单角圆角矩形 | `adj1`, `adj2` |
| `round2DiagRect` | 对角圆角矩形 | `adj1`, `adj2` |
| `ellipse` | 椭圆 | - |
| `triangle` | 三角形 | `adj` (顶点位置) |
| `rtTriangle` | 直角三角形 | - |
| `parallelogram` | 平行四边形 | `adj` |
| `trapezoid` | 梯形 | `adj` |
| `diamond` | 菱形 | - |
| `pentagon` | 五边形 | - |
| `hexagon` | 六边形 | `adj`, `vf` |
| `heptagon` | 七边形 | - |
| `octagon` | 八边形 | `adj` |
| `decagon` | 十边形 | - |
| `dodecagon` | 十二边形 | - |

### 箭头形状

| 预设名称 | 说明 | 调整参数 |
|----------|------|----------|
| `rightArrow` | 右箭头 | `adj1`, `adj2` |
| `leftArrow` | 左箭头 | `adj1`, `adj2` |
| `upArrow` | 上箭头 | `adj1`, `adj2` |
| `downArrow` | 下箭头 | `adj1`, `adj2` |
| `leftRightArrow` | 左右箭头 | `adj1`, `adj2` |
| `upDownArrow` | 上下箭头 | `adj1`, `adj2` |
| `quadArrow` | 四向箭头 | `adj1`, `adj2`, `adj3` |
| `curvedRightArrow` | 弧形右箭头 | `adj1`, `adj2`, `adj3` |
| `chevron` | V形箭头 | `adj` |
| `homePlate` | 五边形箭头 | `adj` |
| `notchedRightArrow` | 缺口箭头 | `adj1`, `adj2` |
| `stripedRightArrow` | 条纹箭头 | `adj1`, `adj2` |

### 星形和标注

| 预设名称 | 说明 | 调整参数 |
|----------|------|----------|
| `star4` | 四角星 | `adj` |
| `star5` | 五角星 | `adj`, `hf`, `vf` |
| `star6` | 六角星 | `adj`, `hf`, `vf` |
| `star7` | 七角星 | `adj`, `hf`, `vf` |
| `star8` | 八角星 | `adj` |
| `star10` | 十角星 | `adj`, `hf`, `vf` |
| `star12` | 十二角星 | `adj` |
| `star16` | 十六角星 | `adj` |
| `star24` | 二十四角星 | `adj` |
| `star32` | 三十二角星 | `adj` |
| `irregularSeal1` | 爆炸形1 | - |
| `irregularSeal2` | 爆炸形2 | - |

### 流程图形状

| 预设名称 | 说明 |
|----------|------|
| `flowChartProcess` | 处理 (矩形) |
| `flowChartAlternateProcess` | 替代处理 (圆角矩形) |
| `flowChartDecision` | 判断 (菱形) |
| `flowChartInputOutput` | 数据 (平行四边形) |
| `flowChartPredefinedProcess` | 预定义处理 |
| `flowChartInternalStorage` | 内部存储 |
| `flowChartDocument` | 文档 |
| `flowChartMultidocument` | 多文档 |
| `flowChartTerminator` | 终结符 (跑道形) |
| `flowChartPreparation` | 准备 (六边形) |
| `flowChartManualInput` | 手动输入 |
| `flowChartManualOperation` | 手动操作 |
| `flowChartConnector` | 连接符 (圆形) |
| `flowChartOffpageConnector` | 离页连接符 |
| `flowChartPunchedCard` | 卡片 |
| `flowChartPunchedTape` | 纸带 |
| `flowChartSummingJunction` | 汇总连接 |
| `flowChartOr` | 或 |
| `flowChartCollate` | 对照 |
| `flowChartSort` | 排序 |
| `flowChartExtract` | 提取 |
| `flowChartMerge` | 合并 |
| `flowChartOnlineStorage` | 联机存储 |
| `flowChartDelay` | 延迟 |
| `flowChartMagneticTape` | 顺序访问存储 |
| `flowChartMagneticDisk` | 磁盘 |
| `flowChartMagneticDrum` | 直接访问存储 |
| `flowChartDisplay` | 显示 |

### 标注形状

| 预设名称 | 说明 |
|----------|------|
| `wedgeRectCallout` | 矩形标注 |
| `wedgeRoundRectCallout` | 圆角矩形标注 |
| `wedgeEllipseCallout` | 椭圆标注 |
| `cloudCallout` | 云形标注 |
| `borderCallout1` | 带边框标注1 |
| `borderCallout2` | 带边框标注2 |
| `borderCallout3` | 带边框标注3 |
| `accentCallout1` | 强调标注1 |
| `accentCallout2` | 强调标注2 |
| `accentCallout3` | 强调标注3 |
| `callout1` | 线形标注1 |
| `callout2` | 线形标注2 |
| `callout3` | 线形标注3 |

### 连接符

| 预设名称 | 说明 |
|----------|------|
| `line` | 直线 |
| `straightConnector1` | 直线连接符 |
| `bentConnector2` | 肘形连接符 (1个弯角) |
| `bentConnector3` | 肘形连接符 (2个弯角) |
| `bentConnector4` | 肘形连接符 (3个弯角) |
| `bentConnector5` | 肘形连接符 (4个弯角) |
| `curvedConnector2` | 曲线连接符 (1个弯角) |
| `curvedConnector3` | 曲线连接符 (2个弯角) |
| `curvedConnector4` | 曲线连接符 (3个弯角) |
| `curvedConnector5` | 曲线连接符 (4个弯角) |

---

## � 填充类型 (Fill)

### 填充类型概览

| 填充类型 | XML 元素 | 说明 |
|----------|----------|------|
| 无填充 | `a:noFill` | 透明 |
| 纯色填充 | `a:solidFill` | 单一颜色 |
| 渐变填充 | `a:gradFill` | 线性/径向渐变 |
| 图案填充 | `a:pattFill` | 预设图案 |
| 图片填充 | `a:blipFill` | 图片作为填充 |

### 1. 纯色填充 (solidFill)

```xml
<a:solidFill>
  <a:srgbClr val="FF0000">
    <a:alpha val="50000"/>    <!-- 透明度 50% -->
  </a:srgbClr>
</a:solidFill>

<!-- 或使用主题颜色 -->
<a:solidFill>
  <a:schemeClr val="accent1">
    <a:tint val="40000"/>     <!-- 变亮 40% -->
    <a:satMod val="120000"/>  <!-- 饱和度 120% -->
  </a:schemeClr>
</a:solidFill>
```

### 2. 渐变填充 (gradFill)

#### 渐变类型

| 类型 | XML 元素 | 说明 |
|------|----------|------|
| 线性渐变 | `a:lin` | 沿直线方向渐变 |
| 路径渐变 | `a:path` | 沿路径方向渐变 |

#### 路径渐变形状 (a:path/@path)

| 值 | 说明 |
|----|------|
| `shape` | 形状渐变 |
| `rect` | 矩形渐变 |
| `circle` | 圆形渐变 |

```xml
<!-- 线性渐变 -->
<a:gradFill rotWithShape="1">
  <a:gsLst>
    <a:gs pos="0">                     <!-- 位置 0% -->
      <a:srgbClr val="FF0000"/>
    </a:gs>
    <a:gs pos="50000">                 <!-- 位置 50% -->
      <a:srgbClr val="FFFF00"/>
    </a:gs>
    <a:gs pos="100000">                <!-- 位置 100% -->
      <a:srgbClr val="00FF00"/>
    </a:gs>
  </a:gsLst>
  <a:lin ang="5400000" scaled="1"/>    <!-- 角度 90° (向下) -->
</a:gradFill>

<!-- 路径渐变（径向） -->
<a:gradFill>
  <a:gsLst>
    <a:gs pos="0"><a:srgbClr val="FFFFFF"/></a:gs>
    <a:gs pos="100000"><a:srgbClr val="000000"/></a:gs>
  </a:gsLst>
  <a:path path="circle">               <!-- 圆形渐变 -->
    <a:fillToRect l="50000" t="50000" r="50000" b="50000"/>
  </a:path>
</a:gradFill>
```

#### 渐变角度参考

| 角度值 | 实际角度 | 方向 |
|--------|----------|------|
| 0 | 0° | 从左到右 |
| 2700000 | 45° | 左上到右下 |
| 5400000 | 90° | 从上到下 |
| 8100000 | 135° | 右上到左下 |
| 10800000 | 180° | 从右到左 |
| 13500000 | 225° | 右下到左上 |
| 16200000 | 270° | 从下到上 |
| 18900000 | 315° | 左下到右上 |

### 3. 图案填充 (pattFill)

```xml
<a:pattFill prst="pct10">              <!-- 10% 点阵 -->
  <a:fgClr><a:srgbClr val="000000"/></a:fgClr>  <!-- 前景色 -->
  <a:bgClr><a:srgbClr val="FFFFFF"/></a:bgClr>  <!-- 背景色 -->
</a:pattFill>
```

#### 常用图案类型 (prst)

| 值 | 说明 | 值 | 说明 |
|----|------|----|------|
| `pct5` | 5% | `pct10` | 10% |
| `pct20` | 20% | `pct25` | 25% |
| `pct30` | 30% | `pct40` | 40% |
| `pct50` | 50% | `pct60` | 60% |
| `pct70` | 70% | `pct75` | 75% |
| `pct80` | 80% | `pct90` | 90% |
| `horz` | 水平线 | `vert` | 垂直线 |
| `ltHorz` | 浅色水平线 | `ltVert` | 浅色垂直线 |
| `dkHorz` | 深色水平线 | `dkVert` | 深色垂直线 |
| `narHorz` | 窄水平线 | `narVert` | 窄垂直线 |
| `dashHorz` | 虚线水平 | `dashVert` | 虚线垂直 |
| `cross` | 十字 | `dnDiag` | 右下斜线 |
| `upDiag` | 右上斜线 | `diagCross` | 斜十字 |
| `ltDnDiag` | 浅色右下斜线 | `ltUpDiag` | 浅色右上斜线 |
| `dkDnDiag` | 深色右下斜线 | `dkUpDiag` | 深色右上斜线 |
| `wdDnDiag` | 宽右下斜线 | `wdUpDiag` | 宽右上斜线 |
| `dashDnDiag` | 虚线右下斜线 | `dashUpDiag` | 虚线右上斜线 |
| `diagBrick` | 斜砖块 | `horzBrick` | 水平砖块 |
| `weave` | 编织 | `plaid` | 格子呢 |
| `divot` | 草皮 | `dotGrid` | 点网格 |
| `dotDmnd` | 点菱形 | `shingle` | 鹅卵石 |
| `trellis` | 棚架 | `sphere` | 球体 |
| `smGrid` | 小网格 | `lgGrid` | 大网格 |
| `smCheck` | 小棋盘格 | `lgCheck` | 大棋盘格 |
| `openDmnd` | 空心菱形 | `solidDmnd` | 实心菱形 |

---

## ✏️ 线条样式 (a:ln)

### 线条属性概览

```xml
<a:ln w="12700" cap="rnd" cmpd="dbl" algn="ctr">
  <a:solidFill>...</a:solidFill>       <!-- 或 gradFill -->
  <a:prstDash val="dash"/>             <!-- 虚线类型 -->
  <a:round/>                            <!-- 连接方式 -->
  <a:headEnd type="arrow" w="med" len="med"/>   <!-- 起始箭头 -->
  <a:tailEnd type="triangle" w="lg" len="lg"/>  <!-- 结束箭头 -->
</a:ln>
```

### 线宽 (w)

线宽单位为 EMU（English Metric Unit）。

| 常用值 | 点数 | 说明 |
|--------|------|------|
| 6350 | 0.5pt | 极细 |
| 9525 | 0.75pt | 细 |
| 12700 | 1pt | 标准 |
| 19050 | 1.5pt | 中粗 |
| 25400 | 2pt | 粗 |
| 38100 | 3pt | 较粗 |
| 50800 | 4pt | 更粗 |
| 76200 | 6pt | 很粗 |

### 复合类型 (cmpd)

| 值 | 说明 | CSS 模拟 |
|----|------|----------|
| `sng` | 单线 | 普通边框 |
| `dbl` | 双线 | `border-style: double` |
| `thickThin` | 由粗到细 | 需自定义 |
| `thinThick` | 由细到粗 | 需自定义 |
| `tri` | 三线 | 需自定义 |

```xml
<a:ln w="38100" cmpd="dbl">  <!-- 3pt 双线 -->
  <a:solidFill><a:srgbClr val="000000"/></a:solidFill>
</a:ln>
```

### 虚线类型 (a:prstDash/@val)

| 值 | 说明 | CSS stroke-dasharray |
|----|------|---------------------|
| `solid` | 实线 | 无 |
| `dot` | 圆点 | `1, 2` |
| `sysDot` | 方点 | `1, 1` |
| `dash` | 短划线 | `4, 3` |
| `sysDash` | 系统短划线 | `3, 1` |
| `lgDash` | 长划线 | `8, 3` |
| `dashDot` | 点划线 | `4, 3, 1, 3` |
| `lgDashDot` | 长点划线 | `8, 3, 1, 3` |
| `lgDashDotDot` | 长双点划线 | `8, 3, 1, 3, 1, 3` |

```xml
<a:ln w="12700">
  <a:solidFill><a:srgbClr val="000000"/></a:solidFill>
  <a:prstDash val="lgDashDot"/>  <!-- 长点划线 -->
</a:ln>
```

### 自定义虚线 (a:custDash)

```xml
<a:ln w="12700">
  <a:solidFill><a:srgbClr val="000000"/></a:solidFill>
  <a:custDash>
    <a:ds d="200000" sp="100000"/>  <!-- 划线长度 / 间隔 -->
    <a:ds d="100000" sp="100000"/>
  </a:custDash>
</a:ln>
```

### 线帽样式 (cap)

| 值 | 说明 | CSS stroke-linecap |
|----|------|-------------------|
| `rnd` | 圆形 | `round` |
| `sq` | 方形 | `square` |
| `flat` | 平头 | `butt` |

### 连接方式 (join)

```xml
<a:round/>   <!-- 圆形连接 - stroke-linejoin: round -->
<a:bevel/>   <!-- 斜角连接 - stroke-linejoin: bevel -->
<a:miter lim="800000"/>  <!-- 尖角连接 - stroke-linejoin: miter -->
```

### 箭头类型 (headEnd/tailEnd)

#### 箭头形状类型 (@type)

| 值 | 说明 |
|----|------|
| `none` | 无箭头 |
| `triangle` | 三角形 (实心) |
| `stealth` | 隐形箭头 (凹进) |
| `diamond` | 菱形 |
| `oval` | 椭圆 |
| `arrow` | 开放箭头 (线条) |

#### 箭头大小 (@w, @len)

| 值 | 说明 |
|----|------|
| `sm` | 小 |
| `med` | 中 |
| `lg` | 大 |

```xml
<a:headEnd type="oval" w="lg" len="lg"/>     <!-- 大椭圆起始 -->
<a:tailEnd type="triangle" w="med" len="sm"/> <!-- 中宽小长三角形结束 -->
```

### 渐变线条

```xml
<a:ln w="25400">
  <a:gradFill>
    <a:gsLst>
      <a:gs pos="0"><a:srgbClr val="FF0000"/></a:gs>
      <a:gs pos="100000"><a:srgbClr val="0000FF"/></a:gs>
    </a:gsLst>
    <a:lin ang="0"/>  <!-- 沿线条方向渐变 -->
  </a:gradFill>
  <a:prstDash val="solid"/>
</a:ln>
```

---

## ✨ 效果 (a:effectLst)

### 效果类型概览

| 效果 | XML 元素 | 说明 |
|------|----------|------|
| 外阴影 | `a:outerShdw` | 形状外部的阴影 |
| 内阴影 | `a:innerShdw` | 形状内部的阴影 |
| 发光 | `a:glow` | 形状周围的光晕 |
| 反射 | `a:reflection` | 镜像反射效果 |
| 柔化边缘 | `a:softEdge` | 边缘模糊 |
| 预设阴影 | `a:prstShdw` | 预定义阴影样式 |

### 外阴影 (outerShdw)

```xml
<a:outerShdw 
  blurRad="50800"         <!-- 模糊半径 (EMU) -->
  dist="38100"            <!-- 偏移距离 (EMU) -->
  dir="2700000"           <!-- 方向 (角度) = 45° -->
  sx="100000"             <!-- X 缩放 100% -->
  sy="100000"             <!-- Y 缩放 100% -->
  kx="0"                  <!-- X 倾斜 -->
  ky="0"                  <!-- Y 倾斜 -->
  algn="bl"               <!-- 对齐: bl(左下), ctr(中心), etc -->
  rotWithShape="0">       <!-- 是否随形状旋转 -->
  <a:srgbClr val="000000">
    <a:alpha val="40000"/> <!-- 透明度 40% -->
  </a:srgbClr>
</a:outerShdw>
```

#### 阴影方向参考

| dir 值 | 角度 | 方向描述 |
|--------|------|----------|
| 0 | 0° | 右 |
| 2700000 | 45° | 右下 |
| 5400000 | 90° | 下 |
| 8100000 | 135° | 左下 |
| 10800000 | 180° | 左 |
| 13500000 | 225° | 左上 |
| 16200000 | 270° | 上 |
| 18900000 | 315° | 右上 |

### 内阴影 (innerShdw)

```xml
<a:innerShdw 
  blurRad="63500" 
  dist="50800" 
  dir="2700000">
  <a:srgbClr val="000000">
    <a:alpha val="50000"/>
  </a:srgbClr>
</a:innerShdw>
```

### 发光 (glow)

```xml
<a:glow rad="101600">     <!-- 发光半径 (EMU) -->
  <a:schemeClr val="accent1">
    <a:alpha val="60000"/>
  </a:schemeClr>
</a:glow>
```

### 反射 (reflection)

```xml
<a:reflection 
  blurRad="6350"          <!-- 模糊 -->
  stA="52000"             <!-- 起始透明度 52% -->
  endA="300"              <!-- 结束透明度 0.3% -->
  endPos="35000"          <!-- 结束位置 35% -->
  dist="0"                <!-- 偏移距离 -->
  dir="5400000"           <!-- 方向 -->
  fadeDir="5400000"       <!-- 渐隐方向 -->
  sy="-100000"            <!-- Y 缩放 -100% (镜像) -->
  algn="bl"               <!-- 对齐 -->
  rotWithShape="0"/>
```

### 柔化边缘 (softEdge)

```xml
<a:softEdge rad="63500"/>  <!-- 模糊半径 (EMU) -->
```

### 预设阴影 (prstShdw)

```xml
<a:prstShdw 
  prst="shdw14"           <!-- 预设阴影编号 -->
  dist="38100"
  dir="2700000">
  <a:srgbClr val="000000">
    <a:alpha val="50000"/>
  </a:srgbClr>
</a:prstShdw>
```

---

## 🔄 变换 (a:xfrm)

```xml
<a:xfrm rot="5400000" flipH="1" flipV="0">
  <a:off x="914400" y="457200"/>      <!-- 偏移位置 (EMU) -->
  <a:ext cx="2743200" cy="1828800"/>  <!-- 尺寸 (EMU) -->
  <a:chOff x="0" y="0"/>              <!-- 子元素偏移 -->
  <a:chExt cx="2743200" cy="1828800"/><!-- 子元素尺寸 -->
</a:xfrm>
```

| 属性 | 说明 | 单位 |
|------|------|------|
| `rot` | 旋转角度 | 1/60000 度 |
| `flipH` | 水平翻转 | 0/1 |
| `flipV` | 垂直翻转 | 0/1 |

### 旋转角度转换

```typescript
// OOXML 角度 → CSS 角度
const cssRotation = ooxmlRotation / 60000;
// 例: 5400000 → 90°

// CSS transform
element.style.transform = `rotate(${cssRotation}deg)`;
```

---

## 📐 自定义几何 (a:custGeom)

```xml
<a:custGeom>
  <a:avLst>                           <!-- 调整参数 -->
    <a:gd name="adj1" fmla="val 50000"/>
  </a:avLst>
  <a:gdLst>                           <!-- 引导公式 -->
    <a:gd name="x1" fmla="*/ w adj1 100000"/>
  </a:gdLst>
  <a:ahLst/>                          <!-- 调整手柄 -->
  <a:cxnLst/>                         <!-- 连接点 -->
  <a:rect l="0" t="0" r="w" b="h"/>   <!-- 文本框 -->
  <a:pathLst>
    <a:path w="21600" h="21600">      <!-- 路径，坐标系 -->
      <a:moveTo><a:pt x="0" y="0"/></a:moveTo>
      <a:lnTo><a:pt x="21600" y="0"/></a:lnTo>
      <a:lnTo><a:pt x="21600" y="21600"/></a:lnTo>
      <a:cubicBezTo>
        <a:pt x="16200" y="21600"/>
        <a:pt x="10800" y="10800"/>
        <a:pt x="0" y="0"/>
      </a:cubicBezTo>
      <a:close/>
    </a:path>
  </a:pathLst>
</a:custGeom>
```

### 路径命令

| 元素 | SVG 等价 | 参数 | 说明 |
|------|----------|------|------|
| `a:moveTo` | M | 1 个点 | 移动到点 |
| `a:lnTo` | L | 1 个点 | 直线到点 |
| `a:cubicBezTo` | C | 3 个点 | 三次贝塞尔曲线 |
| `a:quadBezTo` | Q | 2 个点 | 二次贝塞尔曲线 |
| `a:arcTo` | A | 多个属性 | 椭圆弧 |
| `a:close` | Z | 无 | 闭合路径 |

### arcTo 特殊格式

```xml
<a:arcTo wR="10800" hR="10800" stAng="0" swAng="5400000"/>
<!-- wR/hR: 椭圆半径, stAng: 起始角度, swAng: 扫描角度 -->
```

---

## 🛠️ TypeScript 类型定义

项目中的相关类型定义位于 `packages/shared/src/drawing/types.ts`：

```typescript
// 填充类型
interface OfficeFill {
  type: 'solid' | 'gradient' | 'pattern' | 'none';
  color?: string;
  gradient?: OfficeGradient;
  pattern?: OfficePattern;
  opacity?: number;
}

// 渐变类型
interface OfficeGradient {
  type: 'linear' | 'path';
  angle?: number;
  path?: string;
  stops: Array<{ position: number; color: string }>;
}

// 线条类型
interface OfficeStroke {
  type?: 'solid' | 'gradient' | 'pattern' | 'noFill';
  width?: number;
  color?: string;
  gradient?: OfficeGradient;
  dashStyle?: string;
  headEnd?: { type: string; w?: string; len?: string };
  tailEnd?: { type: string; w?: string; len?: string };
  join?: 'round' | 'bevel' | 'miter';
  cap?: 'rnd' | 'sq' | 'flat';
  compound?: 'sng' | 'dbl' | 'thickThin' | 'thinThick' | 'tri';
}

// 效果类型
interface OfficeEffect {
  type: 'outerShadow' | 'innerShadow' | 'glow' | 'reflection' | 'softEdge';
  blur?: number;
  dist?: number;
  dir?: number;
  color?: string;
  alpha?: number;
  radius?: number;
  // ... 更多属性
}
```

---

## � 相关文件

| 文件 | 说明 |
|------|------|
| `packages/shared/src/drawing/types.ts` | 类型定义 |
| `packages/shared/src/drawing/parsers/FillParser.ts` | 填充解析 |
| `packages/shared/src/drawing/parsers/ShapePropertiesParser.ts` | 形状属性解析 |
| `packages/shared/src/drawing/parsers/EffectParser.ts` | 效果解析 |
| `packages/shared/src/drawing/parsers/ColorParser.ts` | 颜色解析 |
| `packages/shared/src/drawing/parsers/CustomGeometryParser.ts` | 自定义几何解析 |
| `packages/shared/src/drawing/renderers/ShapeRenderer.ts` | 形状渲染 |
| `packages/shared/src/drawing/shapes/ShapeRegistry.ts` | 预设形状注册表 |
| `packages/shared/src/drawing/shapes/BasicShapes.ts` | 基本形状路径 |
| `packages/shared/src/drawing/shapes/ArrowShapes.ts` | 箭头形状路径 |
| `packages/shared/src/drawing/shapes/FlowchartShapes.ts` | 流程图形状路径 |
| `packages/shared/src/drawing/shapes/Stars.ts` | 星形路径 |
| `packages/shared/src/drawing/shapes/Connectors.ts` | 连接符路径 |
