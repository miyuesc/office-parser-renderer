export class ColorUtils {
  /**
   * Applies a tint value to a hex color.
   * @param hex - Hex color string (e.g., "#FF0000" or "FF0000")
   * @param tint - Tint value between -1.0 and 1.0
   * @returns Tinted hex color
   */
  static applyTint(hex: string, tint: number): string {
    if (!hex) return '#000000';
    if (tint === 0 || isNaN(tint)) return hex;

    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

    if (tint < 0) {
      // Darker: lum * (1.0 + tint)
      hsl.l = hsl.l * (1.0 + tint);
    } else {
      // Lighter: lum * (1.0 - tint) + (HLSMAX - HLSMAX * (1.0 - tint))
      // Simplified: L + (1 - L) * tint
      hsl.l = hsl.l * (1.0 - tint) + tint;
    }

    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  static hexToRgb(hex: string): { r: number; g: number; b: number } {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map(c => c + c)
        .join('');
    }
    // Handle ARGB (8 chars), ignore alpha for now or assume opaque
    if (hex.length === 8) {
      hex = hex.substring(2);
    }

    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  static rgbToHex(r: number, g: number, b: number): string {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  static rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return { h, s, l };
  }

  static hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
}

const LocalDefaultThemeColors = {
  dk1: '#000000',
  lt1: '#FFFFFF',
  dk2: '#44546A',
  lt2: '#E7E6E6',
  accent1: '#4472C4',
  accent2: '#ED7D31',
  accent3: '#A5A5A5',
  accent4: '#FFC000',
  accent5: '#5B9BD5',
  accent6: '#70AD47',
  hlink: '#0563C1',
  folHlink: '#954F72'
};

export function resolveThemeColor(themeColor: string, themeColors?: Record<string, string>): string {
  if (!themeColor) return '#000000';
  if (themeColor.startsWith('#')) return themeColor;

  const colorKey = themeColor.replace('theme:', '');
  const colors = themeColors || LocalDefaultThemeColors;
  return colors[colorKey as keyof typeof colors] || '#000000';
}
