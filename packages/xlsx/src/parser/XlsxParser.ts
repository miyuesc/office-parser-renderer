
import { ZipService, XmlUtils } from '@ai-space/shared';
import { XlsxWorkbook, XlsxSheet, XlsxStyles } from '../types.ts';
import { WorkbookParser } from './WorkbookParser';
import { StyleParser } from './StyleParser';
import { ThemeParser } from './ThemeParser';
import { WorksheetParser } from './WorksheetParser';
import { DrawingParser } from './DrawingParser';

export class XlsxParser {
    async parse(buffer: ArrayBuffer): Promise<XlsxWorkbook> {
        const files = await ZipService.load(buffer);
        const decoder = new TextDecoder();
        const getXml = (path: string) => files[path] ? decoder.decode(files[path]) : null;

        // 1. Parse Shared Strings
        const sharedStrings: string[] = [];
        const ssXml = getXml('xl/sharedStrings.xml');
        if (ssXml) {
            const ssDoc = XmlUtils.parse(ssXml);
            const siNodes = XmlUtils.queryAll(ssDoc, 'si');
            siNodes.forEach((si: Element) => {
                const t = XmlUtils.query(si, 't');
                // Basic implementation: just get text. Rich text runs (r) are ignored for now.
                sharedStrings.push(t?.textContent || '');
            });
        }

        // 2. Parse Styles
        let styles: XlsxStyles = { fonts: [], fills: [], borders: [], cellXfs: [], numFmts: {} };
        const stylesXml = getXml('xl/styles.xml');
        if (stylesXml) {
            styles = StyleParser.parse(stylesXml);
        }

        // 3. Parse Theme
        let theme;
        const themeXml = getXml('xl/theme/theme1.xml'); // Standard path
        if (themeXml) {
            theme = ThemeParser.parse(themeXml);
        }

        // 4. Parse Workbook & Sheets
        let sheets: XlsxSheet[] = [];
        const wbXml = getXml('xl/workbook.xml');
        const relsXml = getXml('xl/_rels/workbook.xml.rels');
        
        if (wbXml) {
            const { sheets: parsedSheets, date1904 } = WorkbookParser.parse(wbXml, relsXml);
            sheets = parsedSheets;
            
            // 5. Parse Each Sheet
            for (const sheet of sheets) {
                if (!sheet.id) continue;
                
                const relationships = relsXml ? WorkbookParser.parseRels(relsXml) : {};
                let sheetPath = relationships[sheet.id];
                
                if (sheetPath) {
                    // Resolve path
                    if (sheetPath.startsWith('/')) sheetPath = sheetPath.substring(1);
                    else sheetPath = 'xl/' + sheetPath;

                    const sheetXml = getXml(sheetPath);
                    if (sheetXml) {
                        const parsedSheet = WorksheetParser.parse(sheetXml, sheet);
                        Object.assign(sheet, parsedSheet);

                        // 6. Handle Drawings if present
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
                                     // console.log('Resolved Drawing Path:', drawingPath);

                                     const drawingXml = getXml(drawingPath);
                                     if (drawingXml) {
                                         // console.log('Parsing Drawing:', drawingPath);
                                         const { images, shapes, connectors } = DrawingParser.parse(drawingXml);
                                         // console.log('Parsed Drawings:', { images, shapes, connectors });
                                         
                                         // 7. Resolve Image Embeds (BLIPs)
                                         const dPathParts = drawingPath.split('/');
                                         const dFileName = dPathParts.pop();
                                         const dFolder = dPathParts.join('/');
                                         const drawingRelsPath = `${dFolder}/_rels/${dFileName}.rels`;
                                         
                                         const drawingRelsXml = getXml(drawingRelsPath);
                                         if (drawingRelsXml) {
                                             const drawingRels = WorkbookParser.parseRels(drawingRelsXml);
                                             
                                            for (const img of images) {
                                                 const targetId = img.embedId; // Use embedId for lookup
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
                                                         img.data = imgData;
                                                         if (imgPath.endsWith('.png')) img.mimeType = 'image/png';
                                                         else if (imgPath.endsWith('.jpeg') || imgPath.endsWith('.jpg')) img.mimeType = 'image/jpeg';
                                                         else if (imgPath.endsWith('.gif')) img.mimeType = 'image/gif';
                                                         else if (imgPath.endsWith('.bmp')) img.mimeType = 'image/bmp';
                                                         
                                                         // Generate Blob URL for browser rendering
                                                         if (typeof URL !== 'undefined' && typeof Blob !== 'undefined' && img.mimeType) {
                                                             try {
                                                                 const blob = new Blob([img.data], { type: img.mimeType });
                                                                 img.src = URL.createObjectURL(blob);
                                                             } catch (e) {
                                                                 console.warn('Failed to create object URL for image', e);
                                                             }
                                                         }
                                                     }
                                                 }
                                             }
                                             sheet.images = images;
                                         }
                                         
                                         // Assign shapes (no external rels usually for basic shapes)
                                         sheet.shapes = shapes;
                                         sheet.connectors = connectors;
                                     }
                                }
                            }
                        }

                    } else {
                        console.warn(`Sheet XML not found at ${sheetPath}`);
                    }
                }
            }
        }

        return {
            sheets,
            styles,
            sharedStrings,
            theme,
            date1904: (wbXml && WorkbookParser.parse(wbXml, relsXml).date1904) || false 
        };
    }
}
