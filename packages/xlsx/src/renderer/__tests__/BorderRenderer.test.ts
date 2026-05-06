import { describe, expect, it, vi } from 'vitest';
import { BorderRenderer, DrawCmd } from '../BorderRenderer';

describe('BorderRenderer', () => {
  it('should use the explicit pane clip instead of inferring from scrolled coordinates', () => {
    const ctx = {
      save() {},
      restore() {},
      beginPath() {},
      clip() {},
      rect: vi.fn(),
      setLineDash() {},
      moveTo() {},
      lineTo() {},
      stroke() {},
      lineWidth: 1,
      strokeStyle: '#000000'
    } as unknown as CanvasRenderingContext2D;

    const cmd: DrawCmd = {
      x: 100,
      y: 60,
      len: 25,
      isVertical: true,
      border: {
        style: 'solid',
        width: 1,
        color: '#000000'
      }
    };

    BorderRenderer.renderCmd(ctx, cmd, 1, 1, 140, 49, {
      x: 140,
      y: 49,
      width: 260,
      height: 251
    });

    expect(ctx.rect).toHaveBeenCalledWith(140, 49, 260, 251);
  });
});
