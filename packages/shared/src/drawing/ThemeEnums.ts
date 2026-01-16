// OOXML Theme Color Schemes
export type ThemeColorType =
  | 'dk1'
  | 'lt1'
  | 'dk2'
  | 'lt2'
  | 'accent1'
  | 'accent2'
  | 'accent3'
  | 'accent4'
  | 'accent5'
  | 'accent6'
  | 'hlink'
  | 'folHlink';

// Default Office 2013+ Theme Colors (Fallback)
export const DefaultThemeColors: Record<ThemeColorType, string> = {
  dk1: '000000', // System Text
  lt1: 'FFFFFF', // System Background
  dk2: '44546A', // Dark 2
  lt2: 'E7E6E6', // Light 2
  accent1: '4472C4', // Blue
  accent2: 'ED7D31', // Orange
  accent3: 'A5A5A5', // Gray
  accent4: 'FFC000', // Gold
  accent5: '5B9BD5', // Light Blue
  accent6: '70AD47', // Green
  hlink: '0563C1', // Hyperlink
  folHlink: '954F72' // Followed Hyperlink
};

// Mapping from XML val (e.g. "accent1", "tx1") to Enum
export function mapThemeColor(val: string): ThemeColorType | undefined {
  // Handle aliases
  switch (val) {
    case 'tx1':
      return 'dk1';
    case 'tx2':
      return 'dk2';
    case 'bg1':
      return 'lt1';
    case 'bg2':
      return 'lt2';
    case 'text1':
      return 'dk1';
    case 'text2':
      return 'dk2';
    case 'background1':
      return 'lt1';
    case 'background2':
      return 'lt2';
  }
  // Handle case sensitivity or variants (strip 'theme:' prefix if passed?)
  // Usually renderer strips prefix.
  return val as ThemeColorType;
}
