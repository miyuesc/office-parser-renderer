
import { XmlUtils } from '@ai-space/shared';
import { XlsxTheme } from '../types';

export class ThemeParser {
    static parse(themeXml: string): XlsxTheme {
        const doc = XmlUtils.parse(themeXml);
        const colorScheme: Record<string, string> = {};

        // clrScheme
        //  - dk1, lt1, dk2, lt2, accent1...accent6, hlink, folHlink
        
        const clrScheme = XmlUtils.query(doc, 'a\\:clrScheme');
        if (clrScheme) {
            // Helper to extract RGB from sysClr or srgbClr
            const extractColor = (nodeName: string, mapTo: string) => {
                const node = XmlUtils.query(clrScheme, `a\\:${nodeName}`);
                if (node) {
                    const srgbClr = XmlUtils.query(node, 'a\\:srgbClr');
                    const sysClr = XmlUtils.query(node, 'a\\:sysClr');
                    
                    if (srgbClr) {
                        colorScheme[mapTo] = srgbClr.getAttribute('val') || '000000';
                    } else if (sysClr) {
                        colorScheme[mapTo] = sysClr.getAttribute('lastClr') || '000000';
                    }
                }
            };

            extractColor('lt1', '0');
            extractColor('dk1', '1');
            extractColor('lt2', '2');
            extractColor('dk2', '3');
            extractColor('accent1', '4');
            extractColor('accent2', '5');
            extractColor('accent3', '6');
            extractColor('accent4', '7');
            extractColor('accent5', '8');
            extractColor('accent6', '9');
            extractColor('hlink', '10');
            extractColor('folHlink', '11');
        }

        return { colorScheme };
    }
}
