/**
 * 工作表解析器
 *
 * 解析 XLSX 工作表结构 (xl/worksheets/sheet*.xml)
 */
import { XmlUtils } from '@ai-space/shared';
import {
  XlsxSheet,
  XlsxRow,
  XlsxColumn,
  XlsxMergeCell,
  XlsxCell,
  XlsxPageMargins,
  XlsxPageSetup,
  XlsxHeaderFooter,
} from '../types';
import { Logger } from '../utils/Logger';

const log = Logger.createTagged('WorksheetParser');

export class WorksheetParser {
  /**
   * 解析工作表 XML
   *
   * @param xml - 工作表 XML 内容
   * @param baseSheet - 基础工作表对象
   * @returns 完整的工作表对象
   */
  static parse(xml: string, baseSheet: XlsxSheet): XlsxSheet {
    log.group('Parsing Worksheet');
    log.debug(`Parsing sheet: ${baseSheet.name} (ID: ${baseSheet.id})`);

    const doc = XmlUtils.parse(xml);
    const sheet = { ...baseSheet };

    sheet.cols = this.parseCols(doc);
    sheet.rows = this.parseRows(doc);
    sheet.merges = this.parseMerges(doc);

    const drawing = XmlUtils.query(doc, 'drawing');
    if (drawing) {
      sheet.drawingId = drawing.getAttribute('r:id') || undefined;
    }

    sheet.pageMargins = this.parsePageMargins(doc);
    sheet.pageSetup = this.parsePageSetup(doc);
    sheet.headerFooter = this.parseHeaderFooter(doc);

    log.info('Worksheet stats', {
      rowCount: Object.keys(sheet.rows).length,
      colCount: sheet.cols.length,
      mergeCount: sheet.merges.length,
      hasDrawing: !!sheet.drawingId,
    });
    log.groupEnd();

    return sheet;
  }

  /**
   * 解析页边距
   *
   * @param doc - 文档对象
   * @returns 页边距对象
   */
  private static parsePageMargins(doc: Document): XlsxPageMargins | undefined {
    const node = XmlUtils.query(doc, 'pageMargins');
    if (!node) return undefined;
    return {
      left: parseFloat(node.getAttribute('left') || '0.7'),
      right: parseFloat(node.getAttribute('right') || '0.7'),
      top: parseFloat(node.getAttribute('top') || '0.75'),
      bottom: parseFloat(node.getAttribute('bottom') || '0.75'),
      header: parseFloat(node.getAttribute('header') || '0.3'),
      footer: parseFloat(node.getAttribute('footer') || '0.3'),
    };
  }

  /**
   * 解析页面设置
   *
   * @param doc - 文档对象
   * @returns 页面设置对象
   */
  private static parsePageSetup(doc: Document): XlsxPageSetup | undefined {
    const node = XmlUtils.query(doc, 'pageSetup');
    if (!node) return undefined;
    const orientation = node.getAttribute('orientation');
    return {
      paperSize: parseInt(node.getAttribute('paperSize') || '0', 10),
      orientation: orientation as XlsxPageSetup['orientation'], // portrait/landscape
      scale: parseInt(node.getAttribute('scale') || '100', 10),
      fitToWidth: parseInt(node.getAttribute('fitToWidth') || '1', 10),
      fitToHeight: parseInt(node.getAttribute('fitToHeight') || '1', 10),
    };
  }

  /**
   * 解析页眉页脚
   *
   * @param doc - 文档对象
   * @returns 页眉页脚对象
   */
  private static parseHeaderFooter(doc: Document): XlsxHeaderFooter | undefined {
    const node = XmlUtils.query(doc, 'headerFooter');
    if (!node) return undefined;

    return {
      alignWithMargins: node.getAttribute('alignWithMargins') !== '0', // 默认为 true
      differentFirst: node.getAttribute('differentFirst') === '1',
      differentOddEven: node.getAttribute('differentOddEven') === '1',
      oddHeader: XmlUtils.query(node, 'oddHeader')?.textContent || undefined,
      oddFooter: XmlUtils.query(node, 'oddFooter')?.textContent || undefined,
      evenHeader: XmlUtils.query(node, 'evenHeader')?.textContent || undefined,
      evenFooter: XmlUtils.query(node, 'evenFooter')?.textContent || undefined,
      firstHeader: XmlUtils.query(node, 'firstHeader')?.textContent || undefined,
      firstFooter: XmlUtils.query(node, 'firstFooter')?.textContent || undefined,
    };
  }

  /**
   * 解析列定义
   *
   * @param doc - 文档对象
   * @returns 列定义数组
   */
  private static parseCols(doc: Document): XlsxColumn[] {
    const cols: XlsxColumn[] = [];
    const colNodes = XmlUtils.queryAll(doc, 'cols col');
    colNodes.forEach((node: Element) => {
      const min = parseInt(node.getAttribute('min') || '1', 10);
      const max = parseInt(node.getAttribute('max') || '1', 10);
      const width = parseFloat(node.getAttribute('width') || '8'); // 默认近似宽度
      const customWidth = !!node.getAttribute('customWidth');
      const hidden = !!node.getAttribute('hidden');

      cols.push({
        min,
        max,
        width,
        customWidth,
        hidden,
      });
    });
    return cols;
  }

  /**
   * 解析行数据
   *
   * @param doc - 文档对象
   * @returns 行数据映射
   */
  private static parseRows(doc: Document): Record<number, XlsxRow> {
    const rows: Record<number, XlsxRow> = {};
    const rowNodes = XmlUtils.queryAll(doc, 'sheetData row');

    rowNodes.forEach((row: Element) => {
      const rIndex = parseInt(row.getAttribute('r') || '0', 10);
      const ht = row.getAttribute('ht');

      const cells: Record<number, XlsxCell> = {};
      const cNodes = XmlUtils.queryAll(row, 'c');

      cNodes.forEach((c: Element) => {
        const r = c.getAttribute('r'); // 例如 "B2"
        if (!r) return;

        const colIndex = this.getColumnIndex(r);
        const t = c.getAttribute('t') || 'n';
        const s = parseInt(c.getAttribute('s') || '0', 10);
        const vNode = XmlUtils.query(c, 'v');
        const v = vNode ? vNode.textContent || '' : undefined;
        const f = XmlUtils.query(c, 'f')?.textContent;

        let val: XlsxCell['value'] | undefined = v;
        // 类型处理
        if (v !== undefined) {
          if (t === 'n') {
            val = parseFloat(v);
            if (isNaN(val)) val = v;
          } else if (t === 'b') {
            val = v === '1';
          }
        }
        // 's' (shared) -> 索引
        // 'str' -> 内联字符串
        // 'inlineStr' -> <is><t>...</t></is>

        if (t === 'inlineStr') {
          const isT = XmlUtils.query(c, 'is t');
          if (isT) val = isT.textContent || '';
        }

        cells[colIndex] = {
          type: t as XlsxCell['type'],
          value: val,
          formula: f || undefined,
          styleIndex: s,
        };
      });

      rows[rIndex] = {
        index: rIndex,
        height: ht ? parseFloat(ht) : undefined,
        customHeight: !!row.getAttribute('customHeight'),
        hidden: !!row.getAttribute('hidden'),
        cells,
      };
    });

    return rows;
  }

  /**
   * 解析合并单元格
   *
   * @param doc - 文档对象
   * @returns 合并单元格数组
   */
  private static parseMerges(doc: Document): XlsxMergeCell[] {
    const merges: XlsxMergeCell[] = [];
    const mergeNodes = XmlUtils.queryAll(doc, 'mergeCells mergeCell');

    mergeNodes.forEach((node: Element) => {
      const ref = node.getAttribute('ref'); // "A1:B2"
      if (!ref) return;

      const [start, end] = ref.split(':');
      if (!start || !end) return;

      merges.push({
        s: this.getCellAddress(start),
        e: this.getCellAddress(end),
      });
    });
    return merges;
  }

  /**
   * 获取列索引
   *
   * 将列字母转换为数字索引（如 A=1, B=2, AA=27）
   *
   * @param cellRef - 单元格引用（如 "B2"）
   * @returns 列索引
   */
  private static getColumnIndex(cellRef: string): number {
    const colStr = cellRef.replace(/[0-9]/g, '');
    let colIndex = 0;
    for (let i = 0; i < colStr.length; i++) {
      colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64);
    }
    return colIndex;
  }

  /**
   * 获取单元格地址
   *
   * @param ref - 单元格引用（如 "B2"）
   * @returns 行列坐标对象
   */
  private static getCellAddress(ref: string): { r: number; c: number } {
    const colStr = ref.replace(/[0-9]/g, '');
    const rowStr = ref.replace(/[^0-9]/g, '');

    let colIndex = 0;
    for (let i = 0; i < colStr.length; i++) {
      colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64);
    }

    return {
      r: parseInt(rowStr, 10),
      c: colIndex,
    };
  }
}
