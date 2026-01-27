/**
 * 颜色处理工具类
 *
 * 提供颜色格式转换、色调调整等功能
 */
export class ColorUtils {
  /**
   * 对十六进制颜色应用色调 (tint) 值
   *
   * 正值使颜色变亮（与白色混合），负值使颜色变暗（与黑色混合）
   *
   * @param hex - 十六进制颜色字符串（如 "#FF0000" 或 "FF0000"）
   * @param tint - 色调值，范围 -1.0 到 1.0
   * @returns 调整后的十六进制颜色
   */
  static applyTint(hex: string, tint: number): string {
    if (!hex) return '#000000';
    if (tint === 0 || isNaN(tint)) return hex;

    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

    if (tint < 0) {
      // 变暗：亮度 * (1.0 + tint)
      hsl.l = hsl.l * (1.0 + tint);
    } else {
      // 变亮：亮度 * (1.0 - tint) + (最大亮度 - 最大亮度 * (1.0 - tint))
      // 简化公式：L + (1 - L) * tint
      hsl.l = hsl.l * (1.0 - tint) + tint;
    }

    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  /**
   * 将十六进制颜色转换为 RGB 对象
   * @param hex - 十六进制颜色字符串
   * @returns RGB 颜色对象
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    // 处理 ARGB 格式（8 位），暂时忽略 alpha 值
    if (hex.length === 8) {
      hex = hex.substring(2);
    }

    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  }

  /**
   * 将 RGB 颜色转换为十六进制字符串
   * @param r - 红色分量 (0-255)
   * @param g - 绿色分量 (0-255)
   * @param b - 蓝色分量 (0-255)
   * @returns 十六进制颜色字符串
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /**
   * 规范化十六进制颜色字符串
   *
   * 移除无效字符，确保以 # 开头
   * 移除可能的后缀（如 "[3204]" 等调试信息）
   *
   * @param hex - 原始颜色字符串
   * @returns 规范化的十六进制颜色字符串
   */
  static normalizeHex(hex: string): string {
    if (!hex) return '#000000';

    // 1. 移除空白字符
    let clean = hex.trim();

    // 2. 移除可能的后缀（如 [xxxx]）
    // 某些解析器可能会产生类似 "5B9BD5 [3204]" 的字符串
    const bracketIndex = clean.indexOf('[');
    if (bracketIndex !== -1) {
      clean = clean.substring(0, bracketIndex).trim();
    }

    // 3. 移除非十六进制字符（除了开头的 #）
    // 为了安全起见，我们只提取前 6 位或 8 位十六进制字符
    const match = clean.match(/[0-9a-fA-F]+/);
    if (match) {
      clean = match[0];
    } else {
      return '#000000';
    }

    // 4. 确保长度合法 (3, 6, 8)
    if (clean.length !== 3 && clean.length !== 6 && clean.length !== 8) {
      // 尝试截取
      if (clean.length > 6) clean = clean.substring(0, 6);
      else if (clean.length < 6 && clean.length > 3) clean = clean.substring(0, 3);
      else if (clean.length < 3) return '#000000';
    }

    return '#' + clean;
  }

  /**
   * 将 RGB 颜色转换为 HSL 颜色
   * @param r - 红色分量 (0-255)
   * @param g - 绿色分量 (0-255)
   * @param b - 蓝色分量 (0-255)
   * @returns HSL 颜色对象（h, s, l 范围均为 0-1）
   */
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

  /**
   * 将 HSL 颜色转换为 RGB 颜色
   * @param h - 色相 (0-1)
   * @param s - 饱和度 (0-1)
   * @param l - 亮度 (0-1)
   * @returns RGB 颜色对象
   */
  static hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // 无色调（灰度）
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
      b: Math.round(b * 255),
    };
  }

  /**
   * 应用颜色修饰器
   *
   * 支持 Office OOXML 标准颜色转换（lumMod, lumOff, tint, shade, alpha）
   */
  static applyColorModifiers(
    baseColor: string,
    mods: { lumMod?: number; lumOff?: number; tint?: number; shade?: number; alpha?: number },
  ): string {
    const { lumMod, lumOff, tint, shade, alpha } = mods;
    if (
      lumMod === undefined &&
      lumOff === undefined &&
      tint === undefined &&
      shade === undefined &&
      alpha === undefined
    ) {
      return baseColor;
    }

    const rgb = this.hexToRgb(baseColor);
    let r = rgb.r;
    let g = rgb.g;
    let b = rgb.b;

    // 1. 应用亮度修改 (HSL 空间)
    if (lumMod !== undefined || lumOff !== undefined) {
      const hsl = this.rgbToHsl(r, g, b);
      let l = hsl.l;

      if (lumMod !== undefined) l *= lumMod / 100000;
      if (lumOff !== undefined) l += lumOff / 100000;

      l = Math.max(0, Math.min(1, l));

      const newRgb = this.hslToRgb(hsl.h, hsl.s, l);
      r = newRgb.r;
      g = newRgb.g;
      b = newRgb.b;
    }

    // 2. 应用色调 (Tint) - 混合白色
    if (tint !== undefined) {
      const val = tint / 100000;
      // tint > 0 usually makes it lighter (mix with white?).
      // Valid range for tint in modifiers is usually 0-100000?
      // OOXML tint attribute: value < 0 is shade (mix black), > 0 is tint (mix white).
      // But here we rely on the specific modifier names.
      // The xlsx logic: r * val + 255 * (1 - val). This assumes val is 0-1.
      // If val is percentage of color vs white.
      // Actually spec says:
      // tint: Specifies a lighter version of its input color.
      // A 10% tint is 10% of the input color combined with 90% white. -> val=0.1. formula: c * 0.1 + 255 * 0.9.
      // xlsx logic: r * val + 255 * (1-val). Matches.
      r = Math.round(r * val + 255 * (1 - val));
      g = Math.round(g * val + 255 * (1 - val));
      b = Math.round(b * val + 255 * (1 - val));
    }

    // 3. 应用阴影 (Shade) - 混合黑色
    if (shade !== undefined) {
      const val = shade / 100000;
      // shade: A 10% shade is 10% of the input color combined with 90% black. -> c * 0.1 + 0.
      r = Math.round(r * val);
      g = Math.round(g * val);
      b = Math.round(b * val);
    }

    // Clamping
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // 4. Alpha
    if (alpha !== undefined) {
      return `rgba(${r}, ${g}, ${b}, ${alpha / 100000})`;
    }

    return this.rgbToHex(r, g, b);
  }
}

/**
 * 本地默认主题颜色映射
 * 当未提供主题时使用此默认值
 */
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
  folHlink: '#954F72',
};

/**
 * 解析主题颜色引用
 *
 * 将 "theme:accent1" 格式的引用转换为实际的十六进制颜色值
 *
 * @param themeColor - 主题颜色引用字符串
 * @param themeColors - 可选的自定义主题颜色映射
 * @returns 十六进制颜色值
 */
export function resolveThemeColor(
  themeColor: string,
  themeColors?: Record<string, string>,
): string {
  if (!themeColor) return '#000000';
  if (themeColor.startsWith('#')) return themeColor;

  const colorKey = themeColor.replace('theme:', '');
  const colors = themeColors || LocalDefaultThemeColors;
  return colors[colorKey as keyof typeof colors] || '#000000';
}
