import { IFont, TextMetrics } from './types';
import { UnitConversion } from '../core/UnitConversion';

/**
 * Manages font loading and text measurement.
 */
export class FontManager {
  private static canvas: HTMLCanvasElement | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;
  private static measurementCache = new Map<string, TextMetrics>();

  private static getContext() {
    if (!this.canvas) {
      if (typeof document === 'undefined') {
        throw new Error('FontManager requires a browser environment (DOM).');
      }
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
    return this.ctx!;
  }

  /**
   * Measure text using the Canvas API.
   * @param text The text to measure.
   * @param font The font style.
   * @returns TextMetrics (width, height, ascent, descent).
   */
  static measureText(text: string, font: IFont): TextMetrics {
    const fontStr = this.getFontString(font);
    const cacheKey = `${text}_${fontStr}`;

    if (this.measurementCache.has(cacheKey)) {
      return this.measurementCache.get(cacheKey)!;
    }

    const ctx = this.getContext();
    ctx.font = fontStr;
    const metrics = ctx.measureText(text);

    // Approximate height if not available (Canvas TextMetrics usually gives width)
    // actualBoundingBoxAscent + actualBoundingBoxDescent is accurate but not always supported in older envs
    // Fallback to simple approximation based on font size
    const ascent = metrics.actualBoundingBoxAscent ?? font.size * 1.33 * 0.8;
    const descent = metrics.actualBoundingBoxDescent ?? font.size * 1.33 * 0.2;
    const height = ascent + descent;

    const result: TextMetrics = {
      width: metrics.width,
      height,
      ascent,
      descent
    };

    this.measurementCache.set(cacheKey, result);
    return result;
  }

  /**
   * Generates a CSS font string from IFont.
   */
  static getFontString(font: IFont): string {
    const style = font.italic ? 'italic' : 'normal';
    const weight = font.bold ? 'bold' : 'normal';
    // Convert pt to px: 1 pt = 1.333 px (96 DPI)
    const sizePx = Math.round(UnitConversion.ptToPixel(font.size));

    return `${style} ${weight} ${sizePx}px "${font.family}"`;
  }

  static clearCache() {
    this.measurementCache.clear();
  }
}
