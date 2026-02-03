/**
 * Utility for formatting numbers and dates based on format strings.
 * MVP: Wrapper around Intl.NumberFormat and Intl.DateTimeFormat.
 */
export class NumberFormatter {
  /**
   * Formats a value based on a format string.
   * @param value The value to format (number or date).
   * @param format The format string (e.g., "0.00", "yyyy-mm-dd").
   */
  static format(value: number | Date, format: string): string {
    if (value instanceof Date) {
      return this.formatDate(value, format);
    }
    return this.formatNumber(value, format);
  }

  private static formatNumber(value: number, format: string): string {
    // MVP: Very basic support
    if (format === 'General') return value.toString();

    // Percentage
    if (format.includes('%')) {
      return (value * 100).toFixed(2) + '%';
    }

    // Currency (Simple check)
    if (format.includes('$')) {
      return '$' + value.toFixed(2);
    }

    // Decimal places (0.00)
    if (format.includes('.')) {
      const decimals = format.split('.')[1]?.length || 0;
      return value.toFixed(decimals);
    }

    return value.toString();
  }

  private static formatDate(value: Date, format: string): string {
    // MVP: Simple ISO-like mapping
    // TODO: proper tokenizer

    const year = value.getFullYear();
    const month = (value.getMonth() + 1).toString().padStart(2, '0');
    const day = value.getDate().toString().padStart(2, '0');

    if (format.toLowerCase().includes('yyyy')) {
      return `${year}-${month}-${day}`; // Default to ISO for now if YYYY present
    }
    return value.toLocaleDateString();
  }
}
