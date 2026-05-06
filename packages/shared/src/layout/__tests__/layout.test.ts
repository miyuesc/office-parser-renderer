import { describe, expect, it } from 'vitest';
import { compareLayoutLayers, createAbsoluteLayoutAnchor, getLayoutAnchorRect, translateLayoutRect } from '../anchors';
import type { LayoutCoordinateSpace } from '../types';

describe('shared layout anchors', () => {
  it('creates absolute anchors in an explicit coordinate space', () => {
    const slideSpace: LayoutCoordinateSpace = {
      kind: 'slide',
      unit: 'px',
      width: 960,
      height: 540,
      name: '16:9 slide'
    };

    const anchor = createAbsoluteLayoutAnchor(
      { x: 120, y: 80, width: 320, height: 180 },
      {
        coordinateSpace: slideSpace,
        layer: { zIndex: 3, order: 2 },
        source: { format: 'pptx', partPath: 'ppt/slides/slide1.xml', elementId: 'shape-1' }
      }
    );

    expect(anchor).toMatchObject({
      kind: 'absolute',
      coordinateSpace: slideSpace,
      rect: { x: 120, y: 80, width: 320, height: 180 },
      layer: { zIndex: 3, order: 2 },
      source: { format: 'pptx', partPath: 'ppt/slides/slide1.xml', elementId: 'shape-1' }
    });
  });

  it('orders behind-document layers before foreground layers, then by z-index and document order', () => {
    const layers = [
      { zIndex: 1, order: 2 },
      { zIndex: 10, order: 1, behindDocument: true },
      { zIndex: 1, order: 1 },
      { zIndex: 0, order: 3 }
    ].sort(compareLayoutLayers);

    expect(layers).toEqual([
      { zIndex: 10, order: 1, behindDocument: true },
      { zIndex: 0, order: 3 },
      { zIndex: 1, order: 1 },
      { zIndex: 1, order: 2 }
    ]);
  });

  it('returns immutable rect snapshots and translated rects', () => {
    const anchor = createAbsoluteLayoutAnchor({ x: 10, y: 20, width: 30, height: 40 });
    const rect = getLayoutAnchorRect(anchor);
    rect.x = 99;

    expect(anchor.rect.x).toBe(10);
    expect(translateLayoutRect(anchor.rect, { x: 5, y: -10 })).toEqual({
      x: 15,
      y: 10,
      width: 30,
      height: 40
    });
  });
});
