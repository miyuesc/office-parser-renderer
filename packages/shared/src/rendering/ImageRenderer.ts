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

    // Draw centered at (0,0) because we translated to center
    ctx.drawImage(bitmap, -width / 2, -height / 2, width, height);

    ctx.restore();
  }
}
