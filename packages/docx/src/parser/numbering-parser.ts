import { XmlUtils, LengthUtils } from '@ai-space/shared';
import { NumberingDefinition, AbstractNumbering, NumberingLevel, NumberingInstance } from '../types';

export class NumberingParser {
    static parse(xmlString: string): NumberingDefinition {
        const doc = XmlUtils.parse(xmlString);
        
        const abstractNums: Record<string, AbstractNumbering> = {};
        const nums: Record<string, NumberingInstance> = {};

        // Parse abstractNum
        const abstractNumNodes = XmlUtils.queryAll(doc, 'w\\:abstractNum, abstractNum');
        for (const node of abstractNumNodes) {
             const id = node.getAttribute('w:abstractNumId') || '';
             if (!id) continue;

             const levels: Record<string, NumberingLevel> = {};
             const lvlNodes = XmlUtils.queryAll(node, 'w\\:lvl, lvl');
             
             for (const lvl of lvlNodes) {
                 const ilvl = lvl.getAttribute('w:ilvl') || '0';
                 
                 const startVal = XmlUtils.query(lvl, 'w\\:start, start')?.getAttribute('w:val');
                 const numFmt = XmlUtils.query(lvl, 'w\\:numFmt, numFmt')?.getAttribute('w:val') || 'decimal';
                 const lvlText = XmlUtils.query(lvl, 'w\\:lvlText, lvlText')?.getAttribute('w:val') || '%1.';
                 const jc = XmlUtils.query(lvl, 'w\\:lvlJc, lvlJc')?.getAttribute('w:val') || 'left';
                 
                 // Indentation
                 const pPr = XmlUtils.query(lvl, 'w\\:pPr, pPr');
                 const ind = XmlUtils.query(pPr!, 'w\\:ind, ind');
                 const left = ind?.getAttribute('w:left') || '0';
                 
                 levels[ilvl] = {
                     start: parseInt(startVal || '1', 10),
                     format: numFmt,
                     text: lvlText,
                     alignment: jc as any,
                     indent: LengthUtils.twipsToPixels(parseInt(left, 10))
                 };
             }

             abstractNums[id] = { id, levels };
        }

        // Parse num
        const numNodes = XmlUtils.queryAll(doc, 'w\\:num, num');
        for (const node of numNodes) {
            const id = node.getAttribute('w:numId');
            if (!id) continue;
            
            const abstractNumId = XmlUtils.query(node, 'w\\:abstractNumId, abstractNumId')?.getAttribute('w:val');
            
            if (abstractNumId) {
                nums[id] = {
                    id,
                    abstractNumId
                };
            }
        }

        return { abstractNums, nums };
    }
}
