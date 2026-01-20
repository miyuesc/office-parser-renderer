/**
 * 绘图渲染器
 *
 * 渲染 Drawing 元素（图片、形状等）
 */

import { Logger } from '../utils/Logger';
import { UnitConverter } from '../utils/UnitConverter';
import type { Drawing, DrawingImage, DrawingShape, DocxDocument } from '../types';

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
      return this.renderChartPlaceholder(drawing.chart);
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
    const container = document.createElement('span');
    container.className = 'docx-drawing docx-image';

    const img = document.createElement('img');
    img.className = 'docx-image-content';

    // 获取图片源
    let src = image.src;
    if (!src && context?.images && image.embedId) {
      src = context.images[image.embedId];
    }
    if (!src && context?.document?.images && image.embedId) {
      src = context.document.images[image.embedId];
    }

    if (src) {
      img.src = src;
    } else {
      // 占位图
      img.src =
        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23ddd" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">图片</text></svg>';
      img.alt = '图片加载失败';
    }

    // 尺寸
    const widthPx = UnitConverter.emuToPixels(image.cx);
    const heightPx = UnitConverter.emuToPixels(image.cy);
    img.style.width = `${widthPx}px`;
    img.style.height = `${heightPx}px`;

    // 旋转
    if (image.rotation) {
      img.style.transform = `rotate(${image.rotation}deg)`;
    }

    // 翻转
    const transforms: string[] = [];
    if (image.flipH) transforms.push('scaleX(-1)');
    if (image.flipV) transforms.push('scaleY(-1)');
    if (image.rotation) transforms.push(`rotate(${image.rotation}deg)`);
    if (transforms.length > 0) {
      img.style.transform = transforms.join(' ');
    }

    // 裁剪
    if (image.crop) {
      const clipPath = `inset(${image.crop.top * 100}% ${image.crop.right * 100}% ${image.crop.bottom * 100}% ${image.crop.left * 100}%)`;
      img.style.clipPath = clipPath;
    }

    // 描述
    if (context?.document) {
      // 可以从 drawing 对象获取 alt 文本
    }

    container.appendChild(img);
    return container;
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

    // 尺寸
    const widthPx = UnitConverter.emuToPixels(shape.cx);
    const heightPx = UnitConverter.emuToPixels(shape.cy);
    container.style.width = `${widthPx}px`;
    container.style.height = `${heightPx}px`;

    // 创建 SVG 元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', String(widthPx));
    svg.setAttribute('height', String(heightPx));
    svg.setAttribute('viewBox', `0 0 ${widthPx} ${heightPx}`);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    // 允许 overflow visible 以显示位于边框外的箭头
    svg.style.overflow = 'visible';
    
    // 定义 Defs (渐变、Marker)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    // 创建形状路径
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // 使用自定义路径或预设几何
    if (shape.path) {
      path.setAttribute('d', shape.path);
    } else if (shape.geometry) {
      // 简单几何形状
      const d = this.getPresetGeometryPath(shape.geometry, widthPx, heightPx);
      path.setAttribute('d', d);
    } else {
      // 默认矩形
      path.setAttribute('d', `M0,0 H${widthPx} V${heightPx} H0 Z`);
    }

    // 填充
    if (shape.fill) {
      if (shape.fill.type === 'solid' && shape.fill.color) {
        path.setAttribute('fill', `#${shape.fill.color}`);
      } else if (shape.fill.type === 'gradient' && shape.fill.gradient) {
        // 创建渐变 ID
        const gradId = `grad_${shape.id}_${Math.random().toString(36).substr(2, 9)}`;
        const gradient = this.createGradient(defs, gradId, shape.fill.gradient);
        if (gradient) {
             path.setAttribute('fill', `url(#${gradId})`);
        } else {
             path.setAttribute('fill', '#cccccc');
        }
      } else if (shape.fill.type === 'none') {
        path.setAttribute('fill', 'none');
      } else {
        path.setAttribute('fill', '#cccccc');
      }

      if (shape.fill.opacity !== undefined) {
        path.setAttribute('fill-opacity', String(shape.fill.opacity));
      }
    } else {
      path.setAttribute('fill', '#cccccc');
    }

    // 描边
    if (shape.stroke) {
      if (shape.stroke.color) {
        path.setAttribute('stroke', `#${shape.stroke.color}`);
      }
      if (shape.stroke.width) {
        const strokeWidth = UnitConverter.emuToPixels(shape.stroke.width);
        path.setAttribute('stroke-width', String(strokeWidth));
      }
      if (shape.stroke.dashStyle) {
        path.setAttribute('stroke-dasharray', this.getDashArray(shape.stroke.dashStyle));
      }
      
      // 箭头 (Markers)
      const strokeColor = shape.stroke.color || '000000';
      if (shape.stroke.headEnd && shape.stroke.headEnd.type !== 'none') {
           const markerId = `head_${shape.id}_${Math.random().toString(36).substr(2, 5)}`;
           this.createMarker(defs, markerId, shape.stroke.headEnd.type, strokeColor, true);
           path.setAttribute('marker-start', `url(#${markerId})`);
      }
      if (shape.stroke.tailEnd && shape.stroke.tailEnd.type !== 'none') {
           const markerId = `tail_${shape.id}_${Math.random().toString(36).substr(2, 5)}`;
           this.createMarker(defs, markerId, shape.stroke.tailEnd.type, strokeColor, false);
           path.setAttribute('marker-end', `url(#${markerId})`);
      }
    } else {
      path.setAttribute('stroke', 'none');
    }

    svg.appendChild(path);
    container.appendChild(svg);

    // 文本内容
    if (shape.textBody?.text) {
      const textDiv = document.createElement('div');
      textDiv.className = 'docx-shape-text';
      textDiv.style.position = 'absolute';
      textDiv.style.top = '0';
      textDiv.style.left = '0';
      textDiv.style.width = '100%';
      textDiv.style.height = '100%';
      textDiv.style.display = 'flex';
      textDiv.style.alignItems =
        shape.textBody.verticalAlignment === 'bottom'
          ? 'flex-end'
          : shape.textBody.verticalAlignment === 'middle'
            ? 'center'
            : 'flex-start';
      textDiv.style.justifyContent = 'center';
      textDiv.style.textAlign = 'center';
      textDiv.style.padding = '5px';
      textDiv.style.boxSizing = 'border-box';
      textDiv.style.overflow = 'hidden';
      textDiv.textContent = shape.textBody.text;

      container.appendChild(textDiv);
    }

    return container;
  }

  /**
   * 渲染图表占位符
   *
   * @param chart - DrawingChart 对象
   * @returns HTMLElement
   */
  private static renderChartPlaceholder(chart: { cx: number; cy: number }): HTMLElement {
    const container = document.createElement('div');
    container.className = 'docx-drawing docx-chart';

    const widthPx = UnitConverter.emuToPixels(chart.cx);
    const heightPx = UnitConverter.emuToPixels(chart.cy);

    container.style.width = `${widthPx}px`;
    container.style.height = `${heightPx}px`;
    container.style.backgroundColor = '#f0f0f0';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.border = '1px dashed #999';
    container.style.color = '#666';
    container.textContent = '[图表]';

    return container;
  }

  /**
   * 获取预设几何路径
   *
   * @param geometry - 几何类型
   * @param width - 宽度
   * @param height - 高度
   * @returns SVG 路径字符串
   */
  private static getPresetGeometryPath(geometry: string, width: number, height: number): string {
    switch (geometry) {
      case 'rect':
        return `M0,0 H${width} V${height} H0 Z`;
      case 'ellipse':
        const rx = width / 2;
        const ry = height / 2;
        return `M${rx},0 A${rx},${ry} 0 1,1 ${rx},${height} A${rx},${ry} 0 1,1 ${rx},0`;
      case 'roundRect':
        const r = Math.min(width, height) * 0.1;
        return `M${r},0 H${width - r} Q${width},0 ${width},${r} V${height - r} Q${width},${height} ${width - r},${height} H${r} Q0,${height} 0,${height - r} V${r} Q0,0 ${r},0 Z`;
      case 'triangle':
        return `M${width / 2},0 L${width},${height} L0,${height} Z`;
      default:
        // 默认矩形
        return `M0,0 H${width} V${height} H0 Z`;
    }
  }

  /**
   * 获取虚线数组
   *
   * @param dashStyle - 虚线样式
   * @returns SVG stroke-dasharray 值
   */
  private static getDashArray(dashStyle: string): string {
    const map: Record<string, string> = {
      solid: 'none',
      dot: '2,2',
      dash: '6,3',
      lgDash: '10,3',
      dashDot: '6,3,2,3',
      lgDashDot: '10,3,2,3',
      lgDashDotDot: '10,3,2,3,2,3',
      sysDot: '1,2',
      sysDash: '4,2',
      sysDashDot: '4,2,1,2',
      sysDashDotDot: '4,2,1,2,1,2'
    };

    return map[dashStyle] || 'none';
  }

  /**
   * 创建 SVG 渐变
   */
  private static createGradient(defs: SVGDefsElement, id: string, gradient: { type: string, angle?: number, stops: Array<{position: number, color: string}> }): SVGElement | null {
      const gradEl = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradEl.setAttribute('id', id);
      
      let angle = gradient.angle || 0; 
      // 简单映射: 0=LeftToRight, 90=TopToBottom (approx)
      gradEl.setAttribute('x1', '0%');
      gradEl.setAttribute('y1', '0%');
      gradEl.setAttribute('x2', '100%');
      gradEl.setAttribute('y2', '0%');
      
      if (Math.abs(angle - 90) < 45 || Math.abs(angle - 270) < 45) {
         gradEl.setAttribute('x2', '0%');
         gradEl.setAttribute('y2', '100%');
      }

      if (gradient.type === 'path') {
           return null;
      }

      gradient.stops.forEach(stop => {
          const stopEl = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
          stopEl.setAttribute('offset', `${stop.position * 100}%`);
          stopEl.setAttribute('stop-color', `#${stop.color}`);
          gradEl.appendChild(stopEl);
      });
      
      defs.appendChild(gradEl);
      return gradEl;
  }

  /**
   * 创建 Marker (箭头)
   */
  private static createMarker(defs: SVGDefsElement, id: string, type: string, color: string, isStart: boolean): void {
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', id);
      marker.setAttribute('markerUnits', 'strokeWidth');
      // 基本尺寸
      marker.setAttribute('markerWidth', '12');
      marker.setAttribute('markerHeight', '12');
      marker.setAttribute('refX', isStart ? '0' : '10');
      marker.setAttribute('refY', '6');
      marker.setAttribute('orient', 'auto');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('fill', `#${color}`);
      
      // 根据类型生成路径
      switch (type) {
          case 'triangle':
              path.setAttribute('d', isStart ? 'M10,0 L0,6 L10,12 Z' : 'M0,0 L10,6 L0,12 Z'); 
              // Wait, directions need to be handled carefully with orient=auto and refX
              // Usually standard path pointing Right ->
              // If start marker, we usually reverse it via orient or path
              // Let's stick to standard path pointing right, and let usage handle rotation?
              // Or marker orient='auto-start-reverse' for start marker.
              // SVG 1.1 supports orient="auto". start marker needs to point 180 deg?
              path.setAttribute('d', 'M0,0 L10,6 L0,12 Z'); // Triangle pointing right
              break;
          case 'stealth':
              path.setAttribute('d', 'M0,0 L10,6 L0,12 L3,6 Z');
              break;
          case 'oval':
              // circle
              const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
              circle.setAttribute('cx', '6');
              circle.setAttribute('cy', '6');
              circle.setAttribute('r', '4');
              circle.setAttribute('fill', `#${color}`);
              marker.appendChild(circle);
              defs.appendChild(marker);
              return;
          case 'none':
          default:
              return;
      }
      
      marker.appendChild(path);
      defs.appendChild(marker);
  }
}
