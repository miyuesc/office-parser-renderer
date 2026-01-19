/**
 * 图表渲染器
 * 负责柱状图、饼图、折线图等图表的渲染
 */

import type { OfficeChart } from '../types';
import type { StyleResolver, RenderContext } from './StyleResolver';
import {
  CHART_PADDING,
  BAR_GROUP_GAP_RATIO,
  Y_MAX_MARGIN_RATIO,
  OFFICE_THEME_COLORS,
  DEFAULT_COLORS
} from './constants';

/** 渲染区域 */
export interface RenderRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * 图表渲染器类
 */
export class ChartRenderer {
  private styleResolver: StyleResolver;

  constructor(styleResolver: StyleResolver) {
    this.styleResolver = styleResolver;
  }

  /**
   * 渲染图表
   * @param chart 图表数据
   * @param container SVG 容器
   * @param rect 渲染区域
   * @param _ctx 渲染上下文
   */
  renderChart(chart: OfficeChart, container: SVGElement, rect: RenderRect, _ctx: RenderContext): void {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${rect.x}, ${rect.y})`);

    // 图表背景
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', String(rect.w));
    bg.setAttribute('height', String(rect.h));
    bg.setAttribute('fill', DEFAULT_COLORS.chartBackground);
    bg.setAttribute('stroke', DEFAULT_COLORS.chartBorder);
    bg.setAttribute('stroke-width', '1');
    g.appendChild(bg);

    // 根据类型渲染
    if (chart.type === 'barChart') {
      this._renderBarChart(chart, g, rect);
    } else if (chart.type === 'pieChart' || chart.type === 'pie3DChart') {
      this._renderPieChart(chart, g, rect);
    } else if (chart.type === 'lineChart') {
      this._renderLineChart(chart, g, rect);
    } else {
      // 占位符
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(rect.w / 2));
      text.setAttribute('y', String(rect.h / 2));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', DEFAULT_COLORS.placeholderText);
      text.setAttribute('font-size', '14');
      text.textContent = `${chart.title || 'Chart'} (${chart.type})`;
      g.appendChild(text);
    }

    container.appendChild(g);
  }

  /**
   * 渲染柱状图
   */
  private _renderBarChart(chart: OfficeChart, container: SVGElement, rect: RenderRect): void {
    if (!chart.series.length) return;

    const padding = CHART_PADDING.bar;
    const plotW = rect.w - padding.left - padding.right;
    const plotH = rect.h - padding.top - padding.bottom;

    if (plotW <= 0 || plotH <= 0) return;

    // 绘制标题
    if (chart.title) {
      this._renderTitle(container, chart.title, rect.w / 2, 25);
    }

    // 计算数据范围
    let maxVal = 0;
    chart.series.forEach(s => {
      s.values.forEach(v => {
        if (!isNaN(v) && v > maxVal) maxVal = v;
      });
    });

    if (maxVal === 0) maxVal = 100;
    else maxVal = Math.ceil(maxVal * Y_MAX_MARGIN_RATIO);

    // 绘制 Y 轴网格线和标签
    this._renderYAxis(container, padding, plotW, plotH, maxVal);

    const categories = chart.series[0]?.categories || [];
    const numCats = categories.length;
    const numSeries = chart.series.length;
    if (numCats === 0) return;

    // 柱宽计算 - Office 风格
    const catW = plotW / numCats;
    const groupGapRatio = BAR_GROUP_GAP_RATIO;
    const groupW = catW * (1 - groupGapRatio);
    const barGap = numSeries > 1 ? (groupW * 0.15) / (numSeries - 1) : 0;
    const barW = (groupW - barGap * (numSeries - 1)) / numSeries;
    const groupStartOffset = catW * (groupGapRatio / 2);

    // 绘制柱子
    chart.series.forEach((series, si) => {
      const color = series.fillColor
        ? this.styleResolver.resolveColor(series.fillColor)
        : OFFICE_THEME_COLORS[si % OFFICE_THEME_COLORS.length];

      series.values.forEach((val, ci) => {
        const safeVal = isNaN(val) ? 0 : val;
        const barH = (safeVal / maxVal) * plotH;
        const x = padding.left + ci * catW + groupStartOffset + si * (barW + barGap);
        const y = padding.top + (plotH - barH);

        if (barH > 0) {
          const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          bar.setAttribute('x', String(x));
          bar.setAttribute('y', String(y));
          bar.setAttribute('width', String(barW));
          bar.setAttribute('height', String(barH));
          bar.setAttribute('fill', color);
          bar.setAttribute('stroke', DEFAULT_COLORS.white);
          bar.setAttribute('stroke-width', '0.5');
          container.appendChild(bar);
        }
      });
    });

    // 绘制 X 轴
    this._renderXAxis(container, padding, plotW, plotH, categories, catW);

    // 绘制图例
    this._renderBarLegend(container, chart.series, padding, plotW, rect.h);
  }

  /**
   * 渲染饼图
   */
  private _renderPieChart(chart: OfficeChart, container: SVGElement, rect: RenderRect): void {
    if (!chart.series.length) return;

    const padding = { top: 40, right: 20, bottom: 30, left: 20 };
    const plotW = rect.w - padding.left - padding.right;
    const plotH = rect.h - padding.top - padding.bottom;

    if (plotW <= 0 || plotH <= 0) return;

    // 绘制标题
    if (chart.title) {
      this._renderTitle(container, chart.title, rect.w / 2, 20);
    }

    // 计算饼图中心和半径
    const centerX = padding.left + plotW / 2;
    const centerY = padding.top + plotH / 2;
    const radius = (Math.min(plotW, plotH) / 2) * 0.75;

    // 使用第一个系列的数据
    const series = chart.series[0];
    if (!series || !series.values.length) return;

    // 计算总值
    const total = series.values.reduce((sum, v) => sum + (isNaN(v) ? 0 : v), 0);
    if (total === 0) return;

    // 绘制扇形
    let startAngle = -Math.PI / 2; // 从 12 点钟位置开始

    series.values.forEach((val, i) => {
      const safeVal = isNaN(val) ? 0 : val;
      if (safeVal <= 0) return;

      const angle = (safeVal / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;

      // 计算扇形路径
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArcFlag = angle > Math.PI ? 1 : 0;
      const d = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', OFFICE_THEME_COLORS[i % OFFICE_THEME_COLORS.length]);
      path.setAttribute('stroke', '#ffffff');
      path.setAttribute('stroke-width', '1');
      container.appendChild(path);

      startAngle = endAngle;
    });

    // 绘制图例
    this._renderPieLegend(container, series.categories || [], padding, plotW, rect.h);
  }

  /**
   * 渲染折线图
   */
  private _renderLineChart(chart: OfficeChart, container: SVGElement, rect: RenderRect): void {
    if (!chart.series.length) return;

    const padding = { top: 40, right: 20, bottom: 50, left: 50 };
    const plotW = rect.w - padding.left - padding.right;
    const plotH = rect.h - padding.top - padding.bottom;

    if (plotW <= 0 || plotH <= 0) return;

    // 绘制标题
    if (chart.title) {
      this._renderTitle(container, chart.title, rect.w / 2, 25);
    }

    // 计算数据范围
    let maxVal = 0;
    chart.series.forEach(s => {
      s.values.forEach(v => {
        if (!isNaN(v) && v > maxVal) maxVal = v;
      });
    });

    if (maxVal === 0) maxVal = 100;
    else maxVal = Math.ceil(maxVal * 1.1);

    // 绘制 Y 轴
    this._renderYAxis(container, padding, plotW, plotH, maxVal);

    const categories = chart.series[0]?.categories || [];
    const numCats = categories.length;
    if (numCats === 0) return;

    const catW = plotW / Math.max(1, numCats - 1);

    // 绘制折线和数据点
    chart.series.forEach((series, si) => {
      const color = series.fillColor
        ? this.styleResolver.resolveColor(series.fillColor)
        : OFFICE_THEME_COLORS[si % OFFICE_THEME_COLORS.length];
      const points: { x: number; y: number }[] = [];

      series.values.forEach((val, ci) => {
        const safeVal = isNaN(val) ? 0 : val;
        const x = padding.left + ci * catW;
        const y = padding.top + plotH - (safeVal / maxVal) * plotH;
        points.push({ x, y });
      });

      // 绘制折线
      if (points.length > 1) {
        const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('stroke-linejoin', 'round');
        container.appendChild(path);
      }

      // 绘制数据点标记
      points.forEach(p => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', String(p.x));
        circle.setAttribute('cy', String(p.y));
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', color);
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '1.5');
        container.appendChild(circle);
      });
    });

    // 绘制 X 轴
    this._renderXAxis(container, padding, plotW, plotH, categories, catW);

    // 绘制图例
    this._renderLineLegend(container, chart.series, padding, plotW, rect.h);
  }

  // ====== 辅助方法 ======

  /**
   * 渲染标题
   */
  private _renderTitle(container: SVGElement, title: string, x: number, y: number): void {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '14');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', '#333');
    text.textContent = title;
    container.appendChild(text);
  }

  /**
   * 渲染 Y 轴网格线和标签
   */
  private _renderYAxis(
    container: SVGElement,
    padding: { top: number; right: number; bottom: number; left: number },
    plotW: number,
    plotH: number,
    maxVal: number
  ): void {
    const numTicks = 5;
    for (let i = 0; i <= numTicks; i++) {
      const val = (maxVal / numTicks) * i;
      const y = padding.top + plotH - plotH * (i / numTicks);

      // 网格线
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', String(padding.left));
      tick.setAttribute('y1', String(y));
      tick.setAttribute('x2', String(padding.left + plotW));
      tick.setAttribute('y2', String(y));
      tick.setAttribute('stroke', '#d9d9d9');
      tick.setAttribute('stroke-width', '1');
      container.appendChild(tick);

      // 标签
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(padding.left - 8));
      label.setAttribute('y', String(y));
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('font-size', '10');
      label.setAttribute('fill', '#595959');
      label.textContent = Math.round(val).toString();
      container.appendChild(label);
    }
  }

  /**
   * 渲染 X 轴线和标签
   */
  private _renderXAxis(
    container: SVGElement,
    padding: { top: number; right: number; bottom: number; left: number },
    plotW: number,
    plotH: number,
    categories: string[],
    catW: number
  ): void {
    // X 轴线
    const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxisLine.setAttribute('x1', String(padding.left));
    xAxisLine.setAttribute('y1', String(padding.top + plotH));
    xAxisLine.setAttribute('x2', String(padding.left + plotW));
    xAxisLine.setAttribute('y2', String(padding.top + plotH));
    xAxisLine.setAttribute('stroke', '#8c8c8c');
    xAxisLine.setAttribute('stroke-width', '1');
    container.appendChild(xAxisLine);

    // X 轴标签
    categories.forEach((cat, ci) => {
      const x = padding.left + ci * catW + catW / 2;
      const y = padding.top + plotH + 15;

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(x));
      label.setAttribute('y', String(y));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '10');
      label.setAttribute('fill', '#595959');

      const maxChars = Math.floor(catW / 6);
      label.textContent = cat.length > maxChars ? cat.substring(0, maxChars) + '...' : cat;
      container.appendChild(label);
    });
  }

  /**
   * 渲染柱状图图例
   */
  private _renderBarLegend(
    container: SVGElement,
    series: OfficeChart['series'],
    padding: { left: number },
    plotW: number,
    rectH: number
  ): void {
    const numSeries = series.length;
    const legendY = rectH - 15;
    const seriesW = 80;
    const totalLegendW = numSeries * seriesW;
    const legendStartX = padding.left + (plotW - totalLegendW) / 2;

    series.forEach((s, si) => {
      const color = s.fillColor
        ? this.styleResolver.resolveColor(s.fillColor)
        : OFFICE_THEME_COLORS[si % OFFICE_THEME_COLORS.length];
      const x = legendStartX + si * seriesW;

      const legendRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      legendRect.setAttribute('x', String(x));
      legendRect.setAttribute('y', String(legendY - 8));
      legendRect.setAttribute('width', '10');
      legendRect.setAttribute('height', '10');
      legendRect.setAttribute('fill', color);
      container.appendChild(legendRect);

      const legendText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      legendText.setAttribute('x', String(x + 14));
      legendText.setAttribute('y', String(legendY));
      legendText.setAttribute('font-size', '10');
      legendText.setAttribute('fill', '#595959');
      legendText.textContent = s.name || `Series ${si + 1}`;
      container.appendChild(legendText);
    });
  }

  /**
   * 渲染饼图图例
   */
  private _renderPieLegend(
    container: SVGElement,
    categories: string[],
    padding: { left: number },
    plotW: number,
    rectH: number
  ): void {
    const legendY = rectH - 15;
    const itemW = Math.min(80, plotW / Math.max(1, categories.length));
    const totalLegendW = categories.length * itemW;
    const legendStartX = padding.left + (plotW - totalLegendW) / 2;

    categories.forEach((cat, i) => {
      const x = legendStartX + i * itemW;

      const legendRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      legendRect.setAttribute('x', String(x));
      legendRect.setAttribute('y', String(legendY - 8));
      legendRect.setAttribute('width', '10');
      legendRect.setAttribute('height', '10');
      legendRect.setAttribute('fill', OFFICE_THEME_COLORS[i % OFFICE_THEME_COLORS.length]);
      container.appendChild(legendRect);

      const legendText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      legendText.setAttribute('x', String(x + 14));
      legendText.setAttribute('y', String(legendY));
      legendText.setAttribute('font-size', '9');
      legendText.setAttribute('fill', '#595959');
      const maxChars = Math.floor((itemW - 20) / 5);
      legendText.textContent = cat.length > maxChars ? cat.substring(0, maxChars) + '..' : cat;
      container.appendChild(legendText);
    });
  }

  /**
   * 渲染折线图图例
   */
  private _renderLineLegend(
    container: SVGElement,
    series: OfficeChart['series'],
    padding: { left: number },
    plotW: number,
    rectH: number
  ): void {
    const numSeries = series.length;
    const legendY = rectH - 15;
    const seriesW = 80;
    const totalLegendW = numSeries * seriesW;
    const legendStartX = padding.left + (plotW - totalLegendW) / 2;

    series.forEach((s, si) => {
      const color = s.fillColor
        ? this.styleResolver.resolveColor(s.fillColor)
        : OFFICE_THEME_COLORS[si % OFFICE_THEME_COLORS.length];
      const x = legendStartX + si * seriesW;

      // 折线图例使用线条样式
      const legendLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      legendLine.setAttribute('x1', String(x));
      legendLine.setAttribute('y1', String(legendY - 4));
      legendLine.setAttribute('x2', String(x + 12));
      legendLine.setAttribute('y2', String(legendY - 4));
      legendLine.setAttribute('stroke', color);
      legendLine.setAttribute('stroke-width', '2');
      container.appendChild(legendLine);

      const legendCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      legendCircle.setAttribute('cx', String(x + 6));
      legendCircle.setAttribute('cy', String(legendY - 4));
      legendCircle.setAttribute('r', '3');
      legendCircle.setAttribute('fill', color);
      container.appendChild(legendCircle);

      const legendText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      legendText.setAttribute('x', String(x + 16));
      legendText.setAttribute('y', String(legendY));
      legendText.setAttribute('font-size', '10');
      legendText.setAttribute('fill', '#595959');
      legendText.textContent = s.name || `Series ${si + 1}`;
      container.appendChild(legendText);
    });
  }
}
