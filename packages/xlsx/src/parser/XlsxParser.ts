import { FileHandler, Logger } from '@opr/shared';
import { XlsxDocument } from './types';
import { SharedStringsParser } from './SharedStringsParser';
import { StylesParser } from './StylesParser';
import { WorksheetParser } from './WorksheetParser';
import { DrawingParser } from './DrawingParser';

const logger = new Logger('XlsxParser');

export class XlsxParser {
  /**
   * 解析 XLSX 文件
   * @param buffer 文件二进制数据
   * @returns 解析后的文档对象
   */
  static async parse(buffer: ArrayBuffer): Promise<XlsxDocument> {
    const doc: XlsxDocument = {
      worksheets: new Map(),
      sharedStrings: []
    };

    try {
      // 1. 解压
      const files = await FileHandler.unzip(buffer);

      // 2. 解析 Styles
      const stylesXml = files.get('xl/styles.xml');
      if (stylesXml) {
        const xmlStr = FileHandler.readText(stylesXml);
        doc.styles = StylesParser.parse(xmlStr);
      }

      // 3. 解析 Shared Strings
      const sharedStringsXml = files.get('xl/sharedStrings.xml');
      if (sharedStringsXml) {
        const xmlStr = FileHandler.readText(sharedStringsXml);
        doc.sharedStrings = SharedStringsParser.parse(xmlStr);
      }

      // 3. 解析 Workbook (获取 Sheet 列表)
      // MVP 简化: 尝试读取 sheet1.xml, sheet2.xml ...
      // TODO: 正确做法是解析 xl/workbook.xml 和 xl/_rels/workbook.xml.rels

      const workbookXmlBtn = files.get('xl/workbook.xml');
      if (workbookXmlBtn) {
        const workbookXml = FileHandler.readText(workbookXmlBtn);
        const wbDoc = FileHandler.parseXML(workbookXml);
        const sheets = wbDoc.querySelectorAll('sheet');

        for (let i = 0; i < sheets.length; i++) {
          // 假设 r:id 对应 sheetX, 这里做个简单映射还是直接找文件?
          // 标准流程需要查 refs。这里先暴力尝试 xl/worksheets/sheet{id}.xml
          // 注意: sheetId 不一定等于文件名里的 index，通常是 rId 决定。
          // 更加暴力的 MVP: 遍历 files 找 xl/worksheets/sheet*.xml
        }
      }

      // 暴力遍历所有 sheet 文件
      for (const [path, content] of files.entries()) {
        if (path.match(/^xl\/worksheets\/sheet\d+\.xml$/)) {
          const xmlStr = FileHandler.readText(content);
          const worksheet = WorksheetParser.parse(xmlStr, doc.sharedStrings);

          // Image parsing
          if (worksheet.drawingRId) {
            // 1. Get sheet rels
            // path: xl/worksheets/sheet1.xml
            // rels: xl/worksheets/_rels/sheet1.xml.rels
            const pathParts = path.split('/');
            const filename = pathParts.pop();
            const folder = pathParts.join('/');
            const relsPath = `${folder}/_rels/${filename}.rels`;

            const relsFile = files.get(relsPath);
            if (relsFile) {
              const relsXml = FileHandler.readText(relsFile);
              const relsMap = this.parseRels(relsXml);

              const drawingTarget = relsMap.get(worksheet.drawingRId);
              if (drawingTarget) {
                // Resolve drawing path
                // folder: xl/worksheets
                // target: ../drawings/drawing1.xml
                const drawingPath = this.resolvePath(folder, drawingTarget);
                const drawingFile = files.get(drawingPath);

                if (drawingFile) {
                  const drawingXml = FileHandler.readText(drawingFile);

                  // Get drawing rels (for images)
                  // drawingPath: xl/drawings/drawing1.xml
                  // rels: xl/drawings/_rels/drawing1.xml.rels
                  const dParts = drawingPath.split('/');
                  const dName = dParts.pop();
                  const dFolder = dParts.join('/');
                  const dRelsPath = `${dFolder}/_rels/${dName}.rels`;

                  const dRelsFile = files.get(dRelsPath);
                  const dRelsMap = dRelsFile ? this.parseRels(FileHandler.readText(dRelsFile)) : new Map();

                  // Parse images
                  worksheet.images = DrawingParser.parse(drawingXml, dRelsMap, files, dFolder + '/');
                }
              }
            }
          }

          // 从 path 提取 id 或者 name
          const match = path.match(/sheet(\d+)\.xml/);
          const id = match ? match[1] : path;
          worksheet.name = `Sheet${id}`; // 临时名
          doc.worksheets.set(id, worksheet);
        }
      }
    } catch (e) {
      logger.error('Failed to parse XLSX', e);
      throw e;
    }

    return doc;
  }

  private static parseRels(xmlString: string): Map<string, string> {
    const rels = new Map<string, string>();
    try {
      const doc = FileHandler.parseXML(xmlString);
      const nodes = doc.querySelectorAll('Relationship');
      for (let i = 0; i < nodes.length; i++) {
        const id = nodes[i].getAttribute('Id');
        const target = nodes[i].getAttribute('Target');
        if (id && target) {
          rels.set(id, target);
        }
      }
    } catch (e) {
      logger.warn('Failed to parse rels', e);
    }
    return rels;
  }

  private static resolvePath(base: string, relative: string): string {
    // base: xl/worksheets
    // relative: ../drawings/drawing1.xml
    const parts = base.split('/');
    const relParts = relative.split('/');

    for (const p of relParts) {
      if (p === '..') {
        parts.pop();
      } else if (p !== '.') {
        parts.push(p);
      }
    }
    return parts.join('/');
  }
}
