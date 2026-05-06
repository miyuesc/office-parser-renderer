import { describe, expect, it, vi } from 'vitest';
import { ChartRenderer } from '../renderer/ChartRenderer';
import { ChartType } from '../model/IChartData';

function createMockContext() {
  let fontValue = '';
  const fonts: string[] = [];
  const ctx = {
    save() {},
    restore() {},
    beginPath() {},
    closePath() {},
    fillRect() {},
    strokeRect() {},
    clearRect() {},
    moveTo() {},
    lineTo() {},
    fill() {},
    stroke() {},
    fillText: vi.fn(),
    arc: vi.fn((_x: number, _y: number, radius: number) => {
      if (radius < 0) {
        throw new DOMException('negative radius', 'IndexSizeError');
      }
    }),
    measureText(text: string) {
      return { width: text.length * 7 };
    },
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    textAlign: 'left',
    textBaseline: 'middle',
    get font() {
      return fontValue;
    },
    set font(value: string) {
      fontValue = value;
      fonts.push(value);
    },
    fonts
  } as unknown as CanvasRenderingContext2D & { fonts: string[] };

  return ctx;
}

describe('ChartRenderer', () => {
  it('should not throw when a scaled pie chart leaves too little plot area', () => {
    const renderer = new ChartRenderer(
      {
        type: ChartType.PIE,
        title: { text: 'Tiny chart' },
        legend: { visible: true, position: 'b' },
        categories: ['A', 'B'],
        series: [{ index: 0, order: 0, name: 'Series 1', data: [1, 2] }],
        axes: [],
        is3D: false
      },
      { scale: 0.2 }
    );

    expect(() => renderer.render(createMockContext(), { x: 0, y: 0, width: 8, height: 5 })).not.toThrow();
  });

  it('should scale chart text with the surrounding XLSX zoom', () => {
    const ctx = createMockContext();
    const renderer = new ChartRenderer(
      {
        type: ChartType.LINE,
        title: { text: 'Scaled chart' },
        categories: ['Jan', 'Feb'],
        series: [{ index: 0, order: 0, name: 'Series 1', data: [1, 2] }],
        axes: [],
        is3D: false
      },
      { scale: 0.3 }
    );

    renderer.render(ctx, { x: 0, y: 0, width: 120, height: 80 });

    expect(ctx.fonts.some(font => font.includes('4.8px') || font.includes('4px'))).toBe(true);
    expect(ctx.fonts.some(font => font.includes('3px'))).toBe(true);
  });
});
