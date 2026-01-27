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
  BaseStyleResolver,
  UnitConverter,
} from '@ai-space/shared';
import type {
  RenderRect,
  RenderContext,
  ShapeRenderOptions,
  ImageRenderOptions,
  ChartRenderOptions,
} from '@ai-space/shared';

import type {
  Drawing,
  DrawingImage,
  DrawingShape,
  DrawingChart,
  DocxDocument,
  AnchorPosition,
  DocxSection,
} from '../types';
import { ParagraphRenderer } from './ParagraphRenderer';
import { TableRenderer } from './TableRenderer';

/**
 * 绘图渲染上下文接口
 */
export interface DrawingRenderContext {
  /** 文档对象 */
  document?: DocxDocument;
  /** 图片 URL 映射 */
  images?: Record<string, string>;
  /** 当前分节配置 (用于定位计算) */
  section?: DocxSection;
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
    let element: HTMLElement | null = null;

    if (drawing.image) {
      element = this.renderImage(drawing.image, context);
    } else if (drawing.shape) {
      element = this.renderShape(drawing.shape, context);
    } else if (drawing.chart) {
      element = this.renderChart(drawing.chart, context);
    }

    if (element && drawing.position) {
      this.applyPositioning(element, drawing.position, context?.section);
    }

    return element;
  }

  /**
   * 应用锚定位置样式
   */
  private static applyPositioning(
    element: HTMLElement,
    pos: AnchorPosition,
    section?: DocxSection,
  ): void {
    element.style.position = 'absolute';

    // Z-Index
    if (pos.behindDoc) {
      element.style.zIndex = '-1';
    } else {
      element.style.zIndex = '10'; // Safe value above normal text
    }

    // Explicit relativeHeight (zIndex)
    if (pos.relativeHeight !== undefined) {
      element.style.zIndex = String(pos.relativeHeight);
    }

    // Get margins (in EMUs) - 用于 margin 相对定位
    let marginLeftEmu = 0;
    let marginTopEmu = 0;

    if (section && section.pageMargins) {
      // twips -> emu: 1 twip = 635 emu
      marginLeftEmu = section.pageMargins.left * 635;
      marginTopEmu = section.pageMargins.top * 635;
    }

    // Horizontal
    if (pos.horizontal) {
      const h = pos.horizontal;
      let left = 0;

      if (h.posOffset !== undefined) {
        left = h.posOffset;
      }

      // 处理相对定位
      if (h.relativeTo === 'page') {
        left -= marginLeftEmu;
      }

      if (h.align) {
        if (h.align === 'center') {
          if (h.relativeTo === 'page' && section && section.pageSize) {
            const pageWidthEmu = section.pageSize.width * 635;
            left = pageWidthEmu / 2;
            element.style.transform = 'translateX(-50%)';
          } else if (
            (h.relativeTo === 'margin' || h.relativeTo === 'column') &&
            section &&
            section.pageSize &&
            section.pageMargins
          ) {
            const contentWidth =
              section.pageSize.width * 635 - marginLeftEmu - (section.pageMargins.right || 0) * 635;
            left = marginLeftEmu + contentWidth / 2;
            element.style.transform = 'translateX(-50%)';
          }
        } else if (h.align === 'right') {
          if (h.relativeTo === 'page' && section && section.pageSize) {
            const pageWidthEmu = section.pageSize.width * 635;
            left = pageWidthEmu;
            element.style.transform = 'translateX(-100%)';
          }
        }
      }

      element.style.left = `${UnitConverter.emuToPixels(left)}px`;
    }

    // Vertical
    if (pos.vertical) {
      const v = pos.vertical;
      let top = 0;

      if (v.posOffset !== undefined) {
        top = v.posOffset;
      }

      if (v.relativeTo === 'page') {
        top -= marginTopEmu;
      }

      if (v.align) {
        if (v.align === 'bottom') {
          if (v.relativeTo === 'page' && section && section.pageSize) {
            const pageHeightEmu = section.pageSize.height * 635;
            top = pageHeightEmu;
            element.style.transform = (element.style.transform || '') + ' translateY(-100%)';
          }
        } else if (v.align === 'center') {
          if (v.relativeTo === 'page' && section && section.pageSize) {
            const pageHeightEmu = section.pageSize.height * 635;
            top = pageHeightEmu / 2;
            element.style.transform = (element.style.transform || '') + ' translateY(-50%)';
          }
        }
      }

      element.style.top = `${UnitConverter.emuToPixels(top)}px`;
    }
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
      images: context?.document?.images || context?.images || {},
      defsIdCounter: 0,
    };

    const options: ImageRenderOptions = {
      src,
      embedId: image.embedId,
      rotation: image.rotation,
      flipH: image.flipH,
      flipV: image.flipV,
      crop: image.crop,
    };

    // 使用 BaseStyleResolver
    const styleResolver = new BaseStyleResolver(context?.document?.theme?.colorScheme);
    const imageRenderer = new SharedImageRenderer(styleResolver);

    const element = imageRenderer.render(options, rect, renderCtx);
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

    // 使用 BaseStyleResolver
    const styleResolver = new BaseStyleResolver(context?.document?.theme?.colorScheme);
    const shapeRenderer = new SharedShapeRenderer(styleResolver);

    // 准备渲染上下文
    const renderCtx: RenderContext = {
      defs,
      images: context?.document?.images || context?.images || {},
      defsIdCounter: 0,
    };

    // 准备形状渲染配置
    const options: ShapeRenderOptions = {
      id: shape.id,
      geometry: shape.geometry,
      path: shape.path,
      pathWidth: shape.pathWidth,
      pathHeight: shape.pathHeight,
      fill: shape.fill as ShapeRenderOptions['fill'],
      stroke: shape.stroke
        ? {
            width: shape.stroke.width,
            color: shape.stroke.color,
            dashStyle: shape.stroke.dashStyle,
            gradient: shape.stroke.gradient,
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
            paragraphs: shape.textBody.paragraphs?.map((p) => ({
              alignment: p.alignment,
              runs:
                p.runs?.map((r) => ({
                  text: r.text,
                  bold: r.bold,
                  size: r.size,
                  color: r.color,
                })) || [],
            })),
          }
        : undefined,
    };

    const rect: RenderRect = { x: 0, y: 0, w: widthPx, h: heightPx };
    shapeRenderer.renderShape(options, svg, rect, renderCtx);

    container.appendChild(svg);

    // 渲染文本框内容 (HTML 覆盖层)
    if (shape.textBody?.content && shape.textBody.content.length > 0) {
      const textContainer = document.createElement('div');
      textContainer.className = 'docx-shape-text-body';
      textContainer.style.position = 'absolute';
      textContainer.style.top = '0';
      textContainer.style.left = '0';
      textContainer.style.width = '100%';
      textContainer.style.height = '100%';
      textContainer.style.overflow = 'hidden';
      textContainer.style.display = 'flex';
      textContainer.style.flexDirection = 'column';

      // Vertical Alignment
      const vAlign = shape.textBody.verticalAlignment || 'top';
      if (vAlign === 'middle') textContainer.style.justifyContent = 'center';
      else if (vAlign === 'bottom') textContainer.style.justifyContent = 'flex-end';
      else textContainer.style.justifyContent = 'flex-start';

      textContainer.style.padding = '4px';

      // Render children
      const pContext = {
        document: context?.document,
        styles: context?.document?.styles,
        numbering: context?.document?.numbering,
      };

      for (const element of shape.textBody.content) {
        if (element.type === 'paragraph') {
          const el = ParagraphRenderer.render(element, pContext);
          textContainer.appendChild(el);
        } else if (element.type === 'table') {
          // TableRenderer.render signature needs checking.
          // Usually render(table, context).
          const el = TableRenderer.render(element, pContext);
          textContainer.appendChild(el);
        }
      }

      container.appendChild(textContainer);
    }

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

    // 使用 BaseStyleResolver
    const styleResolver = new BaseStyleResolver(context?.document?.theme?.colorScheme);
    const chartRenderer = new SharedChartRenderer(styleResolver);

    // 准备渲染上下文
    const renderCtx: RenderContext = {
      defs,
      images: context?.document?.images || context?.images || {},
      defsIdCounter: 0,
    };

    // 准备图表渲染配置
    const options: ChartRenderOptions = {
      id: chart.rId,
      type: chart.type || 'other',
      title: chart.title,
      series: chart.series.map((s) => ({
        index: s.index,
        name: s.name,
        categories: s.categories,
        values: s.values,
        fillColor: s.fillColor,
        chartType: s.chartType,
      })),
      barDirection: chart.barDirection,
      grouping: chart.grouping,
    };

    const rect: RenderRect = { x: 0, y: 0, w: widthPx, h: heightPx };
    chartRenderer.renderChart(options, svg, rect, renderCtx);

    container.appendChild(svg);
    return container;
  }
}
