import { afterEach, describe, expect, it, vi } from 'vitest';
import { NumberFormatter } from '../NumberFormatter';
import { ShapeRenderer } from '../ShapeRenderer';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NumberFormatter', () => {
  it('should format numbers with decimals', () => {
    expect(NumberFormatter.format(123.456, '0.00')).toBe('123.46');
    expect(NumberFormatter.format(123, '0.00')).toBe('123.00');
  });

  it('should format percentage', () => {
    expect(NumberFormatter.format(0.123, '0.00%')).toBe('12.30%');
  });

  it('should format currency (simple)', () => {
    expect(NumberFormatter.format(123.45, '$0.00')).toBe('$123.45');
  });

  it('should format dates (ISO)', () => {
    const date = new Date(2023, 0, 1); // Jan 1, 2023
    expect(NumberFormatter.format(date, 'yyyy-mm-dd')).toBe('2023-01-01');
  });
});

describe('ShapeRenderer', () => {
  it('should compute grouped child frames using child-space transforms', () => {
    const group: any = {
      type: 'group',
      position: { type: 'absolute', width: 30, height: 20 },
      geometry: { type: 'preset', preset: 'rect' },
      style: {},
      groupTransform: {
        childOffsetX: 1,
        childOffsetY: 2,
        childWidth: 10,
        childHeight: 10,
        scaleX: 3,
        scaleY: 2
      }
    };

    const child: any = {
      type: 'shape',
      position: { type: 'absolute', x: 4, y: 7, width: 5, height: 6 }
    };

    expect(ShapeRenderer.computeChildRenderFrame(group, child)).toEqual({
      x: 9,
      y: 10,
      width: 15,
      height: 12
    });
  });

  it('should build an arch layout for minimal wordart rendering', () => {
    const glyphs = ShapeRenderer.computeWordArtGlyphLayout(
      {
        kind: 'wordart',
        content: 'ARC',
        wrap: false,
        warp: {
          preset: 'textArchUp'
        }
      },
      120,
      60
    );

    expect(glyphs).toHaveLength(3);
    expect(glyphs[0].x).toBeLessThan(glyphs[1].x);
    expect(glyphs[1].x).toBeLessThan(glyphs[2].x);
    expect(glyphs[1].y).toBeLessThan(glyphs[0].y);
    expect(glyphs[1].y).toBeLessThan(glyphs[2].y);
  });

  it('should support additional wordart presets and consume adjustments', () => {
    const circle = ShapeRenderer.computeWordArtGlyphLayout(
      {
        kind: 'wordart',
        content: 'RING',
        wrap: false,
        warp: {
          preset: 'textCircle',
          adjustments: {
            adj: 80000
          }
        }
      },
      120,
      120
    );

    const button = ShapeRenderer.computeWordArtGlyphLayout(
      {
        kind: 'wordart',
        content: 'BTN',
        wrap: false,
        warp: {
          preset: 'textButton',
          adjustments: {
            adj: 20000
          }
        }
      },
      120,
      60
    );

    const curveDown = ShapeRenderer.computeWordArtGlyphLayout(
      {
        kind: 'wordart',
        content: 'DOWN',
        wrap: false,
        warp: {
          preset: 'textCurveDown',
          adjustments: {
            adj: 65000
          }
        }
      },
      140,
      80
    );

    expect(circle).toHaveLength(4);
    expect(Math.max(...circle.map(g => g.y)) - Math.min(...circle.map(g => g.y))).toBeGreaterThan(20);
    expect(button).toHaveLength(3);
    expect(button[1].y).toBeLessThan(button[0].y);
    expect(curveDown).toHaveLength(4);
    expect(curveDown[1].y).toBeGreaterThan(curveDown[0].y);
    expect(curveDown[2].y).toBeGreaterThan(curveDown[3].y);
  });

  it('should prefer runtime hooks for grouped images and charts', () => {
    const calls: string[] = [];
    const ctx = {
      save() {},
      restore() {},
      translate() {},
      rotate() {},
      scale() {},
      setLineDash() {},
      strokeRect() {},
      beginPath() {},
      moveTo() {},
      lineTo() {},
      stroke() {},
      fillRect() {},
      fill() {},
      fillText() {},
      strokeText() {},
      drawImage() {},
      createPattern() {
        return null;
      },
      createLinearGradient() {
        return { addColorStop() {} };
      }
    } as unknown as CanvasRenderingContext2D;

    ShapeRenderer.render(
      ctx,
      {
        id: 'group',
        type: 'group',
        position: { type: 'absolute', width: 100, height: 100 },
        geometry: { type: 'preset', preset: 'rect' },
        style: {},
        children: [
          {
            id: 'img1',
            blob: new Blob(['x']),
            extension: 'png',
            position: { type: 'absolute', x: 0, y: 0, width: 10, height: 10 }
          },
          {
            id: 'chart1',
            type: 'chart',
            chartData: { type: 'bar', categories: [], series: [], axes: [], is3D: false },
            position: { type: 'absolute', x: 10, y: 10, width: 20, height: 20 }
          }
        ]
      } as any,
      0,
      0,
      100,
      100,
      {
        resolveImageBitmap(image) {
          calls.push(`image:${image.id}`);
          return {} as ImageBitmap;
        },
        renderChart(_ctx, chart) {
          calls.push(`chart:${chart.id}`);
        }
      }
    );

    expect(calls).toEqual(['image:img1', 'chart:chart1']);
  });

  it('should scale shape text to match the rendered frame size', () => {
    vi.stubGlobal(
      'Path2D',
      class {
        constructor(_path?: string) {}
      }
    );

    const fonts: string[] = [];
    const ctx = {
      save() {},
      restore() {},
      translate() {},
      rotate() {},
      scale() {},
      setLineDash() {},
      strokeRect() {},
      beginPath() {},
      moveTo() {},
      lineTo() {},
      stroke() {},
      fillRect() {},
      fill() {},
      strokeText() {},
      drawImage() {},
      createPattern() {
        return null;
      },
      createLinearGradient() {
        return { addColorStop() {} };
      },
      measureText(text: string) {
        return { width: text.length * 10 };
      },
      fillText() {
        fonts.push(this.font);
      },
      font: '',
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      textAlign: 'left',
      textBaseline: 'alphabetic'
    } as unknown as CanvasRenderingContext2D & { font: string };

    ShapeRenderer.render(
      ctx,
      {
        id: 'shape1',
        type: 'shape',
        position: { type: 'absolute', width: 100, height: 50 },
        geometry: { type: 'preset', preset: 'rect' },
        style: {},
        text: {
          kind: 'text',
          content: 'Zoom',
          runs: [{ text: 'Zoom', size: 10, font: 'Arial' }],
          align: 'center',
          valign: 'middle',
          wrap: false
        }
      } as any,
      0,
      0,
      200,
      100
    );

    expect(fonts.some(font => font.includes('20px'))).toBe(true);
  });
});
