/**
 * Common Number Formats (Excel/Office)
 */
export const COMMON_NUM_FMTS = {
  GENERAL: 'General',
  TEXT: '@',
  NUMBER: '0',
  NUMBER_DECIMAL: '0.00',
  NUMBER_THOUSANDS: '#,##0',
  NUMBER_THOUSANDS_DECIMAL: '#,##0.00',

  CURRENCY_USD: '$#,##0.00',
  CURRENCY_RMB: '¥#,##0.00',

  PERCENTAGE: '0%',
  PERCENTAGE_DECIMAL: '0.00%',

  DATE_YMD: 'yyyy-mm-dd',
  DATE_MDY: 'mm-dd-yy',
  DATE_DMY: 'd-mmm-yy',
  TIME: 'h:mm AM/PM',
  DATETIME: 'yyyy-mm-dd h:mm'
} as const;

/**
 * Text Underline Types
 */
export enum UnderlineType {
  NONE = 'none',
  SINGLE = 'single',
  WORDS = 'words',
  DOUBLE = 'double',
  THICK = 'thick',
  DOTTED = 'dotted',
  DOTTED_HEAVY = 'dottedHeavy',
  DASH = 'dash',
  DASHED_HEAVY = 'dashedHeavy',
  DASH_LONG = 'dashLong',
  DASH_LONG_HEAVY = 'dashLongHeavy',
  DOT_DASH = 'dotDash',
  DOT_DASH_HEAVY = 'dotDashHeavy',
  DOT_DOT_DASH = 'dotDotDash',
  DOT_DOT_DASH_HEAVY = 'dotDotDashHeavy',
  WAVE = 'wave',
  WAVY_HEAVY = 'wavyHeavy',
  WAVY_DOUBLE = 'wavyDouble'
}

/**
 * Text Strike Types
 */
export enum StrikeType {
  NONE = 'none',
  SINGLE = 'sngStrike',
  DOUBLE = 'dblStrike'
}
