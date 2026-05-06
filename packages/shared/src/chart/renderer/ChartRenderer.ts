import { IChartData, ChartType } from '../model/IChartData';
import { IRect, BaseChartRenderer } from './IChartRenderer';

export interface ChartRendererOptions {
  scale?: number;
}

export class ChartRenderer extends BaseChartRenderer {
  private readonly scale: number;

  constructor(data: IChartData, options: ChartRendererOptions = {}) {
    super(data);
    this.scale = Math.max(0.05, options.scale || 1);
  }

  render(ctx: CanvasRenderingContext2D, rect: IRect): void {
    if (!this.hasRenderableArea(rect)) {
      return;
    }

    // 1. Background (White)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

    // 2. Layout Calculation
    let plotRect = { ...rect };
    const padding = this.scaled(10);
    plotRect.x += padding;
    plotRect.y += padding;
    plotRect.width = Math.max(0, plotRect.width - padding * 2);
    plotRect.height = Math.max(0, plotRect.height - padding * 2);

    // Title Space
    if (this.data.title) {
      this.renderTitle(ctx, rect, this.data.title);
      const titleHeight = Math.min(this.scaled(30), Math.max(0, plotRect.height * 0.3));
      plotRect.y += titleHeight;
      plotRect.height = Math.max(0, plotRect.height - titleHeight);
    }

    // Legend Space
    if (this.data.legend && this.data.legend.visible) {
      const legendPos = this.data.legend.position;
      if (legendPos === 'r' || legendPos === 'l') {
        const legendWidth = Math.min(this.scaled(100), Math.max(0, plotRect.width * 0.35));
        if (legendWidth > 0) {
          plotRect.width = Math.max(0, plotRect.width - legendWidth);
          this.renderLegend(
            ctx,
            {
              x: plotRect.x + plotRect.width,
              y: plotRect.y,
              width: legendWidth,
              height: plotRect.height
            },
            this.data.legend
          );
        }
      } else {
        // 'b' or 't'
        const legendHeight = Math.min(this.scaled(30), Math.max(0, plotRect.height * 0.3));
        if (legendHeight > 0) {
          plotRect.height = Math.max(0, plotRect.height - legendHeight);
          this.renderLegend(
            ctx,
            {
              x: plotRect.x,
              y: plotRect.y + plotRect.height,
              width: plotRect.width,
              height: legendHeight
            },
            this.data.legend
          );
        }
      }
    }

    if (!this.hasRenderableArea(plotRect)) {
      return;
    }

    // 3. Render Chart Content
    switch (this.data.type) {
      case ChartType.BAR:
        this.renderBarChart(ctx, plotRect);
        break;
      case ChartType.LINE:
        this.renderLineChart(ctx, plotRect);
        break;
      case ChartType.PIE:
        this.renderPieChart(ctx, plotRect);
        break;
      default:
        console.warn(`Unsupported chart type: ${this.data.type}`);
        this.renderPlaceholder(ctx, rect, `Unsupported Chart: ${this.data.type}`);
        break;
    }
  }

  private renderTitle(ctx: CanvasRenderingContext2D, rect: IRect, title: any) {
    if (!title || !title.text) return;
    ctx.save();
    ctx.fillStyle = '#333';
    const maxWidth = Math.max(20, rect.width - 20);
    let fontSize = this.scaled(16, 4);
    ctx.font = `bold ${fontSize}px sans-serif`;
    const minFontSize = this.scaled(9, 3);
    while (fontSize > minFontSize && ctx.measureText(title.text).width > maxWidth) {
      fontSize = Math.max(minFontSize, fontSize - 1);
      ctx.font = `bold ${fontSize}px sans-serif`;
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title.text, rect.x + rect.width / 2, rect.y + this.scaled(10), maxWidth);
    ctx.restore();
  }

  private renderLegend(ctx: CanvasRenderingContext2D, rect: IRect, legend: any) {
    const { series, categories } = this.data;
    const items: { label: string; color: string }[] = [];

    if (
      this.data.type === ChartType.PIE ||
      (series.length === 1 && this.data.type === ChartType.BAR && this.data.grouping !== 'stacked')
    ) {
      // Single series bar or Pie: Legend usually shows categories
      // But standard Excel Single Series Bar doesn't show legend by default unless varied colors.
      // For Pie, it shows categories.
      if (this.data.type === ChartType.PIE) {
        categories.forEach((cat, i) => {
          items.push({
            label: cat,
            color: this.getDefaultColor(i)
          });
        });
      } else {
        // For single series bar, usually series name.
        series.forEach((s, i) => {
          items.push({
            label: s.name || `Series ${i + 1}`,
            color: s.fillColor || this.getDefaultColor(i)
          });
        });
      }
    } else {
      series.forEach((s, i) => {
        items.push({
          label: s.name || `Series ${i + 1}`,
          color: s.fillColor || this.getDefaultColor(i)
        });
      });
    }

    ctx.save();
    const fontSize = this.scaled(12, 4);
    const swatchSize = this.scaled(10, 3);
    const itemGap = this.scaled(20, 5);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textBaseline = 'middle';

    if (legend.position === 'r' || legend.position === 'l') {
      let y = rect.y + itemGap;
      items.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(rect.x + this.scaled(10), y - swatchSize / 2, swatchSize, swatchSize);
        ctx.fillStyle = '#333';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, rect.x + this.scaled(25), y, Math.max(0, rect.width - this.scaled(30)));
        y += itemGap;
      });
    } else {
      // Bottom / Top
      let totalWidth = 0;
      const itemWidths = items.map(item => {
        const w = ctx.measureText(item.label).width + this.scaled(30);
        totalWidth += w;
        return w;
      });

      let x = rect.x + (rect.width - totalWidth) / 2;
      const y = rect.y + rect.height / 2;

      items.forEach((item, i) => {
        ctx.fillStyle = item.color;
        ctx.fillRect(x, y - swatchSize / 2, swatchSize, swatchSize);
        ctx.fillStyle = '#333';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, x + this.scaled(15), y, Math.max(0, itemWidths[i] - this.scaled(18)));
        x += itemWidths[i];
      });
    }
    ctx.restore();
  }

  private renderXYAxes(ctx: CanvasRenderingContext2D, plotRect: IRect, categories: string[], maxVal: number): IRect | undefined {
    if (!this.hasRenderableArea(plotRect)) {
      return undefined;
    }

    const leftAxisWidth = Math.min(this.scaled(40), Math.max(0, plotRect.width * 0.3));
    const bottomAxisHeight = Math.min(this.scaled(20), Math.max(0, plotRect.height * 0.25));

    // Adjust plotRect for axes
    const chartRect = {
      x: plotRect.x + leftAxisWidth,
      y: plotRect.y,
      width: Math.max(0, plotRect.width - leftAxisWidth),
      height: Math.max(0, plotRect.height - bottomAxisHeight)
    };

    if (!this.hasRenderableArea(chartRect)) {
      return undefined;
    }

    ctx.save();
    ctx.strokeStyle = '#d9d9d9'; // Grid line color
    ctx.lineWidth = 1;

    // Y Axis Grid & Labels
    const numTicks = 5;
    ctx.fillStyle = '#595959';
    const axisFontSize = this.scaled(10, 3);
    ctx.font = `${axisFontSize}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= numTicks; i++) {
      const val = (maxVal / numTicks) * i;
      const y = chartRect.y + chartRect.height - (chartRect.height / numTicks) * i;

      // Grid Line
      if (i > 0) {
        // Don't draw on X axis (will draw later)
        ctx.beginPath();
        ctx.moveTo(chartRect.x, Math.floor(y) + 0.5);
        ctx.lineTo(chartRect.x + chartRect.width, Math.floor(y) + 0.5);
        ctx.stroke();
      }

      // Label
      ctx.fillText(Math.round(val).toString(), chartRect.x - this.scaled(5), y, Math.max(0, leftAxisWidth - this.scaled(6)));
    }

    // Main Axes Lines
    ctx.strokeStyle = '#8c8c8c';
    ctx.beginPath();
    ctx.moveTo(Math.floor(chartRect.x) + 0.5, Math.floor(chartRect.y));
    ctx.lineTo(Math.floor(chartRect.x) + 0.5, Math.floor(chartRect.y + chartRect.height) + 0.5);
    ctx.lineTo(Math.floor(chartRect.x + chartRect.width) + 0.5, Math.floor(chartRect.y + chartRect.height) + 0.5);
    ctx.stroke();

    // X Axis Labels
    ctx.fillStyle = '#595959';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const numCats = categories.length;
    if (numCats > 0) {
      const xStep = chartRect.width / numCats;
      categories.forEach((cat, i) => {
        const x = chartRect.x + xStep * i + xStep / 2;
        ctx.fillText(cat, x, chartRect.y + chartRect.height + this.scaled(5), Math.max(0, xStep - this.scaled(4)));
      });
    }

    ctx.restore();

    return chartRect; // Return the inner rect for drawing bars/lines
  }

  private getMaxVal(series: any[]): number {
    let maxVal = 0;
    series.forEach(s => {
      s.data.forEach((v: number) => {
        if (v > maxVal) maxVal = v;
      });
    });
    // Safety padding for axis top (e.g. 10%)
    if (maxVal === 0) maxVal = 100;
    return Math.ceil(maxVal * 1.1);
  }

  private renderBarChart(ctx: CanvasRenderingContext2D, rect: IRect) {
    const { series, categories } = this.data;

    if (series.length === 0 || categories.length === 0) {
      this.renderPlaceholder(ctx, rect, 'No Data');
      return;
    }

    const maxVal = this.getMaxVal(series);
    // Use the rect passed from render() which already handles title/legend spacing
    // renderXYAxes now returns the inner chartRect (excluding axis labels)
    const chartRect = this.renderXYAxes(ctx, rect, categories, maxVal);
    if (!chartRect) return;

    // 4. Draw Bars
    const numSeries = series.length;
    const numCats = categories.length;
    const categoryWidth = chartRect.width / numCats;
    const groupPadding = categoryWidth * 0.3; // More breathing room
    const availableWidth = categoryWidth - groupPadding;
    const barWidth = availableWidth / numSeries;
    if (barWidth <= 0) return;

    series.forEach((s, sIdx) => {
      const fillColor = s.fillColor || this.getDefaultColor(sIdx);
      const strokeColor = s.borderColor;

      ctx.fillStyle = fillColor;
      if (strokeColor) ctx.strokeStyle = strokeColor;

      s.data.forEach((val, cIdx) => {
        if (cIdx >= numCats) return;

        const x = chartRect.x + categoryWidth * cIdx + groupPadding / 2 + barWidth * sIdx;
        const barHeight = (val / maxVal) * chartRect.height;
        const y = chartRect.y + chartRect.height - barHeight;

        if (this.data.is3D) {
          this.render3DBar(ctx, x, y, barWidth, barHeight, fillColor, strokeColor);
        } else {
          ctx.fillRect(x, y, barWidth, barHeight);
          if (strokeColor) ctx.strokeRect(x, y, barWidth, barHeight);
        }
      });
    });
  }

  private render3DBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: string,
    strokeColor?: string
  ) {
    const depth = Math.max(3, Math.min(width * 0.25, height * 0.18, 10));
    const dx = depth;
    const dy = -depth * 0.65;

    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = this.shadeColor(fillColor, -18);
    ctx.beginPath();
    ctx.moveTo(x + width, y);
    ctx.lineTo(x + width + dx, y + dy);
    ctx.lineTo(x + width + dx, y + height + dy);
    ctx.lineTo(x + width, y + height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this.shadeColor(fillColor, 16);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.lineTo(x + width + dx, y + dy);
    ctx.lineTo(x + width, y);
    ctx.closePath();
    ctx.fill();

    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.strokeRect(x, y, width, height);
    }
  }

  private renderLineChart(ctx: CanvasRenderingContext2D, rect: IRect) {
    const { series, categories } = this.data;

    if (series.length === 0 || categories.length === 0) {
      this.renderPlaceholder(ctx, rect, 'No Data');
      return;
    }

    const maxVal = this.getMaxVal(series);
    const chartRect = this.renderXYAxes(ctx, rect, categories, maxVal);
    if (!chartRect) return;

    const numCats = categories.length;
    const xStep = chartRect.width / numCats;

    series.forEach((s, sIdx) => {
      const color = s.fillColor || this.getDefaultColor(sIdx);
      ctx.strokeStyle = color;
      ctx.lineWidth = this.scaled(2, 0.5);
      ctx.beginPath();

      s.data.forEach((val, cIdx) => {
        if (cIdx >= numCats) return;

        const x = chartRect.x + xStep * cIdx + xStep / 2;
        const y = chartRect.y + chartRect.height - (val / maxVal) * chartRect.height;

        if (cIdx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Markers
      ctx.fillStyle = '#fff'; // White center
      ctx.lineWidth = this.scaled(2, 0.5);
      s.data.forEach((val, cIdx) => {
        if (cIdx >= numCats) return;
        const x = chartRect.x + xStep * cIdx + xStep / 2;
        const y = chartRect.y + chartRect.height - (val / maxVal) * chartRect.height;

        ctx.beginPath();
        ctx.arc(x, y, this.scaled(3.5, 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    });
  }

  private renderPieChart(ctx: CanvasRenderingContext2D, rect: IRect) {
    // Pie chart typically uses the first series
    const { series } = this.data;
    if (series.length === 0) {
      this.renderPlaceholder(ctx, rect, 'No Data');
      return;
    }

    const s = series[0];
    const total = s.data.reduce((acc, v) => acc + v, 0);
    if (total === 0) return;
    if (!this.hasRenderableArea(rect)) return;

    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const radius = Math.max(0, (Math.min(rect.width, rect.height) / 2) * 0.8);
    if (radius <= 0) return;

    let startAngle = -Math.PI / 2; // Start from top

    if (this.data.is3D) {
      this.renderPieDepth(ctx, rect, s.data, total);
    }

    s.data.forEach((val, idx) => {
      const sliceAngle = (val / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = this.getDefaultColor(idx);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = this.scaled(1.5, 0.5);
      ctx.stroke();

      // Labels (simplified)
      if (val / total > 0.05) {
        const midAngle = startAngle + sliceAngle / 2;
        const labelR = radius * 0.65;
        const lx = centerX + Math.cos(midAngle) * labelR;
        const ly = centerY + Math.sin(midAngle) * labelR;

        ctx.fillStyle = '#fff';
        ctx.font = `bold ${this.scaled(11, 3)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round((val / total) * 100) + '%', lx, ly);
      }

      startAngle = endAngle;
    });
  }

  private renderPieDepth(ctx: CanvasRenderingContext2D, rect: IRect, data: number[], total: number) {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const radius = Math.max(0, (Math.min(rect.width, rect.height) / 2) * 0.8);
    if (radius <= 0) return;
    const depth = Math.max(this.scaled(4, 0.5), Math.min(radius * 0.12, this.scaled(14, 1)));
    let startAngle = -Math.PI / 2;

    for (let layer = depth; layer >= 1; layer -= 2) {
      data.forEach((val, idx) => {
        const sliceAngle = (val / total) * Math.PI * 2;
        const endAngle = startAngle + sliceAngle;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + layer);
        ctx.arc(centerX, centerY + layer, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = this.shadeColor(this.getDefaultColor(idx), -22);
        ctx.fill();
        startAngle = endAngle;
      });
      startAngle = -Math.PI / 2;
    }
  }

  private getDefaultColor(index: number): string {
    const colors = [
      '#4472C4',
      '#ED7D31',
      '#A5A5A5',
      '#FFC000',
      '#5B9BD5',
      '#70AD47',
      '#264478',
      '#9E480E',
      '#636363',
      '#997300'
    ];
    return colors[index % colors.length];
  }

  private renderPlaceholder(ctx: CanvasRenderingContext2D, rect: IRect, text: string) {
    ctx.save();
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

    ctx.fillStyle = '#666';
    ctx.font = `${this.scaled(14, 4)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, rect.x + rect.width / 2, rect.y + rect.height / 2);
    ctx.restore();
  }

  private scaled(value: number, min = 0): number {
    return Math.max(min, value * this.scale);
  }

  private hasRenderableArea(rect: IRect): boolean {
    return rect.width > 0 && rect.height > 0 && Number.isFinite(rect.width) && Number.isFinite(rect.height);
  }

  private shadeColor(color: string, percent: number): string {
    if (!color.startsWith('#') || (color.length !== 7 && color.length !== 4)) {
      return color;
    }

    const normalized =
      color.length === 4
        ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
        : color;
    const amount = Math.round(2.55 * percent);
    const r = Math.max(0, Math.min(255, parseInt(normalized.slice(1, 3), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(normalized.slice(3, 5), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(normalized.slice(5, 7), 16) + amount));

    return `#${this.toHex(r)}${this.toHex(g)}${this.toHex(b)}`;
  }

  private toHex(value: number): string {
    return value.toString(16).padStart(2, '0');
  }
}
