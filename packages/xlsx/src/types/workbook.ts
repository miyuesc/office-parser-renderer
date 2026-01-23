/**
 * XLSX 工作簿与工作表相关类型定义
 */

import type { OfficeImage, OfficeShape, OfficeConnector } from '@ai-space/shared';
import type { OfficeChart, OfficeGroupShape } from './chart';
import type { XlsxRow, XlsxColumn, XlsxMergeCell } from './cell';
import type { XlsxStyles } from './styles';

/**
 * XLSX 工作簿接口
 */
export interface XlsxWorkbook {
  /** 工作表列表 */
  sheets: XlsxSheet[];
  /** 样式信息 */
  styles: XlsxStyles;
  /** 共享字符串表 */
  sharedStrings: string[];
  /** 主题信息 */
  theme?: XlsxTheme;
  /** 是否使用 1904 日期系统 */
  date1904?: boolean;
}

/**
 * XLSX 工作表接口
 */
export interface XlsxSheet {
  /** 工作表名称 */
  name: string;
  /** 关系 ID (r:id) */
  id: string;
  /** 可见状态 */
  state?: 'visible' | 'hidden' | 'veryHidden';
  /** 行数据（稀疏数组） */
  rows: Record<number, XlsxRow>;
  /** 合并单元格列表 */
  merges: XlsxMergeCell[];
  /** 列宽信息（范围） */
  cols: XlsxColumn[];
  /** 页边距 */
  pageMargins?: XlsxPageMargins;
  /** 页面设置 */
  pageSetup?: XlsxPageSetup;
  /** 页眉页脚 */
  headerFooter?: XlsxHeaderFooter;
  /** 绘图关系 ID (r:id) */
  drawingId?: string;
  /** 图片列表 */
  images?: OfficeImage[];
  /** 形状列表 */
  shapes?: OfficeShape[];
  /** 连接符列表 */
  connectors?: OfficeConnector[];
  /** 组合形状列表 */
  groupShapes?: OfficeGroupShape[];
  /** 图表列表 */
  charts?: OfficeChart[];
}

/**
 * XLSX 主题接口
 */
export interface XlsxTheme {
  /** 颜色方案（名称 -> RGB 值） */
  colorScheme: Record<string, string>;
}

/**
 * XLSX 页边距接口
 */
export interface XlsxPageMargins {
  /** 左边距 */
  left: number;
  /** 右边距 */
  right: number;
  /** 上边距 */
  top: number;
  /** 下边距 */
  bottom: number;
  /** 页眉边距 */
  header: number;
  /** 页脚边距 */
  footer: number;
}

/**
 * XLSX 页面设置接口
 */
export interface XlsxPageSetup {
  /** 纸张大小 */
  paperSize?: number;
  /** 纸张方向 */
  orientation?: 'default' | 'portrait' | 'landscape';
  /** 缩放比例 */
  scale?: number;
  /** 适合宽度页数 */
  fitToWidth?: number;
  /** 适合高度页数 */
  fitToHeight?: number;
}

/**
 * XLSX 页眉页脚接口
 */
export interface XlsxHeaderFooter {
  /** 奇数页页眉 */
  oddHeader?: string;
  /** 奇数页页脚 */
  oddFooter?: string;
  /** 偶数页页眉 */
  evenHeader?: string;
  /** 偶数页页脚 */
  evenFooter?: string;
  /** 首页页眉 */
  firstHeader?: string;
  /** 首页页脚 */
  firstFooter?: string;
  /** 与边距对齐 */
  alignWithMargins?: boolean;
  /** 首页不同 */
  differentFirst?: boolean;
  /** 奇偶页不同 */
  differentOddEven?: boolean;
}
