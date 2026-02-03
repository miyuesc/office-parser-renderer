import { FileHandler, Logger, UnitConversion } from '@opr/shared';
import { Worksheet, Row, Cell, CellType } from './types';

const logger = new Logger('WorksheetParser');

export class WorksheetParser {
  /**
   * 解析 sheetX.xml
   * @param xmlString XML 内容
   * @param sharedStrings 共享字符串表
   * @returns Worksheet 对象
   */
  static parse(xmlString: string, sharedStrings: string[]): Worksheet {
    const worksheet: Worksheet = {
      name: '', // 在 workbook.xml 中定义，这里暂时为空
      rows: new Map(),
      cols: new Map()
    };

    try {
      const doc = FileHandler.parseXML(xmlString);

      // 1. 解析维度 dimension
      const dimNode = doc.querySelector('dimension');
      if (dimNode) {
        const ref = dimNode.getAttribute('ref'); // e.g., "A1:C10" or "A1"
        if (ref) {
          worksheet.dimension = this.parseDimension(ref);
        }
      }

      // 2. 解析 Cols (列宽)
      const colsNode = doc.querySelector('cols');
      if (colsNode) {
        const colNodes = colsNode.querySelectorAll('col');
        for (let i = 0; i < colNodes.length; i++) {
          const colNode = colNodes[i];
          const min = parseInt(colNode.getAttribute('min') || '1', 10);
          const max = parseInt(colNode.getAttribute('max') || '1', 10);
          const width = parseFloat(colNode.getAttribute('width') || '10');
          const customWidth = colNode.getAttribute('customWidth') === '1';

          const colInfo = { min, max, width, customWidth };

          // 展开 col 范围 (min-max) 到每一列
          // 实际存储可以优化为 Range, 但 MVP 为了查询方便，可以暂时不展开，或者渲染时查 Range
          // 为了 GridRenderer 简单，我们暂时存储 Range?
          // 不，TYPES里定义的是 Map<number, Column>，key是colIndex?
          // 不太好，Excel col 定义通常是 Ranges.
          // 这里我们做一个简单的 Range 展开，或者让 Map key 代表 min?
          // 还是展开吧，通常 max - min 不会太大。

          for (let c = min; c <= max; c++) {
            worksheet.cols.set(c, colInfo);
          }
        }
      }

      // 3. 解析 SheetData
      const sheetData = doc.querySelector('sheetData');
      if (sheetData) {
        const rowNodes = sheetData.querySelectorAll('row');
        for (let i = 0; i < rowNodes.length; i++) {
          const rowNode = rowNodes[i];
          const row = this.parseRow(rowNode, sharedStrings);
          worksheet.rows.set(row.index, row);
        }
      }
    } catch (e) {
      logger.error('Failed to parse worksheet', e);
    }

    return worksheet;
  }

  private static parseRow(rowNode: Element, sharedStrings: string[]): Row {
    const rIndex = parseInt(rowNode.getAttribute('r') || '0', 10);
    const ht = rowNode.getAttribute('ht');
    const customHeight = rowNode.getAttribute('customHeight') === '1';

    const row: Row = {
      index: rIndex,
      cells: new Map(),
      customHeight
    };

    if (ht) {
      row.height = parseFloat(ht);
    }

    const cNodes = rowNode.querySelectorAll('c');
    for (let i = 0; i < cNodes.length; i++) {
      const cNode = cNodes[i];
      const cell = this.parseCell(cNode, rIndex, sharedStrings);
      row.cells.set(cell.col, cell);
    }

    return row;
  }

  private static parseCell(cNode: Element, rowIndex: number, sharedStrings: string[]): Cell {
    const rAttr = cNode.getAttribute('r'); // e.g. "A1"
    const tAttr = cNode.getAttribute('t') || 'n'; // type: s, b, e, str, inlineStr, n(default)
    const sAttr = cNode.getAttribute('s'); // style index

    // 计算列索引
    let colIndex = 0;
    if (rAttr) {
      colIndex = this.getColumnIndex(rAttr);
    }

    const cell: Cell = {
      row: rowIndex,
      col: colIndex,
      type: 'string', // 默认string，下面会修正
      value: ''
    };

    if (sAttr) {
      cell.styleId = parseInt(sAttr, 10);
    }

    // 获取值 <v>
    const vNode = cNode.querySelector('v');
    const vText = vNode ? vNode.textContent || '' : '';

    switch (tAttr) {
      case 's': // Shared String
        cell.type = 'sharedString';
        const idx = parseInt(vText, 10);
        if (idx >= 0 && idx < sharedStrings.length) {
          cell.value = sharedStrings[idx];
        } else {
          cell.value = vText; // Fallback
        }
        break;

      case 'inlineStr': // Inline String
        cell.type = 'inlineString';
        const isNode = cNode.querySelector('is');
        if (isNode) {
          const tNodes = isNode.querySelectorAll('t');
          let text = '';
          for (let j = 0; j < tNodes.length; j++) {
            text += tNodes[j].textContent || '';
          }
          cell.value = text;
        }
        break;

      case 'b': // Boolean
        cell.type = 'boolean';
        cell.value = vText === '1';
        break;

      case 'str': // Formula String result
        cell.type = 'string';
        cell.value = vText;
        break;

      case 'e': // Error
        cell.type = 'error';
        cell.value = vText;
        break;

      case 'n': // Number
      default:
        cell.type = 'number';
        cell.value = vText ? parseFloat(vText) : '';
        break;
    }

    // Formula <f>
    const fNode = cNode.querySelector('f');
    if (fNode) {
      cell.formula = fNode.textContent || '';
    }

    return cell;
  }

  private static getColumnIndex(cellRef: string): number {
    // "A1" -> "A" -> 1
    // "AA10" -> "AA" -> 27
    const matches = cellRef.match(/^([A-Z]+)/);
    if (!matches) return 0;

    const colStr = matches[1];
    let index = 0;
    for (let i = 0; i < colStr.length; i++) {
      index = index * 26 + (colStr.charCodeAt(i) - 64);
    }
    return index;
  }

  private static parseDimension(ref: string) {
    const parts = ref.split(':');
    const start = parts[0];
    const end = parts.length > 1 ? parts[1] : start;

    // 简单解析，实际需要正则分离行列
    // 假设 A1:C10
    const parseRef = (r: string) => {
      const colMatch = r.match(/[A-Z]+/);
      const rowMatch = r.match(/[0-9]+/);
      return {
        colStr: colMatch ? colMatch[0] : 'A',
        row: rowMatch ? parseInt(rowMatch[0], 10) : 1
      };
    };

    const startPos = parseRef(start);
    const endPos = parseRef(end);

    return {
      startStr: startPos.colStr,
      endStr: endPos.colStr,
      startRow: startPos.row,
      endRow: endPos.row,
      startCol: this.getColumnIndex(start),
      endCol: this.getColumnIndex(end)
    };
  }
}
