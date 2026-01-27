import { ST_ShapeType } from '@ai-space/definitions/dml-shapeGeometry';

/**
 * 预设几何形状类型，扩展自 ST_ShapeType
 */
export type PresetGeomType = keyof typeof ST_ShapeType | string;

/**
 * 形状生成器返回结果
 * 可以是单个路径字符串，或包含路径和元数据的对象
 */
export interface ShapeResult {
  /** SVG 路径数据 (d 属性) - 主路径，通常需要填充 */
  path: string;
  /** 是否禁止填充 (用于连接线、标注线等开放路径) */
  noFill?: boolean;
  /** 辅助描边路径 (用于 callout 指示线等只需描边的部分) */
  strokePath?: string;
}

/**
 * 形状生成器函数定义
 * @param w 宽度 (px)
 * @param h 高度 (px)
 * @param adj 调整值 (100000 为 100%)
 * @returns 路径字符串或 ShapeResult 对象
 */
export type ShapeGenerator = (
  w: number,
  h: number,
  adj?: Record<string, number>,
) => string | ShapeResult;

/**
 * 判断返回结果是否为 ShapeResult 对象
 */
export function isShapeResult(result: string | ShapeResult): result is ShapeResult {
  return typeof result === 'object' && 'path' in result;
}
