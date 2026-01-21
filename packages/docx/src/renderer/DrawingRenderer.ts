/**
 * 绘图渲染器
 *
 * 渲染 Drawing 元素（图片、形状等）
 * 使用共享渲染器实现核心渲染逻辑
 */

import {
  ImageRenderer as SharedImageRenderer,
  ShapeRenderer as SharedShapeRenderer,
  ChartRenderer as SharedChartRenderer,
  emuToPt
} from '@ai-space/shared';
import type {
  RenderRect,
  RenderContext,
  StyleResolverInterface,
  ShapeRenderOptions,
  ImageRenderOptions,
  ChartRenderOptions,
  ColorDef
} from '@ai-space/shared';
import { Logger } from '../utils/Logger';
import { UnitConverter } from '../utils/UnitConverter';
import type { Drawing, DrawingImage, DrawingShape, DrawingChart, DocxDocument } from '../types';

const log = Logger.createTagged('DrawingRenderer');

/**
 * 绘图渲染上下文接口
 */
export interface DrawingRenderContext {
  /** 文档对象 */
  document?: DocxDocument;
  /** 图片 URL 映射 */
  images?: Record<string, string>;
}

/**
 * DOCX 样式解析器适配器
 * 实现 StyleResolverInterface 接口
 */
class DocxStyleResolver implements StyleResolverInterface {
  private context: DrawingRenderContext;

  constructor(context: DrawingRenderContext) {
    this.context = context;
  }

  /**
   * 解析颜色值
   */
  resolveColor(color: ColorDef): string {
    if (typeof color === 'string') {
      // 处理 theme:xxx 格式
      if (color.startsWith('theme:')) {
        return this.resolveThemeColor(color.substring(6));
      }
      return color.startsWith('#') ? color : `#${color}`;
    }
    if (color.val) {
      return color.val.startsWith('#') ? color.val : `#${color.val}`;
    }
    if (color.theme) {
      return this.resolveThemeColor(color.theme);
    }
    // 默认返回黑色
    return '#000000';
  }

  /**
   * 解析主题颜色
   * 将主题颜色键映射到具体的十六进制颜色值
   */
  private resolveThemeColor(themeKey: string): string {
    // Office 标准主题颜色调色板
    const themeColorMap: Record<string, string> = {
      // 主要主题颜色
      lt1: '#FFFFFF', // 浅色 1 (白色)
      dk1: '#000000', // 深色 1 (黑色)
      lt2: '#E7E6E6', // 浅色 2
      dk2: '#44546A', // 深色 2
      // 强调色
      accent1: '#4472C4', // 蓝色
      accent2: '#ED7D31', // 橙色
      accent3: '#A5A5A5', // 灰色
      accent4: '#FFC000', // 黄色
      accent5: '#5B9BD5', // 浅蓝
      accent6: '#70AD47', // 绿色
      // 超链接
      hlink: '#0563C1',
      folHlink: '#954F72',
      // 背景和文本颜色别名
      bg1: '#FFFFFF',
      bg2: '#E7E6E6',
      tx1: '#000000',
      tx2: '#44546A'
    };
    return themeColorMap[themeKey] || '#000000';
  }

  /**
   * 解析填充样式
   */
  resolveFill(
    fill: { type?: string; color?: string; gradient?: unknown; opacity?: number } | undefined,
    ctx: RenderContext,
    rect: RenderRect | null,
    asCSS?: boolean
  ): string {
    if (!fill) return 'none';
    if (fill.type === 'none') return 'none';

    if (fill.type === 'solid' && fill.color) {
      return this.resolveColor(fill.color);
    }

    if (fill.type === 'gradient' && fill.gradient && ctx.defs) {
      const gradId = `grad_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const gradient = fill.gradient as {
        type: string;
        angle?: number;
        stops: Array<{ position: number; color: string }>;
      };

      if (asCSS) {
        // 返回 CSS 渐变
        const stops = gradient.stops.map(s => `${this.resolveColor(s.color)} ${s.position * 100}%`).join(', ');
        const angle = gradient.angle || 0;
        return `linear-gradient(${90 - angle}deg, ${stops})`;
      }

      // 创建 SVG 渐变
      const gradEl = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradEl.setAttribute('id', gradId);
      gradEl.setAttribute('x1', '0%');
      gradEl.setAttribute('y1', '0%');
      gradEl.setAttribute('x2', '100%');
      gradEl.setAttribute('y2', '0%');

      const angle = gradient.angle || 0;
      if (Math.abs(angle - 90) < 45 || Math.abs(angle - 270) < 45) {
        gradEl.setAttribute('x2', '0%');
        gradEl.setAttribute('y2', '100%');
      }

      gradient.stops.forEach(stop => {
        const stopEl = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stopEl.setAttribute('offset', `${stop.position * 100}%`);
        stopEl.setAttribute('stop-color', this.resolveColor(stop.color));
        gradEl.appendChild(stopEl);
      });

      ctx.defs.appendChild(gradEl);
      return `url(#${gradId})`;
    }

    return '#cccccc';
  }

  /**
   * 解析滤镜效果
   */
  resolveFilter(
    effects: Array<{ type: string; blur?: number; dist?: number; dir?: number; color?: string }>,
    ctx: RenderContext
  ): string | null {
    if (!effects || effects.length === 0 || !ctx.defs) return null;

    const filterId = `filter_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', filterId);
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');

    effects.forEach(eff => {
      if (eff.type === 'outerShadow') {
        const blur = (eff.blur || 0) / 72; // pt to approx pixels
        const dist = (eff.dist || 0) / 72;
        const dir = ((eff.dir || 0) * Math.PI) / 180;

        const dx = dist * Math.cos(dir);
        const dy = dist * Math.sin(dir);

        const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
        feDropShadow.setAttribute('dx', String(dx));
        feDropShadow.setAttribute('dy', String(dy));
        feDropShadow.setAttribute('stdDeviation', String(blur));
        feDropShadow.setAttribute('flood-color', eff.color ? this.resolveColor(eff.color) : 'rgba(0,0,0,0.3)');
        filter.appendChild(feDropShadow);
      } else if (eff.type === 'glow') {
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('in', 'SourceAlpha');
        feGaussianBlur.setAttribute('stdDeviation', String((eff.blur || 0) / 72));
        feGaussianBlur.setAttribute('result', 'blur');
        filter.appendChild(feGaussianBlur);
      }
    });

    if (filter.children.length > 0) {
      ctx.defs.appendChild(filter);
      return filterId;
    }

    return null;
  }
}

/**
 * 绘图渲染器类
 */
export class DrawingRenderer {
  /**
   * 渲染绘图元素
   *
   * @param drawing - Drawing 对象
   * @param context - 渲染上下文
   * @returns HTMLElement 或 null
   */
  static render(drawing: Drawing, context?: DrawingRenderContext): HTMLElement | null {
    if (drawing.image) {
      return this.renderImage(drawing.image, context);
    }

    if (drawing.shape) {
      return this.renderShape(drawing.shape, context);
    }

    if (drawing.chart) {
      return this.renderChart(drawing.chart, context);
    }

    log.warn('未知的绘图类型');
    return null;
  }

  /**
   * 渲染图片
   *
   * @param image - DrawingImage 对象
   * @param context - 渲染上下文
   * @returns HTMLElement
   */
  static renderImage(image: DrawingImage, context?: DrawingRenderContext): HTMLElement {
    const widthPx = UnitConverter.emuToPixels(image.cx);
    const heightPx = UnitConverter.emuToPixels(image.cy);

    // 获取图片源
    let src = image.src;
    if (!src && context?.images && image.embedId) {
      src = context.images[image.embedId];
    }
    if (!src && context?.document?.images && image.embedId) {
      src = context.document.images[image.embedId];
    }

    const rect: RenderRect = { x: 0, y: 0, w: widthPx, h: heightPx };
    const renderCtx: RenderContext = {
      images: context?.document?.images || context?.images || {}
    };

    const options: ImageRenderOptions = {
      src,
      embedId: image.embedId,
      rotation: image.rotation,
      flipH: image.flipH,
      flipV: image.flipV,
      crop: image.crop
    };

    const element = SharedImageRenderer.render(options, rect, renderCtx);
    element.className = 'docx-drawing docx-image';

    return element;
  }

  /**
   * 渲染形状
   *
   * @param shape - DrawingShape 对象
   * @param context - 渲染上下文
   * @returns HTMLElement
   */
  static renderShape(shape: DrawingShape, context?: DrawingRenderContext): HTMLElement {
    const container = document.createElement('span');
    container.className = 'docx-drawing docx-shape';
    container.style.display = 'inline-block';
    container.style.position = 'relative';

    const widthPx = UnitConverter.emuToPixels(shape.cx);
    const heightPx = UnitConverter.emuToPixels(shape.cy);
    container.style.width = `${widthPx}px`;
    container.style.height = `${heightPx}px`;

    // 创建 SVG 容器
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', String(widthPx));
    svg.setAttribute('height', String(heightPx));
    svg.setAttribute('viewBox', `0 0 ${widthPx} ${heightPx}`);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.overflow = 'visible';

    // 创建 defs 元素
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    // 创建样式解析器
    const styleResolver = new DocxStyleResolver(context || {});
    const shapeRenderer = new SharedShapeRenderer(styleResolver);

    // 准备渲染上下文
    const renderCtx: RenderContext = {
      defs,
      images: context?.document?.images || context?.images || {}
    };

    // 准备形状渲染配置
    const options: ShapeRenderOptions = {
      id: shape.id,
      geometry: shape.geometry,
      path: shape.path,
      pathWidth: shape.pathWidth,
      pathHeight: shape.pathHeight,
      fill: shape.fill,
      stroke: shape.stroke
        ? {
            width: shape.stroke.width,
            color: shape.stroke.color,
            dashStyle: shape.stroke.dashStyle,
            gradient: shape.stroke.gradient
          }
        : undefined,
      rotation: shape.rotation,
      flipH: shape.flipH,
      flipV: shape.flipV,
      adjustValues: shape.adjustValues,
      effects: shape.effects,
      textBody: shape.textBody
        ? {
            text: shape.textBody.text,
            verticalAlignment: shape.textBody.verticalAlignment as 'top' | 'middle' | 'bottom',
            paragraphs: shape.textBody.paragraphs?.map(p => ({
              alignment: p.alignment,
              runs:
                p.runs?.map(r => ({
                  text: r.text,
                  bold: r.bold,
                  size: r.size,
                  color: r.color
                })) || []
            }))
          }
        : undefined
    };

    const rect: RenderRect = { x: 0, y: 0, w: widthPx, h: heightPx };
    shapeRenderer.renderShape(options, svg, rect, renderCtx);

    container.appendChild(svg);
    return container;
  }

  /**
   * 渲染图表
   *
   * @param chart - DrawingChart 对象
   * @param context - 渲染上下文
   * @returns HTMLElement
   */
  private static renderChart(chart: DrawingChart, context?: DrawingRenderContext): HTMLElement {
    const container = document.createElement('div');
    container.className = 'docx-drawing docx-chart';
    container.style.display = 'inline-block';
    container.style.position = 'relative';

    const widthPx = UnitConverter.emuToPixels(chart.cx);
    const heightPx = UnitConverter.emuToPixels(chart.cy);
    container.style.width = `${widthPx}px`;
    container.style.height = `${heightPx}px`;

    // 检查是否有解析的图表数据
    if (!chart.type || !chart.series || chart.series.length === 0) {
      // 没有图表数据，渲染占位符
      container.style.backgroundColor = '#f0f0f0';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';
      container.style.border = '1px dashed #999';
      container.style.color = '#666';
      container.textContent = '[图表]';
      return container;
    }

    // 创建 SVG 容器
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', String(widthPx));
    svg.setAttribute('height', String(heightPx));
    svg.setAttribute('viewBox', `0 0 ${widthPx} ${heightPx}`);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.overflow = 'visible';

    // 创建 defs 元素
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    // 创建样式解析器
    const styleResolver = new DocxStyleResolver(context || {});
    const chartRenderer = new SharedChartRenderer(styleResolver);

    // 准备渲染上下文
    const renderCtx: RenderContext = {
      defs,
      images: context?.document?.images || context?.images || {}
    };

    // 准备图表渲染配置
    const options: ChartRenderOptions = {
      id: chart.rId,
      type: chart.type || 'other',
      title: chart.title,
      series: chart.series.map(s => ({
        index: s.index,
        name: s.name,
        categories: s.categories,
        values: s.values,
        fillColor: s.fillColor,
        chartType: s.chartType
      })),
      barDirection: chart.barDirection,
      grouping: chart.grouping
    };

    const rect: RenderRect = { x: 0, y: 0, w: widthPx, h: heightPx };
    chartRenderer.renderChart(options, svg, rect, renderCtx);

    container.appendChild(svg);
    return container;
  }
}
