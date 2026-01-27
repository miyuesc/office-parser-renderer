/**
 * 图表解析器
 * 解析 OOXML 图表文件 (xl/charts/chart*.xml)
 */

import { ChartParser as SharedChartParser } from '@ai-space/shared';
import { Logger } from '../utils/Logger';
import type { OfficeChart, ChartSeries } from '@ai-space/shared';

const log = Logger.createTagged('ChartParser');

// Re-export types for backward compatibility within the package
export type { OfficeChart, ChartSeries };

/**
 * 图表解析器
 */
export class ChartParser {
  /**
   * 解析图表 XML
   * @param chartXml 图表 XML 内容
   */
  static parse(chartXml: string): OfficeChart {
    log.group('ChartParser.parse');

    // Reuse shared parser
    const result = SharedChartParser.parse(chartXml);

    log.debug('Parsed Chart:', result);
    log.groupEnd();

    return result;
  }
}
