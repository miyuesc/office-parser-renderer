import { FileHandler, Logger } from '@opr/shared';

const logger = new Logger('SharedStringsParser');

export class SharedStringsParser {
  /**
   * 解析 sharedStrings.xml
   * @param xmlString XML 内容
   * @returns 共享字符串数组
   */
  static parse(xmlString: string): string[] {
    const strings: string[] = [];

    try {
      const doc = FileHandler.parseXML(xmlString);
      const siNodes = doc.querySelectorAll('si');

      // 遍历所有 <si> (String Item) 节点
      for (let i = 0; i < siNodes.length; i++) {
        const si = siNodes[i];
        let textContent = '';

        // 1. 简单文本 <t>
        const tNodes = si.querySelectorAll('t');
        if (tNodes.length > 0) {
          // 如果有多个 <t> (例如在 <r> 中)，拼接它们
          for (let j = 0; j < tNodes.length; j++) {
            textContent += tNodes[j].textContent || '';
          }
        }

        strings.push(textContent);
      }
    } catch (e) {
      logger.error('Failed to parse shared strings', e);
    }

    return strings;
  }
}
