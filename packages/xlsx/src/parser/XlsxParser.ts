import {
  DrawingParser,
  getElementsByLocalName,
  getOptionalAttr,
  Logger,
  PackageReader,
  ThemeModel,
  ThemeParser
} from '@opr/shared';
import { Worksheet, XlsxDocument } from './types';
import { SharedStringsParser } from './SharedStringsParser';
import { StylesParser } from './StylesParser';
import { WorksheetParser } from './WorksheetParser';

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
      const pkg = await PackageReader.load(buffer);
      const themeXml = pkg.findPartsByContentType('application/vnd.openxmlformats-officedocument.theme+xml')[0];
      const theme = themeXml ? ThemeParser.parse(pkg.readText(themeXml.path) || '') : undefined;

      // 2. 解析 Styles
      const stylesXml = pkg.readText('xl/styles.xml');
      if (stylesXml) {
        doc.styles = StylesParser.parse(stylesXml, { theme });
      } else if (theme) {
        doc.styles = {
          fonts: [],
          fills: [],
          borders: [],
          cellXfs: [],
          numFmts: new Map(),
          theme
        };
      }

      // 3. 解析 Shared Strings
      const sharedStringsXml = pkg.readText('xl/sharedStrings.xml');
      if (sharedStringsXml) {
        doc.sharedStrings = SharedStringsParser.parse(sharedStringsXml);
      }

      // 3. 解析 Workbook (获取 Sheet 列表)
      let sheetMapping = new Map<string, { id: string; sheetId?: string; name: string; path: string; relationshipId: string }>();

      const wbDoc = pkg.readXml('xl/workbook.xml');
      if (wbDoc) {
        const rels = pkg.getRelationships('xl/workbook.xml');
        const sheets = getElementsByLocalName(wbDoc, 'sheet');

        for (let i = 0; i < sheets.length; i++) {
          const name = getOptionalAttr(sheets[i], 'name');
          const sheetId = getOptionalAttr(sheets[i], 'sheetId');
          const rId = getOptionalAttr(sheets[i], 'r:id');

          if (name && rId) {
            const target = rels.getTarget(rId);
            if (target) {
              const id = sheetId || rId;
              sheetMapping.set(target, { id, sheetId, name, path: target, relationshipId: rId });
            }
          }
        }
      }

      // 如果解析到了 sheetMapping，优先使用 mapping 加载
      if (sheetMapping.size > 0) {
        for (const [path, info] of sheetMapping.entries()) {
          const file = this.readTextCaseInsensitive(pkg, path);

          if (file) {
            const worksheet = WorksheetParser.parse(file, doc.sharedStrings, pkg.getRelationships(path));

            this.applyWorksheetIdentity(worksheet, info);

            await this.parseImagesForWorksheet(worksheet, path, pkg, theme);

            doc.worksheets.set(info.id, worksheet);
          }
        }
      } else {
        // Fallback: 暴力遍历所有 sheet 文件 (Legacy Mode)
        for (const path of pkg.listPartPaths()) {
          if (path.match(/^xl\/worksheets\/sheet\d+\.xml$/)) {
            const xmlStr = pkg.readText(path);
            if (!xmlStr) {
              continue;
            }

            const worksheet = WorksheetParser.parse(xmlStr, doc.sharedStrings, pkg.getRelationships(path));

            await this.parseImagesForWorksheet(worksheet, path, pkg, theme);

            // 从 path 提取 id 或者 name
            const match = path.match(/sheet(\d+)\.xml/);
            const id = match ? match[1] : path;
            this.applyWorksheetIdentity(worksheet, {
              id,
              sheetId: match ? id : undefined,
              name: `Sheet${id}`,
              path,
              relationshipId: ''
            });
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

  private static applyWorksheetIdentity(
    worksheet: Worksheet,
    identity: { id: string; sheetId?: string; name: string; path: string; relationshipId: string }
  ): void {
    worksheet.id = identity.id;
    worksheet.sheetId = identity.sheetId;
    worksheet.name = identity.name;
    worksheet.path = identity.path;
    worksheet.relationshipId = identity.relationshipId || undefined;
  }

  private static readTextCaseInsensitive(pkg: PackageReader, path: string): string | undefined {
    const direct = pkg.readText(path);
    if (direct) {
      return direct;
    }

    const lowerPath = path.toLowerCase();
    for (const existingPath of pkg.listPartPaths()) {
      if (existingPath.toLowerCase() === lowerPath) {
        return pkg.readText(existingPath);
      }
    }

    return undefined;
  }

  private static async parseImagesForWorksheet(
    worksheet: any,
    path: string,
    pkg: PackageReader,
    theme?: ThemeModel
  ) {
    if (worksheet.drawingRId) {
      const drawingPath = pkg.getRelationships(path).getTarget(worksheet.drawingRId);
      if (drawingPath) {
        const drawingXml = pkg.readText(drawingPath);
        if (drawingXml) {
          worksheet.drawings = DrawingParser.parsePart(pkg, drawingPath, { theme });
        }
      }
    }
  }
}
