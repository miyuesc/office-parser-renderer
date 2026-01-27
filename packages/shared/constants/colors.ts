/**
 * Preset Colors (Standard Office Colors)
 */
export const PRESET_COLORS: Record<string, string> = {
  black: '#000000',
  silver: '#C0C0C0',
  gray: '#808080',
  white: '#FFFFFF',
  maroon: '#800000',
  red: '#FF0000',
  purple: '#800080',
  fuchsia: '#FF00FF',
  green: '#008000',
  lime: '#00FF00',
  olive: '#808000',
  yellow: '#FFFF00',
  navy: '#000080',
  blue: '#0000FF',
  teal: '#008080',
  aqua: '#00FFFF',
  // Common Theme Colors (Fallback)
  dark1: '#000000',
  light1: '#FFFFFF',
  dark2: '#44546A',
  light2: '#E7E6E6',
  accent1: '#4472C4', // Blue
  accent2: '#ED7D31', // Orange
  accent3: '#A5A5A5', // Gray
  accent4: '#FFC000', // Gold
  accent5: '#5B9BD5', // Light Blue
  accent6: '#70AD47' // Green
} as const;

export const DEFAULT_COLORS = {
  AUTO: '#000000',
  BACKGROUND: '#FFFFFF',
  HIGHLIGHT: '#FFFF00'
} as const;
