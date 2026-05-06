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
import { parseCellRef } from '../model';
import { SharedStringsParser } from './SharedStringsParser';
import { StylesParser } from './StylesParser';
import { WorksheetParser } from './WorksheetParser';
import { CommentsParser } from './CommentsParser';

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
          differentialStyles: [],
          theme
        };
      }

      // 3. 解析 Shared Strings
      const sharedStringsXml = pkg.readText('xl/sharedStrings.xml');
      if (sharedStringsXml) {
        doc.sharedStrings = SharedStringsParser.parse(sharedStringsXml, { theme });
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
            const worksheet = WorksheetParser.parse(file, doc.sharedStrings, pkg.getRelationships(path), { theme });

            this.applyWorksheetIdentity(worksheet, info);
            this.parseCommentsForWorksheet(worksheet, path, pkg);

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

            const worksheet = WorksheetParser.parse(xmlStr, doc.sharedStrings, pkg.getRelationships(path), { theme });
            this.parseCommentsForWorksheet(worksheet, path, pkg);

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

  private static parseCommentsForWorksheet(worksheet: Worksheet, path: string, pkg: PackageReader) {
    const commentsRelationship = pkg
      .getRelationships(path)
      .list()
      .find(relationship => relationship.type?.endsWith('/comments') && relationship.resolvedTarget);

    if (!commentsRelationship?.resolvedTarget) {
      return;
    }

    const commentsXml = pkg.readText(commentsRelationship.resolvedTarget);
    if (!commentsXml) {
      return;
    }

    const comments = CommentsParser.parse(commentsXml);
    if (comments.length === 0) {
      return;
    }

    worksheet.comments = comments;

    for (const comment of comments) {
      const address = parseCellRef(comment.ref);
      if (!address) {
        continue;
      }

      let row = worksheet.rows.get(address.row);
      if (!row) {
        row = {
          index: address.row,
          cells: new Map()
        };
        worksheet.rows.set(address.row, row);
      }

      let cell = row.cells.get(address.col);
      if (!cell) {
        cell = {
          row: address.row,
          col: address.col,
          type: 'string',
          value: ''
        };
        row.cells.set(address.col, cell);
      }

      cell.comment = comment;
    }
  }
}
