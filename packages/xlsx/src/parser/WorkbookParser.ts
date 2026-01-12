
import { XmlUtils } from '@ai-space/shared';
import { XlsxSheet, XlsxPageSetup } from '../types';

interface SheetRelation {
    id: string;
    path: string;
}

export class WorkbookParser {
    static parse(workbookXml: string, relsXml: string | null): { sheets: XlsxSheet[], date1904: boolean } {
        const doc = XmlUtils.parse(workbookXml);
        const sheetNodes = XmlUtils.queryAll(doc, 'sheets sheet');

        // Parse relationships to find file paths
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
            const sheetId = node.getAttribute('sheetId') || '0';
            const rId = node.getAttribute('r:id'); // Relationships namespace usually needed
            const state = node.getAttribute('state') as 'visible' | 'hidden' | 'veryHidden' || 'visible';
            
            sheets.push({
                name,
                id: rId || '',
                state,
                rows: {},
                merges: [],
                cols: []
            });
        });

        // Parse Workbook Properties for Date1904
        const workbookPr = XmlUtils.query(doc, 'workbookPr');
        const date1904 = workbookPr?.getAttribute('date1904') === '1' || workbookPr?.getAttribute('date1904') === 'true';

        return { sheets, date1904 };
    }

    static getSheetPath(relId: string, relationships: Record<string, string>): string | null {
        // Relationships target might be relative or absolute (from root).
        // Usually relative to xl/ directory if we are in xl/workbook.xml
        
        return relationships[relId] || null;
    }
    
    // Helper to parse relationships map
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
