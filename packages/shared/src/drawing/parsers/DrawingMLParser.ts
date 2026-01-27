/**
 * DrawingML 解析器门面类
 *
 * 提供 OOXML DrawingML 元素解析的统一入口，
 * 内部委托给各专用解析器处理
 */
import { OfficeFill, OfficeStroke, OfficeTextBody, OfficeEffect, OfficeStyle } from '../types';
import { TextBodyParser } from './TextBodyParser';
import { ShapeStyleParser } from './ShapeStyleParser';
import { ShapePropertiesParser } from './ShapePropertiesParser';
import { sharedLogger } from '../../core/utils/Logger';

const log = sharedLogger.createTagged('DrawingMLParser');

export class DrawingMLParser {
  /**
   * 解析形状属性 (a:spPr)
   *
   * 从形状属性节点中提取填充、描边、几何、旋转、翻转等信息
   *
   * @param node - spPr 元素节点
   * @returns 解析后的形状属性对象
   */
  static parseShapeProperties(node: Element): {
    fill?: OfficeFill;
    stroke?: OfficeStroke;
    geometry?: string;
    path?: string;
    pathWidth?: number;
    pathHeight?: number;
    rotation?: number;
    flipH?: boolean;
    flipV?: boolean;
    effects?: OfficeEffect[];
    adjustValues?: Record<string, number>;
  } {
    log.debug('解析形状属性', { tagName: node.tagName });
    return ShapePropertiesParser.parseShapeProperties(node);
  }

  /**
   * 解析形状样式引用 (a:style)
   *
   * @param node - style 元素节点
   * @returns 样式引用对象
   */
  static parseStyle(node: Element): OfficeStyle | undefined {
    return ShapeStyleParser.parseStyle(node);
  }

  /**
   * 解析文本体 (a:txBody)
   *
   * @param node - txBody 元素节点
   * @returns 文本体对象
   */
  static parseTextBody(node: Element): OfficeTextBody | undefined {
    return TextBodyParser.parseTextBody(node);
  }

  // 注意：以下私有方法已移至各专用解析器类中：
  // - parseFill -> FillParser
  // - parseEffects -> EffectParser
  // - parseColor -> ColorParser
  // - parseCustomGeometry -> CustomGeometryParser
  // 这些方法原为私有静态方法，不应在外部直接调用
}
