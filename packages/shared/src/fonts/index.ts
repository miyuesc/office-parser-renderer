type FontFamily = {
  css_family: string;
  safe_css_family: string;
  type: string;
  category: string;
  description: string;
};

export const fonts: Record<string, FontFamily> = {
  微软雅黑: {
    css_family: 'Microsoft YaHei',
    safe_css_family:
      '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Sans-Serif',
    category: 'Modern Standard',
    description: 'Windows 现代标准中文字体，屏幕显示效果最佳。',
  },
  '微软雅黑 UI': {
    css_family: 'Microsoft YaHei UI',
    safe_css_family:
      '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei UI", "微软雅黑 UI", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Sans-Serif',
    category: 'UI Interface',
    description: '字间距比标准版略窄，专为 UI 界面设计。',
  },
  等线: {
    css_family: 'DengXian',
    safe_css_family: '"DengXian", "等线", "PingFang SC", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Sans-Serif',
    category: 'Office Modern',
    description: 'Office 2016+ 默认正文主题字体，较细。',
  },
  '等线 Light': {
    css_family: 'DengXian Light',
    safe_css_family:
      '"DengXian Light", "等线 Light", "PingFang SC", "Microsoft YaHei Light", "微软雅黑 Light", sans-serif',
    type: 'Sans-Serif',
    category: 'Office Modern',
    description: '细体版的等线。',
  },
  黑体: {
    css_family: 'SimHei',
    safe_css_family: '"Heiti SC", "SimHei", "黑体", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Sans-Serif',
    category: 'Legacy',
    description: '旧版 Windows 标准黑体，边缘较粗糙，仅作兼容使用。',
  },
  宋体: {
    css_family: 'SimSun',
    safe_css_family: '"Songti SC", "SimSun", "宋体", serif',
    type: 'Serif',
    category: 'Classic',
    description: 'Windows 最经典的衬线字体，适合正文印刷风格。',
  },
  新宋体: {
    css_family: 'NSimSun',
    safe_css_family: '"Songti SC", "NSimSun", "新宋体", "SimSun", "宋体", serif',
    type: 'Serif',
    category: 'Classic Monospace',
    description: '宋体的等宽版本。',
  },
  仿宋: {
    css_family: 'FangSong',
    safe_css_family:
      '"FangSong SC", "STFangsong", "FangSong", "仿宋", "FangSong_GB2312", "仿宋_GB2312", serif',
    type: 'Serif',
    category: 'Official Document',
    description: '公文标准字体。包含 GB2312 兼容名。',
  },
  楷体: {
    css_family: 'KaiTi',
    safe_css_family: '"Kaiti SC", "STKaiti", "KaiTi", "楷体", "KaiTi_GB2312", "楷体_GB2312", serif',
    type: 'Serif',
    category: 'Official Document',
    description: '教科书、公文标准字体。包含 GB2312 兼容名。',
  },
  微軟正黑體: {
    css_family: 'Microsoft JhengHei',
    safe_css_family: '"PingFang TC", "Microsoft JhengHei", "微軟正黑體", sans-serif',
    type: 'Sans-Serif',
    category: 'Traditional Chinese',
    description: '繁体版微软雅黑，Windows 繁体环境默认字体。',
  },
  '微軟正黑體 UI': {
    css_family: 'Microsoft JhengHei UI',
    safe_css_family:
      '"PingFang TC", "Microsoft JhengHei UI", "微軟正黑體 UI", "Microsoft JhengHei", "微軟正黑體", sans-serif',
    type: 'Sans-Serif',
    category: 'Traditional Chinese UI',
    description: '界面用繁体字。',
  },
  新細明體: {
    css_family: 'PMingLiU',
    safe_css_family: '"LiSong Pro", "PMingLiU", "新細明體", serif',
    type: 'Serif',
    category: 'Traditional Chinese',
    description: '繁体经典衬线体。',
  },
  細明體: {
    css_family: 'MingLiU',
    safe_css_family: '"LiSong Pro", "MingLiU", "細明體", serif',
    type: 'Serif',
    category: 'Traditional Chinese Monospace',
    description: '等宽版细明体。',
  },
  標楷體: {
    css_family: 'DFKai-SB',
    safe_css_family: '"BiauKai", "DFKai-SB", "標楷體", serif',
    type: 'Serif',
    category: 'Traditional Chinese',
    description: '台湾公文标准楷体。',
  },
  隶书: {
    css_family: 'LiSu',
    safe_css_family: '"LiSu", "隶书", "SimSun", "宋体", serif',
    type: 'Display',
    category: 'Art / Decorative',
    description: '扁平、古朴，常用于标题。',
  },
  幼圆: {
    css_family: 'YouYuan',
    safe_css_family: '"YouYuan", "幼圆", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Display',
    category: 'Art / Decorative',
    description: '笔画圆润，黑体的变种。',
  },
  华文细黑: {
    css_family: 'STXihei',
    safe_css_family: '"STXihei", "华文细黑", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Sans-Serif',
    category: 'Art / Decorative',
    description: '极细的黑体。',
  },
  华文楷体: {
    css_family: 'STKaiti',
    safe_css_family: '"STKaiti", "华文楷体", "KaiTi", "楷体", serif',
    type: 'Serif',
    category: 'Art / Decorative',
    description: '常用于排版，类似于 Office 楷体。',
  },
  华文宋体: {
    css_family: 'STSong',
    safe_css_family: '"STSong", "华文宋体", "SimSun", "宋体", serif',
    type: 'Serif',
    category: 'Art / Decorative',
    description: '常用于排版，类似于 Office 宋体。',
  },
  华文仿宋: {
    css_family: 'STFangsong',
    safe_css_family: '"STFangsong", "华文仿宋", "FangSong", "仿宋", serif',
    type: 'Serif',
    category: 'Art / Decorative',
    description: '常用于排版，类似于 Office 仿宋。',
  },
  华文彩云: {
    css_family: 'STCaiyun',
    safe_css_family: '"STCaiyun", "华文彩云", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Display',
    category: 'Art / Decorative',
    description: '双钩空心，极其夸张。缺失回退到黑体。',
  },
  华文琥珀: {
    css_family: 'STHupo',
    safe_css_family: '"STHupo", "华文琥珀", "Microsoft YaHei", "微软雅黑", sans-serif',
    type: 'Display',
    category: 'Art / Decorative',
    description: '笔画粗大重叠。缺失回退到黑体。',
  },
  华文隶书: {
    css_family: 'STLiti',
    safe_css_family: '"STLiti", "华文隶书", "LiSu", "隶书", "SimSun", "宋体", serif',
    type: 'Display',
    category: 'Art / Decorative',
    description: '书法感较强的隶书。缺失回退到隶书或宋体。',
  },
  华文行楷: {
    css_family: 'STXingkai',
    safe_css_family: '"STXingkai", "华文行楷", cursive, serif',
    type: 'Display',
    category: 'Calligraphy',
    description: '飘逸的手写书法风格。缺失回退到 cursive。',
  },
  华文新魏: {
    css_family: 'STXinwei',
    safe_css_family: '"STXinwei", "华文新魏", serif',
    type: 'Display',
    category: 'Calligraphy',
    description: '庄重、有力的魏碑风格。缺失回退到 serif。',
  },
};

export * from './FontManager';
