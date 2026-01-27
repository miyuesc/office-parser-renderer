/**
 * 样式解析工具类
 * 负责填充、滤镜、颜色、图案等样式的解析和转换
 */

import { BaseStyleResolver } from '@ai-space/shared';
import type { XlsxWorkbook } from '../types';
import type { RenderContext, OfficeLineEnd } from '@ai-space/shared';

/**
 * 样式解析器
 * 提供填充、滤镜、颜色等样式解析功能
 * 继承自 BaseStyleResolver 以复用通用逻辑
 */
export class StyleResolver extends BaseStyleResolver {
  private workbook: XlsxWorkbook | null = null;

  /**
   * 设置工作簿引用（用于主题颜色解析）
   * @param workbook XLSX 工作簿对象
   */
  setWorkbook(workbook: XlsxWorkbook | null): void {
    this.workbook = workbook;
    if (workbook?.theme?.colorScheme) {
      this.themeColors = workbook.theme.colorScheme;
    }
  }

  /**
   * 解析箭头标记 (XLSX 特有逻辑 or candidate for shared)
   * @param end 箭头端点配置
   * @param pos 位置（'start' 或 'end'）
   * @param ctx 渲染上下文
   * @param color 颜色
   * @returns 标记 ID 或 null
   */
  resolveMarker(
    end: OfficeLineEnd,
    pos: 'start' | 'end',
    ctx: RenderContext,
    color: string,
  ): string | null {
    if (!end || end.type === 'none') return null;

    const type = end.type || 'arrow';
    const w = end.w || 'med';
    const len = end.len || 'med';
    const colorId = color.replace(/[^a-zA-Z0-9]/g, '');
    const id = `marker-${type}-${w}-${len}-${pos}-${colorId}`;

    if (ctx.defs?.querySelector(`#${id}`)) {
      return id;
    }

    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', id);

    // 缩放因子
    let scaleW = 1;
    if (w === 'sm') scaleW = 0.7;
    if (w === 'lg') scaleW = 1.4;

    let scaleL = 1;
    if (len === 'sm') scaleL = 0.7;
    if (len === 'lg') scaleL = 1.4;

    const baseSize = 6;
    const mWidth = baseSize * scaleL;
    const mHeight = baseSize * scaleW;

    marker.setAttribute('viewBox', '-10 -5 10 10');
    marker.setAttribute('markerWidth', String(mWidth));
    marker.setAttribute('markerHeight', String(mHeight));
    marker.setAttribute('markerUnits', 'userSpaceOnUse');
    marker.setAttribute('orient', 'auto');

    // 路径生成
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let d = '';
    let refX = 0;

    const lx = 10;
    const wy = 5;

    if (pos === 'start') {
      if (type === 'triangle' || type === 'arrow') {
        d = `M 0 0 L ${-lx} ${wy} L ${-lx} ${-wy} Z`;
      } else if (type === 'stealth') {
        d = `M 0 0 L ${-lx} ${wy} L ${-lx + lx * 0.3} 0 L ${-lx} ${-wy} Z`;
      } else if (type === 'diamond') {
        d = `M ${lx / 2} 0 L 0 ${-wy} L ${-lx / 2} 0 L 0 ${wy} Z`;
      } else if (type === 'oval') {
        d = `M 0 0 A 5 5 0 1 1 0 0.1`;
      } else {
        d = `M 0 0 L ${-lx} ${wy} L ${-lx} ${-wy} Z`;
      }
      refX = 0;
    } else {
      if (type === 'triangle' || type === 'arrow') {
        d = `M ${-lx} ${-wy} L 0 0 L ${-lx} ${wy} Z`;
      } else if (type === 'stealth') {
        d = `M ${-lx} ${-wy} L 0 0 L ${-lx} ${wy} L ${-lx + lx * 0.3} 0 Z`;
      } else if (type === 'diamond') {
        d = `M ${-lx} 0 L ${-lx / 2} ${-wy} L 0 0 L ${-lx / 2} ${wy} Z`;
      } else {
        d = `M ${-lx} ${-wy} L 0 0 L ${-lx} ${wy} Z`;
      }
      refX = 0;
    }

    path.setAttribute('d', d);
    path.setAttribute('fill', color);
    path.setAttribute('stroke', 'none');

    marker.setAttribute('refX', String(refX));
    marker.setAttribute('refY', '0');
    marker.appendChild(path);

    ctx.defs?.appendChild(marker);
    return id;
  }
}

// Export RenderContext compatible with shared one is enough.
export type { RenderContext };
