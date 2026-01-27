/**
 * DOCX 主题解析器
 *
 * 解析 word/theme/theme1.xml
 */
import { XmlUtils } from '@ai-space/shared';
import { DocxTheme } from '../types';

export class ThemeParser {
  /**
   * 解析主题 XML
   *
   * @param themeXml - 主题 XML 内容
   * @returns DocxTheme 对象
   */
  static parse(themeXml: string): DocxTheme {
    const doc = XmlUtils.parse(themeXml);
    const colorScheme: Record<string, string> = {};

    // 颜色方案
    // - dk1, lt1, dk2, lt2, accent1...accent6, hlink, folHlink

    const clrScheme = XmlUtils.query(doc, 'a\\:clrScheme');
    if (clrScheme) {
      /**
       * 从 sysClr 或 srgbClr 提取 RGB 值
       * @param nodeName - 节点名称
       * @param mapTo - 映射到的索引
       */
      const extractColor = (nodeName: string, mapTo: string) => {
        const node = XmlUtils.query(clrScheme, `a\\:${nodeName}`);
        if (node) {
          const srgbClr = XmlUtils.query(node, 'a\\:srgbClr');
          const sysClr = XmlUtils.query(node, 'a\\:sysClr');

          let colorVal = '000000';
          if (srgbClr) {
            // Include # prefix immediately
            colorVal = '#' + (srgbClr.getAttribute('val') || '000000');
          } else if (sysClr) {
            colorVal = '#' + (sysClr.getAttribute('lastClr') || '000000');
          }

          // 同时存储数字索引和名称
          colorScheme[mapTo] = colorVal;
          colorScheme[nodeName] = colorVal;

          // 同时映射别名
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
