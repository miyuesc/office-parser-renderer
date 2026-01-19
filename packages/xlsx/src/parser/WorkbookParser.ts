/**
 * 工作簿解析器
 *
 * 解析 XLSX 工作簿结构 (xl/workbook.xml)
 */
import { XmlUtils } from '@ai-space/shared';
import { XlsxSheet } from '../types';

export class WorkbookParser {
  /**
   * 解析工作簿 XML
   *
   * @param workbookXml - 工作簿 XML 内容
   * @param relsXml - 关系 XML 内容
   * @returns 工作表列表和日期系统设置
   */
  static parse(workbookXml: string, relsXml: string | null): { sheets: XlsxSheet[]; date1904: boolean } {
    const doc = XmlUtils.parse(workbookXml);
    const sheetNodes = XmlUtils.queryAll(doc, 'sheets sheet');

    // 解析关系以查找文件路径
    const relationships: Record<string, string> = {};
    if (relsXml) {
      const relsDoc = XmlUtils.parse(relsXml);
      const relNodes = XmlUtils.queryAll(relsDoc, 'Relationship');
      relNodes.forEach((rel: Element) => {
        const id = rel.getAttribute('Id');
        const target = rel.getAttribute('Target');
        if (id && target) {
          relationships[id] = target;
        }
      });
    }

    const sheets: XlsxSheet[] = [];
    sheetNodes.forEach((node: Element) => {
      const name = node.getAttribute('name') || 'Untitled';
      const rId = node.getAttribute('r:id'); // 需要关系命名空间
      const state = (node.getAttribute('state') as 'visible' | 'hidden' | 'veryHidden') || 'visible';

      sheets.push({
        name,
        id: rId || '',
        state,
        rows: {},
        merges: [],
        cols: []
      });
    });

    // 解析工作簿属性获取 Date1904 设置
    const workbookPr = XmlUtils.query(doc, 'workbookPr');
    const date1904 = workbookPr?.getAttribute('date1904') === '1' || workbookPr?.getAttribute('date1904') === 'true';

    return { sheets, date1904 };
  }

  /**
   * 获取工作表路径
   *
   * @param relId - 关系 ID
   * @param relationships - 关系映射
   * @returns 工作表路径或 null
   */
  static getSheetPath(relId: string, relationships: Record<string, string>): string | null {
    // 关系目标可能是相对路径或绝对路径（从根目录开始）
    // 如果在 xl/workbook.xml 中，通常相对于 xl/ 目录
    return relationships[relId] || null;
  }

  /**
   * 解析关系映射
   *
   * @param relsXml - 关系 XML 内容
   * @returns ID 到目标路径的映射
   */
  static parseRels(relsXml: string): Record<string, string> {
    const relationships: Record<string, string> = {};
    const relsDoc = XmlUtils.parse(relsXml);
    const relNodes = XmlUtils.queryAll(relsDoc, 'Relationship');
    relNodes.forEach((rel: Element) => {
      const id = rel.getAttribute('Id');
      const target = rel.getAttribute('Target');
      if (id && target) {
        relationships[id] = target;
      }
    });
    return relationships;
  }
}
