/**
 * 形状几何图形类型定义
 */

/**
 * 形状调整参数接口
 * 用于控制形状的各种可调整属性，如箭头宽度、圆角半径等
 */
export interface ShapeAdjustment {
  /** 调整参数 1，通常表示主要尺寸比例 (0-100000) */
  adj1?: number;
  /** 调整参数 2，通常表示次要尺寸比例或角度 */
  adj2?: number;
  /** 调整参数 3，用于复杂形状的额外控制 */
  adj3?: number;
  /** 调整参数 4，用于复杂形状的额外控制 */
  adj4?: number;
  /** 调整参数 5，用于复杂形状的额外控制 */
  adj5?: number;
  /** 简化值，用于圆角等单一参数场景 */
  val?: number;
}

/**
 * 形状生成器函数类型
 * @param w - 形状宽度
 * @param h - 形状高度
 * @param adj - 可选的调整参数
 * @returns SVG 路径字符串
 */
export type ShapeGenerator = (w: number, h: number, adj?: ShapeAdjustment) => string;

/**
 * 形状生成器映射表类型
 */
export type ShapeGeneratorMap = Record<string, ShapeGenerator>;

/**
 * 连接器形状名称列表
 * 这些形状不应有填充色
 */
export const CONNECTOR_SHAPES = [
  'straightConnector1',
  'bentConnector2',
  'bentConnector3',
  'bentConnector4',
  'bentConnector5',
  'curvedConnector2',
  'curvedConnector3',
  'curvedConnector4',
  'curvedConnector5'
] as const;

/**
 * 判断是否为连接器形状
 * @param shapeName - 形状名称
 * @returns 是否为连接器
 */
export const isConnectorShape = (shapeName: string): boolean => {
  return CONNECTOR_SHAPES.includes(shapeName as (typeof CONNECTOR_SHAPES)[number]);
};
