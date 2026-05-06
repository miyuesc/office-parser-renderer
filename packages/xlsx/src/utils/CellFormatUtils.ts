import { Cell, Styles } from '../parser/types';

const BUILTIN_NUMBER_FORMATS: Record<number, string> = {
  0: 'General',
  1: '0',
  2: '0.00',
  9: '0%',
  10: '0.00%',
  14: 'm/d/yy',
  15: 'd-mmm-yy',
  16: 'd-mmm',
  17: 'mmm-yy',
  18: 'h:mm AM/PM',
  19: 'h:mm:ss AM/PM',
  20: 'h:mm',
  21: 'h:mm:ss',
  22: 'm/d/yy h:mm',
  45: 'mm:ss',
  46: '[h]:mm:ss',
  47: 'mmss.0'
};

const BUILTIN_DATE_NUMBER_FORMAT_IDS = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 45, 46, 47]);
const EXCEL_UNIX_EPOCH_OFFSET = 25569;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export interface ResolvedNumberFormat {
  numFmtId: number;
  formatCode: string;
}

export class CellFormatUtils {
  static resolveNumberFormat(cell?: Cell, styles?: Styles): ResolvedNumberFormat | undefined {
    if (!styles || cell?.styleId === undefined) {
      return undefined;
    }

    const xf = styles.cellXfs[cell.styleId];
    if (!xf || (!xf.applyNumberFormat && xf.numFmtId === undefined)) {
      return undefined;
    }

    const numFmtId = xf.numFmtId || 0;
    return {
      numFmtId,
      formatCode: styles.numFmts.get(numFmtId) || BUILTIN_NUMBER_FORMATS[numFmtId] || 'General'
    };
  }

  static isDateFormat(formatCode: string, numFmtId?: number) {
    if (numFmtId !== undefined && BUILTIN_DATE_NUMBER_FORMAT_IDS.has(numFmtId)) {
      return true;
    }

    const normalized = formatCode
      .replace(/"[^"]*"/g, '')
      .replace(/\\./g, '')
      .replace(/\[(?![hmsHMS]+\])[^[]*?\]/g, '');

    return /(am\/pm|y+|m+|d+|h+|s+)/i.test(normalized);
  }

  static getDateValue(cell?: Cell, styles?: Styles) {
    if (!cell) {
      return undefined;
    }

    if (cell.type === 'date') {
      if (typeof cell.value === 'number' && Number.isFinite(cell.value)) {
        return this.excelSerialToDate(cell.value);
      }

      if (typeof cell.value === 'string') {
        const parsed = new Date(cell.value);
        return Number.isNaN(parsed.getTime()) ? undefined : parsed;
      }
    }

    if (typeof cell.value !== 'number' || !Number.isFinite(cell.value)) {
      return undefined;
    }

    const numberFormat = this.resolveNumberFormat(cell, styles);
    if (!numberFormat || !this.isDateFormat(numberFormat.formatCode, numberFormat.numFmtId)) {
      return undefined;
    }

    return this.excelSerialToDate(cell.value);
  }

  static excelSerialToDate(serial: number) {
    const utcDate = new Date(Math.round((serial - EXCEL_UNIX_EPOCH_OFFSET) * MILLISECONDS_PER_DAY));

    return new Date(
      utcDate.getUTCFullYear(),
      utcDate.getUTCMonth(),
      utcDate.getUTCDate(),
      utcDate.getUTCHours(),
      utcDate.getUTCMinutes(),
      utcDate.getUTCSeconds(),
      utcDate.getUTCMilliseconds()
    );
  }
}
