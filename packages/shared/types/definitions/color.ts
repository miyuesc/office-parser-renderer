import { ST_SystemColorVal, ST_SchemeColorVal, ST_PresetColorVal } from '@ai-space/definitions/autogen/dml-baseTypes';

/**
 * Supported color types in Office documents.
 */
export type ColorType = 'rgb' | 'scheme' | 'system' | 'preset';

/**
 * RGB Color definition.
 */
export interface RgbColor {
  type: 'rgb';
  r: number;
  g: number;
  b: number;
  a?: number; // Alpha channel (0-1)
}

/**
 * Scheme Color definition (references a theme color).
 */
export interface SchemeColor {
  type: 'scheme';
  value: ST_SchemeColorVal | string; // Allow string for flexibility, but strongly typed preference
  tint?: number; // Tint percentage
  shade?: number; // Shade percentage
}

/**
 * System Color definition.
 */
export interface SystemColor {
  type: 'system';
  value: ST_SystemColorVal | string;
}

/**
 * Preset Color definition.
 */
export interface PresetColor {
  type: 'preset';
  value: ST_PresetColorVal | string;
}

/**
 * Union type for all supported color definitions.
 */
export type Color = RgbColor | SchemeColor | SystemColor | PresetColor | string;
