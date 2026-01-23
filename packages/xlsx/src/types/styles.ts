/**
 * XLSX 样式相关类型定义
 */

/**
 * XLSX 样式集接口
 */
export interface XlsxStyles {
  /** 字体列表 */
  fonts: XlsxFont[];
  /** 填充列表 */
  fills: XlsxFill[];
  /** 边框列表 */
  borders: XlsxBorder[];
  /** 单元格格式列表 */
  cellXfs: XlsxCellXf[];
  /** 数字格式映射（ID -> 格式代码） */
  numFmts: Record<number, string>;
}

/**
 * XLSX 字体接口
 */
export interface XlsxFont {
  /** 字号 */
  sz: number;
  /** 字体名称 */
  name: string;
  /** 字体家族 */
  family?: number;
  /** 字符集 */
  charset?: number;
  /** 粗体 */
  b?: boolean;
  /** 斜体 */
  i?: boolean;
  /** 下划线（布尔值或下划线类型） */
  u?: boolean | string;
  /** 删除线 */
  strike?: boolean;
  /** 颜色 */
  color?: XlsxColor;
}

/**
 * XLSX 填充接口
 */
export interface XlsxFill {
  /** 图案类型 */
  patternType?: string;
  /** 前景色 */
  fgColor?: XlsxColor;
  /** 背景色 */
  bgColor?: XlsxColor;
}

/**
 * XLSX 边框接口
 */
export interface XlsxBorder {
  /** 左边框 */
  left?: XlsxBorderSide;
  /** 右边框 */
  right?: XlsxBorderSide;
  /** 上边框 */
  top?: XlsxBorderSide;
  /** 下边框 */
  bottom?: XlsxBorderSide;
  /** 对角线边框 */
  diagonal?: XlsxBorderSide;
}

/**
 * XLSX 边框边接口
 */
export interface XlsxBorderSide {
  /** 边框样式 */
  style: string;
  /** 边框颜色 */
  color?: XlsxColor;
}

/**
 * XLSX 单元格格式接口
 */
export interface XlsxCellXf {
  /** 字体索引 */
  fontId: number;
  /** 填充索引 */
  fillId: number;
  /** 边框索引 */
  borderId: number;
  /** 数字格式索引 */
  numFmtId: number;
  /** 父格式索引 */
  xfId?: number;
  /** 是否应用对齐 */
  applyAlignment?: boolean;
  /** 对齐设置 */
  alignment?: {
    /** 水平对齐 */
    horizontal?: 'general' | 'left' | 'center' | 'right' | 'fill' | 'justify' | 'centerContinuous' | 'distributed';
    /** 垂直对齐 */
    vertical?: 'top' | 'center' | 'bottom' | 'justify' | 'distributed';
    /** 自动换行 */
    wrapText?: boolean;
    /**  缩进 */
    indent?: number;
    /** 文本旋转角度 */
    textRotation?: number;
  };
}

/**
 * XLSX 颜色接口
 */
export interface XlsxColor {
  /** 自动颜色 */
  auto?: boolean;
  /** RGB 颜色（ARGB 十六进制） */
  rgb?: string;
  /** 主题颜色索引 */
  theme?: number;
  /** 色调调整 */
  tint?: number;
  /** 索引颜色 */
  indexed?: number;
}
