/**
 * XLSX 主解析器
 *
 * 解析完整的 XLSX 文件，协调各个子解析器
 */
import { XmlUtils, BaseParser } from '@ai-space/shared';
import { Logger } from '../utils/Logger';

const log = Logger.createTagged('XlsxParser');
import { XlsxWorkbook, XlsxSheet, XlsxStyles, OfficeChart } from '../types';
import { WorkbookParser } from './WorkbookParser';
import { StyleParser } from './StyleParser';
import { ThemeParser } from './ThemeParser';
import { WorksheetParser } from './WorksheetParser';
import { DrawingParser } from './DrawingParser';
import { ChartParser } from './ChartParser';

export class XlsxParser extends BaseParser<XlsxWorkbook> {
  /**
   * 解析 XLSX 文件
   *
   * 核心逻辑：
   * 1. 文件解压：使用 ZipService 读取 XLSX (ZIP) 文件内容。
   * 2. 共享字符串：解析 `xl/sharedStrings.xml`，构建全局共享字符串表，这是 Excel 存储文本的高效方式。
   * 3. 样式表：解析 `xl/styles.xml`，获取字体、填充、边框、数字格式等样式信息。
   * 4. 主题：解析 `xl/theme/theme1.xml`，获取颜色主题方案。
   * 5. 工作簿结构：解析 `xl/workbook.xml` 获取工作表列表 (Sheets) 和定义的名称。
   * 6. 工作表内容：遍历每个 Sheet，解析其 XML 内容 (`xl/worksheets/sheetN.xml`)，处理单元格数据、合并单元格等。
   * 7. 绘图对象：解析每个 Sheet 关联的绘图部分 (`xl/drawings/drawingN.xml`)，处理图片、形状、图表。
   * 8. 资源关联：通过 `_rels` 关系文件解决图片、图表等外部资源的引用路径。
   *
   * @param input - 输入数据 (File | ArrayBuffer | Uint8Array)
   * @returns Promise<XlsxWorkbook> - 解析完成的工作簿对象，包含所有 Sheet 数据、样式和资源
   */
  async parse(input: File | ArrayBuffer | Uint8Array): Promise<XlsxWorkbook> {
    const buffer = await this.normalizeInput(input);
    await this.initZip(buffer);

    const files = this.files;
    // 使用 files 成员变量或 getXml/getText 方法
    // 为了保持原有逻辑中的 getXml 简便性:
    const getXml = (path: string) => this.getText(path);

    // 1. 解析共享字符串 (Shared Strings)
    // Excel 将重复出现的文本存储在单独的表中，单元格通过索引引用，以减小文件体积
    const sharedStrings: string[] = [];
    const ssXml = getXml('xl/sharedStrings.xml');
    if (ssXml) {
      const ssDoc = XmlUtils.parse(ssXml);
      const siNodes = XmlUtils.queryAll(ssDoc, 'si');
      siNodes.forEach((si: Element) => {
        const t = XmlUtils.query(si, 't');
        // 基础实现：仅获取文本，暂时忽略富文本片段 (r)
        sharedStrings.push(t?.textContent || '');
      });
    }

    // 2. 解析样式 (Styles)
    // 包含数字格式 (numFmts)、字体 (fonts)、填充 (fills)、边框 (borders) 和单元格样式引用 (cellXfs)
    let styles: XlsxStyles = { fonts: [], fills: [], borders: [], cellXfs: [], numFmts: {} };
    const stylesXml = getXml('xl/styles.xml');
    if (stylesXml) {
      styles = StyleParser.parse(stylesXml);
    }

    // 3. 解析主题 (Theme)
    // 主要用于颜色引用 (clrScheme)
    let theme;
    const themeXml = getXml('xl/theme/theme1.xml'); // 标准路径
    if (themeXml) {
      theme = ThemeParser.parse(themeXml);
    }

    // 4. 解析工作簿和工作表列表 (Workbook & Sheets)
    let sheets: XlsxSheet[] = [];
    const wbXml = getXml('xl/workbook.xml');
    const relsXml = getXml('xl/_rels/workbook.xml.rels');

    if (wbXml) {
      const { sheets: parsedSheets } = WorkbookParser.parse(wbXml, relsXml);
      sheets = parsedSheets;

      // 5. 解析每个工作表的内容 (Sheet Content)
      for (const sheet of sheets) {
        if (!sheet.id) continue;

        const relationships = relsXml ? WorkbookParser.parseRels(relsXml) : {};
        let sheetPath = relationships[sheet.id];

        if (sheetPath) {
          // 解析路径
          if (sheetPath.startsWith('/')) sheetPath = sheetPath.substring(1);
          else sheetPath = 'xl/' + sheetPath;

          const sheetXml = getXml(sheetPath);
          if (sheetXml) {
            const parsedSheet = WorksheetParser.parse(sheetXml, sheet);
            Object.assign(sheet, parsedSheet);

            // 6. 处理绘图 (Drawings: Shapes, Images, Charts)
            // 绘图内容存储在单独的 XML 中，通过 relationships 关联
            if (sheet.drawingId) {
              const pathParts = sheetPath.split('/');
              const fileName = pathParts.pop();
              const folder = pathParts.join('/');
              const sheetRelsPath = `${folder}/_rels/${fileName}.rels`;

              const sheetRelsXml = getXml(sheetRelsPath);
              if (sheetRelsXml) {
                const sheetRels = WorkbookParser.parseRels(sheetRelsXml);
                const drawingPathRel = sheetRels[sheet.drawingId];

                if (drawingPathRel) {
                  let drawingPath = drawingPathRel;
                  if (!drawingPath.startsWith('/')) {
                    const parts = folder.split('/');
                    const relParts = drawingPath.split('/');
                    for (const p of relParts) {
                      if (p === '..') parts.pop();
                      else parts.push(p);
                    }
                    drawingPath = parts.join('/');
                  } else {
                    drawingPath = drawingPath.substring(1);
                  }

                  const drawingXml = getXml(drawingPath);
                  if (drawingXml) {
                    const { images, shapes, connectors, chartRefs } =
                      DrawingParser.parse(drawingXml);

                    // 7. 解析图片嵌入 (BLIP) 和图表引用
                    const dPathParts = drawingPath.split('/');
                    const dFileName = dPathParts.pop();
                    const dFolder = dPathParts.join('/');
                    const drawingRelsPath = `${dFolder}/_rels/${dFileName}.rels`;

                    const drawingRelsXml = getXml(drawingRelsPath);
                    if (drawingRelsXml) {
                      const drawingRels = WorkbookParser.parseRels(drawingRelsXml);

                      for (const img of images) {
                        const targetId = img.embedId; // 使用 embedId 进行查找
                        const imgRelPath = drawingRels[targetId];

                        if (imgRelPath) {
                          let imgPath = imgRelPath;
                          if (!imgPath.startsWith('/')) {
                            const dParts = dFolder.split('/');
                            const iParts = imgRelPath.split('/');
                            for (const p of iParts) {
                              if (p === '..') dParts.pop();
                              else dParts.push(p);
                            }
                            imgPath = dParts.join('/');
                          } else {
                            imgPath = imgPath.substring(1);
                          }

                          const imgData = files[imgPath];
                          if (imgData) {
                            img.data = imgData as unknown as ArrayBuffer;
                            if (imgPath.endsWith('.png')) img.mimeType = 'image/png';
                            else if (imgPath.endsWith('.jpeg') || imgPath.endsWith('.jpg'))
                              img.mimeType = 'image/jpeg';
                            else if (imgPath.endsWith('.gif')) img.mimeType = 'image/gif';
                            else if (imgPath.endsWith('.bmp')) img.mimeType = 'image/bmp';

                            // 为浏览器渲染生成 Blob URL
                            if (
                              typeof URL !== 'undefined' &&
                              typeof Blob !== 'undefined' &&
                              img.mimeType
                            ) {
                              try {
                                const blob = new Blob([img.data!], { type: img.mimeType });
                                img.src = URL.createObjectURL(blob);
                              } catch (e) {
                                log.warn('创建图片 Object URL 失败', e);
                              }
                            }
                          }
                        }
                      }
                      sheet.images = images;

                      // 8. 解析图表 (Charts)
                      if (chartRefs.length > 0) {
                        const charts: OfficeChart[] = [];
                        for (const chartRef of chartRefs) {
                          const chartRelPath = drawingRels[chartRef.chartId];
                          if (chartRelPath) {
                            let chartPath = chartRelPath;
                            if (!chartPath.startsWith('/')) {
                              const cParts = dFolder.split('/');
                              const rParts = chartRelPath.split('/');
                              for (const p of rParts) {
                                if (p === '..') cParts.pop();
                                else cParts.push(p);
                              }
                              chartPath = cParts.join('/');
                            } else {
                              chartPath = chartPath.substring(1);
                            }

                            const chartXml = getXml(chartPath);
                            if (chartXml) {
                              const parsedChart = ChartParser.parse(chartXml);
                              charts.push({
                                ...parsedChart,
                                id: chartRef.id,
                                anchor: chartRef.anchor,
                              });
                              log.debug(`已解析图表: ${chartRef.name}`, parsedChart);
                            }
                          }
                        }
                        sheet.charts = charts;
                      }
                    }

                    // 分配形状（基础形状通常没有外部关系）
                    sheet.shapes = shapes;
                    sheet.connectors = connectors;
                  }
                }
              }
            }
          } else {
            log.warn(`在 ${sheetPath} 未找到工作表 XML`);
          }
        }
      }
    }

    return {
      sheets,
      styles,
      sharedStrings,
      theme,
      date1904: (wbXml && WorkbookParser.parse(wbXml, relsXml).date1904) || false,
    };
  }
}
