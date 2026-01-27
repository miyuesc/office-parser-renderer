import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('../../src/drawing/PresetGeometries', () => ({
  generatePresetPath: vi.fn((geom) => {
    if (geom === 'rect') return { path: 'M0,0 L100,0 L100,100 L0,100 Z' };
    return undefined;
  }),
}));
import { ShapeRenderer } from '../../src/drawing/renderers/ShapeRenderer';
import type {
  StyleResolverInterface,
  RenderContext,
  RenderRect,
  ShapeRenderOptions,
} from '../../src/drawing/renderers/types';

// Mock StyleResolver
class MockStyleResolver implements StyleResolverInterface {
  resolveColor(color: any): string {
    if (typeof color === 'string') return color;
    if (color?.val) return color.val;
    return '#000000';
  }
  resolveFill(fill: any, ctx: any, rect: any): string {
    if (fill?.color) return fill.color;
    return 'none';
  }
  resolveFilter(effects: any[], ctx: any): string | null {
    return null;
  }
}

describe('ShapeRenderer', () => {
  let renderer: ShapeRenderer;
  let styleResolver: MockStyleResolver;
  let container: SVGElement;
  let ctx: RenderContext;
  let rect: RenderRect;

  beforeEach(() => {
    styleResolver = new MockStyleResolver();
    renderer = new ShapeRenderer(styleResolver);
    container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    ctx = {
      defs: document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
    };
    rect = { x: 0, y: 0, w: 100, h: 100 };
  });

  it('should render a simple rectangle', () => {
    const options: ShapeRenderOptions = {
      id: 'rect1',
      geometry: 'rect',
      fill: { type: 'solid', color: '#ff0000' },
    };

    renderer.renderShape(options, container, rect, ctx);

    const g = container.querySelector('g');
    console.log('SVG G Content:', g?.outerHTML);
    console.log('G Children:', g?.children.length);
    if (g && g.children.length > 0) {
      console.log('First Child:', g.children[0].tagName);
    }
    expect(g).toBeTruthy();

    // Check transform
    expect(g?.getAttribute('transform')).toBe('translate(0, 0)');

    const pathEl = g?.querySelector('path');
    expect(pathEl).toBeTruthy();
    expect(pathEl?.getAttribute('d')).toBe('M0,0 L100,0 L100,100 L0,100 Z');
    expect(pathEl?.getAttribute('fill')).toBe('#ff0000');
  });

  it('should render an ellipse', () => {
    const options: ShapeRenderOptions = {
      id: 'ellipse1',
      geometry: 'ellipse',
      stroke: { width: 12700, color: '#00ff00' }, // 1pt stroke
    };

    renderer.renderShape(options, container, rect, ctx);

    const ellipse = container.querySelector('ellipse');
    expect(ellipse).toBeTruthy();
    expect(ellipse?.getAttribute('cx')).toBe('50');
    expect(ellipse?.getAttribute('cy')).toBe('50');
    expect(ellipse?.getAttribute('rx')).toBe('50');
    expect(ellipse?.getAttribute('ry')).toBe('50');

    // Check stroke
    expect(ellipse?.getAttribute('stroke')).toBe('#00ff00');
    expect(ellipse?.getAttribute('stroke-width')).toBe('1');
  });

  it('should handle rotation', () => {
    const options: ShapeRenderOptions = {
      id: 'rect_rot',
      geometry: 'rect',
      rotation: 45,
    };

    renderer.renderShape(options, container, rect, ctx);

    const g = container.querySelector('g');
    expect(g?.getAttribute('transform')).toContain('rotate(45, 50, 50)');
  });

  it('should render custom geometry path', () => {
    const options: ShapeRenderOptions = {
      id: 'custom1',
      geometry: 'custom',
      path: 'M0,0 L100,100',
      pathWidth: 100,
      pathHeight: 100,
    };

    renderer.renderShape(options, container, rect, ctx);

    const path = container.querySelector('path');
    expect(path).toBeTruthy();
    expect(path?.getAttribute('d')).toBe('M0,0 L100,100');
    expect(path?.getAttribute('vector-effect')).toBe('non-scaling-stroke');
  });
});
