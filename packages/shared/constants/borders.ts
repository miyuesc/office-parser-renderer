/**
 * Border Styles
 * Coincides with ST_Border (OpenXML)
 */
export enum BorderStyle {
  NONE = 'none',
  SINGLE = 'single',
  THICK = 'thick',
  DOUBLE = 'double',
  DOTTED = 'dotted',
  DASHED = 'dashed',
  DOT_DASH = 'dotDash',
  DOT_DOT_DASH = 'dotDotDash',
  TRIPLE = 'triple',
  THIN_THICK_SMALL_GAP = 'thinThickSmallGap',
  THICK_THIN_SMALL_GAP = 'thickThinSmallGap',
  THIN_THICK_THIN_SMALL_GAP = 'thinThickThinSmallGap',
  THIN_THICK_MEDIUM_GAP = 'thinThickMediumGap',
  THICK_THIN_MEDIUM_GAP = 'thickThinMediumGap',
  THIN_THICK_THIN_MEDIUM_GAP = 'thinThickThinMediumGap',
  THIN_THICK_LARGE_GAP = 'thinThickLargeGap',
  THICK_THIN_LARGE_GAP = 'thickThinLargeGap',
  THIN_THICK_THIN_LARGE_GAP = 'thinThickThinLargeGap',
  WAVE = 'wave',
  DOUBLE_WAVE = 'doubleWave',
  DASH_SMALL_GAP = 'dashSmallGap',
  DASH_DOT_STROKED = 'dashDotStroked',
  THREE_D_EMBOSS = 'threeDEmboss',
  THREE_D_ENGRAVE = 'threeDEngrave',
  OUTSET = 'outset',
  INSET = 'inset'
}

/**
 * Common Border Widths (in eights of a point, per OpenXML spec)
 * 1/8 pt = 0.125 pt
 */
export const BORDER_WIDTHS = {
  THIN: 2, // 0.25 pt
  MEDIUM: 4, // 0.5 pt
  THICK: 6, // 0.75 pt
  HEAVY: 24, // 3 pt
  EXTRA_HEAVY: 48 // 6 pt
} as const;

/**
 * CSS Border Style Mapping
 */
export const CSS_BORDER_STYLE_MAP: Partial<Record<BorderStyle, string>> = {
  [BorderStyle.NONE]: 'none',
  [BorderStyle.SINGLE]: 'solid',
  [BorderStyle.THICK]: 'solid',
  [BorderStyle.DOUBLE]: 'double',
  [BorderStyle.DOTTED]: 'dotted',
  [BorderStyle.DASHED]: 'dashed',
  [BorderStyle.DOT_DASH]: 'dashed', // Approximation
  [BorderStyle.WAVE]: 'solid', // No direct CSS equivalent for wave
  [BorderStyle.INSET]: 'inset',
  [BorderStyle.OUTSET]: 'outset'
};
