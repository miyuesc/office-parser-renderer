import { OfficeShape } from '../types';
import { ShapeEngine } from '../drawing/ShapeEngine';

export class ShapeRenderer {
  static render(
    ctx: CanvasRenderingContext2D,
    shape: OfficeShape,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    // Rotation
    if (shape.position.rotation) {
      const cx = width / 2;
      const cy = height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((shape.position.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    // Flip (Scale)
    if (shape.position.flipH || shape.position.flipV) {
      const cx = width / 2;
      const cy = height / 2;
      ctx.translate(cx, cy);
      ctx.scale(shape.position.flipH ? -1 : 1, shape.position.flipV ? -1 : 1);
      ctx.translate(-cx, -cy);
    }

    // Path
    const pathData = ShapeEngine.getShapePath(shape.geometry.preset || 'rect', width, height);
    const path = new Path2D(pathData);

    // Fill
    if (shape.style.fill?.type === 'solid' && shape.style.fill.color) {
      ctx.fillStyle = `#${shape.style.fill.color}`;
      ctx.fill(path);
    } else if (shape.style.fill?.type === 'none') {
      // No fill
    } else {
      // Default fill logic based on type
      if (shape.type === 'shape' && !shape.style.fill) {
        ctx.fillStyle = '#b4c7e7';
        ctx.fill(path);
      }
    }

    // Stroke
    if (shape.style.stroke) {
      ctx.lineWidth = shape.style.stroke.width || 1;
      ctx.strokeStyle = `#${shape.style.stroke.color || '000000'}`;
      // pending: dash type
      ctx.stroke(path);
    } else {
      // Default stroke
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#2c5d94';
      ctx.stroke(path);
    }

    // Text
    if (shape.text && shape.text.content) {
      ctx.fillStyle = '#000000'; // Default text color
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Simple centering for now
      ctx.fillText(shape.text.content, width / 2, height / 2);
    }

    ctx.restore();
  }
}
