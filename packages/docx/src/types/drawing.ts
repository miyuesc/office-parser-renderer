/**
 * DOCX 绘图相关类型定义
 *
 * 统一使用 Shared 包中的 Office 类型定义
 */

import type { OfficeImage, OfficeShape, OfficeChart, OfficeTextBody } from '@ai-space/shared';
import type { DocxElement } from './paragraph';

/**
 * 绘图对象
 */
export interface Drawing {
  type: 'drawing';
  drawingType: 'inline' | 'anchor';
  description?: string;
  title?: string;
  position?: AnchorPosition;
  image?: DrawingImage;
  shape?: DrawingShape;
  chart?: DrawingChart;
}

/**
 * 锚点位置配置
 */
export interface AnchorPosition {
  allowOverlap?: boolean;
  behindDoc?: boolean;
  relativeHeight?: number;
  horizontal?: PositionConfig;
  vertical?: PositionConfig;
  wrap?: WrapConfig;
}

export interface PositionConfig {
  relativeTo:
    | 'margin'
    | 'page'
    | 'column'
    | 'paragraph'
    | 'character'
    | 'leftMargin'
    | 'rightMargin'
    | 'topMargin'
    | 'bottomMargin'
    | 'insideMargin'
    | 'outsideMargin';
  align?: 'left' | 'center' | 'right' | 'top' | 'bottom' | 'inside' | 'outside';
  posOffset?: number;
}

export interface WrapConfig {
  type: 'none' | 'square' | 'tight' | 'through' | 'topAndBottom';
  distT?: number;
  distB?: number;
  distL?: number;
  distR?: number;
}

/**
 * DOCX 图片类型
 * 基于 OfficeImage，但使用 cx/cy 替代 anchor
 */
export type DrawingImage = Omit<OfficeImage, 'anchor' | 'id'> & {
  cx: number;
  cy: number;
};

/**
 * DOCX 形状文本体
 */
export interface DocxTextBody extends Omit<OfficeTextBody, 'paragraphs'> {
  paragraphs?: any[]; // TODO: Define strict paragraph type if needed
  content?: DocxElement[];
}

/**
 * DOCX 形状类型
 * 基于 OfficeShape，但使用 cx/cy 替代 anchor
 */
export type DrawingShape = Omit<OfficeShape, 'anchor' | 'textBody'> & {
  cx: number;
  cy: number;
  textBody?: DocxTextBody;
};

/**
 * DOCX 图表类型
 * 基于 OfficeChart，但使用 cx/cy 替代 anchor，且必须有 rId
 */
export type DrawingChart = Omit<OfficeChart, 'anchor' | 'id'> & {
  rId: string;
  cx: number;
  cy: number;
};
