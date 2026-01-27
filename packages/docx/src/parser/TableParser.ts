 
/**
 * 表格解析器
 *
 * 解析 w:tbl 元素
 * 处理表格属性、行、列和单元格
 */

import { XmlUtils } from '@ai-space/shared';
import { Logger } from '../utils/Logger';
import { ParagraphParser, ParagraphParserContext } from './ParagraphParser';
import type {
  Table,
  TableProperties,
  TableRow,
  TableRowProperties,
  TableCell,
  TableCellProperties,
  TableWidth,
  TableBorders,
  TableCellMargins,
  TableLook,
  BorderStyle,
  Shading,
  DocxElement,
} from '../types';

const log = Logger.createTagged('TableParser');

/**
 * 表格解析器类
 */
export class TableParser {
  /**
   * 解析表格
   *
   * @param node - w:tbl 元素
   * @param context - 解析上下文
   * @returns Table 对象
   */
  static parse(node: Element, context?: ParagraphParserContext): Table {
    // 解析表格属性
    const tblPrNode = XmlUtils.query(node, 'w\\:tblPr, tblPr');
    const props = tblPrNode ? this.parseProperties(tblPrNode) : {};

    // 解析列宽网格
    const grid = this.parseGrid(node);

    // 解析行
    const rows = this.parseRows(node, context);

    log.debug(`解析表格: ${rows.length} 行, ${grid.length} 列`);

    return {
      type: 'table',
      props,
      grid,
      rows,
    };
  }

  /**
   * 解析表格属性
   *
   * @param node - w:tblPr 元素
   * @returns TableProperties 对象
   */
  private static parseProperties(node: Element): TableProperties {
    const props: TableProperties = {};

    // 表格样式
    const tblStyle = XmlUtils.query(node, 'w\\:tblStyle, tblStyle');
    if (tblStyle) {
      props.styleId = tblStyle.getAttribute('w:val') || undefined;
    }

    // 表格宽度
    const tblW = XmlUtils.query(node, 'w\\:tblW, tblW');
    if (tblW) {
      props.width = this.parseWidth(tblW);
    }

    // 表格对齐
    const jcNode = XmlUtils.query(node, 'w\\:jc, jc');
    if (jcNode) {
      const val = jcNode.getAttribute('w:val');
      if (val === 'left' || val === 'center' || val === 'right') {
        props.alignment = val;
      }
    }

    // 表格缩进
    const tblInd = XmlUtils.query(node, 'w\\:tblInd, tblInd');
    if (tblInd) {
      const w = tblInd.getAttribute('w:w');
      if (w) {
        props.indent = parseInt(w, 10);
      }
    }

    // 表格边框
    const tblBorders = XmlUtils.query(node, 'w\\:tblBorders, tblBorders');
    if (tblBorders) {
      props.borders = this.parseTableBorders(tblBorders);
    }

    // 默认单元格边距
    const tblCellMar = XmlUtils.query(node, 'w\\:tblCellMar, tblCellMar');
    if (tblCellMar) {
      props.cellMargins = this.parseCellMargins(tblCellMar);
    }

    // 单元格间距
    const tblCellSpacing = XmlUtils.query(node, 'w\\:tblCellSpacing, tblCellSpacing');
    if (tblCellSpacing) {
      const w = tblCellSpacing.getAttribute('w:w');
      if (w) {
        props.cellSpacing = parseInt(w, 10);
      }
    }

    // 表格底纹
    const shd = XmlUtils.query(node, 'w\\:shd, shd');
    if (shd) {
      props.shading = this.parseShading(shd);
    }

    // 表格布局
    const tblLayout = XmlUtils.query(node, 'w\\:tblLayout, tblLayout');
    if (tblLayout) {
      const type = tblLayout.getAttribute('w:type');
      if (type === 'fixed' || type === 'autofit') {
        props.layout = type;
      }
    }

    // 表格外观
    const tblLook = XmlUtils.query(node, 'w\\:tblLook, tblLook');
    if (tblLook) {
      props.look = this.parseTableLook(tblLook);
    }

    return props;
  }

  /**
   * 解析宽度
   *
   * @param node - 宽度元素
   * @returns TableWidth 对象
   */
  private static parseWidth(node: Element): TableWidth {
    const w = node.getAttribute('w:w');
    const type = node.getAttribute('w:type');

    return {
      value: w ? parseInt(w, 10) : 0,
      type: (type || 'auto') as TableWidth['type'],
    };
  }

  /**
   * 解析表格边框
   *
   * @param node - w:tblBorders 元素
   * @returns TableBorders 对象
   */
  private static parseTableBorders(node: Element): TableBorders {
    const borders: TableBorders = {};

    const sides = ['top', 'bottom', 'left', 'right', 'insideH', 'insideV', 'tl2br', 'tr2bl'];
    for (const side of sides) {
      const sideNode = XmlUtils.query(node, `w\\:${side}, ${side}`);
      if (sideNode) {
        borders[side as keyof TableBorders] = this.parseBorderStyle(sideNode);
      }
    }

    return borders;
  }

  /**
   * 解析边框样式
   *
   * @param node - 边框元素
   * @returns BorderStyle 对象
   */
  private static parseBorderStyle(node: Element): BorderStyle {
    return {
      val: node.getAttribute('w:val') || 'single',
      color: node.getAttribute('w:color') || undefined,
      sz: node.getAttribute('w:sz') ? parseInt(node.getAttribute('w:sz')!, 10) : undefined,
      space: node.getAttribute('w:space') ? parseInt(node.getAttribute('w:space')!, 10) : undefined,
      shadow: node.getAttribute('w:shadow') === '1' || node.getAttribute('w:shadow') === 'true',
      themeColor: node.getAttribute('w:themeColor') || undefined,
    };
  }

  /**
   * 解析单元格边距
   *
   * @param node - w:tblCellMar 元素
   * @returns TableCellMargins 对象
   */
  private static parseCellMargins(node: Element): TableCellMargins {
    const margins: TableCellMargins = {};

    const sides = ['top', 'bottom', 'left', 'right', 'start', 'end'];
    for (const side of sides) {
      const sideNode = XmlUtils.query(node, `w\\:${side}, ${side}`);
      if (sideNode) {
        const w = sideNode.getAttribute('w:w');
        if (w) {
          // start/end 映射到 left/right
          const key = side === 'start' ? 'left' : side === 'end' ? 'right' : side;
          margins[key as keyof TableCellMargins] = parseInt(w, 10);
        }
      }
    }

    return margins;
  }

  /**
   * 解析底纹
   *
   * @param node - w:shd 元素
   * @returns Shading 对象
   */
  private static parseShading(node: Element): Shading {
    return {
      val: node.getAttribute('w:val') || 'clear',
      fill: node.getAttribute('w:fill') || undefined,
      color: node.getAttribute('w:color') || undefined,
      themeFill: node.getAttribute('w:themeFill') || undefined,
      themeColor: node.getAttribute('w:themeColor') || undefined,
    };
  }

  /**
   * 解析表格外观
   *
   * @param node - w:tblLook 元素
   * @returns TableLook 对象
   */
  private static parseTableLook(node: Element): TableLook {
    const val = node.getAttribute('w:val');
    const look: TableLook = {};

    if (val) {
      // 解析十六进制位掩码
      const mask = parseInt(val, 16);
      look.firstRow = !!(mask & 0x0020);
      look.lastRow = !!(mask & 0x0040);
      look.firstColumn = !!(mask & 0x0080);
      look.lastColumn = !!(mask & 0x0100);
      look.noHBand = !!(mask & 0x0200);
      look.noVBand = !!(mask & 0x0400);
    } else {
      // 单独属性
      look.firstRow = node.getAttribute('w:firstRow') === '1';
      look.lastRow = node.getAttribute('w:lastRow') === '1';
      look.firstColumn = node.getAttribute('w:firstColumn') === '1';
      look.lastColumn = node.getAttribute('w:lastColumn') === '1';
      look.noHBand = node.getAttribute('w:noHBand') === '1';
      look.noVBand = node.getAttribute('w:noVBand') === '1';
    }

    return look;
  }

  /**
   * 解析列宽网格
   *
   * @param node - w:tbl 元素
   * @returns 列宽数组 (twips)
   */
  private static parseGrid(node: Element): number[] {
    const grid: number[] = [];
    const tblGrid = XmlUtils.query(node, 'w\\:tblGrid, tblGrid');

    if (tblGrid) {
      const gridCols = XmlUtils.queryAll(tblGrid, 'w\\:gridCol, gridCol');
      gridCols.forEach((col: Element) => {
        const w = col.getAttribute('w:w');
        grid.push(w ? parseInt(w, 10) : 0);
      });
    }

    return grid;
  }

  /**
   * 解析所有行
   *
   * @param node - w:tbl 元素
   * @param context - 解析上下文
   * @returns TableRow 数组
   */
  private static parseRows(node: Element, context?: ParagraphParserContext): TableRow[] {
    const rows: TableRow[] = [];
    const trNodes = XmlUtils.queryAll(node, 'w\\:tr, tr');

    trNodes.forEach((tr: Element) => {
      const row = this.parseRow(tr, context);
      rows.push(row);
    });

    return rows;
  }

  /**
   * 解析单行
   *
   * @param node - w:tr 元素
   * @param context - 解析上下文
   * @returns TableRow 对象
   */
  private static parseRow(node: Element, context?: ParagraphParserContext): TableRow {
    // 解析行属性
    const trPrNode = XmlUtils.query(node, 'w\\:trPr, trPr');
    const props = trPrNode ? this.parseRowProperties(trPrNode) : {};

    // 解析单元格
    const cells = this.parseCells(node, context);

    return {
      type: 'row',
      props,
      cells,
    };
  }

  /**
   * 解析行属性
   *
   * @param node - w:trPr 元素
   * @returns TableRowProperties 对象
   */
  private static parseRowProperties(node: Element): TableRowProperties {
    const props: TableRowProperties = {};

    // 行高
    const trHeight = XmlUtils.query(node, 'w\\:trHeight, trHeight');
    if (trHeight) {
      const val = trHeight.getAttribute('w:val');
      const hRule = trHeight.getAttribute('w:hRule');

      if (val) {
        props.height = parseInt(val, 10);
      }
      if (hRule) {
        props.heightRule = hRule as TableRowProperties['heightRule'];
      }
    }

    // 表头行
    const tblHeader = XmlUtils.query(node, 'w\\:tblHeader, tblHeader');
    if (tblHeader) {
      const val = tblHeader.getAttribute('w:val');
      props.isHeader = val !== '0' && val !== 'false';
    }

    // 不允许跨页拆分
    const cantSplit = XmlUtils.query(node, 'w\\:cantSplit, cantSplit');
    if (cantSplit) {
      const val = cantSplit.getAttribute('w:val');
      props.cantSplit = val !== '0' && val !== 'false';
    }

    return props;
  }

  /**
   * 解析所有单元格
   *
   * @param node - w:tr 元素
   * @param context - 解析上下文
   * @returns TableCell 数组
   */
  private static parseCells(node: Element, context?: ParagraphParserContext): TableCell[] {
    const cells: TableCell[] = [];
    const tcNodes = XmlUtils.queryAll(node, 'w\\:tc, tc');

    tcNodes.forEach((tc: Element) => {
      const cell = this.parseCell(tc, context);
      cells.push(cell);
    });

    return cells;
  }

  /**
   * 解析单个单元格
   *
   * @param node - w:tc 元素
   * @param context - 解析上下文
   * @returns TableCell 对象
   */
  private static parseCell(node: Element, context?: ParagraphParserContext): TableCell {
    // 解析单元格属性
    const tcPrNode = XmlUtils.query(node, 'w\\:tcPr, tcPr');
    const props = tcPrNode ? this.parseCellProperties(tcPrNode) : {};

    // 解析单元格内容
    const children = this.parseCellContent(node, context);

    return {
      type: 'cell',
      props,
      children,
    };
  }

  /**
   * 解析单元格属性
   *
   * @param node - w:tcPr 元素
   * @returns TableCellProperties 对象
   */
  private static parseCellProperties(node: Element): TableCellProperties {
    const props: TableCellProperties = {};

    // 单元格宽度
    const tcW = XmlUtils.query(node, 'w\\:tcW, tcW');
    if (tcW) {
      const w = tcW.getAttribute('w:w');
      const type = tcW.getAttribute('w:type');
      if (w) {
        props.width = parseInt(w, 10);
        props.widthType = (type || 'dxa') as TableCellProperties['widthType'];
      }
    }

    // 水平合并
    const gridSpan = XmlUtils.query(node, 'w\\:gridSpan, gridSpan');
    if (gridSpan) {
      const val = gridSpan.getAttribute('w:val');
      if (val) {
        props.gridSpan = parseInt(val, 10);
      }
    }

    // 垂直合并
    const vMerge = XmlUtils.query(node, 'w\\:vMerge, vMerge');
    if (vMerge) {
      const val = vMerge.getAttribute('w:val');
      props.vMerge = val === 'restart' ? 'restart' : 'continue';
    }

    // 单元格边框
    const tcBorders = XmlUtils.query(node, 'w\\:tcBorders, tcBorders');
    if (tcBorders) {
      props.borders = this.parseTableBorders(tcBorders);
    }

    // 单元格边距
    const tcMar = XmlUtils.query(node, 'w\\:tcMar, tcMar');
    if (tcMar) {
      props.margins = this.parseCellMargins(tcMar);
    }

    // 单元格底纹
    const shd = XmlUtils.query(node, 'w\\:shd, shd');
    if (shd) {
      props.shading = this.parseShading(shd);
    }

    // 垂直对齐
    const vAlign = XmlUtils.query(node, 'w\\:vAlign, vAlign');
    if (vAlign) {
      const val = vAlign.getAttribute('w:val');
      if (val === 'top' || val === 'center' || val === 'bottom') {
        props.vAlign = val;
      }
    }

    // 文字方向
    const textDirection = XmlUtils.query(node, 'w\\:textDirection, textDirection');
    if (textDirection) {
      const val = textDirection.getAttribute('w:val');
      if (val) {
        props.textDirection = val as TableCellProperties['textDirection'];
      }
    }

    // 禁止自动换行
    const noWrap = XmlUtils.query(node, 'w\\:noWrap, noWrap');
    if (noWrap) {
      const val = noWrap.getAttribute('w:val');
      props.noWrap = val !== '0' && val !== 'false';
    }

    // 适应文本
    const tcFitText = XmlUtils.query(node, 'w\\:tcFitText, tcFitText');
    if (tcFitText) {
      const val = tcFitText.getAttribute('w:val');
      props.tcFitText = val !== '0' && val !== 'false';
    }

    return props;
  }

  /**
   * 解析单元格内容
   *
   * @param node - w:tc 元素
   * @param context - 解析上下文
   * @returns DocxElement 数组
   */
  private static parseCellContent(node: Element, context?: ParagraphParserContext): DocxElement[] {
    const children: DocxElement[] = [];

    for (const child of Array.from(node.children)) {
      const tagName = child.tagName.toLowerCase();
      const localName = tagName.split(':').pop() || tagName;

      switch (localName) {
        case 'p': {
          // 段落
          const para = ParagraphParser.parse(child, context);
          children.push(para);
          break;
        }

        case 'tbl': {
          // 嵌套表格
          const nestedTable = TableParser.parse(child, context);
          children.push(nestedTable);
          break;
        }

        case 'tcpr':
          // 单元格属性，已在上面处理
          break;

        case 'sdt': {
          // 结构化文档标签
          const sdtContent = XmlUtils.query(child, 'w\\:sdtContent, sdtContent');
          if (sdtContent) {
            const sdtChildren = this.parseCellContent(sdtContent, context);
            children.push(...sdtChildren);
          }
          break;
        }

        default:
          log.debug(`未处理的单元格子元素: ${localName}`);
          break;
      }
    }

    return children;
  }
}
