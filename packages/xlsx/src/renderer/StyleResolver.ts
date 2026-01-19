/**
 * 样式解析工具类
 * 负责填充、滤镜、颜色、图案等样式的解析和转换
 */

import { resolveThemeColor } from '@ai-space/shared';
import { PatternType } from '../utils/Enums';
import type { XlsxWorkbook } from '../types';

/** 渲染上下文 */
export interface RenderContext {
  defs: SVGDefsElement;
  counter: number;
}

/** 颜色修饰器参数 */
interface ColorModifiers {
  lumMod?: number;
  lumOff?: number;
  tint?: number;
  shade?: number;
  alpha?: number;
}

/**
 * 样式解析器
 * 提供填充、滤镜、颜色等样式解析功能
 */
export class StyleResolver {
  private workbook: XlsxWorkbook | null = null;

  /**
   * 设置工作簿引用（用于主题颜色解析）
   * @param workbook XLSX 工作簿对象
   */
  setWorkbook(workbook: XlsxWorkbook | null): void {
    this.workbook = workbook;
  }

  /**
   * 解析填充样式
   * @param fill 填充配置对象
   * @param ctx 渲染上下文
   * @param _rect 矩形区域（用于渐变计算）
   * @param asCss 是否返回 CSS 格式
   * @returns 填充值（颜色、渐变URL 或 'none'）
   */
  resolveFill(fill: any, ctx: RenderContext, _rect: any, asCss: boolean = false): string {
    if (!fill) return 'none';

    // 处理原始字符串（主题颜色或十六进制）
    if (typeof fill === 'string') {
      return this.resolveColor(fill);
    }

    if (fill.type === 'solid') {
      return this.resolveColor(fill.color || '#000000');
    } else if (fill.type === 'gradient' && fill.gradient) {
      // 创建线性渐变
      const id = `grad-${++ctx.counter}`;
      const stops = fill.gradient.stops;
      const angle = fill.gradient.angle || 90;

      if (asCss) {
        // 返回 CSS 渐变
        const stopStr = stops.map((s: any) => `${this.resolveColor(s.color)} ${s.position * 100}%`).join(', ');
        return `linear-gradient(${angle}deg, ${stopStr})`;
      }

      const lg = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      lg.setAttribute('id', id);

      // 将 OOXML 角度转换为 SVG 渐变坐标
      // OOXML: 0° = 从左到右, 90° = 从上到下
      // SVG: x1,y1 = 起点, x2,y2 = 终点（百分比）
      const angleRad = (angle * Math.PI) / 180;
      const x1 = 50 - 50 * Math.cos(angleRad);
      const y1 = 50 - 50 * Math.sin(angleRad);
      const x2 = 50 + 50 * Math.cos(angleRad);
      const y2 = 50 + 50 * Math.sin(angleRad);

      lg.setAttribute('x1', `${x1}%`);
      lg.setAttribute('y1', `${y1}%`);
      lg.setAttribute('x2', `${x2}%`);
      lg.setAttribute('y2', `${y2}%`);

      stops.forEach((s: any) => {
        const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop.setAttribute('offset', `${s.position * 100}%`);
        stop.setAttribute('stop-color', this.resolveColor(s.color));
        lg.appendChild(stop);
      });
      ctx.defs.appendChild(lg);
      return `url(#${id})`;
    } else if (fill.type === 'pattern' && fill.pattern) {
      return this.resolvePattern(fill.pattern, ctx);
    } else if (fill.type === 'noFill' || fill.type === 'none') {
      return 'none';
    }
    return 'none';
  }

  /**
   * 解析滤镜效果
   * @param effects 效果数组
   * @param ctx 渲染上下文
   * @returns 滤镜 ID 或 null
   */
  resolveFilter(effects: any[], ctx: RenderContext): string | null {
    if (!effects || !effects.length) return null;

    const id = `filter-${++ctx.counter}`;
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', id);
    // 扩展滤镜区域以容纳大阴影
    filter.setAttribute('width', '250%');
    filter.setAttribute('height', '250%');
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');

    let hasFilter = false;

    effects.forEach((eff: any) => {
      if (eff.type === 'outerShadow') {
        hasFilter = true;
        this._createOuterShadowFilter(eff, filter);
      } else if (eff.type === 'glow') {
        hasFilter = true;
        this._createGlowFilter(eff, filter);
      } else if (eff.type === 'softEdge') {
        hasFilter = true;
        this._createSoftEdgeFilter(eff, filter);
      }
    });

    if (!hasFilter) return null;

    ctx.defs.appendChild(filter);
    return id;
  }

  /**
   * 创建外阴影滤镜
   */
  private _createOuterShadowFilter(eff: any, filter: SVGFilterElement): void {
    // 高斯模糊
    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blur.setAttribute('in', 'SourceAlpha');
    const stdDev = (eff.blur || 0) * 1.33; // PT 到 PX
    blur.setAttribute('stdDeviation', String(stdDev > 0 ? stdDev : 2));
    blur.setAttribute('result', 'blurOut');
    filter.appendChild(blur);

    // 偏移
    const offset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
    const distPx = (eff.dist || 0) * 1.33;
    const angleRad = (eff.dir || 0) * (Math.PI / 180);
    const dx = distPx * Math.cos(angleRad);
    const dy = distPx * Math.sin(angleRad);

    offset.setAttribute('dx', String(dx));
    offset.setAttribute('dy', String(dy));
    offset.setAttribute('in', 'blurOut');
    offset.setAttribute('result', 'offsetBlur');
    filter.appendChild(offset);

    // 颜色填充
    const flood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
    flood.setAttribute('flood-color', this.resolveColor(eff.color || '#000000'));
    flood.setAttribute('flood-opacity', '0.5');
    flood.setAttribute('result', 'floodOut');
    filter.appendChild(flood);

    // 合成
    const composite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    composite.setAttribute('in', 'floodOut');
    composite.setAttribute('in2', 'offsetBlur');
    composite.setAttribute('operator', 'in');
    composite.setAttribute('result', 'shadowOpt');
    filter.appendChild(composite);

    // 合并
    const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const nShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    nShadow.setAttribute('in', 'shadowOpt');
    const nSource = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    nSource.setAttribute('in', 'SourceGraphic');
    merge.appendChild(nShadow);
    merge.appendChild(nSource);
    filter.appendChild(merge);
  }

  /**
   * 创建发光滤镜
   */
  private _createGlowFilter(eff: any, filter: SVGFilterElement): void {
    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    const stdDev = (eff.radius || 0) * 1.33;
    blur.setAttribute('stdDeviation', String(stdDev > 0 ? stdDev : 5));
    blur.setAttribute('result', 'coloredBlur');
    filter.appendChild(blur);

    const flood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
    flood.setAttribute('flood-color', this.resolveColor(eff.color || '#FF0000'));
    flood.setAttribute('result', 'glowColor');
    filter.appendChild(flood);

    const composite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    composite.setAttribute('in', 'glowColor');
    composite.setAttribute('in2', 'coloredBlur');
    composite.setAttribute('operator', 'in');
    composite.setAttribute('result', 'softGlow');
    filter.appendChild(composite);

    const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const n1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    n1.setAttribute('in', 'softGlow');
    const n2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    n2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(n1);
    merge.appendChild(n2);
    filter.appendChild(merge);
  }

  /**
   * 创建柔化边缘滤镜
   */
  private _createSoftEdgeFilter(eff: any, filter: SVGFilterElement): void {
    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    const stdDev = (eff.radius || 0) * 1.33;
    blur.setAttribute('stdDeviation', String(stdDev > 0 ? stdDev : 5));
    filter.appendChild(blur);
  }

  /**
   * 解析颜色值
   * @param color 颜色字符串
   * @returns 解析后的颜色值
   */
  resolveColor(color: string): string {
    if (!color) return '#000000';
    if (color.startsWith('#') || color.startsWith('rgb')) return color;

    if (color.startsWith('theme:')) {
      // 解析带修饰器的主题颜色
      // 格式: theme:accent1 或 theme:accent1:lumMod=75000:lumOff=25000
      const parts = color.split(':');
      const themeColor = parts[1];
      const mods: ColorModifiers = {};

      // 解析修饰器
      for (let i = 2; i < parts.length; i++) {
        const p = parts[i];
        if (p.startsWith('lumMod=')) mods.lumMod = parseInt(p.split('=')[1], 10);
        if (p.startsWith('lumOff=')) mods.lumOff = parseInt(p.split('=')[1], 10);
        if (p.startsWith('tint=')) mods.tint = parseInt(p.split('=')[1], 10);
        if (p.startsWith('shade=')) mods.shade = parseInt(p.split('=')[1], 10);
        if (p.startsWith('alpha=')) mods.alpha = parseInt(p.split('=')[1], 10);
      }

      let baseColor: string | undefined;

      const theme = this.workbook?.theme;
      if (theme?.colorScheme) {
        const resolved = theme.colorScheme[themeColor];
        if (resolved) {
          baseColor = resolved.startsWith('#') ? resolved : '#' + resolved;
        }
      }

      // 基于 ECMA-376 和 Office 默认主题
      if (!baseColor) {
        baseColor = resolveThemeColor(themeColor);
      }

      if (baseColor) {
        return this.applyColorModifiers(baseColor, mods);
      }
    }
    return color;
  }

  /**
   * 应用颜色修饰器（亮度、色调、阴影、透明度）
   * @param baseColor 基础颜色
   * @param mods 修饰器参数
   * @returns 修改后的颜色值
   */
  applyColorModifiers(baseColor: string, mods: ColorModifiers): string {
    const { lumMod, lumOff, tint, shade, alpha } = mods;
    if (!lumMod && !lumOff && !tint && !shade && !alpha) return baseColor;

    // 解析十六进制颜色
    let hex = baseColor.replace('#', '');
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map(c => c + c)
        .join('');
    }

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // 应用亮度（HSL）
    if (lumMod !== undefined || lumOff !== undefined) {
      // 转换为 HSL
      const max = Math.max(r, g, b) / 255;
      const min = Math.min(r, g, b) / 255;
      let h = 0,
        s = 0,
        l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (Math.max(r, g, b)) {
          case r:
            h = ((g - b) / 255 / d + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / 255 / d + 2) / 6;
            break;
          case b:
            h = ((r - g) / 255 / d + 4) / 6;
            break;
        }
      }

      if (lumMod !== undefined) l = l * (lumMod / 100000);
      if (lumOff !== undefined) l = l + lumOff / 100000;
      l = Math.max(0, Math.min(1, l));

      // 转回 RGB
      let r2, g2, b2;
      if (s === 0) {
        r2 = g2 = b2 = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r2 = hue2rgb(p, q, h + 1 / 3);
        g2 = hue2rgb(p, q, h);
        b2 = hue2rgb(p, q, h - 1 / 3);
      }
      r = Math.round(r2 * 255);
      g = Math.round(g2 * 255);
      b = Math.round(b2 * 255);
    }

    // 应用色调/阴影（RGB 混合）
    if (tint !== undefined) {
      const val = tint / 100000;
      r = Math.round(r * val + 255 * (1 - val));
      g = Math.round(g * val + 255 * (1 - val));
      b = Math.round(b * val + 255 * (1 - val));
    }

    if (shade !== undefined) {
      const val = shade / 100000;
      r = Math.round(r * val);
      g = Math.round(g * val);
      b = Math.round(b * val);
    }

    // 限制范围
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // 透明度
    if (alpha !== undefined) {
      return `rgba(${r}, ${g}, ${b}, ${alpha / 100000})`;
    }

    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * 解析图案填充
   * @param pattern 图案配置
   * @param ctx 渲染上下文
   * @returns 图案 URL
   */
  resolvePattern(pattern: any, ctx: RenderContext): string {
    const id = `patt-${pattern.patternType}-${++ctx.counter}`;
    const patt = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    patt.setAttribute('id', id);
    patt.setAttribute('patternUnits', 'userSpaceOnUse');
    patt.setAttribute('width', '10');
    patt.setAttribute('height', '10');

    // 背景
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '10');
    bg.setAttribute('height', '10');
    bg.setAttribute('fill', this.resolveColor(pattern.bgColor || '#ffffff'));
    patt.appendChild(bg);

    // 前景路径
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let d = '';

    switch (pattern.patternType) {
      case PatternType.DkUpDiag:
      case 'dkUpDiag':
        d = 'M -2,8 L 2,-2 M 0,10 L 10,0 M 8,12 L 12,8';
        break;
      case PatternType.DkDnDiag:
      case 'dkDnDiag':
        d = 'M -2,2 L 2,-2 M 0,0 L 10,10 M 8,8 L 12,12';
        break;
      case PatternType.DkHorz:
      case 'dkHorz':
        d = 'M 0,5 L 10,5';
        break;
      case PatternType.DkVert:
      case 'dkVert':
        d = 'M 5,0 L 5,10';
        break;
      case 'pct50':
        d = 'M 0,0 L 2,0 L 2,2 L 0,2 Z M 5,5 L 7,5 L 7,7 L 5,7 Z';
        break;
      default:
        d = 'M 0,10 L 10,0';
        break;
    }

    path.setAttribute('d', d);
    path.setAttribute('stroke', this.resolveColor(pattern.fgColor || '#000000'));
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'square');
    patt.appendChild(path);

    ctx.defs.appendChild(patt);
    return `url(#${id})`;
  }

  /**
   * 解析箭头标记
   * @param end 箭头端点配置
   * @param pos 位置（'start' 或 'end'）
   * @param ctx 渲染上下文
   * @param color 颜色
   * @returns 标记 ID 或 null
   */
  resolveMarker(end: any, pos: 'start' | 'end', ctx: RenderContext, color: string): string | null {
    if (!end || end.type === 'none') return null;

    const type = end.type || 'arrow';
    const w = end.w || 'med';
    const len = end.len || 'med';
    const colorId = color.replace(/[^a-zA-Z0-9]/g, '');
    const id = `marker-${type}-${w}-${len}-${pos}-${colorId}`;

    if (ctx.defs.querySelector(`#${id}`)) {
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

    ctx.defs.appendChild(marker);
    return id;
  }
}
