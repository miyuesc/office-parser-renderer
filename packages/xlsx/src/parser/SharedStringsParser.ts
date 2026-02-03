import { FileHandler, Logger, ColorParser } from '@opr/shared';
import { RichTextRun, Font } from './types';

const logger = new Logger('SharedStringsParser');

export class SharedStringsParser {
  /**
   * 解析 sharedStrings.xml
   * @param xmlString XML 内容
   * @returns 共享字符串数组 (string or RichTextRun[])
   */
  static parse(xmlString: string): (string | RichTextRun[])[] {
    const strings: (string | RichTextRun[])[] = [];

    try {
      const doc = FileHandler.parseXML(xmlString);
      const siNodes = doc.querySelectorAll('si');

      // 遍历所有 <si> (String Item) 节点
      for (let i = 0; i < siNodes.length; i++) {
        const si = siNodes[i];

        // Check for Rich Text Runs <r>
        const rNodes = si.querySelectorAll('r');
        if (rNodes.length > 0) {
          const runs: RichTextRun[] = [];
          for (let j = 0; j < rNodes.length; j++) {
            const rNode = rNodes[j];
            const tNode = rNode.querySelector('t');
            const text = tNode ? tNode.textContent || '' : '';

            const rPrNode = rNode.querySelector('rPr');
            let font: Font | undefined;
            if (rPrNode) {
              font = this.parseRPr(rPrNode);
            }
            runs.push({ text, font });
          }
          strings.push(runs);
        } else {
          // Simple text <t> (fallback/optimization)
          const tNodes = si.querySelectorAll('t');
          let textContent = '';
          for (let j = 0; j < tNodes.length; j++) {
            textContent += tNodes[j].textContent || '';
          }
          strings.push(textContent);
        }
      }
    } catch (e) {
      logger.error('Failed to parse shared strings', e);
    }

    return strings;
  }

  private static parseRPr(node: Element): Font {
    const font: Font = {};

    const rFont = node.querySelector('rFont');
    if (rFont) font.name = rFont.getAttribute('val') || undefined;

    const sz = node.querySelector('sz');
    if (sz) font.size = parseFloat(sz.getAttribute('val') || '11');

    const color = node.querySelector('color');
    if (color) {
      const rgb = color.getAttribute('rgb');
      if (rgb) font.color = ColorParser.toCSS(rgb);
    }

    if (node.querySelector('b')) font.bold = true;
    if (node.querySelector('i')) font.italic = true;

    return font;
  }
}
