import type { LayoutAnchor, LayoutCoordinateSpace, LayoutLayer, LayoutRect } from './types';

const LOCAL_PX_SPACE: LayoutCoordinateSpace = {
  kind: 'local',
  unit: 'px'
};

export function createAbsoluteLayoutAnchor(
  rect: LayoutRect,
  options: {
    coordinateSpace?: LayoutCoordinateSpace;
    layer?: Partial<LayoutLayer>;
    source?: LayoutAnchor['source'];
  } = {}
): LayoutAnchor {
  return {
    kind: 'absolute',
    coordinateSpace: options.coordinateSpace || LOCAL_PX_SPACE,
    rect,
    layer: normalizeLayoutLayer(options.layer),
    source: options.source
  };
}

export function getLayoutAnchorRect(anchor: LayoutAnchor): LayoutRect {
  return { ...anchor.rect };
}

export function translateLayoutRect(rect: LayoutRect, delta: { x?: number; y?: number }): LayoutRect {
  return {
    ...rect,
    x: rect.x + (delta.x ?? 0),
    y: rect.y + (delta.y ?? 0)
  };
}

export function normalizeLayoutLayer(layer: Partial<LayoutLayer> = {}): LayoutLayer {
  return {
    zIndex: layer.zIndex ?? 0,
    order: layer.order ?? 0,
    behindDocument: layer.behindDocument,
    allowOverlap: layer.allowOverlap
  };
}

export function compareLayoutLayers(left?: Partial<LayoutLayer>, right?: Partial<LayoutLayer>): number {
  const leftLayer = normalizeLayoutLayer(left);
  const rightLayer = normalizeLayoutLayer(right);

  if (leftLayer.behindDocument !== rightLayer.behindDocument) {
    return leftLayer.behindDocument ? -1 : 1;
  }

  if (leftLayer.zIndex !== rightLayer.zIndex) {
    return leftLayer.zIndex - rightLayer.zIndex;
  }

  return (leftLayer.order ?? 0) - (rightLayer.order ?? 0);
}
