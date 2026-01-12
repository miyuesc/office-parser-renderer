
import { XmlUtils } from '@ai-space/shared';
import { XlsxSheet, XlsxRow, XlsxColumn, XlsxMergeCell, XlsxCell } from '../types';

export class WorksheetParser {
    static parse(xml: string, baseSheet: XlsxSheet): XlsxSheet {
        const doc = XmlUtils.parse(xml);
        const sheet = { ...baseSheet };

        sheet.cols = this.parseCols(doc);
        sheet.rows = this.parseRows(doc);
        sheet.merges = this.parseMerges(doc);
        
        const drawing = XmlUtils.query(doc, 'drawing');
        if (drawing) {
            sheet.drawingId = drawing.getAttribute('r:id') || undefined;
        }

        sheet.pageMargins = this.parsePageMargins(doc);
        sheet.pageSetup = this.parsePageSetup(doc);
        sheet.headerFooter = this.parseHeaderFooter(doc);

        return sheet;
    }

    private static parsePageMargins(doc: Document): any {
        const node = XmlUtils.query(doc, 'pageMargins');
        if (!node) return undefined;
        return {
            left: parseFloat(node.getAttribute('left') || '0.7'),
            right: parseFloat(node.getAttribute('right') || '0.7'),
            top: parseFloat(node.getAttribute('top') || '0.75'),
            bottom: parseFloat(node.getAttribute('bottom') || '0.75'),
            header: parseFloat(node.getAttribute('header') || '0.3'),
            footer: parseFloat(node.getAttribute('footer') || '0.3')
        };
    }

    private static parsePageSetup(doc: Document): any {
        const node = XmlUtils.query(doc, 'pageSetup');
        if (!node) return undefined;
        return {
            paperSize: parseInt(node.getAttribute('paperSize') || '0', 10),
            orientation: node.getAttribute('orientation'), // portrait/landscape
            scale: parseInt(node.getAttribute('scale') || '100', 10),
            fitToWidth: parseInt(node.getAttribute('fitToWidth') || '1', 10),
            fitToHeight: parseInt(node.getAttribute('fitToHeight') || '1', 10)
        };
    }

    private static parseHeaderFooter(doc: Document): any {
         const node = XmlUtils.query(doc, 'headerFooter');
         if (!node) return undefined;
         
         return {
             alignWithMargins: node.getAttribute('alignWithMargins') !== '0', // default true
             differentFirst: node.getAttribute('differentFirst') === '1',
             differentOddEven: node.getAttribute('differentOddEven') === '1',
             oddHeader: XmlUtils.query(node, 'oddHeader')?.textContent || undefined,
             oddFooter: XmlUtils.query(node, 'oddFooter')?.textContent || undefined,
             evenHeader: XmlUtils.query(node, 'evenHeader')?.textContent || undefined,
             evenFooter: XmlUtils.query(node, 'evenFooter')?.textContent || undefined,
             firstHeader: XmlUtils.query(node, 'firstHeader')?.textContent || undefined,
             firstFooter: XmlUtils.query(node, 'firstFooter')?.textContent || undefined,
         };
    }

    private static parseCols(doc: Document): XlsxColumn[] {
        const cols: XlsxColumn[] = [];
        const colNodes = XmlUtils.queryAll(doc, 'cols col');
        colNodes.forEach((node: Element) => {
            const min = parseInt(node.getAttribute('min') || '1', 10);
            const max = parseInt(node.getAttribute('max') || '1', 10);
            const width = parseFloat(node.getAttribute('width') || '8'); // Default approx width
            const customWidth = !!node.getAttribute('customWidth');
            const hidden = !!node.getAttribute('hidden');

            cols.push({
                min,
                max,
                width,
                customWidth,
                hidden
            });
        });
        return cols;
    }

    private static parseRows(doc: Document): Record<number, XlsxRow> {
        const rows: Record<number, XlsxRow> = {};
        const rowNodes = XmlUtils.queryAll(doc, 'sheetData row');
        
        rowNodes.forEach((row: Element) => {
            const rIndex = parseInt(row.getAttribute('r') || '0', 10);
            const ht = row.getAttribute('ht');
            
            const cells: Record<number, XlsxCell> = {};
            const cNodes = XmlUtils.queryAll(row, 'c');
            
            cNodes.forEach((c: Element) => {
                const r = c.getAttribute('r'); // e.g. "B2"
                if (!r) return;
                
                const colIndex = this.getColumnIndex(r);
                const t = c.getAttribute('t') || 'n';
                const s = parseInt(c.getAttribute('s') || '0', 10);
                const vNode = XmlUtils.query(c, 'v');
                const v = vNode ? (vNode.textContent || '') : undefined;
                const f = XmlUtils.query(c, 'f')?.textContent;

                let val: any = v;
                // Type handling
                if (v !== undefined) {
                    if (t === 'n') {
                        val = parseFloat(v);
                        if (isNaN(val)) val = v;
                    } else if (t === 'b') {
                        val = v === '1';
                    }
                }
                // 's' (shared) -> index
                // 'str' -> inline string
                // 'inlineStr' -> <is><t>...</t></is>
                
                if (t === 'inlineStr') {
                    const isT = XmlUtils.query(c, 'is t');
                    if (isT) val = isT.textContent || '';
                }

                cells[colIndex] = {
                    type: t as any,
                    value: val,
                    formula: f || undefined,
                    styleIndex: s
                };
            });

            rows[rIndex] = {
                index: rIndex,
                height: ht ? parseFloat(ht) : undefined,
                customHeight: !!row.getAttribute('customHeight'),
                hidden: !!row.getAttribute('hidden'),
                cells
            };
        });

        return rows;
    }

    private static parseMerges(doc: Document): XlsxMergeCell[] {
        const merges: XlsxMergeCell[] = [];
        const mergeNodes = XmlUtils.queryAll(doc, 'mergeCells mergeCell');
        
        mergeNodes.forEach((node: Element) => {
            const ref = node.getAttribute('ref'); // "A1:B2"
            if (!ref) return;
            
            const [start, end] = ref.split(':');
            if (!start || !end) return;

            merges.push({
                s: this.getCellAddress(start),
                e: this.getCellAddress(end)
            });
        });
        return merges;
    }

    private static getColumnIndex(cellRef: string): number {
        const colStr = cellRef.replace(/[0-9]/g, '');
        let colIndex = 0;
        for (let i = 0; i < colStr.length; i++) {
            colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64);
        }
        return colIndex;
    }

    private static getCellAddress(ref: string): { r: number, c: number } {
        const colStr = ref.replace(/[0-9]/g, '');
        const rowStr = ref.replace(/[^0-9]/g, '');
        
        let colIndex = 0;
        for (let i = 0; i < colStr.length; i++) {
            colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64);
        }
        
        return {
            r: parseInt(rowStr, 10),
            c: colIndex
        };
    }
}
