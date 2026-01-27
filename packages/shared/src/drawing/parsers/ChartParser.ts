import { XmlUtils } from '../../core/xml';
import type { OfficeChart, ChartSeries } from '../types';

/**
 * 通用图表解析器
 *
 * 负责解析 OOXML 图表部分 (charts/chartN.xml) 的标准内容。
 * 不依赖于特定 Office 应用（Word/Excel）的上下文信息（如 rId 或 anchor）。
 */
export class ChartParser {
  /**
   * 解析图表 XML 内容
   *
   * @param chartXml - 图表 XML 字符串
   * @returns 解析后的标准图表对象
   */
  static parse(chartXml: string): OfficeChart {
    const doc = XmlUtils.parse(chartXml);
    const result: OfficeChart = {
      type: 'other',
      series: [],
    };

    // 解析图表标题
    const titleNode = XmlUtils.query(doc, 'c\\:chart c\\:title c\\:tx c\\:rich');
    if (titleNode) {
      const titleText = XmlUtils.query(titleNode, 'a\\:p a\\:r a\\:t');
      if (titleText) {
        result.title = titleText.textContent || undefined;
      }
    }

    // 检测所有图表类型元素
    // 使用数组收集所有找到的图表类型，以支持组合图表
    const chartTypes: Array<{
      type: OfficeChart['type'];
      node: Element;
      seriesType: NonNullable<ChartSeries['chartType']>;
    }> = [];

    const barChart = XmlUtils.query(doc, 'c\\:barChart');
    if (barChart) {
      result.barDirection =
        (barChart.querySelector('c\\:barDir')?.getAttribute('val') as 'col' | 'bar') || 'col';
      result.grouping =
        (barChart.querySelector('c\\:grouping')?.getAttribute('val') as OfficeChart['grouping']) ||
        'clustered';
      chartTypes.push({ type: 'barChart', node: barChart, seriesType: 'bar' });
    }

    const lineChart = XmlUtils.query(doc, 'c\\:lineChart');
    if (lineChart) {
      chartTypes.push({ type: 'lineChart', node: lineChart, seriesType: 'line' });
    }

    const pieChart = XmlUtils.query(doc, 'c\\:pieChart');
    if (pieChart) {
      chartTypes.push({ type: 'pieChart', node: pieChart, seriesType: 'pie' });
    }

    const pie3DChart = XmlUtils.query(doc, 'c\\:pie3DChart');
    if (pie3DChart) {
      chartTypes.push({ type: 'pie3DChart', node: pie3DChart, seriesType: 'pie' });
    }

    const areaChart = XmlUtils.query(doc, 'c\\:areaChart');
    if (areaChart) {
      chartTypes.push({ type: 'areaChart', node: areaChart, seriesType: 'area' });
    }

    const scatterChart = XmlUtils.query(doc, 'c\\:scatterChart');
    if (scatterChart) {
      chartTypes.push({ type: 'scatterChart', node: scatterChart, seriesType: 'scatter' });
    }

    // 确定最终图表类型和数据
    if (chartTypes.length === 0) {
      result.type = 'other';
    } else if (chartTypes.length === 1) {
      result.type = chartTypes[0].type;
      result.series = this.parseSeriesData(chartTypes[0].node, chartTypes[0].seriesType);
    } else {
      // 混合图表：合并所有系列数据
      result.type = 'comboChart';
      result.series = [];
      for (const ct of chartTypes) {
        const seriesData = this.parseSeriesData(ct.node, ct.seriesType);
        result.series.push(...seriesData);
      }
    }

    return result;
  }

  /**
   * 解析系列数据
   *
   * @param chartNode - 图表节点 (barChart、pieChart 等)
   * @param seriesType - 系列图表类型
   */
  private static parseSeriesData(
    chartNode: Element,
    seriesType: NonNullable<ChartSeries['chartType']> = 'bar',
  ): ChartSeries[] {
    const series: ChartSeries[] = [];
    const serNodes = XmlUtils.queryAll(chartNode, 'c\\:ser');

    serNodes.forEach((ser: Element) => {
      const idx = parseInt(XmlUtils.query(ser, 'c\\:idx')?.getAttribute('val') || '0', 10);

      // 系列名称
      let name: string | undefined;
      const txStrRef = XmlUtils.query(ser, 'c\\:tx c\\:strRef c\\:strCache c\\:pt c\\:v');
      if (txStrRef) {
        name = txStrRef.textContent || undefined;
      }

      // 分类数据 (X轴)
      const categories: string[] = [];
      const catNode = XmlUtils.query(ser, 'c\\:cat');
      if (catNode) {
        // strRef > numRef
        const strCache = XmlUtils.query(catNode, 'c\\:strRef c\\:strCache');
        const numCache = XmlUtils.query(catNode, 'c\\:numRef c\\:numCache');

        const cache = strCache || numCache;
        if (cache) {
          const pts = XmlUtils.queryAll(cache, 'c\\:pt');
          pts.forEach((pt: Element) => {
            const v = XmlUtils.query(pt, 'c\\:v');
            if (v) categories.push(v.textContent || '');
          });
        }
      }

      // 数值数据 (Y轴)
      const values: number[] = [];
      const valNode = XmlUtils.query(ser, 'c\\:val');
      if (valNode) {
        const numCache = XmlUtils.query(valNode, 'c\\:numRef c\\:numCache');
        if (numCache) {
          const valPts = XmlUtils.queryAll(numCache, 'c\\:pt');
          valPts.forEach((pt: Element) => {
            const v = XmlUtils.query(pt, 'c\\:v');
            if (v) {
              values.push(parseFloat(v.textContent || '0'));
            }
          });
        }
      }

      // 填充颜色
      let fillColor: string | undefined;
      const solidFill = XmlUtils.query(ser, 'c\\:spPr a\\:solidFill');
      if (solidFill) {
        const schemeClr = XmlUtils.query(solidFill, 'a\\:schemeClr');
        if (schemeClr) {
          fillColor = `theme:${schemeClr.getAttribute('val')}`;
        }
        const srgbClr = XmlUtils.query(solidFill, 'a\\:srgbClr');
        if (srgbClr) {
          fillColor = `#${srgbClr.getAttribute('val')}`;
        }
      }

      series.push({
        index: idx,
        name,
        categories,
        values,
        fillColor,
        chartType: seriesType,
      });
    });

    return series;
  }
}
