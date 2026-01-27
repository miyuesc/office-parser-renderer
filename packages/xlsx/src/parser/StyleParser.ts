/**
 * 样式解析器
 *
 * 解析 XLSX 样式定义 (xl/styles.xml)
 */
import { XmlUtils } from '@ai-space/shared';
import {
  XlsxStyles,
  XlsxFont,
  XlsxFill,
  XlsxBorder,
  XlsxCellXf,
  XlsxColor,
  XlsxBorderSide,
} from '../types';

export class StyleParser {
  /**
   * 解析样式 XML
   *
   * @param stylesXml - 样式 XML 内容
   * @returns 样式集对象
   */
  static parse(stylesXml: string): XlsxStyles {
    const doc = XmlUtils.parse(stylesXml);

    return {
      numFmts: this.parseNumFmts(doc),
      fonts: this.parseFonts(doc),
      fills: this.parseFills(doc),
      borders: this.parseBorders(doc),
      cellXfs: this.parseCellXfs(doc),
    };
  }

  /**
   * 解析数字格式
   *
   * @param doc - 文档对象
   * @returns 数字格式映射（ID -> 格式代码）
   */
  private static parseNumFmts(doc: Document): Record<number, string> {
    const numFmts: Record<number, string> = {
      // 标准 Excel 格式（部分列表）
      0: 'General',
      1: '0',
      2: '0.00',
      3: '#,##0',
      4: '#,##0.00',
      9: '0%',
      10: '0.00%',
      11: '0.00E+00',
      12: '# ?/?',
      13: '# ??/??',
      14: 'mm-dd-yy',
      15: 'd-mmm-yy',
      16: 'd-mmm',
      17: 'mmm-yy',
      18: 'h:mm AM/PM',
      19: 'h:mm:ss AM/PM',
      20: 'h:mm',
      21: 'h:mm:ss',
      22: 'm/d/yy h:mm',
      49: '@',
    };

    const nodes = XmlUtils.queryAll(doc, 'numFmts numFmt');
    nodes.forEach((node: Element) => {
      const id = parseInt(node.getAttribute('numFmtId') || '0', 10);
      const code = node.getAttribute('formatCode');
      if (code) {
        numFmts[id] = code;
      }
    });

    return numFmts;
  }

  /**
   * 解析字体
   *
   * @param doc - 文档对象
   * @returns 字体数组
   */
  private static parseFonts(doc: Document): XlsxFont[] {
    const fonts: XlsxFont[] = [];
    const nodes = XmlUtils.queryAll(doc, 'fonts font');
    nodes.forEach((node: Element) => {
      fonts.push({
        sz: parseInt(XmlUtils.query(node, 'sz')?.getAttribute('val') || '11', 10),
        name: XmlUtils.query(node, 'name')?.getAttribute('val') || 'Calibri',
        b: !!XmlUtils.query(node, 'b'),
        i: !!XmlUtils.query(node, 'i'),
        u: XmlUtils.query(node, 'u')
          ? XmlUtils.query(node, 'u')?.getAttribute('val') || true
          : undefined,
        strike: !!XmlUtils.query(node, 'strike'),
        color: this.parseColor(XmlUtils.query(node, 'color')),
      });
    });
    return fonts;
  }

  /**
   * 解析填充
   *
   * @param doc - 文档对象
   * @returns 填充数组
   */
  private static parseFills(doc: Document): XlsxFill[] {
    const fills: XlsxFill[] = [];
    const nodes = XmlUtils.queryAll(doc, 'fills fill');
    nodes.forEach((node: Element) => {
      const patternFill = XmlUtils.query(node, 'patternFill');
      if (patternFill) {
        fills.push({
          patternType: patternFill.getAttribute('patternType') || undefined,
          fgColor: this.parseColor(XmlUtils.query(patternFill, 'fgColor')),
          bgColor: this.parseColor(XmlUtils.query(patternFill, 'bgColor')),
        });
      } else {
        fills.push({}); // gradientFill 占位符等
      }
    });
    return fills;
  }

  /**
   * 解析边框
   *
   * @param doc - 文档对象
   * @returns 边框数组
   */
  private static parseBorders(doc: Document): XlsxBorder[] {
    const borders: XlsxBorder[] = [];
    const nodes = XmlUtils.queryAll(doc, 'borders border');
    nodes.forEach((node: Element) => {
      borders.push({
        left: this.parseBorderSide(XmlUtils.query(node, 'left')),
        right: this.parseBorderSide(XmlUtils.query(node, 'right')),
        top: this.parseBorderSide(XmlUtils.query(node, 'top')),
        bottom: this.parseBorderSide(XmlUtils.query(node, 'bottom')),
        diagonal: this.parseBorderSide(XmlUtils.query(node, 'diagonal')),
      });
    });
    return borders;
  }

  /**
   * 解析边框边
   *
   * @param node - 边框边节点
   * @returns 边框边对象
   */
  private static parseBorderSide(node: Element | null): XlsxBorderSide | undefined {
    if (!node) return undefined;
    const style = node.getAttribute('style');
    if (!style) return undefined;
    return {
      style,
      color: this.parseColor(XmlUtils.query(node, 'color')),
    };
  }

  /**
   * 解析单元格格式
   *
   * @param doc - 文档对象
   * @returns 单元格格式数组
   */
  private static parseCellXfs(doc: Document): XlsxCellXf[] {
    const cellXfs: XlsxCellXf[] = [];
    const nodes = XmlUtils.queryAll(doc, 'cellXfs xf');
    nodes.forEach((node: Element) => {
      const alignNode = XmlUtils.query(node, 'alignment');
      cellXfs.push({
        numFmtId: parseInt(node.getAttribute('numFmtId') || '0', 10),
        fontId: parseInt(node.getAttribute('fontId') || '0', 10),
        fillId: parseInt(node.getAttribute('fillId') || '0', 10),
        borderId: parseInt(node.getAttribute('borderId') || '0', 10),
        xfId: parseInt(node.getAttribute('xfId') || '0', 10),
        applyAlignment: !!node.getAttribute('applyAlignment'),
        alignment: alignNode
          ? {
              horizontal: alignNode.getAttribute('horizontal') as NonNullable<
                XlsxCellXf['alignment']
              >['horizontal'],
              vertical: alignNode.getAttribute('vertical') as NonNullable<
                XlsxCellXf['alignment']
              >['vertical'],
              wrapText: !!alignNode.getAttribute('wrapText'),
              indent: parseInt(alignNode.getAttribute('indent') || '0', 10),
              textRotation: parseInt(alignNode.getAttribute('textRotation') || '0', 10),
            }
          : undefined,
      });
    });
    return cellXfs;
  }

  /**
   * 解析颜色
   *
   * @param node - 颜色节点
   * @returns 颜色对象
   */
  private static parseColor(node: Element | null): XlsxColor | undefined {
    if (!node) return undefined;
    const auto = node.getAttribute('auto');
    if (auto) return { auto: true };

    const rgb = node.getAttribute('rgb'); // ARGB 十六进制
    const theme = node.getAttribute('theme');
    const tint = node.getAttribute('tint');
    const indexed = node.getAttribute('indexed');

    return {
      rgb: rgb ? `#${rgb}` : undefined,
      theme: theme ? parseInt(theme, 10) : undefined,
      tint: tint ? parseFloat(tint) : undefined,
      indexed: indexed ? parseInt(indexed, 10) : undefined,
    };
  }
}
