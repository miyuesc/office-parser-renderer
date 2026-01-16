/**
 * 图表解析器
 * 解析 OOXML 图表文件 (xl/charts/chart*.xml)
 */

import { XmlUtils } from '@ai-space/shared';

/**
 * 图表系列数据
 */
export interface ChartSeries {
  /** 系列索引 */
  index: number;
  /** 系列名称 */
  name?: string;
  /** 分类数据 (X轴标签) */
  categories: string[];
  /** 数值数据 (Y轴值) */
  values: number[];
  /** 填充颜色 */
  fillColor?: string;
}

/**
 * 图表数据
 */
export interface OfficeChart {
  /** 图表类型 */
  type: 'barChart' | 'pieChart' | 'lineChart' | 'areaChart' | 'scatterChart' | 'other';
  /** 图表标题 */
  title?: string;
  /** 数据系列 */
  series: ChartSeries[];
  /** 柱状图方向 (barChart only) */
  barDirection?: 'col' | 'bar';
  /** 柱状图分组方式 */
  grouping?: 'clustered' | 'stacked' | 'percentStacked';
  /** 锚点信息 */
  anchor?: {
    from: { col: number; colOff: number; row: number; rowOff: number };
    to?: { col: number; colOff: number; row: number; rowOff: number };
    ext?: { cx: number; cy: number };
  };
}

/**
 * 图表解析器
 */
export class ChartParser {
  /**
   * 解析图表 XML
   * @param chartXml 图表 XML 内容
   */
  static parse(chartXml: string): OfficeChart {
    console.group('ChartParser.parse');

    const doc = XmlUtils.parse(chartXml);
    const result: OfficeChart = {
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

    // 检测图表类型并解析
    const barChart = XmlUtils.query(doc, 'c\\:barChart');
    if (barChart) {
      result.type = 'barChart';
      result.barDirection = (barChart.querySelector('c\\:barDir')?.getAttribute('val') as 'col' | 'bar') || 'col';
      result.grouping = (barChart.querySelector('c\\:grouping')?.getAttribute('val') as any) || 'clustered';
      result.series = this.parseSeriesData(barChart);
    }

    const pieChart = XmlUtils.query(doc, 'c\\:pieChart');
    if (pieChart) {
      result.type = 'pieChart';
      result.series = this.parseSeriesData(pieChart);
    }

    const lineChart = XmlUtils.query(doc, 'c\\:lineChart');
    if (lineChart) {
      result.type = 'lineChart';
      result.series = this.parseSeriesData(lineChart);
    }

    console.log('Parsed Chart:', result);
    console.groupEnd();

    return result;
  }

  /**
   * 解析系列数据
   * @param chartNode 图表节点 (barChart、pieChart 等)
   */
  private static parseSeriesData(chartNode: Element): ChartSeries[] {
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

      // 分类数据 (X轴) - 优先从 strRef (字符串引用) 获取，其次从 numRef (数值引用) 获取
      const categories: string[] = [];
      // 直接获取 c:cat 节点下的缓存数据
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
          // 尝试从数值缓存获取 (某些图表使用数值作为分类)
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

      // 数值数据 (Y轴) - 使用与 categories 相同的精确选择器方式
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
        fillColor
      });
    });

    return series;
  }
}
