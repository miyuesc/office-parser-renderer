export class NumberFormatUtils {
  /**
   * Formats a value according to Excel format string.
   * Partial implementation of SSF.
   */
  static format(value: any, formatCode: string, date1904 = false): string {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'number') return String(value);
    if (!formatCode || formatCode === 'General') return String(value);

    // Handle Sections (Positive;Negative;Zero;Text)
    const sections = formatCode.split(';');
    let activeFmt = sections[0];

    if (sections.length > 1) {
      if (value > 0) activeFmt = sections[0];
      else if (value < 0) activeFmt = sections[1] || sections[0];
      else if (value === 0) activeFmt = sections[2] || sections[0];
    }

    // Remove conditions/colors [Red], [<=100] etc.
    // Simplistic removal for rendering content only
    activeFmt = activeFmt.replace(/\[[^\]]*\]/g, '');

    // Date/Time Logic
    if (this.isDateFormat(activeFmt)) {
      const date = this.parseExcelDate(value, date1904);
      if (date) return this.formatDate(date, activeFmt);
    }

    // Percentage
    if (activeFmt.includes('%')) {
      return this.formatPercent(value, activeFmt);
    }

    // Scientific
    if (/E[+-]0+/i.test(activeFmt)) {
      return this.formatScientific(value, activeFmt);
    }

    // Fraction
    if (activeFmt.includes('?/?')) {
      return this.formatFraction(value, activeFmt);
    }

    // Standard Decimal
    return this.formatDecimal(value, activeFmt);
  }

  private static isDateFormat(fmt: string): boolean {
    // Remove literal quotes
    const cleaned = fmt.replace(/"[^"]*"/g, '');
    // Check for standard date tokens, excluding "General" or simple number chars
    // y: year, m: month/min, d: day, h: hour, s: second, a/p: am/pm
    return /[ymdhs]/.test(cleaned.toLowerCase()) && !/^[0#\.,]+$/.test(cleaned);
  }

  private static parseExcelDate(serial: number, date1904 = false): Date | null {
    if (serial < 1) {
      // Basic time only support (0.5 = 12:00 PM) based on epoch
      // Serial 0 is 1900-01-00?
      // Just treat as offset from epoch for time extraction
      const totalSeconds = Math.round(serial * 86400);
      const date = new Date(0);
      date.setUTCHours(0, 0, 0, 0);
      date.setUTCSeconds(totalSeconds);
      return date;
    }

    // Offset for 1970-01-01
    // 1900 System: 25569 days from 1899-12-30 to 1970-01-01
    // 1904 System: 24107 days from 1904-01-01 to 1970-01-01
    const offset = date1904 ? 24107 : 25569;
    const utc_days = Math.floor(serial - offset);
    const utc_value = utc_days * 86400;
    // Add fractional day (time)
    const fractional_day = serial - Math.floor(serial);
    const total_seconds = utc_value + Math.round(fractional_day * 86400);

    return new Date(total_seconds * 1000);
  }

  private static formatDate(date: Date, fmt: string): string {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    const H = date.getUTCHours();
    const M = date.getUTCMinutes();
    const S = date.getUTCSeconds();

    // Tokenizer approach
    let out = '';
    let i = 0;
    const len = fmt.length;

    // Pre-calculate values

    while (i < len) {
      const c = fmt[i];

      // Check for quoted strings
      if (c === '"') {
        i++;
        while (i < len && fmt[i] !== '"') {
          out += fmt[i];
          i++;
        }
        i++;
        continue;
      }

      // check standard tokens descending length
      // yyyy, yy, mmmm, mmm, mm, m, dddd, ddd, dd, d, hh, h, ss, s, am/pm
      // Simple approach: Check specific tokens
      // Special handling for 'm' (minute vs month)
      // If previous token was h, or next is s? Contextual.

      // Actually, Regex replace is safer if we handle m vs min separately.
      // Let's fallback to the robust regex-chain for this iteration to avoid tokenizer bugs.
      out += c; // fallback
      i++;
    }

    // Revert to regex for safety + logic fix
    out = fmt;

    // Escape check
    // ...

    // 1. Years
    out = out.replace(/yyyy/gi, String(y));
    out = out.replace(/yy/gi, String(y % 100).padStart(2, '0'));

    // 2. Hours (24h default for H)
    out = out.replace(/hh/gi, String(H).padStart(2, '0'));
    out = out.replace(/h/gi, String(H));

    // 3. Seconds
    out = out.replace(/ss/gi, String(S).padStart(2, '0'));
    out = out.replace(/s/gi, String(S));

    // Replace mm:ss -> MIN:ss
    out = out.replace(/(m+)[:\s]+(s+)/gi, (match, mStr, _s) => {
      return match.replace(mStr, mStr.length > 1 ? String(M).padStart(2, '0') : String(M));
    });

    // Remaining m/mm are Months
    out = out.replace(/mm/gi, String(m).padStart(2, '0'));
    out = out.replace(/m/gi, String(m));

    // 5. Days
    out = out.replace(/dd/gi, String(d).padStart(2, '0'));
    out = out.replace(/d/gi, String(d));

    // Cleanup Quotes
    out = out.replace(/"/g, '');

    return out;
  }

  private static formatPercent(value: number, fmt: string): string {
    const val = value * 100;
    // Clean fmt to find decimal places
    // "0.00%" -> 2 decimals
    // Fix Scientific: 0.00E+00 -> 2 decimals.
    // Count only 0s and #s after dot, BEFORE any E or %
    const cleanDec = fmt.split('.')[1]?.match(/^[0#]+/)?.[0]?.length || 0;
    return val.toFixed(cleanDec) + '%';
  }

  private static formatScientific(value: number, fmt: string): string {
    // 0.00E+00
    const afterDot = fmt.split('.')[1] || '';
    const decimals = afterDot.match(/^[0#]+/)?.[0]?.length || 2;
    const exp = value.toExponential(decimals).toUpperCase();

    const [mantissa, exponent] = exp.split('E');
    if (!exponent) return exp;

    // Check needed padding for exponent
    // fmt contains E+00 or E-00 etc.
    const expFmt = fmt.match(/E[+-]([0]+)/i);
    if (expFmt) {
      const minWidth = expFmt[1].length; // number of 0s
      const sign = exponent[0];
      const valStr = exponent.substring(1);
      const paddedVal = valStr.padStart(minWidth, '0');
      return `${mantissa}E${sign}${paddedVal}`;
    }

    return exp;
  }

  private static formatDecimal(value: number, fmt: string): string {
    // Handle thousands separator
    const useThousands = fmt.includes(',');
    // Decimals
    const decimals = (fmt.split('.')[1] || '').replace(/[^0#]/g, '').length;

    let ret = value.toFixed(decimals);
    if (useThousands) {
      const parts = ret.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      ret = parts.join('.');
    }
    // Currency symbol?
    // E.g. "¥#,##0.00"
    // Try to preserve non-format strings
    // This is complex regex.
    // Quick hack: if fmt starts with char
    const prefix = fmt.match(/^[^#0\.]+/)?.[0] || '';
    const suffix = fmt.match(/[^#0\.]+$/)?.[0] || '';

    // Remove formatting chars from strings for logic
    return prefix.replace(/"/g, '') + ret + suffix.replace(/"/g, '');
  }

  private static formatFraction(value: number, _fmt: string): string {
    // Simple improper fraction approximation
    // "1 1/5"
    const intPart = Math.floor(value);
    const frac = value - intPart;
    if (Math.abs(frac) < 0.00001) return String(intPart);

    // Simplified: find closest denominator (up to 2 digits usually)
    let bestNum = 1,
      bestDen = 1;
    let minErr = 1.0;

    for (let den = 1; den < 100; den++) {
      const num = Math.round(frac * den);
      const err = Math.abs(frac - num / den);
      if (err < minErr) {
        minErr = err;
        bestNum = num;
        bestDen = den;
      }
    }

    return `${intPart} ${bestNum}/${bestDen}`;
  }
}
