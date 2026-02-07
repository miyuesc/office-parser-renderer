import { IChartData, ChartType, AxisPosition, IChartSeries, IChartAxis } from '../model/IChartData';
import { XmlUtils } from '../utils/XmlUtils';

import { FileHandler } from '../../core/FileHandler';

export class ChartParser {
  /**
   * 解析 chart.xml 内容
   * @param xmlContent chart.xml 的字符串内容
   * @returns 解析后的 IChartData
   */
  public parse(xmlContent: string): IChartData | null {
    const doc = FileHandler.parseXML(xmlContent);

    // 检查是否有解析错误
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.error('XML Parse Error', parserError);
      return null;
    }

    return this.parseDocument(doc);
  }

  private parseDocument(doc: Document): IChartData | null {
    const chartSpace = XmlUtils.getChild(doc, 'chartSpace');
    if (!chartSpace) return null;

    const chart = XmlUtils.getChild(chartSpace, 'chart');
    if (!chart) return null;

    const plotArea = XmlUtils.getChild(chart, 'plotArea');
    if (!plotArea) return null;

    // 1. Title
    let title: any = undefined;
    const titleNode = XmlUtils.getChild(chart!, 'title');
    if (titleNode) {
      title = this.parseTitle(titleNode);
    }

    // 2. Legend
    let legend: any = undefined;
    const legendNode = XmlUtils.getChild(chart!, 'legend');
    if (legendNode) {
      legend = this.parseLegend(legendNode);
    }

    // 3. 识别图表类型
    let chartData: IChartData | null = null;

    // Bar Chart
    const barChart = XmlUtils.getChild(plotArea, 'barChart');
    const bar3DChart = XmlUtils.getChild(plotArea, 'bar3DChart');
    if (barChart) {
      chartData = this.parseBarChart(barChart, plotArea);
    } else if (bar3DChart) {
      chartData = this.parseBarChart(bar3DChart, plotArea);
      chartData.is3D = true;
    } else {
      // Line Chart
      const lineChart = XmlUtils.getChild(plotArea, 'lineChart');
      const line3DChart = XmlUtils.getChild(plotArea, 'line3DChart');
      if (lineChart) {
        chartData = this.parseLineChart(lineChart, plotArea);
      } else if (line3DChart) {
        chartData = this.parseLineChart(line3DChart, plotArea);
        chartData.is3D = true;
      } else {
        // Pie Chart
        const pieChart = XmlUtils.getChild(plotArea, 'pieChart');
        const pie3DChart = XmlUtils.getChild(plotArea, 'pie3DChart');
        if (pieChart) {
          chartData = this.parsePieChart(pieChart, plotArea);
        } else if (pie3DChart) {
          chartData = this.parsePieChart(pie3DChart, plotArea);
          chartData.is3D = true;
        }
      }
    }

    if (chartData) {
      chartData.title = title;
      chartData.legend = legend;
      return chartData;
    }

    return null;
  }

  private parseTitle(titleNode: Element): { text: string } | undefined {
    // 尝试获取 tx -> rich -> p -> r -> t
    const tx = XmlUtils.getChild(titleNode, 'tx');
    if (tx) {
      const rich = XmlUtils.getChild(tx, 'rich');
      if (rich) {
        const p = XmlUtils.getChild(rich, 'p');
        if (p) {
          const r = XmlUtils.getChild(p, 'r');
          if (r) {
            const t = XmlUtils.getChild(r, 't');
            if (t) {
              const text = XmlUtils.getText(t);
              return { text };
            }
          }
          // Sometimes text is in multiple runs
          const runs = XmlUtils.getChildren(p, 'r');
          if (runs.length > 0) {
            const text = runs
              .map(run => {
                const tNode = XmlUtils.getChild(run, 't');
                return tNode ? XmlUtils.getText(tNode) : '';
              })
              .join('');
            return { text };
          }
        }
      }
      // 尝试 strRef
      const strRef = XmlUtils.getChild(tx, 'strRef');
      if (strRef) {
        const strCache = XmlUtils.getChild(strRef, 'strCache');
        if (strCache) {
          const pt = XmlUtils.getChild(strCache, 'pt');
          if (pt) {
            const v = XmlUtils.getChild(pt, 'v');
            if (v) {
              const text = XmlUtils.getText(v);
              return { text };
            }
          }
        }
      }
    }

    // If we are here, we found a title node but couldn't extract specific text.
    // Default to 'Chart Title' to ensure something is rendered.
    return { text: 'Chart Title' };
  }

  private parseLegend(legendNode: Element): { position: AxisPosition | 'tr' | 'tl' | 'br' | 'bl'; visible: boolean } {
    const legendPos = XmlUtils.getChild(legendNode, 'legendPos')?.getAttribute('val') || 'r';
    // Map 'r', 'l', 't', 'b', 'tr' to internal types
    return {
      position: legendPos as any,
      visible: true
    };
  }

  private parseBarChart(barChartNode: Element, plotAreaNode: Element): IChartData {
    const grouping = (XmlUtils.getChild(barChartNode, 'grouping')?.getAttribute('val') as any) || 'standard';
    // const barDir = XmlUtils.getChild(barChartNode, 'barDir')?.getAttribute('val') || 'col';

    // 解析 Categories 和 Series
    const seriesList = this.parseSeries(barChartNode);

    // 提取 shared categories (通常从第一个 series 获取)
    const categories = seriesList.length > 0 ? seriesList[0].categories || [] : [];

    // 解析 Axes
    const axes = this.parseAxes(plotAreaNode);

    return {
      type: ChartType.BAR, // 目前统一归为 BAR, 渲染层再区分 col/bar
      grouping,
      is3D: false,
      series: seriesList,
      categories,
      axes // TODO: link axis IDs
    };
  }

  private parseLineChart(chartNode: Element, plotAreaNode: Element): IChartData {
    const grouping = (XmlUtils.getChild(chartNode, 'grouping')?.getAttribute('val') as any) || 'standard';

    const seriesList = this.parseSeries(chartNode);
    const categories = seriesList.length > 0 ? seriesList[0].categories || [] : [];
    const axes = this.parseAxes(plotAreaNode);

    return {
      type: ChartType.LINE,
      grouping,
      is3D: false,
      series: seriesList,
      categories,
      axes
    };
  }

  private parsePieChart(chartNode: Element, plotAreaNode: Element): IChartData {
    // Pie charts usually don't have typical axes, but we scan for them anyway if they exist (unlikely visible)
    // Pie chart series are usually one per chart for simple pies
    const seriesList = this.parseSeries(chartNode);
    const categories = seriesList.length > 0 ? seriesList[0].categories || [] : [];

    return {
      type: ChartType.PIE,
      grouping: 'standard',
      is3D: false,
      series: seriesList,
      categories,
      axes: [] // Pie charts don't use XY axes in the traditional sense
    };
  }

  private parseSeries(chartNode: Element): IChartSeries[] {
    const serNodes = XmlUtils.getChildren(chartNode, 'ser');
    return serNodes.map((ser, index) => {
      const idx = parseInt(XmlUtils.getChild(ser, 'idx')?.getAttribute('val') || '0');
      const order = parseInt(XmlUtils.getChild(ser, 'order')?.getAttribute('val') || '0');

      // Series Name
      const tx = XmlUtils.getChild(ser, 'tx');
      const strRef = XmlUtils.getChild(tx!, 'strRef'); // string reference
      const v = XmlUtils.getChild(tx!, 'v'); // literal value
      let name = '';
      if (v) name = XmlUtils.getText(v);
      else if (strRef) {
        // 尝试获取缓存的字符串
        const strCache = XmlUtils.getChild(strRef, 'strCache');
        if (strCache) {
          const pt = XmlUtils.getChild(strCache, 'pt');
          if (pt) name = XmlUtils.getText(XmlUtils.getChild(pt, 'v'));
        }
      }

      // Styles (spPr)
      const spPr = XmlUtils.getChild(ser, 'spPr');
      const styles = this.parseShapeProperties(spPr);

      // Categories (cat)
      const cat = XmlUtils.getChild(ser, 'cat');
      const categories = this.parseDataCache(cat!); // helper to extract strings

      // Values (val)
      const val = XmlUtils.getChild(ser, 'val');
      const values = this.parseNumCache(val!);

      return {
        index: idx,
        order,
        name,
        fillColor: styles.fillColor,
        borderColor: styles.borderColor,
        borderWidth: styles.borderWidth,
        data: values,
        categories
      };
    });
  }

  private parseShapeProperties(spPrNode: Element | null): {
    fillColor?: string;
    borderColor?: string;
    borderWidth?: number;
  } {
    if (!spPrNode) return {};

    let fillColor: string | undefined;
    let borderColor: string | undefined;
    let borderWidth: number | undefined;

    // 1. Fill
    const solidFill = XmlUtils.getChild(spPrNode, 'solidFill');
    if (solidFill) {
      const srgbClr = XmlUtils.getChild(solidFill, 'srgbClr');
      const schemeClr = XmlUtils.getChild(solidFill, 'schemeClr');

      if (srgbClr) {
        let val = srgbClr.getAttribute('val');
        if (val) fillColor = `#${val}`;
      } else if (schemeClr) {
        // TODO: Handle theme colors
        // const val = schemeClr.getAttribute('val');
        // fillColor = ThemeColorMap[val] || ...
        fillColor = '#888888'; // Fallback
      }
    } else if (XmlUtils.getChild(spPrNode, 'noFill')) {
      fillColor = 'transparent';
    }

    // 2. Border (ln - line)
    const ln = XmlUtils.getChild(spPrNode, 'ln');
    if (ln) {
      const w = ln.getAttribute('w');
      if (w) {
        // EMU to pixels? OOXML uses EMUs. 12700 EMUs = 1pt.
        // 9525 EMUs = 1 pixel (at 96 DPI).
        // Let's assume input is EMU, convert to basic pixel.
        borderWidth = parseInt(w) / 9525;
      }

      const lnSolidFill = XmlUtils.getChild(ln, 'solidFill');
      if (lnSolidFill) {
        const lnSrgbClr = XmlUtils.getChild(lnSolidFill, 'srgbClr');
        if (lnSrgbClr) {
          const val = lnSrgbClr.getAttribute('val');
          if (val) borderColor = `#${val}`;
        }
      }
    }

    return { fillColor, borderColor, borderWidth };
  }

  private parseAxes(plotAreaNode: Element): IChartAxis[] {
    const axes: IChartAxis[] = [];
    const catAxList = XmlUtils.getChildren(plotAreaNode, 'catAx');
    const valAxList = XmlUtils.getChildren(plotAreaNode, 'valAx');

    catAxList.forEach(ax => {
      const axId = parseInt(XmlUtils.getChild(ax, 'axId')?.getAttribute('val') || '0');
      const axPos = XmlUtils.getChild(ax, 'axPos')?.getAttribute('val') as AxisPosition;
      axes.push({
        id: axId,
        position: axPos || AxisPosition.BOTTOM,
        type: 'cat'
      });
    });

    valAxList.forEach(ax => {
      const axId = parseInt(XmlUtils.getChild(ax, 'axId')?.getAttribute('val') || '0');
      const axPos = XmlUtils.getChild(ax, 'axPos')?.getAttribute('val') as AxisPosition;
      axes.push({
        id: axId,
        position: axPos || AxisPosition.LEFT,
        type: 'val'
      });
    });

    return axes;
  }

  private parseDataCache(refNode: Element): string[] {
    if (!refNode) return [];
    // 无论是 strRef 还是 numRef
    const strRef = XmlUtils.getChild(refNode, 'strRef');
    if (strRef) {
      const strCache = XmlUtils.getChild(strRef, 'strCache');
      if (strCache) {
        const pts = XmlUtils.getChildren(strCache, 'pt');
        return pts.map(pt => XmlUtils.getText(XmlUtils.getChild(pt, 'v')));
      }
    }
    // Check for numRef (if using numbers as categories)
    const numRef = XmlUtils.getChild(refNode, 'numRef');
    if (numRef) {
      const numCache = XmlUtils.getChild(numRef, 'numCache');
      if (numCache) {
        const pts = XmlUtils.getChildren(numCache, 'pt');
        return pts.map(pt => XmlUtils.getText(XmlUtils.getChild(pt, 'v')));
      }
    }
    return [];
  }

  private parseNumCache(refNode: Element): number[] {
    if (!refNode) return [];
    const numRef = XmlUtils.getChild(refNode, 'numRef');
    if (numRef) {
      const numCache = XmlUtils.getChild(numRef, 'numCache');
      if (numCache) {
        const pts = XmlUtils.getChildren(numCache, 'pt');
        return pts.map(pt => parseFloat(XmlUtils.getText(XmlUtils.getChild(pt, 'v'))));
      }
    }
    return [];
  }
}
