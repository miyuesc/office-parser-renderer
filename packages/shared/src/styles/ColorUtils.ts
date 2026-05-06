import { ColorRef, ThemeColorKey, ThemeModel } from './types';

/**
 * 颜色处理工具
 */
export class ColorUtils {
  private static readonly SCHEME_TO_THEME_KEY: Record<string, ThemeColorKey> = {
    bg1: 'lt1',
    tx1: 'dk1',
    bg2: 'lt2',
    tx2: 'dk2',
    accent1: 'accent1',
    accent2: 'accent2',
    accent3: 'accent3',
    accent4: 'accent4',
    accent5: 'accent5',
    accent6: 'accent6',
    hlink: 'hlink',
    folHlink: 'folHlink'
  };

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
      const hex = c.substring(1);
      if (/^[0-9A-Fa-f]{8}$/.test(hex)) {
        return this.formatArgbHex(hex);
      }
      return c;
    }

    // Hex string validation
    if (/^[0-9A-Fa-f]+$/.test(c)) {
      if (c.length === 6) {
        return `#${c}`;
      }
      if (c.length === 8) {
        return this.formatArgbHex(c);
      }
    }

    // Return original if it might be a valid css name like "red"
    return c;
  }

  private static formatArgbHex(hex: string): string {
    const a = parseInt(hex.substring(0, 2), 16);
    const r = parseInt(hex.substring(2, 4), 16);
    const g = parseInt(hex.substring(4, 6), 16);
    const b = parseInt(hex.substring(6, 8), 16);

    // SpreadsheetML producers commonly write 00RRGGBB even though Excel renders
    // the color as opaque. Treat zero alpha as visible to avoid disappearing text.
    if (a === 0 || a === 255) {
      return `rgb(${r}, ${g}, ${b})`;
    }

    return `rgba(${r}, ${g}, ${b}, ${Number((a / 255).toFixed(2))})`;
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
  private static readonly THEME_COLOR_KEYS: ThemeColorKey[] = [
    'lt1',
    'dk1',
    'lt2',
    'dk2',
    'accent1',
    'accent2',
    'accent3',
    'accent4',
    'accent5',
    'accent6',
    'hlink',
    'folHlink'
  ];

  private static readonly DEFAULT_THEME_COLORS: Record<ThemeColorKey, string> = {
    lt1: '#FFFFFF',
    dk1: '#000000',
    lt2: '#EEECE1',
    dk2: '#1F497D',
    accent1: '#4F81BD',
    accent2: '#C0504D',
    accent3: '#9BBB59',
    accent4: '#8064A2',
    accent5: '#4BACC6',
    accent6: '#F79646',
    hlink: '#0000FF',
    folHlink: '#800080'
  };

  static createColorRef(
    rgb?: string | null,
    theme?: string | number | null,
    indexed?: string | number | null,
    tint?: string | number | null
  ): ColorRef | undefined {
    const hasRgb = !!rgb;
    const hasTheme = theme !== undefined && theme !== null && theme !== '';
    const hasIndexed = indexed !== undefined && indexed !== null && indexed !== '';
    const hasTint = tint !== undefined && tint !== null && tint !== '';

    if (!hasRgb && !hasTheme && !hasIndexed && !hasTint) {
      return undefined;
    }

    const colorRef: ColorRef = {};

    if (rgb) {
      colorRef.rgb = rgb;
    }
    if (hasTheme) {
      colorRef.theme = typeof theme === 'string' ? parseInt(theme, 10) : theme;
    }
    if (hasIndexed) {
      colorRef.indexed = typeof indexed === 'string' ? parseInt(indexed, 10) : indexed;
    }
    if (hasTint) {
      colorRef.tint = typeof tint === 'string' ? parseFloat(tint) : tint;
    }

    return colorRef;
  }

  static resolveThemeColor(themeIndex: number, themeModel?: ThemeModel): string | undefined {
    const key = this.THEME_COLOR_KEYS[themeIndex];
    if (!key) {
      return undefined;
    }

    return themeModel?.colors[key] || this.DEFAULT_THEME_COLORS[key];
  }

  static resolveSchemeColor(scheme: string, themeModel?: ThemeModel): string | undefined {
    const key = this.SCHEME_TO_THEME_KEY[scheme];
    if (!key) {
      return undefined;
    }

    return themeModel?.colors[key] || this.DEFAULT_THEME_COLORS[key];
  }

  static resolveColorRef(colorRef?: ColorRef, themeModel?: ThemeModel): string | undefined {
    if (!colorRef) return undefined;

    let baseColor: string | undefined;

    if (colorRef.rgb) {
      baseColor = this.formatColor(colorRef.rgb);
    } else if (colorRef.theme !== undefined) {
      baseColor = this.resolveThemeColor(colorRef.theme, themeModel);
    } else if (colorRef.indexed !== undefined) {
      baseColor = this.INDEXED_COLORS[colorRef.indexed];
    }

    if (!baseColor) return undefined;

    if (colorRef.tint !== undefined && !isNaN(colorRef.tint) && colorRef.tint !== 0) {
      return this.applyTint(baseColor, colorRef.tint);
    }

    return baseColor;
  }

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
    tint?: string | number | null,
    themeModel?: ThemeModel
  ): string | undefined {
    return this.resolveColorRef(this.createColorRef(rgb, theme, indexed, tint), themeModel);
  }

  static interpolateColor(startColor?: string, endColor?: string, ratio: number = 0): string | undefined {
    const start = this.parseRgbColor(startColor);
    const end = this.parseRgbColor(endColor);
    if (!start || !end) {
      return this.formatColor(endColor || startColor);
    }

    const clamped = Math.min(1, Math.max(0, ratio));
    const r = Math.round(start.r + (end.r - start.r) * clamped);
    const g = Math.round(start.g + (end.g - start.g) * clamped);
    const b = Math.round(start.b + (end.b - start.b) * clamped);
    const a = start.a + (end.a - start.a) * clamped;

    if (Math.abs(a - 1) < 0.001) {
      return `rgb(${r}, ${g}, ${b})`;
    }

    return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(2))})`;
  }

  private static parseRgbColor(color?: string) {
    const normalized = this.formatColor(color);
    if (!normalized) {
      return undefined;
    }

    const hex = normalized.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      return {
        r: parseInt(hex.substring(1, 3), 16),
        g: parseInt(hex.substring(3, 5), 16),
        b: parseInt(hex.substring(5, 7), 16),
        a: 1
      };
    }

    if (/^#[0-9A-Fa-f]{8}$/.test(hex)) {
      return {
        a: parseInt(hex.substring(1, 3), 16) / 255,
        r: parseInt(hex.substring(3, 5), 16),
        g: parseInt(hex.substring(5, 7), 16),
        b: parseInt(hex.substring(7, 9), 16)
      };
    }

    const rgbMatch = hex.match(/^rgba?\(([^)]+)\)$/i);
    if (!rgbMatch) {
      return undefined;
    }

    const [r = '0', g = '0', b = '0', a = '1'] = rgbMatch[1].split(',').map(part => part.trim());
    return {
      r: Number(r),
      g: Number(g),
      b: Number(b),
      a: Number(a)
    };
  }

  private static applyTint(color: string, tint: number): string {
    const parsed = this.parseRgbColor(color);
    if (!parsed) {
      return color;
    }

    let { r, g, b } = parsed;

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

    if (Math.abs(parsed.a - 1) >= 0.001) {
      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Number(parsed.a.toFixed(2))})`;
    }
    return `#${newRgb}`;
  }
}
