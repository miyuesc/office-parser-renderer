/**
 * XLSX 图表相关类型定义
 */

import { OfficeShape, OfficeImage, OfficeConnector, OfficeAnchor } from '@ai-space/shared';

/**
 * Office 组合形状接口
 */
export interface OfficeGroupShape {
  /** 唯一标识符 */
  id: string;
  /** 组合名称 */
  name?: string;
  /** 旋转角度 */
  rotation?: number;
  /** 水平翻转 */
  flipH?: boolean;
  /** 垂直翻转 */
  flipV?: boolean;
  /** 锚点信息 */
  anchor: OfficeAnchor;
  /** 子形状列表 */
  shapes: OfficeShape[];
  /** 子图片列表 */
  images: OfficeImage[];
  /** 子连接符列表 */
  connectors: OfficeConnector[];
  /** 子组合列表 */
  groups: OfficeGroupShape[];
}

/**
 * 图表系列数据
 */
export interface ChartSeries {
  /** 系列索引 */
  index: number;
  /** 系列名称 */
  name?: string;
  /** 分类数据 (X轴标签) */
  categories: string[];
  /** 数值数据 (Y轴值) */
  values: number[];
  /** 填充颜色 */
  fillColor?: string;
}

/**
 * 图表数据
 */
export interface OfficeChart {
  /** 图表 ID */
  id: string;
  /** 图表类型 */
  type: 'barChart' | 'pieChart' | 'pie3DChart' | 'lineChart' | 'areaChart' | 'scatterChart' | 'other';
  /** 图表标题 */
  title?: string;
  /** 数据系列 */
  series: ChartSeries[];
  /** 柱状图方向 (barChart only) */
  barDirection?: 'col' | 'bar';
  /** 柱状图分组方式 */
  grouping?: 'clustered' | 'stacked' | 'percentStacked';
  /** 锚点信息 */
  anchor: any;
}
