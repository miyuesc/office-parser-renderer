/**
 * 颜色处理工具
 */
export class ColorUtils {
  /**
   * 将 Excel 颜色字符串标准化为 CSS 颜色
   * Supports:
   * - #RRGGBB
   * - RRGGBB
   * - AARRGGBB (Excel ARGB) -> rgba(r,g,b,a)
   */
  static formatColor(color?: string): string | undefined {
    if (!color) return undefined;

    const c = color.trim();

    if (c.startsWith('#')) {
      return c;
    }

    // Hex string validation
    if (/^[0-9A-Fa-f]+$/.test(c)) {
      if (c.length === 6) {
        return `#${c}`;
      }
      if (c.length === 8) {
        // Excel ARGB: AARRGGBB
        const a = parseInt(c.substring(0, 2), 16);
        const r = parseInt(c.substring(2, 4), 16);
        const g = parseInt(c.substring(4, 6), 16);
        const b = parseInt(c.substring(6, 8), 16);

        // Optimize for fully opaque
        if (a === 255) {
          return `rgb(${r}, ${g}, ${b})`;
        }

        return `rgba(${r}, ${g}, ${b}, ${Number((a / 255).toFixed(2))})`;
      }
    }

    // Return original if it might be a valid css name like "red"
    return c;
  }

  // --- Theme & Tint Support ---

  // Standard Excel Indexed Colors (0-65)
  // Source: https://github.com/SheetJS/sheetjs/blob/master/bits/15_sty.js
  private static readonly INDEXED_COLORS = [
    '#000000',
    '#FFFFFF',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
    '#000000',
    '#FFFFFF',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
    '#800000',
    '#008000',
    '#000080',
    '#808000',
    '#800080',
    '#008080',
    '#C0C0C0',
    '#808080',
    '#9999FF',
    '#993366',
    '#FFFFCC',
    '#CCFFFF',
    '#660066',
    '#FF8080',
    '#0066CC',
    '#CCCCFF',
    '#000080',
    '#FF00FF',
    '#FFFF00',
    '#00FFFF',
    '#800080',
    '#800000',
    '#008080',
    '#0000FF',
    '#00CCFF',
    '#CCFFFF',
    '#CCFFCC',
    '#FFFF99',
    '#99CCFF',
    '#FF99CC',
    '#CC99FF',
    '#FFCC99',
    '#3366FF',
    '#33CCCC',
    '#99CC00',
    '#FFCC00',
    '#FF9900',
    '#FF6600',
    '#666699',
    '#969696',
    '#003366',
    '#339966',
    '#003300',
    '#333300',
    '#993300',
    '#993366',
    '#333399',
    '#333333',
    '#000000',
    '#FFFFFF' // 64, 65 (system)
  ];

  // Default Office Theme Colors (Theme1)
  // Mapping: 0=Lt1, 1=Dk1, 2=Lt2, 3=Dk2, 4=Accent1 ... 9=Accent6, 10=Hlink, 11=FolHlink
  private static readonly THEME_COLORS = [
    '#FFFFFF', // 0: Lt1
    '#000000', // 1: Dk1
    '#EEECE1', // 2: Lt2
    '#1F497D', // 3: Dk2 (Actually usually slightly different, but this is a common default)
    '#4F81BD', // 4: Accent1
    '#C0504D', // 5: Accent2
    '#9BBB59', // 6: Accent3
    '#8064A2', // 7: Accent4
    '#4BACC6', // 8: Accent5
    '#F79646', // 9: Accent6
    '#0000FF', // 10: Hlink
    '#800080' // 11: FolHlink
  ];

  /**
   * Resolve color from Excel attributes
   * @param rgb ARGB hex string
   * @param theme Theme index
   * @param indexed Indexed color index
   * @param tint Tint value (-1.0 to 1.0)
   */
  static resolveColor(
    rgb?: string | null,
    theme?: string | number | null,
    indexed?: string | number | null,
    tint?: string | number | null
  ): string | undefined {
    let baseColor: string | undefined;

    if (rgb) {
      baseColor = this.formatColor(rgb);
    } else if (theme !== undefined && theme !== null) {
      const themeIdx = typeof theme === 'string' ? parseInt(theme, 10) : theme;
      if (this.THEME_COLORS[themeIdx]) {
        baseColor = this.THEME_COLORS[themeIdx];
      }
    } else if (indexed !== undefined && indexed !== null) {
      const idx = typeof indexed === 'string' ? parseInt(indexed, 10) : indexed;
      if (this.INDEXED_COLORS[idx]) {
        baseColor = this.INDEXED_COLORS[idx];
      }
    }

    if (!baseColor) return undefined;

    // Apply Tint if present
    if (tint !== undefined && tint !== null) {
      const tintVal = typeof tint === 'string' ? parseFloat(tint) : tint;
      if (!isNaN(tintVal) && tintVal !== 0) {
        return this.applyTint(baseColor, tintVal);
      }
    }

    return baseColor;
  }

  private static applyTint(hex: string, tint: number): string {
    // Parse Hex to RGB
    const c = hex.replace('#', '');
    let r = parseInt(c.substring(0, 2), 16);
    let g = parseInt(c.substring(2, 4), 16);
    let b = parseInt(c.substring(4, 6), 16);

    // Handle ARGB (skip Alpha for tint calc, or apply to RGB part)
    if (c.length === 8) {
      // AARRGGBB
      // For simplicity, let's keep alpha as is and tint the RGB
      r = parseInt(c.substring(2, 4), 16);
      g = parseInt(c.substring(4, 6), 16);
      b = parseInt(c.substring(6, 8), 16);
    }

    if (tint < 0) {
      // Shade: R * (1 + tint)
      r = r * (1.0 + tint);
      g = g * (1.0 + tint);
      b = b * (1.0 + tint);
    } else {
      // Tint: R * (1 - tint) + (255 * tint)
      r = r * (1.0 - tint) + 255 * tint;
      g = g * (1.0 - tint) + 255 * tint;
      b = b * (1.0 - tint) + 255 * tint;
    }

    const toHex = (n: number) => {
      const i = Math.round(n);
      return (i < 16 ? '0' : '') + i.toString(16);
    };

    const newRgb = `${toHex(r)}${toHex(g)}${toHex(b)}`;

    if (c.length === 8) {
      return `#${c.substring(0, 2)}${newRgb}`;
    }
    return `#${newRgb}`;
  }
}
