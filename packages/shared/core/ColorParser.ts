export class ColorParser {
  /**
   * Parses a color string (hex) and returns a standardized CSS color string.
   * Handles various formats like "RRGGBB", "AARRGGBB".
   * Future can support theme colors.
   */
  public static parseHex(hex: string): string {
    if (!hex) return 'transparent';

    // Remove hash if present
    let color = hex.startsWith('#') ? hex.slice(1) : hex;

    if (color.length === 6) {
      return `#${color}`;
    }

    if (color.length === 8) {
      // AARRGGBB format (Alpha First) commonly used in Office
      const alpha = parseInt(color.substring(0, 2), 16) / 255;
      const rgb = color.substring(2);
      // Convert to rgba if alpha is not 1
      if (alpha < 1) {
        const r = parseInt(rgb.substring(0, 2), 16);
        const g = parseInt(rgb.substring(2, 4), 16);
        const b = parseInt(rgb.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
      }
      return `#${rgb}`;
    }

    return `#${color}`;
  }
}
