# Office Parser & Renderer 开发任务清单

此文档根据 [docs/DEVELOPING_GUIDE_ZH.md](file:///Users/miyuefe/MyGitHub/ai-space/officeParserRenderer/docs/DEVELOPING_GUIDE_ZH.md) 自动生成，用于追踪 Office Parser & Renderer 项目的开发进度。

## Phase 0: 基础设施 (Infrastructure & Commons)

- [ ] **Core 模块**
    - [ ] `core`: 日志系统 (Logger)
    - [ ] `core`: 单位转换 (EMU/Pt/Px/字符宽)
    - [ ] `core`: 颜色解析工具
    - [ ] `core`: Zip 解压与文件处理
- [ ] **Types 模块**
    - [ ] `types`: 公共类型定义与 Type Guards
- [ ] **Styles 模块**
    - [ ] `styles`: 文本/段落样式解析 (字号/字体/行距/对齐/缩进)
    - [ ] `styles`: 基础几何解析 (边框/填充/阴影)
    - [ ] `styles`: 边框冲突解决算法
- [ ] **Drawing 模块**
    - [ ] `drawing`: DrawingML 形状解析 (prstGeom/custGeom)
    - [ ] `drawing`: 图片处理 (裁剪/着色/透明度)
    - [ ] `drawing`: 变换系统 (2D 旋转/翻转/缩放)
    - [ ] `drawing`: 浮动定位引擎 (TwoCellAnchor/OneCellAnchor)
- [ ] **Fonts 模块**
    - [ ] `fonts`: 字体加载与管理
- [ ] **Rendering 模块**
    - [ ] `rendering`: 富文本渲染器 (字符级样式)
    - [ ] `rendering`: 数值格式化引擎 (numFmt)
    - [ ] `rendering`: ChartML 图表引擎 (基础图表/组合图/图表元素)
- [ ] **Performance 模块**
    - [ ] `performance`: Web Worker 封装 (线程池/任务调度)
    - [ ] `performance`: Document Fragment 工具 (批量 DOM 创建)
    - [ ] `performance`: Virtual Scroll 引擎 (通用虚拟滚动逻辑)
    - [ ] `performance`: OffscreenCanvas 封装
    - [ ] `performance`: 资源优化策略 (对象池/懒加载)

## Phase 1: Excel (XLSX)

- [ ] **Level 1: MVP - 基础数据展示**
    - [ ] 解析: Workbook 结构解析 (workbook.xml)
    - [ ] 解析: SharedStrings 字符串索引 (sharedStrings.xml)
    - [ ] 解析: Worksheet 单元格解析 (sheetX.xml, 稀疏矩阵)
    - [ ] 渲染: 基础网格布局 (dimension)
    - [ ] 渲染: 多 Sheet 切换 UI
- [ ] **Level 2: 基础样式还原**
    - [ ] 解析: styles.xml 深度解析 (索引复用)
    - [ ] 渲染: 单元格样式 (字体/填充/对齐/自动换行)
    - [ ] 渲染: 行列尺寸应用与单位换算
- [ ] **Level 3: 进阶布局与格式**
    - [ ] 解析: 合并单元格 (mergeCells)
    - [ ] 渲染: 合并单元格渲染与交互
    - [ ] 渲染: 数值格式化应用 (日期/货币/百分比)
    - [ ] 渲染: 冻结行列 (Freeze Panes)
- [ ] **Level 4: 高保真视觉**
    - [ ] 渲染: 复杂边框 (边框冲突解决)
    - [ ] 渲染: 富文本单元格 (Run Properties)
    - [ ] 解析: 图片与图形 (Drawings)
    - [ ] 渲染: 浮动定位图片渲染
- [ ] **Level 5: 核心逻辑与高级特性**
    - [ ] 解析/渲染: 公式预览 (读取缓存值)
    - [ ] 计算: 公式引擎 (可选)
    - [ ] 图表: ChartML 解析与渲染
    - [ ] 渲染: 条件格式 (数据条/色阶/图标集)

## Phase 2: Word (DOCX)

- [ ] **Level 1: MVP - 基础文本展示**
    - [ ] 解析: Document 结构解析 (document.xml)
    - [ ] 解析: 段落与文本解析 (w:p, w:r, w:t)
    - [ ] 渲染: 基础文本渲染
    - [ ] 渲染: 基础段落样式 (对齐、缩进)
- [ ] **Level 2: 基础样式还原**
    - [ ] 解析: styles.xml 样式解析 (段落/字符)
    - [ ] 渲染: 字符样式 (Run Properties)
    - [ ] 解析: numbering.xml 编号定义
    - [ ] 渲染: 列表渲染 (有序/无序/多级)
- [ ] **Level 3: 复杂内容支持**
    - [ ] 解析: 表格解析 (w:tbl, w:tr, w:tc)
    - [ ] 渲染: 表格渲染 (合并/边框)
    - [ ] 解析: 图片解析 (内联/浮动)
    - [ ] 渲染: 图片渲染 (文字环绕支持)
- [ ] **Level 4: 布局引擎 - 分页与分栏**
    - [ ] 布局: 纸张拆分 (分页逻辑)
    - [ ] 布局: 分节处理 (w:sectPr)
    - [ ] 布局: 分栏布局 (w:cols)
    - [ ] 渲染: 页眉页脚 (首页不同/奇偶页不同)
- [ ] **Level 5: 高级特性**
    - [ ] 高级: 数学公式 (m:oMath)
    - [ ] 高级: 修订记录 (Track Changes)
    - [ ] 高级: 批注 (Comments)
    - [ ] 高级: 艺术字 (WordArt)
    - [ ] 兼容: VML 矢量图

## Phase 3: PowerPoint (PPTX)

- [ ] **Level 1: MVP - 基础幻灯片展示**
    - [ ] 解析: Presentation 结构解析
    - [ ] 解析: Slide 内容解析 (slideX.xml)
    - [ ] 渲染: 基础 Slide 渲染 (背景色/尺寸)
    - [ ] 渲染: Slide 列表导航
- [ ] **Level 2: 基础元素渲染**
    - [ ] 解析: 形状 (p:sp, 文本框) 与样式
    - [ ] 渲染: 文本框渲染
    - [ ] 解析: 图片 (p:pic)
    - [ ] 渲染: 图片渲染
- [ ] **Level 3: 母版与布局继承**
    - [ ] 解析: Master Slide 解析
    - [ ] 解析: Layout Slide 解析
    - [ ] 渲染: 母版/布局继承机制
    - [ ] 渲染: 缩略图生成
- [ ] **Level 4: 动画引擎**
    - [ ] 解析: 动画时序解析 (p:timing)
    - [ ] 动画: 进入/退出/强调动画
    - [ ] 动画: 路径动画
    - [ ] 播放: 步骤播放控制 (On Click)
- [ ] **Level 5: 高级特性**
    - [ ] 多媒体: 视频嵌入与播放
    - [ ] 多媒体: 音频嵌入与播放
    - [ ] 高级: 切换效果 (Slide Transition)
    - [ ] 高级: 3D 形状与场景
    - [ ] 高级: SmartArt 渲染

## Phase 4: 高级视觉与极致细节 (Advanced Visuals)

- [ ] **3D 与特效**
    - [ ] 3D 场景与相机视角
    - [ ] 3D 材质与光照
    - [ ] 高级特效 (柔化边缘/发光/倒影)
- [ ] **复杂组合**
    - [ ] SmartArt 逻辑图表解析渲染
    - [ ] Group Shape 多层嵌套处理

## 验证与质量保证

- [ ] **测试体系**
    - [ ] 单元测试 (Vitest)
    - [ ] 集成测试
    - [ ] 视觉回归测试 (Visual Regression)
    - [ ] 性能测试 (Benchmark)
- [ ] **验收标准**
    - [ ] 建立 Badcase 库
    - [ ] Office 1:1 对比验收
