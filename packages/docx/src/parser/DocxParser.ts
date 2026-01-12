import { ZipService, XmlUtils, LengthUtils } from '@ai-space/shared';
import { NumberingParser } from './numbering-parser';
import { RelationshipsParser } from './relationships-parser';
import { DocxDocument, Paragraph, Run, NumberingDefinition, Drawing } from '../types.ts';

export class DocxParser {
    async parse(buffer: ArrayBuffer): Promise<DocxDocument> {
        const files = await ZipService.load(buffer);
        const decoder = new TextDecoder();
        
        const getXml = (path: string) => {
            return files[path] ? decoder.decode(files[path]) : null;
        };

        const documentXml = getXml('word/document.xml');
        const numberingXml = getXml('word/numbering.xml');
        const relsXml = getXml('word/_rels/document.xml.rels');
        
        if (!documentXml) {
            throw new Error('Invalid DOCX: Missing word/document.xml');
        }

        let numbering: NumberingDefinition = { abstractNums: {}, nums: {} };
        if (numberingXml) {
            numbering = NumberingParser.parse(numberingXml);
        }

        let relationships: Record<string, string> = {};
        if (relsXml) {
            relationships = RelationshipsParser.parse(relsXml);
        }

        // Load Images
        const images: Record<string, string> = {};
        for (const [rId, target] of Object.entries(relationships)) {
            if (target.match(/\.(png|jpeg|jpg|gif)$/i)) {
                 const cleanTarget = target.startsWith('/') ? target.substring(1) : `word/${target}`;
                 const fileData = files[cleanTarget];
                 
                 if (fileData) {
                     // Create Blob URL
                     const mimeType = this.getMimeType(cleanTarget);
                     const blob = new Blob([fileData], { type: mimeType });
                     const url = URL.createObjectURL(blob);
                     images[cleanTarget] = url;
                 }
            }
        }

        const xmlDoc = XmlUtils.parse(documentXml);
        const body = xmlDoc.querySelector('w\\:body, body'); 
        
        const children: any[] = [];
        if (body) {
           for (const child of Array.from(body.children)) {
               if (child.tagName.endsWith('p')) {
                   children.push(this.parseParagraph(child as Element));
               } else if (child.tagName.endsWith('tbl')) {
                   children.push(this.parseTable(child as Element));
               }
           }
        }

        return {
            body: children,
            styles: {},
            numbering,
            relationships,
            images
        };
    }

    private parseParagraph(node: Element): Paragraph {
        const pPr = XmlUtils.query(node, 'w\\:pPr, pPr');
        
        // Parse Numbering Props
        let numberingProps = undefined;
        if (pPr) {
            const numPr = XmlUtils.query(pPr, 'w\\:numPr, numPr');
            if (numPr) {
                const numId = XmlUtils.query(numPr, 'w\\:numId, numId')?.getAttribute('w:val');
                const ilvl = XmlUtils.query(numPr, 'w\\:ilvl, ilvl')?.getAttribute('w:val');
                if (numId && ilvl) {
                    numberingProps = { 
                        id: parseInt(numId, 10), 
                        level: parseInt(ilvl, 10) 
                    };
                }
            }
        }

        const runs: Run[] = [];
        const runNodes = XmlUtils.queryAll(node, 'w\\:r, r');
        
        const children: (Run|Drawing)[] = [];
        runNodes.forEach((r: Element) => {
             const t = XmlUtils.query(r, 'w\\:t, t');
             if (t) {
                 children.push({
                     type: 'run',
                     props: {},
                     text: t.textContent || ''
                 });
             }
             const drawing = XmlUtils.query(r, 'w\\:drawing, drawing');
             if (drawing) {
                 const d = this.parseDrawing(drawing);
                 if (d) children.push(d);
             }
        });

        return {
            type: 'paragraph',
            props: {
                numbering: numberingProps
            },
            children: children
        };
    }

    private parseDrawing(node: Element): import('../types').Drawing | null {
        const blip = node.querySelector('a\\:blip, blip'); 
        if (!blip) return null;
        
        const embedId = blip.getAttribute('r:embed');
        if (!embedId) return null;
        
        const extent = node.querySelector('wp\\:extent, extent');
        const cx = extent?.getAttribute('cx');
        const cy = extent?.getAttribute('cy');
        
        return {
            type: 'drawing',
            image: {
                src: embedId, 
                width: cx ? LengthUtils.emusToPixels(parseInt(cx, 10)) : 100,
                height: cy ? LengthUtils.emusToPixels(parseInt(cy, 10)) : 100
            }
        };
    }

    private getMimeType(filename: string): string {
        if (filename.endsWith('.png')) return 'image/png';
        if (filename.endsWith('.jpeg') || filename.endsWith('.jpg')) return 'image/jpeg';
        if (filename.endsWith('.gif')) return 'image/gif';
        return 'application/octet-stream';
    }

    private parseTable(node: Element): import('../types').Table {
        const rows: import('../types').TableRow[] = [];
        const grid: number[] = [];

        const tblGrid = XmlUtils.query(node, 'w\\:tblGrid, tblGrid');
        if (tblGrid) {
            const cols = XmlUtils.queryAll(tblGrid, 'w\\:gridCol, gridCol');
            cols.forEach((col: Element) => {
                const w = col.getAttribute('w:w');
                grid.push(w ? LengthUtils.twipsToPixels(parseInt(w, 10)) : 0);
            });
        }

        const rowNodes = XmlUtils.queryAll(node, 'w\\:tr, tr');
        rowNodes.forEach((tr: Element) => {
            const cells: import('../types').TableCell[] = [];
            const cellNodes = XmlUtils.queryAll(tr, 'w\\:tc, tc');
            
            cellNodes.forEach((tc: Element) => {
                const cellChildren: any[] = [];
                const pNodes = XmlUtils.queryAll(tc, 'w\\:p, p');
                pNodes.forEach((p: Element) => cellChildren.push(this.parseParagraph(p)));

                const tcPr = XmlUtils.query(tc, 'w\\:tcPr, tcPr');
                const gridSpan = tcPr ? XmlUtils.query(tcPr, 'w\\:gridSpan, gridSpan')?.getAttribute('w:val') : null;
                const width = tcPr ? XmlUtils.query(tcPr, 'w\\:tcW, tcW')?.getAttribute('w:w') : null;

                cells.push({
                    type: 'cell',
                    children: cellChildren,
                    props: {
                        gridSpan: gridSpan ? parseInt(gridSpan, 10) : 1,
                        width: width ? LengthUtils.twipsToPixels(parseInt(width, 10)) : undefined
                    }
                });
            });

            rows.push({
                type: 'row',
                cells,
                props: {}
            });
        });

        return {
            type: 'table',
            rows,
            grid,
            props: {}
        };
    }
}
