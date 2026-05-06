import {
  ColorUtils,
  FileHandler,
  getElementsByLocalName,
  getOptionalAttr,
  Logger,
  RelationshipsResolver,
  ThemeModel
} from '@opr/shared';
import { Worksheet, Row, Cell, RichTextRun, WorksheetHyperlink, WorksheetConditionalFormatting, ConditionalFormattingRule } from './types';
import { SharedStringsParser } from './SharedStringsParser';

const logger = new Logger('WorksheetParser');

export class WorksheetParser {
  /**
   * 解析 sheetX.xml
   * @param xmlString XML 内容
   * @param sharedStrings 共享字符串表
   * @returns Worksheet 对象
   */
  static parse(
    xmlString: string,
    sharedStrings: (string | RichTextRun[])[],
    rels: RelationshipsResolver = RelationshipsResolver.empty(),
    options: { theme?: ThemeModel } = {}
  ): Worksheet {
    const worksheet: Worksheet = {
      name: '', // 在 workbook.xml 中定义，这里暂时为空
      rows: new Map(),
      cols: new Map()
    };

    try {
      const doc = FileHandler.parseXML(xmlString);

      // 0. 解析 SheetViews (Freeze Panes)
      const sheetViewsNode = doc.querySelector('sheetViews');
      if (sheetViewsNode) {
        const sheetViewNodes = sheetViewsNode.querySelectorAll('sheetView');
        if (sheetViewNodes.length > 0) {
          // Usually take the first one
          const paneNode = sheetViewNodes[0].querySelector('pane');
          if (paneNode) {
            const xSplit = parseFloat(paneNode.getAttribute('xSplit') || '0');
            const ySplit = parseFloat(paneNode.getAttribute('ySplit') || '0');
            const topLeftCell = paneNode.getAttribute('topLeftCell');
            const state = paneNode.getAttribute('state');

            if (state === 'frozen' || xSplit > 0 || ySplit > 0) {
              worksheet.frozen = {
                xSplit,
                ySplit,
                topLeftCell: topLeftCell || undefined,
                state: state || 'split'
              };
            }
          }
        }
      }

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
          const styleId = this.parseStyleId(colNode.getAttribute('style'));

          const colInfo = {
            min,
            max,
            width,
            customWidth,
            ...(styleId !== undefined ? { styleId } : {})
          };

          // 展开 col 范围 (min-max) 到每一列
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
          const row = this.parseRow(rowNode, sharedStrings, worksheet.cols, options.theme);
          worksheet.rows.set(row.index, row);
        }
      }

      // 4. 解析 Merged Cells
      const mergeCellsNode = doc.querySelector('mergeCells');
      if (mergeCellsNode) {
        worksheet.merges = [];
        const mergeNodes = mergeCellsNode.querySelectorAll('mergeCell');
        for (let i = 0; i < mergeNodes.length; i++) {
          const ref = mergeNodes[i].getAttribute('ref');
          if (ref) {
            worksheet.merges.push(ref);
          }
        }
      }

      // 5. Parse Drawing
      const drawingNode = doc.querySelector('drawing');
      if (drawingNode) {
        worksheet.drawingRId = drawingNode.getAttribute('r:id') || drawingNode.getAttribute('id') || undefined;
      }

      // 6. Parse hyperlinks and attach them to cells in the referenced range.
      worksheet.hyperlinks = this.parseHyperlinks(doc, rels);
      for (const hyperlink of worksheet.hyperlinks) {
        const range = this.parseRange(hyperlink.ref);
        for (let rowIndex = range.startRow; rowIndex <= range.endRow; rowIndex++) {
          const row = worksheet.rows.get(rowIndex);
          if (!row) continue;

          for (let colIndex = range.startCol; colIndex <= range.endCol; colIndex++) {
            const cell = row.cells.get(colIndex);
            if (cell) {
              cell.hyperlink = hyperlink;
            }
          }
        }
      }

      // 7. Parse conditional formatting rules.
      worksheet.conditionalFormattings = this.parseConditionalFormattings(doc);
    } catch (e) {
      logger.error('Failed to parse worksheet', e);
    }

    return worksheet;
  }

  private static parseRow(
    rowNode: Element,
    sharedStrings: (string | RichTextRun[])[],
    cols: Map<number, { styleId?: number }>,
    theme?: ThemeModel
  ): Row {
    const rIndex = parseInt(rowNode.getAttribute('r') || '0', 10);
    const ht = rowNode.getAttribute('ht');
    const customHeight = rowNode.getAttribute('customHeight') === '1';
    const rowStyleId = this.parseStyleId(rowNode.getAttribute('s'));

    const row: Row = {
      index: rIndex,
      cells: new Map(),
      customHeight
    };

    if (ht) {
      row.height = parseFloat(ht);
    }
    if (rowStyleId !== undefined) {
      row.styleId = rowStyleId;
    }

    const cNodes = rowNode.querySelectorAll('c');
    for (let i = 0; i < cNodes.length; i++) {
      const cNode = cNodes[i];
      const colIndex = this.getCellColumnIndex(cNode);
      const inheritedStyleId = rowStyleId ?? cols.get(colIndex)?.styleId;
      const cell = this.parseCell(cNode, rIndex, sharedStrings, theme, inheritedStyleId, colIndex);
      row.cells.set(cell.col, cell);
    }

    return row;
  }

  private static parseCell(
    cNode: Element,
    rowIndex: number,
    sharedStrings: (string | RichTextRun[])[],
    theme?: ThemeModel,
    inheritedStyleId?: number,
    parsedColIndex?: number
  ): Cell {
    const tAttr = cNode.getAttribute('t') || 'n'; // type: s, b, e, str, inlineStr, n(default)
    const sAttr = cNode.getAttribute('s'); // style index

    // 计算列索引
    const colIndex = parsedColIndex ?? this.getCellColumnIndex(cNode);

    const cell: Cell = {
      row: rowIndex,
      col: colIndex,
      type: 'string', // 默认string，下面会修正
      value: ''
    };

    const ownStyleId = this.parseStyleId(sAttr);
    if (ownStyleId !== undefined) {
      cell.styleId = ownStyleId;
    } else if (inheritedStyleId !== undefined) {
      cell.styleId = inheritedStyleId;
    }

    // 获取值 <v>
    const vNode = cNode.querySelector('v');
    const vText = vNode ? vNode.textContent || '' : '';

    switch (tAttr) {
      case 's': // Shared String
        cell.type = 'sharedString';
        const idx = parseInt(vText, 10);
        if (idx >= 0 && idx < sharedStrings.length) {
          const content = sharedStrings[idx];
          if (typeof content === 'string') {
            cell.value = content;
          } else {
            // Rich Text
            cell.richText = content;
            // Concatenate text for fallback
            cell.value = content.map(r => r.text).join('');
          }
        } else {
          cell.value = vText; // Fallback
        }
        break;

      case 'inlineStr': // Inline String
        cell.type = 'inlineString';
        const isNode = cNode.querySelector('is');
        if (isNode) {
          // Check for runs <r>
          const rNodes = isNode.querySelectorAll('r');
          if (rNodes.length > 0) {
            const runs: RichTextRun[] = [];
            let fullText = '';
            for (let j = 0; j < rNodes.length; j++) {
              const r = rNodes[j];
              const t = r.querySelector('t')?.textContent || '';
              const rPr = r.querySelector('rPr');
              const run: RichTextRun = {
                text: t,
                ...(rPr ? { font: SharedStringsParser.parseRPr(rPr, theme) } : {})
              };
              fullText += t;
              runs.push(run);
            }
            cell.richText = runs;
            cell.value = fullText;
          } else {
            const tNodes = isNode.querySelectorAll('t');
            let text = '';
            for (let j = 0; j < tNodes.length; j++) {
              text += tNodes[j].textContent || '';
            }
            cell.value = text;
          }
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
      cell.hasFormulaResult = vNode !== null;
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

  private static getCellColumnIndex(cNode: Element): number {
    const rAttr = cNode.getAttribute('r');
    return rAttr ? this.getColumnIndex(rAttr) : 0;
  }

  private static parseStyleId(value: string | null): number | undefined {
    if (value === null || value === '') {
      return undefined;
    }

    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
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

  public static parseRange(ref: string) {
    const parts = ref.split(':');
    const start = parts[0];
    const end = parts.length > 1 ? parts[1] : start;

    return {
      startRow: parseInt(start.replace(/[A-Z]+/, ''), 10),
      endRow: parseInt(end.replace(/[A-Z]+/, ''), 10),
      startCol: this.getColumnIndex(start),
      endCol: this.getColumnIndex(end)
    };
  }

  private static parseHyperlinks(doc: Document, rels: RelationshipsResolver): WorksheetHyperlink[] {
    const nodes = getElementsByLocalName(doc, 'hyperlink');
    const hyperlinks: WorksheetHyperlink[] = [];

    for (const node of nodes) {
      const ref = getOptionalAttr(node, 'ref');
      if (!ref) continue;

      const relationshipId = getOptionalAttr(node, 'r:id') || getOptionalAttr(node, 'id');
      const relationship = relationshipId ? rels.get(relationshipId) : undefined;

      hyperlinks.push({
        ref,
        relationshipId,
        target: relationship?.target,
        location: getOptionalAttr(node, 'location') || relationship?.resolvedTarget,
        tooltip: getOptionalAttr(node, 'tooltip'),
        display: getOptionalAttr(node, 'display')
      });
    }

    return hyperlinks;
  }

  private static parseConditionalFormattings(doc: Document): WorksheetConditionalFormatting[] {
    const nodes = getElementsByLocalName(doc, 'conditionalFormatting');
    const conditionalFormattings: WorksheetConditionalFormatting[] = [];

    for (const node of nodes) {
      const sqref = getOptionalAttr(node, 'sqref');
      if (!sqref) {
        continue;
      }

      const rules = getElementsByLocalName(node, 'cfRule')
        .map(ruleNode => this.parseConditionalFormattingRule(ruleNode))
        .filter((rule): rule is ConditionalFormattingRule => Boolean(rule))
        .sort((left, right) => (left.priority ?? Number.MAX_SAFE_INTEGER) - (right.priority ?? Number.MAX_SAFE_INTEGER));

      if (rules.length === 0) {
        continue;
      }

      conditionalFormattings.push({
        sqref: sqref.trim().split(/\s+/).filter(Boolean),
        rules
      });
    }

    return conditionalFormattings;
  }

  private static parseConditionalFormattingRule(node: Element): ConditionalFormattingRule | undefined {
    const type = getOptionalAttr(node, 'type');
    if (!type) {
      return undefined;
    }

    const colorScale = this.parseColorScale(getElementsByLocalName(node, 'colorScale')[0]);
    const dataBar = this.parseDataBar(getElementsByLocalName(node, 'dataBar')[0]);
    const iconSet = this.parseIconSet(getElementsByLocalName(node, 'iconSet')[0]);
    const rank = this.parseOptionalInteger(getOptionalAttr(node, 'rank'));
    const stdDev = this.parseOptionalInteger(getOptionalAttr(node, 'stdDev'));
    const percent = this.parseOptionalBoolean(getOptionalAttr(node, 'percent'));
    const bottom = this.parseOptionalBoolean(getOptionalAttr(node, 'bottom'));
    const aboveAverage = this.parseOptionalBoolean(getOptionalAttr(node, 'aboveAverage'));
    const equalAverage = this.parseOptionalBoolean(getOptionalAttr(node, 'equalAverage'));
    const timePeriod = getOptionalAttr(node, 'timePeriod');

    return {
      type,
      dxfId: this.parseOptionalInteger(getOptionalAttr(node, 'dxfId')),
      priority: this.parseOptionalInteger(getOptionalAttr(node, 'priority')),
      stopIfTrue: getOptionalAttr(node, 'stopIfTrue') === '1',
      operator: getOptionalAttr(node, 'operator'),
      text: getOptionalAttr(node, 'text'),
      ...(rank !== undefined ? { rank } : {}),
      ...(percent !== undefined ? { percent } : {}),
      ...(bottom !== undefined ? { bottom } : {}),
      ...(aboveAverage !== undefined ? { aboveAverage } : {}),
      ...(equalAverage !== undefined ? { equalAverage } : {}),
      ...(stdDev !== undefined ? { stdDev } : {}),
      ...(timePeriod ? { timePeriod } : {}),
      formulas: getElementsByLocalName(node, 'formula').map(formulaNode => formulaNode.textContent || ''),
      ...(colorScale ? { colorScale } : {}),
      ...(dataBar ? { dataBar } : {}),
      ...(iconSet ? { iconSet } : {})
    };
  }

  private static parseColorScale(node?: Element) {
    if (!node) {
      return undefined;
    }

    const values = getElementsByLocalName(node, 'cfvo').map(cfvoNode => {
      const gte = getOptionalAttr(cfvoNode, 'gte');
      return {
        type: getOptionalAttr(cfvoNode, 'type') || 'num',
        value: getOptionalAttr(cfvoNode, 'val'),
        gte: gte === undefined ? undefined : gte !== '0'
      };
    });

    const colors = getElementsByLocalName(node, 'color').map(colorNode => {
      const colorRef = ColorUtils.createColorRef(
        getOptionalAttr(colorNode, 'rgb'),
        getOptionalAttr(colorNode, 'theme'),
        getOptionalAttr(colorNode, 'indexed'),
        getOptionalAttr(colorNode, 'tint')
      );

      return {
        colorRef,
        color: ColorUtils.resolveColorRef(colorRef)
      };
    });

    if (values.length < 2 || colors.length < 2 || values.length !== colors.length) {
      return undefined;
    }

    return {
      values,
      colors
    };
  }

  private static parseDataBar(node?: Element) {
    if (!node) {
      return undefined;
    }

    const values = getElementsByLocalName(node, 'cfvo').map(cfvoNode => {
      const gte = getOptionalAttr(cfvoNode, 'gte');
      return {
        type: getOptionalAttr(cfvoNode, 'type') || 'num',
        value: getOptionalAttr(cfvoNode, 'val'),
        gte: gte === undefined ? undefined : gte !== '0'
      };
    });

    const colorNode = getElementsByLocalName(node, 'color')[0];
    const colorRef = colorNode
      ? ColorUtils.createColorRef(
          getOptionalAttr(colorNode, 'rgb'),
          getOptionalAttr(colorNode, 'theme'),
          getOptionalAttr(colorNode, 'indexed'),
          getOptionalAttr(colorNode, 'tint')
        )
      : undefined;

    if (values.length < 2 || !colorRef) {
      return undefined;
    }

    const showValue = getOptionalAttr(node, 'showValue');

    return {
      values,
      colorRef,
      color: ColorUtils.resolveColorRef(colorRef),
      minLength: this.parseOptionalNumber(getOptionalAttr(node, 'minLength')),
      maxLength: this.parseOptionalNumber(getOptionalAttr(node, 'maxLength')),
      showValue: showValue === undefined ? undefined : showValue !== '0'
    };
  }

  private static parseIconSet(node?: Element) {
    if (!node) {
      return undefined;
    }

    const values = getElementsByLocalName(node, 'cfvo').map(cfvoNode => {
      const gte = getOptionalAttr(cfvoNode, 'gte');
      return {
        type: getOptionalAttr(cfvoNode, 'type') || 'num',
        value: getOptionalAttr(cfvoNode, 'val'),
        gte: gte === undefined ? undefined : gte !== '0'
      };
    });

    if (values.length < 2) {
      return undefined;
    }

    const showValue = getOptionalAttr(node, 'showValue');
    const reverse = getOptionalAttr(node, 'reverse');

    return {
      name: getOptionalAttr(node, 'iconSet'),
      values,
      reverse: reverse === undefined ? undefined : reverse !== '0',
      showValue: showValue === undefined ? undefined : showValue !== '0'
    };
  }

  private static parseOptionalInteger(value?: string): number | undefined {
    if (value === undefined) {
      return undefined;
    }

    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private static parseOptionalNumber(value?: string): number | undefined {
    if (value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private static parseOptionalBoolean(value?: string): boolean | undefined {
    if (value === undefined) {
      return undefined;
    }

    return value !== '0';
  }
}
