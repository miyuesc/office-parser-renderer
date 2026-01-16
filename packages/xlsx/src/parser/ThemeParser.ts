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

          let colorVal = '000000';
          if (srgbClr) {
            colorVal = srgbClr.getAttribute('val') || '000000';
          } else if (sysClr) {
            colorVal = sysClr.getAttribute('lastClr') || '000000';
          }

          // Store by both numeric index and name
          colorScheme[mapTo] = colorVal;
          colorScheme[nodeName] = colorVal;

          // Also map aliases
          if (nodeName === 'dk1') colorScheme['tx1'] = colorVal;
          if (nodeName === 'lt1') colorScheme['bg1'] = colorVal;
          if (nodeName === 'dk2') colorScheme['tx2'] = colorVal;
          if (nodeName === 'lt2') colorScheme['bg2'] = colorVal;
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
