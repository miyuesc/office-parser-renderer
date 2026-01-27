/**
 * Supported length units in Office documents.
 * Common units include points (pt), pixels (px), centimeters (cm), inches (in), and percent (%).
 */
export type LengthUnit = 'pt' | 'px' | 'cm' | 'in' | '%' | 'pc' | 'mm' | 'em' | 'rem';

/**
 * Represents a length value, which can be a number (usually treated as px or pt depending on context)
 * or a string with a unit.
 */
export type Length = number | string;
