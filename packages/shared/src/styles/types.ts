/**
 * Common style interfaces for all document types.
 */

export type ThemeColorKey =
  | 'lt1'
  | 'dk1'
  | 'lt2'
  | 'dk2'
  | 'accent1'
  | 'accent2'
  | 'accent3'
  | 'accent4'
  | 'accent5'
  | 'accent6'
  | 'hlink'
  | 'folHlink';

export interface ColorRef {
  rgb?: string;
  theme?: number;
  indexed?: number;
  tint?: number;
}

export interface ThemeFontSet {
  latin?: string;
  eastAsia?: string;
  complexScript?: string;
}

export interface ThemeFontScheme {
  major: ThemeFontSet;
  minor: ThemeFontSet;
}

export interface ThemeModel {
  name?: string;
  colors: Partial<Record<ThemeColorKey, string>>;
  fontScheme: ThemeFontScheme;
}

export interface FontDescriptor {
  family?: string;
  scheme?: string;
  size?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  colorRef?: ColorRef;
}

export interface TextStyle {
  fontFamily?: string;
  fontFallback?: string[];
  scheme?: 'major' | 'minor' | string;
  size?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean | string;
  strike?: boolean;
  color?: string;
  colorRef?: ColorRef;
  highlight?: string;
  highlightRef?: ColorRef;
}

export interface ParagraphStyle {
  text?: TextStyle;
  alignment?: 'left' | 'center' | 'right' | 'justify' | string;
  verticalAlignment?: 'top' | 'center' | 'bottom' | string;
  snapToGrid?: boolean;
  indent?: {
    left?: number;
    right?: number;
    firstLine?: number;
    hanging?: number;
  };
  spacing?: {
    before?: number;
    after?: number;
    line?: number;
    lineRule?: 'auto' | 'exact' | 'atLeast' | string;
  };
}

export interface FillStyle {
  type: 'solid' | 'gradient' | 'pattern' | 'none';
  color?: string;
  colorRef?: ColorRef;
  backgroundColor?: string;
  backgroundColorRef?: ColorRef;
  alpha?: number;
  tint?: number;
  shade?: number;
  patternType?: string;
  gradientStops?: Array<{
    position: number;
    color: string;
    colorRef?: ColorRef;
    alpha?: number;
  }>;
}

export interface StrokeStyle {
  style?: string;
  width?: number;
  color?: string;
  colorRef?: ColorRef;
  alpha?: number;
  tint?: number;
  shade?: number;
}

export interface StyleCascadeContext {
  theme?: ThemeModel;
  defaults?: {
    text?: TextStyle;
    paragraph?: ParagraphStyle;
    fill?: FillStyle;
    stroke?: StrokeStyle;
  };
}

export interface StyleResolver<TStyle, TContext extends StyleCascadeContext = StyleCascadeContext> {
  resolve(styleId: string | number | undefined, context?: TContext): TStyle | undefined;
}

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
