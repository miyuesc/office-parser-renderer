import { OfficeImage } from '../types/OfficeImage';

export class ImageRenderer {
  /**
   * Render an OfficeImage onto a canvas context.
   * Assumes the context is already set up (or handles transformation itself if coords provided).
   *
   * @param ctx Canvas context
   * @param image The office image object
   * @param bitmap The loaded ImageBitmap
   * @param x Screen X coordinate (top-left of the image box)
   * @param y Screen Y coordinate (top-left of the image box)
   * @param width Target width
   * @param height Target height
   */
  static render(
    ctx: CanvasRenderingContext2D,
    image: OfficeImage,
    bitmap: ImageBitmap,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    if (!bitmap) return;

    ctx.save();

    // Calculate center for rotation
    const cx = x + width / 2;
    const cy = y + height / 2;

    ctx.translate(cx, cy);

    // Rotation
    if (image.position.rotation) {
      // Excel rotation is usually in degrees
      // TODO: Verify if unit is standardized in OfficeImage as degrees
      ctx.rotate((image.position.rotation * Math.PI) / 180);
    }

    // Flip
    // Scale -1, 1 for horizontal flip
    const scaleX = image.position.flipH ? -1 : 1;
    const scaleY = image.position.flipV ? -1 : 1;

    if (scaleX !== 1 || scaleY !== 1) {
      ctx.scale(scaleX, scaleY);
    }

    this.applyEffects(ctx, image);

    // Draw centered at (0,0) because we translated to center
    ctx.drawImage(bitmap, -width / 2, -height / 2, width, height);
    this.resetEffects(ctx);

    if (image.style?.stroke && image.style.stroke.type !== 'none') {
      ctx.lineWidth = image.style.stroke.width || 1;
      ctx.strokeStyle = this.toCssColor(image.style.stroke.color, '#000000');
      this.applyStrokeDash(ctx, image.style.stroke);
      ctx.strokeRect(-width / 2, -height / 2, width, height);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  private static applyEffects(ctx: CanvasRenderingContext2D, image: OfficeImage) {
    const effects = image.style?.effects;
    if (!effects) {
      return;
    }

    if (effects.shadow) {
      ctx.shadowColor = this.toCssColor(effects.shadow.color);
      ctx.shadowBlur = effects.shadow.blur;
      ctx.shadowOffsetX = effects.shadow.offsetX;
      ctx.shadowOffsetY = effects.shadow.offsetY;
    } else if (effects.glow) {
      ctx.shadowColor = this.toCssColor(effects.glow.color);
      ctx.shadowBlur = effects.glow.radius;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  }

  private static resetEffects(ctx: CanvasRenderingContext2D) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  private static applyStrokeDash(ctx: CanvasRenderingContext2D, stroke: NonNullable<OfficeImage['style']>['stroke']) {
    const width = stroke?.width || 1;
    if (stroke?.type === 'dash') {
      ctx.setLineDash([width * 4, width * 2]);
    } else if (stroke?.type === 'dot') {
      ctx.setLineDash([width, width * 2]);
    } else {
      ctx.setLineDash([]);
    }
  }

  private static toCssColor(color: string | undefined, fallback = '#000000') {
    if (!color) {
      return fallback;
    }

    return color.startsWith('#') || color.startsWith('rgb') || color === 'transparent' ? color : `#${color}`;
  }
}
