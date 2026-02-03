import { describe, it, expect } from 'vitest';
import { Transform } from '../Transform';
import { ShapeEngine } from '../ShapeEngine';
import { ITransform } from '../types';

describe('Transform', () => {
  it('should generate correct CSS transform string', () => {
    const xfrm: ITransform = {
      off: { x: 0, y: 0 },
      ext: { cx: 100, cy: 100 },
      rot: 2700000, // 45 degrees
      flipH: true
    };
    const css = Transform.toCSSTransform(xfrm);
    expect(css).toContain('rotate(45deg)');
    expect(css).toContain('scaleX(-1)');
  });

  it('should generate correct CSS style object', () => {
    const xfrm: ITransform = {
      off: { x: 914400, y: 0 }, // 1 inch -> 96px
      ext: { cx: 914400, cy: 914400 }
    };
    const style = Transform.toCSSStyle(xfrm);
    expect(style.left).toBe('96px');
    expect(style.width).toBe('96px');
  });
});

describe('ShapeEngine', () => {
  it('should generate path for rect', () => {
    const path = ShapeEngine.getShapePath('rect', 100, 100);
    expect(path).toBe('M 0 0 L 100 0 L 100 100 L 0 100 Z');
  });

  it('should generate path for triangle', () => {
    const path = ShapeEngine.getShapePath('triangle', 100, 100);
    expect(path).toBe('M 50 0 L 100 100 L 0 100 Z');
  });
});
