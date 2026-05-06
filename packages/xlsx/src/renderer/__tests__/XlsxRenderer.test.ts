import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ShapeRenderer, VirtualScrollbar } from '@opr/shared';
import { XlsxRenderer } from '../XlsxRenderer';

describe('XlsxRenderer drawings', () => {
  const mockCtx = {
    save() {},
    restore() {},
    beginPath() {},
    closePath() {},
    rect: vi.fn(),
    clip() {},
    clearRect() {},
    fillRect() {},
    fill: vi.fn(),
    fillText: vi.fn(),
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
    vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 400,
      bottom: 300,
      width: 400,
      height: 300,
      x: 0,
      y: 0,
      toJSON() {
        return {};
      }
    } as DOMRect);
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

  it('should switch formula display modes at render time', () => {
    const container = document.createElement('div');
    const renderer = new XlsxRenderer(container, {
      width: 400,
      height: 300,
      formulaDisplay: 'formula'
    });

    const worksheet = {
      name: 'Sheet1',
      rows: new Map([
        [
          1,
          {
            index: 1,
            cells: new Map([
              [
                1,
                {
                  row: 1,
                  col: 1,
                  type: 'number',
                  value: 3,
                  formula: '1+2',
                  hasFormulaResult: true
                }
              ]
            ])
          }
        ]
      ]),
      cols: new Map()
    } as any;

    const fillTextSpy = mockCtx.fillText as unknown as ReturnType<typeof vi.fn>;
    fillTextSpy.mockClear();

    renderer.setWorksheet(
      worksheet,
      {
        worksheets: new Map([['sheet-1', worksheet]]),
        sharedStrings: []
      } as any
    );

    expect(fillTextSpy.mock.calls.some(call => call[0] === '=1+2')).toBe(true);

    fillTextSpy.mockClear();
    renderer.setFormulaDisplay('value');

    expect(fillTextSpy.mock.calls.some(call => call[0] === '3')).toBe(true);
  });

  it('should expose render options and hide inserted drawings when toggled off', () => {
    const container = document.createElement('div');
    const renderer = new XlsxRenderer(container, {
      width: 400,
      height: 300
    });
    const renderSpy = vi.spyOn(ShapeRenderer, 'render').mockImplementation(() => {});
    const worksheet = {
      name: 'Sheet1',
      rows: new Map(),
      cols: new Map(),
      drawings: [
        {
          id: 'shape-1',
          type: 'shape',
          position: {
            type: 'oneCellAnchor',
            from: { col: 0, row: 0, colOff: 0, rowOff: 0 },
            width: 100,
            height: 50
          },
          geometry: { type: 'preset', preset: 'rect' },
          style: {}
        }
      ]
    } as any;

    renderer.setWorksheet(
      worksheet,
      {
        worksheets: new Map([['sheet-1', worksheet]]),
        sharedStrings: []
      } as any
    );

    expect(renderSpy).toHaveBeenCalled();
    renderSpy.mockClear();

    renderer.setShowInsertedElements(false);

    expect(renderer.getRenderOptions().showInsertedElements).toBe(false);
    expect(renderSpy).not.toHaveBeenCalled();
  });

  it('should switch display scale and apply initial cell location', () => {
    const container = document.createElement('div');
    const renderer = new XlsxRenderer(container, {
      width: 400,
      height: 300,
      locateCellMode: { row: 20 }
    });
    const worksheet = {
      name: 'Sheet1',
      rows: new Map([
        [1, { index: 1, cells: new Map() }],
        [2, { index: 2, cells: new Map() }],
        [20, { index: 20, cells: new Map() }]
      ]),
      cols: new Map()
    } as any;

    renderer.setWorksheet(
      worksheet,
      {
        worksheets: new Map([['sheet-1', worksheet]]),
        sharedStrings: []
      } as any
    );

    renderer.setDisplayScale(150);
    expect(renderer.getScale()).toBe(1.5);
    expect(renderer.scrollY).toBeGreaterThan(0);

    renderer.setCellLocateMode({ cell: 10 });

    expect(renderer.scrollX).toBeGreaterThan(0);
  });

  it('should keep row and column headers measurable at very low zoom', () => {
    const container = document.createElement('div');
    const renderer = new XlsxRenderer(container, {
      width: 400,
      height: 300,
      showRowHeaders: true,
      showColHeaders: true
    });

    const worksheet = {
      name: 'Sheet1',
      rows: new Map([
        [
          1,
          {
            index: 1,
            cells: new Map([
              [
                1,
                {
                  row: 1,
                  col: 1,
                  type: 'string',
                  value: 'A1'
                }
              ]
            ])
          }
        ]
      ]),
      cols: new Map()
    } as any;

    renderer.setWorksheet(
      worksheet,
      {
        worksheets: new Map([['sheet-1', worksheet]]),
        sharedStrings: []
      } as any
    );

    renderer.setScale(0.2);

    const info = renderer.getCellInfo(1, 1);
    expect(info?.screenBounds.x).toBe(24);
    expect(info?.screenBounds.y).toBe(16);
  });

  it('should keep scrolling headers out of frozen header areas', () => {
    const container = document.createElement('div');
    const renderer = new XlsxRenderer(container, {
      width: 400,
      height: 300,
      showRowHeaders: true,
      showColHeaders: true
    });

    const worksheet = {
      name: 'Sheet1',
      frozen: {
        xSplit: 1,
        ySplit: 1,
        state: 'frozen'
      },
      rows: new Map([
        [1, { index: 1, cells: new Map() }],
        [2, { index: 2, cells: new Map() }],
        [3, { index: 3, cells: new Map() }]
      ]),
      cols: new Map()
    } as any;

    renderer.setWorksheet(
      worksheet,
      {
        worksheets: new Map([['sheet-1', worksheet]]),
        sharedStrings: []
      } as any
    );

    renderer.scrollX = 80;
    renderer.scrollY = 15;
    const fillTextSpy = mockCtx.fillText as unknown as ReturnType<typeof vi.fn>;
    fillTextSpy.mockClear();

    renderer.render();

    expect(fillTextSpy.mock.calls.some(call => call[0] === 'A' && call[1] === 90)).toBe(true);
    expect(fillTextSpy.mock.calls.some(call => call[0] === 'B' && Number(call[1]) < 140)).toBe(false);
    expect(fillTextSpy.mock.calls.some(call => call[0] === '1' && call[2] === 36.5)).toBe(true);
    expect(fillTextSpy.mock.calls.some(call => call[0] === '2' && Number(call[2]) < 49)).toBe(false);
  });

  it('should render comment indicators and show comment tooltip on hover', () => {
    const container = document.createElement('div');
    const renderer = new XlsxRenderer(container, {
      width: 400,
      height: 300
    });

    const worksheet = {
      name: 'Sheet1',
      rows: new Map([
        [
          1,
          {
            index: 1,
            cells: new Map([
              [
                1,
                {
                  row: 1,
                  col: 1,
                  type: 'string',
                  value: '',
                  comment: {
                    ref: 'A1',
                    author: 'Alice',
                    text: 'Check this value'
                  }
                }
              ]
            ])
          }
        ]
      ]),
      cols: new Map(),
      comments: [
        {
          ref: 'A1',
          author: 'Alice',
          text: 'Check this value'
        }
      ]
    } as any;

    const fillSpy = mockCtx.fill as unknown as ReturnType<typeof vi.fn>;
    fillSpy.mockClear();

    renderer.setWorksheet(
      worksheet,
      {
        worksheets: new Map([['sheet-1', worksheet]]),
        sharedStrings: []
      } as any
    );

    expect(fillSpy).toHaveBeenCalled();

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }));

    const tooltip = container.querySelector('[data-testid="xlsx-comment-tooltip"]') as HTMLElement | null;
    expect(tooltip?.style.display).toBe('block');
    expect(tooltip?.textContent).toContain('Alice');
    expect(tooltip?.textContent).toContain('Check this value');

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 250, clientY: 250 }));
    expect(tooltip?.style.display).toBe('none');
  });
});
