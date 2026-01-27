/**
 * DOCX 图表解析器
 *
 * 解析 OOXML 图表文件 (word/charts/chart*.xml)
 */

import { ChartParser as SharedChartParser } from '@ai-space/shared';
import type { DrawingChart } from '../types/drawing';

/**
 * 图表解析器类
 */
export class ChartParser {
  /**
   * 解析图表 XML
   *
   * @param chartXml - 图表 XML 内容
   * @param cx - 图表宽度 (EMU)
   * @param cy - 图表高度 (EMU)
   * @param rId - 图表关系 ID
   * @returns 解析后的图表数据
   */
  static parse(chartXml: string, cx: number, cy: number, rId: string): DrawingChart {
    // 使用通用解析器解析图表内容
    const chartData = SharedChartParser.parse(chartXml);

    // 转换为 DrawingChart 结构（附加布局信息）
    return {
      rId,
      cx,
      cy,
      type: chartData.type,
      title: chartData.title,
      // Shared ChartSeries is compatible with Docx DrawingChart series structure
      // DrawingChart series is defined in shared/types.ts? No, it's in docx/types.
      // But they should be structurally identical based on previous analysis.
      series: chartData.series,
      barDirection: chartData.barDirection,
      grouping: chartData.grouping,
    };
  }
}
