/**
 * DOCX 图表解析器
 *
 * 解析 OOXML 图表文件 (word/charts/chart*.xml)
 * 图表 XML 格式与 XLSX 中的图表格式相同（OOXML 标准）
 */

import { XmlUtils } from '@ai-space/shared';
import type { DrawingChart } from '../types';

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
    const doc = XmlUtils.parse(chartXml);
    const result: DrawingChart = {
      rId,
      cx,
      cy,
      type: 'other',
      series: []
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
    const chartTypes: Array<{ type: string; node: Element; seriesType: 'bar' | 'line' | 'area' | 'scatter' }> = [];

    const barChart = XmlUtils.query(doc, 'c\\:barChart');
    if (barChart) {
      result.barDirection = (barChart.querySelector('c\\:barDir')?.getAttribute('val') as 'col' | 'bar') || 'col';
      result.grouping =
        (barChart.querySelector('c\\:grouping')?.getAttribute('val') as DrawingChart['grouping']) || 'clustered';
      chartTypes.push({ type: 'barChart', node: barChart, seriesType: 'bar' });
    }

    const lineChart = XmlUtils.query(doc, 'c\\:lineChart');
    if (lineChart) {
      chartTypes.push({ type: 'lineChart', node: lineChart, seriesType: 'line' });
    }

    const pieChart = XmlUtils.query(doc, 'c\\:pieChart');
    if (pieChart) {
      chartTypes.push({ type: 'pieChart', node: pieChart, seriesType: 'bar' });
    }

    const pie3DChart = XmlUtils.query(doc, 'c\\:pie3DChart');
    if (pie3DChart) {
      chartTypes.push({ type: 'pie3DChart', node: pie3DChart, seriesType: 'bar' });
    }

    const areaChart = XmlUtils.query(doc, 'c\\:areaChart');
    if (areaChart) {
      chartTypes.push({ type: 'areaChart', node: areaChart, seriesType: 'area' });
    }

    const scatterChart = XmlUtils.query(doc, 'c\\:scatterChart');
    if (scatterChart) {
      chartTypes.push({ type: 'scatterChart', node: scatterChart, seriesType: 'scatter' });
    }

    // 确定最终图表类型
    if (chartTypes.length === 0) {
      result.type = 'other';
    } else if (chartTypes.length === 1) {
      result.type = chartTypes[0].type as DrawingChart['type'];
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
   * @param seriesType - 系列图表类型（用于混合图表）
   * @returns 系列数据数组
   */
  private static parseSeriesData(
    chartNode: Element,
    seriesType: 'bar' | 'line' | 'area' | 'scatter' = 'bar'
  ): NonNullable<DrawingChart['series']> {
    const series: NonNullable<DrawingChart['series']> = [];
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
        // 尝试从字符串缓存获取
        const strCache = XmlUtils.query(catNode, 'c\\:strRef c\\:strCache');
        if (strCache) {
          const catPts = XmlUtils.queryAll(strCache, 'c\\:pt');
          catPts.forEach((pt: Element) => {
            const v = XmlUtils.query(pt, 'c\\:v');
            if (v) {
              categories.push(v.textContent || '');
            }
          });
        } else {
          // 尝试从数值缓存获取
          const numCache = XmlUtils.query(catNode, 'c\\:numRef c\\:numCache');
          if (numCache) {
            const catPts = XmlUtils.queryAll(numCache, 'c\\:pt');
            catPts.forEach((pt: Element) => {
              const v = XmlUtils.query(pt, 'c\\:v');
              if (v) {
                categories.push(v.textContent || '');
              }
            });
          }
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
        chartType: seriesType
      });
    });

    return series;
  }
}
