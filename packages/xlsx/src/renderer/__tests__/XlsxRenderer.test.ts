import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ShapeRenderer, VirtualScrollbar } from '@opr/shared';
import { XlsxRenderer } from '../XlsxRenderer';

describe('XlsxRenderer drawings', () => {
  const mockCtx = {
    save() {},
    restore() {},
    beginPath() {},
    rect() {},
    clip() {},
    clearRect() {},
    fillRect() {},
    fillText() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    strokeRect() {},
    setLineDash() {},
    scale() {},
    measureText(text: string) {
      return { width: text.length * 8 };
    },
    font: '',
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    textAlign: 'left',
    textBaseline: 'middle'
  } as unknown as CanvasRenderingContext2D;

  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx);
    vi.spyOn(VirtualScrollbar.prototype, 'draw').mockImplementation(() => {});
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should offset drawings by headers and scale one-cell anchors with zoom', () => {
    const container = document.createElement('div');
    const renderer = new XlsxRenderer(container, {
      width: 400,
      height: 300,
      showRowHeaders: true,
      showColHeaders: true
    });

    const renderSpy = vi.spyOn(ShapeRenderer, 'render').mockImplementation(() => {});
    const drawing = {
      id: 'shape-1',
      type: 'shape',
      position: {
        type: 'oneCellAnchor',
        from: { col: 0, row: 0, colOff: 0, rowOff: 0 },
        width: 100,
        height: 50
      },
      geometry: { type: 'preset', preset: 'rect' },
      style: {},
      text: {
        kind: 'text',
        content: 'Shape',
        runs: [{ text: 'Shape', size: 12, font: 'Arial' }],
        align: 'center',
        valign: 'middle',
        wrap: false
      }
    };
    const worksheet = {
      name: 'Sheet1',
      rows: new Map(),
      cols: new Map(),
      drawings: [drawing]
    } as any;

    renderer.setWorksheet(
      worksheet,
      {
        worksheets: new Map([['sheet-1', worksheet]]),
        sharedStrings: []
      } as any
    );

    const initialCall = renderSpy.mock.calls.at(-1);
    expect(initialCall?.[2]).toBe(40);
    expect(initialCall?.[3]).toBe(24);
    expect(initialCall?.[4]).toBe(100);
    expect(initialCall?.[5]).toBe(50);

    renderSpy.mockClear();
    renderer.setScale(2);

    const zoomedCall = renderSpy.mock.calls.at(-1);
    expect(zoomedCall?.[2]).toBe(80);
    expect(zoomedCall?.[3]).toBe(48);
    expect(zoomedCall?.[4]).toBe(200);
    expect(zoomedCall?.[5]).toBe(100);
  });
});
