/**
 * DOCX 样式相关类型定义
 *
 * 此文件包含样式、字体、边框等样式相关的类型定义
 */

import type { GradientDefaults } from '@ai-space/shared';

// 基础样式接口（完整定义待补充）
export interface DocxStyles {
  // 待补充完整定义
  [key: string]: any;
}

export interface NumberingDefinition {
  // 待补充完整定义
  [key: string]: any;
}

/**
 * 下划线样式
 */
export interface UnderlineStyle {
  val:
    | 'single'
    | 'double'
    | 'thick'
    | 'dotted'
    | 'dash'
    | 'dotDash'
    | 'dotDotDash'
    | 'wave'
    | 'wavyDouble'
    | 'wavyHeavy'
    | 'none'
    | string;
  color?: string;
  themeColor?: string;
}

/**
 * 字体配置
 */
export interface FontConfig {
  ascii?: string;
  eastAsia?: string;
  hAnsi?: string;
  cs?: string;
  hint?: 'default' | 'eastAsia' | 'cs';
  asciiTheme?: string;
  eastAsiaTheme?: string;
  hAnsiTheme?: string;
  csTheme?: string;
}

/**
 * 底纹配置
 */
export interface Shading {
  val: string;
  fill?: string;
  color?: string;
  themeFill?: string;
  themeColor?: string;
}

/**
 * 语言配置
 */
export interface LanguageConfig {
  val?: string;
  eastAsia?: string;
  bidi?: string;
}

/**
 * 文本轮廓配置
 */
export interface TextOutline {
  width: number;
  color?: string;
  gradient?: GradientDefaults; // 引用 shared 中的类型，或者自定义
  cap?: 'rnd' | 'sq' | 'flat';
  compound?: 'sng' | 'dbl' | 'thickThin' | 'thinThick' | 'tri';
  dashStyle?: string;
}

/**
 * 文本运行属性
 */
export interface RunProperties {
  styleId?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: UnderlineStyle;
  strike?: boolean;
  dstrike?: boolean;
  vertAlign?: 'superscript' | 'subscript' | 'baseline' | string;
  size?: number;
  fonts?: FontConfig;
  color?: string;
  highlight?: string;
  shading?: Shading;
  spacing?: number;
  kern?: number;
  position?: number;
  vanish?: boolean;
  smallCaps?: boolean;
  caps?: boolean;
  emboss?: boolean;
  imprint?: boolean;
  outline?: boolean;
  shadow?: boolean;
  lang?: LanguageConfig;
  w?: number;
  effect?: string;
  textOutline?: TextOutline;
  textFill?: any; // Start with any for complex fill types, or import properly
  [key: string]: unknown;
}
