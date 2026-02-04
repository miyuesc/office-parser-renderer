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
      const workbookXmlBtn = files.get('xl/workbook.xml');
      const workbookRelsBtn = files.get('xl/_rels/workbook.xml.rels');

      let sheetMapping = new Map<string, { name: string; path: string }>();

      if (workbookXmlBtn && workbookRelsBtn) {
        // Parse Rels: rId -> Target (e.g., "rId1" -> "worksheets/sheet1.xml")
        const relsXml = FileHandler.readText(workbookRelsBtn);
        const relsMap = this.parseRels(relsXml);

        // Parse Workbook: name, r:id
        const workbookXml = FileHandler.readText(workbookXmlBtn);
        const wbDoc = FileHandler.parseXML(workbookXml);
        const sheets = wbDoc.querySelectorAll('sheet');

        for (let i = 0; i < sheets.length; i++) {
          const name = sheets[i].getAttribute('name');
          let rId = sheets[i].getAttribute('r:id');
          if (!rId) rId = sheets[i].getAttribute('id'); // Fallback for namespace issues

          if (name && rId) {
            const target = relsMap.get(rId);
            if (target) {
              let path = target;
              if (path.startsWith('/')) {
                path = path.substring(1); // Absolute path in zip. e.g. /xl/worksheets/sheet1.xml -> xl/worksheets/sheet1.xml
              } else {
                path = `xl/${path}`; // Relative to workbook.xml (which is in xl/)
              }
              sheetMapping.set(path, { name, path });
            }
          }
        }
      }

      // 如果解析到了 sheetMapping，优先使用 mapping 加载
      if (sheetMapping.size > 0) {
        for (const [path, info] of sheetMapping.entries()) {
          let file = files.get(path); // Try direct match

          // Case-insensitive fallback
          if (!file) {
            const lowerPath = path.toLowerCase();
            for (const [key, val] of files.entries()) {
              if (key.toLowerCase() === lowerPath) {
                file = val;
                break;
              }
            }
          }

          if (file) {
            const xmlStr = FileHandler.readText(file);
            const worksheet = WorksheetParser.parse(xmlStr, doc.sharedStrings);

            worksheet.name = info.name;

            // Parse Images (Shared logic, extracted or duplicated slightly for now)
            await this.parseImagesForWorksheet(worksheet, path, files);

            doc.worksheets.set(info.name, worksheet); // Use name as ID or keep internal ID?
            // Using name as key makes sense for display, but ensure uniqueness.
            // Sheet names are unique in Excel.
          }
        }
      } else {
        // Fallback: 暴力遍历所有 sheet 文件 (Legacy Mode)
        for (const [path, content] of files.entries()) {
          if (path.match(/^xl\/worksheets\/sheet\d+\.xml$/)) {
            const xmlStr = FileHandler.readText(content);
            const worksheet = WorksheetParser.parse(xmlStr, doc.sharedStrings);

            await this.parseImagesForWorksheet(worksheet, path, files);

            // 从 path 提取 id 或者 name
            const match = path.match(/sheet(\d+)\.xml/);
            const id = match ? match[1] : path;
            worksheet.name = `Sheet${id}`; // 临时名
            doc.worksheets.set(id, worksheet);
          }
        }
      }
    } catch (e) {
      logger.error('Failed to parse XLSX', e);
      throw e;
    }

    return doc;
  }

  private static async parseImagesForWorksheet(worksheet: any, path: string, files: Map<string, Uint8Array>) {
    if (worksheet.drawingRId) {
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
          const drawingPath = this.resolvePath(folder, drawingTarget);
          const drawingFile = files.get(drawingPath);

          if (drawingFile) {
            const drawingXml = FileHandler.readText(drawingFile);

            const dParts = drawingPath.split('/');
            const dName = dParts.pop();
            const dFolder = dParts.join('/');
            const dRelsPath = `${dFolder}/_rels/${dName}.rels`;

            const dRelsFile = files.get(dRelsPath);
            const dRelsMap = dRelsFile ? this.parseRels(FileHandler.readText(dRelsFile)) : new Map();

            worksheet.images = DrawingParser.parse(drawingXml, dRelsMap, files, dFolder + '/');
          }
        }
      }
    }
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
