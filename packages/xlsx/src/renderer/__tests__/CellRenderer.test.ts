import { describe, expect, it, vi } from 'vitest';
import { CellRenderer } from '../CellRenderer';

describe('CellRenderer formula display', () => {
  it('should fall back to formula text when auto mode has no cached result', () => {
    expect(
      CellRenderer.getCellText(
        {
          row: 1,
          col: 1,
          type: 'number',
          value: '',
          formula: 'SUM(B1:B2)',
          hasFormulaResult: false
        },
        undefined,
        'auto'
      )
    ).toBe('=SUM(B1:B2)');
  });

  it('should respect explicit formula and value display modes', () => {
    const cell = {
      row: 1,
      col: 1,
      type: 'number' as const,
      value: 3,
      formula: '1+2',
      hasFormulaResult: true
    };

    expect(CellRenderer.getCellText(cell, undefined, 'auto')).toBe('3');
    expect(CellRenderer.getCellText(cell, undefined, 'value')).toBe('3');
    expect(CellRenderer.getCellText(cell, undefined, 'formula')).toBe('=1+2');
  });

  it('should keep empty cached string results hidden in auto mode', () => {
    expect(
      CellRenderer.getCellText(
        {
          row: 1,
          col: 1,
          type: 'string',
          value: '',
          formula: 'IF(A1=\"\", \"\", A1)',
          hasFormulaResult: true
        },
        undefined,
        'auto'
      )
    ).toBe('');
  });

  it('should render data bars and hide text when showValue is false', () => {
    const ctx = {
      save() {},
      restore() {},
      beginPath() {},
      rect() {},
      clip() {},
      fillRect: vi.fn(),
      fillText: vi.fn(),
      measureText(text: string) {
        return { width: text.length * 8 };
      },
      font: '',
      fillStyle: '#000000',
      textAlign: 'left',
      textBaseline: 'middle'
    } as unknown as CanvasRenderingContext2D;

    const row = {
      index: 1,
      cells: new Map([
        [
          1,
          {
            row: 1,
            col: 1,
            type: 'number' as const,
            value: 42
          }
        ]
      ])
    };

    CellRenderer.render(
      ctx,
      row,
      1,
      10,
      20,
      100,
      24,
      undefined,
      '11px Arial',
      1,
      'auto',
      {
        dataBar: {
          color: '#638ec6',
          xRatio: 0.1,
          widthRatio: 0.5,
          showValue: false
        }
      }
    );

    const fillRectSpy = ctx.fillRect as unknown as ReturnType<typeof vi.fn>;
    expect(fillRectSpy).toHaveBeenCalledTimes(1);
    expect(fillRectSpy.mock.calls[0][0]).toBeCloseTo(21.6, 6);
    expect(fillRectSpy.mock.calls[0][1]).toBeCloseTo(25.4, 6);
    expect(fillRectSpy.mock.calls[0][2]).toBeCloseTo(48, 6);
    expect(fillRectSpy.mock.calls[0][3]).toBeCloseTo(13.2, 6);
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('should render iconSet glyphs and hide value text when showValue is false', () => {
    const ctx = {
      save() {},
      restore() {},
      beginPath() {},
      rect() {},
      clip() {},
      fillRect: vi.fn(),
      fillText: vi.fn(),
      measureText(text: string) {
        return { width: text.length * 8 };
      },
      font: '',
      fillStyle: '#000000',
      textAlign: 'left',
      textBaseline: 'middle'
    } as unknown as CanvasRenderingContext2D;

    const row = {
      index: 1,
      cells: new Map([
        [
          1,
          {
            row: 1,
            col: 1,
            type: 'number' as const,
            value: 42
          }
        ]
      ])
    };

    CellRenderer.render(
      ctx,
      row,
      1,
      10,
      20,
      100,
      24,
      undefined,
      '11px Arial',
      1,
      'auto',
      {
        iconSet: {
          name: '3TrafficLights1',
          iconIndex: 2,
          iconCount: 3,
          showValue: false
        }
      }
    );

    const fillTextSpy = ctx.fillText as unknown as ReturnType<typeof vi.fn>;
    expect(fillTextSpy).toHaveBeenCalledTimes(1);
    expect(fillTextSpy.mock.calls[0][0]).toBe('●');
  });

  it('should keep row font color when a cell style only applies fill', () => {
    const textPaints: string[] = [];
    const ctx = {
      save() {},
      restore() {},
      beginPath() {},
      rect() {},
      clip() {},
      fillRect: vi.fn(),
      fillText: vi.fn(function (this: CanvasRenderingContext2D) {
        textPaints.push(String(this.fillStyle));
      }),
      measureText(text: string) {
        return { width: text.length * 8 };
      },
      font: '',
      fillStyle: '#000000',
      textAlign: 'left',
      textBaseline: 'middle'
    } as unknown as CanvasRenderingContext2D;

    const row = {
      index: 1,
      styleId: 1,
      cells: new Map([
        [
          1,
          {
            row: 1,
            col: 1,
            type: 'string' as const,
            value: 'row-colored',
            styleId: 2
          }
        ]
      ])
    };

    CellRenderer.render(
      ctx,
      row,
      1,
      0,
      0,
      120,
      24,
      {
        fonts: [
          {},
          { color: '#808080' },
          { color: '#000000' }
        ],
        fills: [
          { type: 'pattern', patternType: 'none' },
          { type: 'pattern', patternType: 'solid', fgColor: '#ffff00' }
        ],
        borders: [],
        cellXfs: [
          { fontId: 0, fillId: 0, borderId: 0, numFmtId: 0 },
          { fontId: 1, fillId: 0, borderId: 0, numFmtId: 0, applyFont: true },
          { fontId: 2, fillId: 1, borderId: 0, numFmtId: 0, applyFill: true }
        ],
        numFmts: new Map(),
        differentialStyles: []
      },
      '11px Arial'
    );

    expect(ctx.fillRect).toHaveBeenCalled();
    expect(textPaints.at(-1)).toBe('#808080');
  });
});
