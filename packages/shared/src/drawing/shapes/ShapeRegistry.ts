import { ShapeGenerator, ShapeResult, isShapeResult } from './types';
import { GeoUtils } from './GeoUtils';
import { Rectangles } from './Rectangles';
import { SnipShapes } from './SnipShapes';
import { BasicShapes } from './BasicShapes';
import { Stars } from './Stars';
import { MathShapes } from './MathShapes';
import { Connectors } from './Connectors';
import { SpecialShapes } from './SpecialShapes';
import { ArrowShapes } from './ArrowShapes';
import { CalloutShapes } from './CalloutShapes';
import { FlowchartShapes } from './FlowchartShapes';
import { ActionShapes } from './ActionShapes';
import { DecorationShapes } from './DecorationShapes';

/**
 * 预设形状生成器注册表
 */
export const ShapeRegistry: Record<string, ShapeGenerator> = {
  ...Rectangles,
  ...SnipShapes,
  ...BasicShapes,
  ...Stars,
  ...MathShapes,
  ...Connectors,
  ...SpecialShapes,
  ...ArrowShapes,
  ...CalloutShapes,
  ...FlowchartShapes,
  ...ActionShapes,
  ...DecorationShapes
};

/**
 * 生成预设路径的返回结果
 */
export interface GeneratedPath {
  /** SVG 路径数据 */
  path: string;
  /** 是否禁止填充 */
  noFill: boolean;
}

/**
 * 根据预设名称生成路径数据
 * @param prst 预设形状名称
 * @param w 宽度 (px)
 * @param h 高度 (px)
 * @param adj 调整值映射 (可选)
 * @returns 路径数据和填充信息
 */
export function generatePresetPath(
  prst: string,
  w: number,
  h: number,
  adj?: Record<string, number>
): GeneratedPath | undefined {
  const generator = ShapeRegistry[prst];
  if (generator) {
    const result = generator(w, h, adj);
    if (isShapeResult(result)) {
      return {
        path: result.path,
        noFill: result.noFill ?? false
      };
    }
    return {
      path: result,
      noFill: false
    };
  }

  // 回退逻辑
  switch (prst) {
    case 'rect':
      return { path: GeoUtils.rect(0, 0, w, h), noFill: false };
    case 'line':
      return { path: `M 0 0 L ${w} ${h}`, noFill: true };
    default:
      return undefined;
  }
}

/**
 * 仅获取路径字符串 (向后兼容)
 */
export function generatePresetPathString(
  prst: string,
  w: number,
  h: number,
  adj?: Record<string, number>
): string | undefined {
  const result = generatePresetPath(prst, w, h, adj);
  return result?.path;
}
