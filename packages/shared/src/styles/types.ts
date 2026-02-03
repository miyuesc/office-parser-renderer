/**
 * Common style interfaces for all document types.
 */

export interface IFont {
  family: string;
  size: number; // pt
  bold?: boolean;
  italic?: boolean;
  color?: string; // CSS color string
}

export interface IBorder {
  style: BorderStyle;
  width: number; // pt
  color: string; // CSS color string
}

export type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted' | 'double';

export interface IFill {
  type: 'solid' | 'gradient' | 'pattern';
  color?: string; // CSS color string (for solid)
  // TODO: Add gradient/pattern props
}

export interface TextMetrics {
  width: number;
  height: number;
  ascent: number;
  descent: number;
}
