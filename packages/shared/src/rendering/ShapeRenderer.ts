import { ChartRenderer } from '../chart/renderer/ChartRenderer';
import { DrawingElement, OfficeChart, OfficeImage, OfficeShape } from '../types';
import { ShapeEngine } from '../drawing/ShapeEngine';
import { ImageRenderer } from './ImageRenderer';

export interface ShapeRendererRuntime {
  resolveImageBitmap?: (image: OfficeImage) => ImageBitmap | undefined;
  scheduleRender?: () => void;
  renderChart?: (
    ctx: CanvasRenderingContext2D,
    chart: OfficeChart,
    rect: { x: number; y: number; width: number; height: number }
  ) => void;
}

export class ShapeRenderer {
  static render(
    ctx: CanvasRenderingContext2D,
    shape: OfficeShape,
    x: number,
    y: number,
    width: number,
    height: number,
    runtime?: ShapeRendererRuntime
  ) {
    ctx.save();
    ctx.translate(x, y);
    this.applyShapeTransform(ctx, shape, width, height);

    if (shape.type === 'group') {
      this.renderGroup(ctx, shape, width, height, runtime);
      ctx.restore();
      return;
    }

    // Apply Shape Effects (Shadow/Glow) - applied before fill/stroke so they don't overlay content weirdly,
    // but mostly shadow is behind.
    if (shape.style.effects) {
      this.applyEffects(ctx, shape.style.effects);
    }

    // Path
    const pathData = ShapeEngine.getShapePath(shape.geometry.preset || 'rect', width, height);
    const path = new Path2D(pathData);

    // Fill
    if (shape.style.fill) {
      this.applyFill(ctx, shape.style.fill, width, height, path);
    } else if (shape.type === 'shape' && this.shouldRenderDefaultFill(shape)) {
      // Default fill
      ctx.fillStyle = '#b4c7e7';
      ctx.fill(path);
    }

    // Clear Shadow for Stroke (unless stroke should have shadow?)
    // Usually shadow applies to the whole shape composited.
    // For now, keep shadow for stroke too.

    // Stroke
    if (shape.style.stroke) {
      ctx.lineWidth = shape.style.stroke.width || 1;
      ctx.strokeStyle = this.toCssColor(shape.style.stroke.color, '#000000');
      this.applyStrokeDash(ctx, shape.style.stroke);
      ctx.stroke(path);
      ctx.setLineDash([]);
    }

    // Reset effects for text (text has its own effects)
    this.resetEffects(ctx);

    // Text
    if (shape.text) {
      this.renderText(ctx, shape, width, height);
    }

    ctx.restore();
  }

  private static applyFill(
    ctx: CanvasRenderingContext2D,
    fill: NonNullable<OfficeShape['style']['fill']>,
    w: number,
    h: number,
    path?: Path2D
  ) {
    if (fill.type === 'none') return;

    if (fill.type === 'solid' && fill.color) {
      ctx.fillStyle = this.toCssColor(fill.color);
      if (path) ctx.fill(path);
      else ctx.fillRect(0, 0, w, h);
    } else if (fill.type === 'gradient' && fill.gradient) {
      const g = fill.gradient;
      const angle = g.angle !== undefined ? g.angle : 90;
      const angleRad = (angle * Math.PI) / 180;

      const cx = w / 2;
      const cy = h / 2;
      const length = Math.abs(w * Math.cos(angleRad)) + Math.abs(h * Math.sin(angleRad));

      const dx = (Math.cos(angleRad) * length) / 2;
      const dy = (Math.sin(angleRad) * length) / 2;

      const x1 = cx - dx;
      const y1 = cy - dy;
      const x2 = cx + dx;
      const y2 = cy + dy;

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);

      g.stops.forEach(stop => {
        gradient.addColorStop(stop.position, `${stop.color}`);
      });

      ctx.fillStyle = gradient;
      if (path) ctx.fill(path);
    } else if (fill.type === 'pattern' && fill.pattern) {
      this.renderPattern(ctx, fill.pattern, w, h, path);
    }
  }

  private static renderPattern(
    ctx: CanvasRenderingContext2D,
    pattern: NonNullable<NonNullable<OfficeShape['style']['fill']>['pattern']>,
    w: number,
    h: number,
    path?: Path2D
  ) {
    // Create pattern canvas - INCREASED SIZE FOR VISIBILITY
    const size = 20;
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = size;
    patternCanvas.height = size;
    const ptrCtx = patternCanvas.getContext('2d');
    if (!ptrCtx) return;

    // Background
    ptrCtx.fillStyle = this.toCssColor(pattern.backgroundColor);
    ptrCtx.fillRect(0, 0, size, size);

    // Foreground Pattern (Simplified)
    // Always draw a strong diagonal for now if it's a stripe or generic pattern
    ptrCtx.strokeStyle = this.toCssColor(pattern.foregroundColor);
    ptrCtx.lineWidth = 4; // Thicker line for visibility
    ptrCtx.lineCap = 'square';

    ptrCtx.beginPath();
    // Main diagonal
    ptrCtx.moveTo(0, size);
    ptrCtx.lineTo(size, 0);
    ptrCtx.stroke();

    // Add parallel lines for better tiling look (top-right and bottom-left)
    ptrCtx.beginPath();
    ptrCtx.moveTo(size / 2, size);
    ptrCtx.lineTo(size, size / 2);
    ptrCtx.stroke();

    ptrCtx.beginPath();
    ptrCtx.moveTo(0, size / 2);
    ptrCtx.lineTo(size / 2, 0);
    ptrCtx.stroke();

    // Check specific presets if needed, but for now force this visible diagonal style
    // if (pattern.preset.includes('Stripe')) ...

    const ptr = ctx.createPattern(patternCanvas, 'repeat');
    if (ptr) {
      ctx.fillStyle = ptr;
      if (path) {
        ctx.fill(path);
      } else {
        // For text, we can't easily fillRect with pattern unless we setup the pattern global.
        // For ShapeRenderer.applyFill, it handles rect too.
        ctx.fillRect(0, 0, w, h);
      }
    }
  }

  private static applyEffects(ctx: CanvasRenderingContext2D, effects: NonNullable<OfficeShape['style']['effects']>) {
    // Shadow
    if (effects.shadow) {
      ctx.shadowColor = this.toCssColor(effects.shadow.color);
      ctx.shadowBlur = effects.shadow.blur;
      ctx.shadowOffsetX = effects.shadow.offsetX;
      ctx.shadowOffsetY = effects.shadow.offsetY;
      // Note: Canvas shadow applies to everything drawn.
    }
    // Glow (Approximated as shadow with 0 offset and high blur)
    if (effects.glow) {
      // If shadow exists, we can't do both easily in one pass.
      // Prioritize glow if no shadow, or mix?
      // For now, if no shadow, use glow.
      if (!effects.shadow) {
        ctx.shadowColor = this.toCssColor(effects.glow.color);
        ctx.shadowBlur = effects.glow.radius;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    }
  }

  private static resetEffects(ctx: CanvasRenderingContext2D) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  private static applyStrokeDash(ctx: CanvasRenderingContext2D, stroke: NonNullable<OfficeShape['style']['stroke']>) {
    const width = stroke.width || 1;
    if (stroke.type === 'dash') {
      ctx.setLineDash([width * 4, width * 2]);
    } else if (stroke.type === 'dot') {
      ctx.setLineDash([width, width * 2]);
    } else {
      ctx.setLineDash([]);
    }
  }

  static computeChildRenderFrame(group: OfficeShape, child: DrawingElement) {
    const transform = group.groupTransform;
    const childX = child.position.x || 0;
    const childY = child.position.y || 0;
    const childWidth = child.position.width || 0;
    const childHeight = child.position.height || 0;

    if (!transform) {
      return {
        x: childX,
        y: childY,
        width: childWidth,
        height: childHeight
      };
    }

    return {
      x: (childX - transform.childOffsetX) * transform.scaleX,
      y: (childY - transform.childOffsetY) * transform.scaleY,
      width: childWidth * transform.scaleX,
      height: childHeight * transform.scaleY
    };
  }

  static computeWordArtGlyphLayout(
    text: NonNullable<OfficeShape['text']>,
    width: number,
    height: number
  ): Array<{ char: string; x: number; y: number; rotation: number }> {
    if (!text.content || !this.supportsWordArt(text)) {
      return [];
    }

    const chars = [...text.content.replace(/\n/g, '')];
    if (chars.length === 0) {
      return [];
    }

    const config = this.computeWordArtLayoutConfig(text, width, height);
    const start = config.startAngle;
    const step = chars.length === 1 ? 0 : config.span / (chars.length - 1);

    return chars.map((char, index) => {
      const angle = start + step * index;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      return {
        char,
        x: config.centerX + config.radiusX * sin,
        y: config.centerY + config.radiusY * cos * config.verticalDirection,
        rotation: angle + config.rotationOffset
      };
    });
  }

  static supportsWordArt(text: NonNullable<OfficeShape['text']>) {
    return (
      text.kind === 'wordart' &&
      ['textArchUp', 'textArchDown', 'textCurveUp', 'textCurveDown', 'textCircle', 'textButton'].includes(
        text.warp?.preset || ''
      )
    );
  }

  private static renderText(
    ctx: CanvasRenderingContext2D,
    shape: OfficeShape,
    width: number,
    height: number
  ) {
    const text = shape.text;
    if (!text) {
      return;
    }

    const textScale = this.computeTextScale(shape, width, height);

    if (this.supportsWordArt(text)) {
      this.renderWordArtText(ctx, text, width, height, textScale);
      return;
    }

    if (!text.runs || text.runs.length === 0) {
      if (text.content) {
        ctx.fillStyle = '#000000';
        ctx.font = `${Math.max(1, 12 * textScale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text.content, width / 2, height / 2);
      }
      return;
    }

    const maxTextWidth = width - 10; // Padding

    // 1. Pre-process runs for wrapping if needed
    let processedRuns = text.runs;
    if (text.wrap) {
      processedRuns = [];
      text.runs.forEach(run => {
        if (run.text === '\n') {
          processedRuns.push(run);
          return;
        }

        const scaledFontSize = Math.max(1, (run.size || 11) * textScale);
        const font = `${run.italic ? 'italic ' : ''}${run.bold ? 'bold ' : ''}${scaledFontSize}px ${run.font || 'Arial'}`;
        ctx.font = font;

        // Check if run fits in one line or needs split
        const m = ctx.measureText(run.text);

        if (m.width < maxTextWidth) {
          processedRuns.push(run);
        } else {
          // Need to split
          let currentStr = '';
          for (const char of run.text) {
            const testStr = currentStr + char;
            const testW = ctx.measureText(testStr).width;
            if (testW > maxTextWidth && currentStr.length > 0) {
              processedRuns.push({ ...run, text: currentStr });
              processedRuns.push({ text: '\n' }); // Newline trigger for line grouping
              currentStr = char;
            } else {
              currentStr = testStr;
            }
          }
          if (currentStr) {
            processedRuns.push({ ...run, text: currentStr });
          }
        }
      });
    }

    // 2. Group Runs into Lines
    interface LineData {
      runs: { run: any; width: number; font: string; height: number; ascender: number }[];
      totalWidth: number;
      maxHeight: number;
      maxAscender: number; // For baseline alignment
    }

    const lines: LineData[] = [];
    let currentLine: LineData = { runs: [], totalWidth: 0, maxHeight: 0, maxAscender: 0 };

    processedRuns.forEach(run => {
      if (run.text === '\n') {
        lines.push(currentLine);
        currentLine = { runs: [], totalWidth: 0, maxHeight: 0, maxAscender: 0 };
        return;
      }

      const scaledFontSize = Math.max(1, (run.size || 11) * textScale);
      const font = `${run.italic ? 'italic ' : ''}${run.bold ? 'bold ' : ''}${scaledFontSize}px ${run.font || 'Arial'}, serif`; // Add fallback for fonts
      ctx.font = font;
      const m = ctx.measureText(run.text);
      const w = m.width;
      // Estimate height and ascender since standard TextMetrics not always full
      // Simple estimation: height ~ size * 1.2, ascender ~ size * 0.9
      const size = scaledFontSize;
      const h = size * 1.2;
      const asc = size * 1.0;

      currentLine.runs.push({ run, width: w, font, height: h, ascender: asc });
      currentLine.totalWidth += w;
      currentLine.maxHeight = Math.max(currentLine.maxHeight, h);
      currentLine.maxAscender = Math.max(currentLine.maxAscender, asc);
    });
    if (currentLine.runs.length > 0 || lines.length === 0) {
      lines.push(currentLine);
    }

    // 2. Calculate Vertical Start
    const totalTextHeight = lines.reduce((acc, line) => acc + line.maxHeight, 0);
    let startY = 0;
    if (text.valign === 'top') {
      startY = 5;
    } else if (text.valign === 'bottom') {
      startY = height - totalTextHeight - 5;
    } else {
      // middle
      startY = (height - totalTextHeight) / 2;
    }

    // 3. Render Lines
    let currentY = startY;

    lines.forEach(line => {
      let startX = 0;
      if (text.align === 'center' || !text.align) {
        startX = (width - line.totalWidth) / 2;
      } else if (text.align === 'right') {
        startX = width - line.totalWidth - 5;
      } else {
        startX = 5;
      }

      // Render runs in this line
      let currentX = startX;
      // Align items to the common baseline of the line (maxAscender)
      // currentY is top of line. Baseline is currentY + line.maxAscender
      const baselineY = currentY + line.maxAscender;

      line.runs.forEach(item => {
        const { run, width: runW, font } = item;
        ctx.font = font;
        // We use alphabetic baseline
        ctx.textBaseline = 'alphabetic';

        const textTop = baselineY - item.ascender;
        const textBottom = baselineY + (item.height - item.ascender);

        // Apply Effects
        this.resetEffects(ctx);
        if (run.effects) {
          this.applyEffects(ctx, run.effects);
        }

        if (run.highlight) {
          ctx.save();
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.fillStyle = this.toCssColor(run.highlight);
          ctx.fillRect(currentX, textTop, runW, item.height);
          ctx.restore();
        }

        // Fill
        if (run.fill) {
          if (run.fill.type === 'gradient' && run.fill.gradient) {
            const g = run.fill.gradient;
            // Simplified vertical gradient mapping for text
            // For text, especially simple WordArt, vertical gradient usually spans the text height
            const gx1 = currentX;
            const gy1 = textTop;
            const gy2 = textBottom;

            const gradient = ctx.createLinearGradient(gx1, gy1, gx1, gy2);
            g.stops.forEach((stop: { position: number; color: string }) => {
              gradient.addColorStop(stop.position, `${stop.color}`);
            });
            ctx.fillStyle = gradient;
          } else if (run.fill.type === 'pattern' && run.fill.pattern) {
            const size = 16;
            const ptrC = document.createElement('canvas');
            ptrC.width = size;
            ptrC.height = size;
            const pCtx = ptrC.getContext('2d');
            if (pCtx) {
              const p = run.fill.pattern;
              pCtx.fillStyle = this.toCssColor(p.backgroundColor);
              pCtx.fillRect(0, 0, size, size);
              pCtx.strokeStyle = this.toCssColor(p.foregroundColor);
              pCtx.lineWidth = 3;

              // Draw Diagonal
              pCtx.beginPath();
              pCtx.moveTo(0, size);
              pCtx.lineTo(size, 0);
              pCtx.stroke();

              // Extra lines
              pCtx.beginPath();
              pCtx.moveTo(size / 2, size);
              pCtx.lineTo(size, size / 2);
              pCtx.stroke();

              const ptr = ctx.createPattern(ptrC, 'repeat');
              if (ptr) ctx.fillStyle = ptr;
            }
          } else if (run.fill.type === 'solid' && run.fill.color) {
            ctx.fillStyle = this.toCssColor(run.fill.color);
          } else {
            ctx.fillStyle = 'transparent';
          }
        } else {
          ctx.fillStyle = run.color ? `#${run.color}` : '#000000';
        }

        ctx.fillText(run.text, currentX, baselineY);

        // Outline
        if (run.outline) {
          ctx.lineWidth = run.outline.width;
          ctx.strokeStyle = this.toCssColor(run.outline.color);
          ctx.strokeText(run.text, currentX, baselineY);
        }

        if (run.underline || run.strike) {
          ctx.save();
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.strokeStyle = this.getRunDecorationColor(run);
          ctx.lineWidth = Math.max(1, Math.round((Math.max(1, (run.size || 11) * textScale)) / 14));
          if (run.underline) {
            const y = baselineY + Math.max(1, Math.max(1, (run.size || 11) * textScale) * 0.08);
            this.drawDecorationLine(ctx, currentX, y, currentX + runW);
          }
          if (run.strike) {
            const y = baselineY - item.ascender * 0.35;
            this.drawDecorationLine(ctx, currentX, y, currentX + runW);
          }
          ctx.restore();
        }

        currentX += runW;
      });

      // Move to next line
      currentY += line.maxHeight;
    });
  }

  private static renderGroup(
    ctx: CanvasRenderingContext2D,
    shape: OfficeShape,
    width: number,
    height: number,
    runtime?: ShapeRendererRuntime
  ) {
    if (!shape.children || shape.children.length === 0) {
      return;
    }

    for (const child of shape.children) {
      const frame = this.computeChildRenderFrame(shape, child);

      if ('blob' in child) {
        this.renderImageElement(ctx, child, frame.x, frame.y, frame.width, frame.height, runtime);
      } else if (child.type === 'chart') {
        this.renderChartElement(ctx, child, frame.x, frame.y, frame.width, frame.height, runtime);
      } else {
        this.render(ctx, child, frame.x, frame.y, frame.width, frame.height, runtime);
      }
    }
  }

  private static getRunDecorationColor(run: NonNullable<NonNullable<OfficeShape['text']>['runs']>[0]) {
    if (run.fill?.type === 'solid' && run.fill.color) {
      return this.toCssColor(run.fill.color);
    }

    return run.color ? this.toCssColor(run.color) : '#000000';
  }

  private static drawDecorationLine(ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number) {
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  }

  private static renderImageElement(
    ctx: CanvasRenderingContext2D,
    image: OfficeImage,
    x: number,
    y: number,
    width: number,
    height: number,
    runtime?: ShapeRendererRuntime
  ) {
    const bitmap = runtime?.resolveImageBitmap?.(image);
    if (bitmap) {
      ImageRenderer.render(ctx, image, bitmap, x, y, width, height);
      return;
    }

    runtime?.scheduleRender?.();
    this.renderImagePlaceholder(ctx, x, y, width, height);
  }

  private static renderChartElement(
    ctx: CanvasRenderingContext2D,
    chart: OfficeChart,
    x: number,
    y: number,
    width: number,
    height: number,
    runtime?: ShapeRendererRuntime
  ) {
    if (runtime?.renderChart) {
      runtime.renderChart(ctx, chart, { x, y, width, height });
      return;
    }

    new ChartRenderer(chart.chartData).render(ctx, { x, y, width, height });
  }

  private static renderImagePlaceholder(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    ctx.save();
    ctx.strokeStyle = '#999999';
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(x, y, width, height);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y + height);
    ctx.moveTo(x + width, y);
    ctx.lineTo(x, y + height);
    ctx.stroke();
    ctx.restore();
  }

  private static renderWordArtText(
    ctx: CanvasRenderingContext2D,
    text: NonNullable<OfficeShape['text']>,
    width: number,
    height: number,
    textScale: number
  ) {
    const glyphs = this.computeWordArtGlyphLayout(text, width, height);
    if (glyphs.length === 0) {
      return;
    }

    const styledRun = text.runs?.find(run => run.text !== '\n');
    const font = `${styledRun?.italic ? 'italic ' : ''}${styledRun?.bold ? 'bold ' : ''}${Math.max(1, (styledRun?.size || 18) * textScale)}px ${styledRun?.font || 'Arial'}, serif`;

    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const glyph of glyphs) {
      ctx.save();
      ctx.translate(glyph.x, glyph.y);
      ctx.rotate(glyph.rotation);
      this.resetEffects(ctx);
      if (styledRun?.effects) {
        this.applyEffects(ctx, styledRun.effects);
      }
      ctx.fillStyle =
        styledRun?.fill?.type === 'solid' && styledRun.fill.color ? this.toCssColor(styledRun.fill.color) : '#000000';
      ctx.fillText(glyph.char, 0, 0);
      if (styledRun?.outline) {
        ctx.lineWidth = styledRun.outline.width;
        ctx.strokeStyle = this.toCssColor(styledRun.outline.color);
        ctx.strokeText(glyph.char, 0, 0);
      }
      ctx.restore();
    }
  }

  private static applyShapeTransform(
    ctx: CanvasRenderingContext2D,
    shape: OfficeShape,
    width: number,
    height: number
  ) {
    if (shape.position.rotation) {
      const cx = width / 2;
      const cy = height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((shape.position.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    if (shape.position.flipH || shape.position.flipV) {
      const cx = width / 2;
      const cy = height / 2;
      ctx.translate(cx, cy);
      ctx.scale(shape.position.flipH ? -1 : 1, shape.position.flipV ? -1 : 1);
      ctx.translate(-cx, -cy);
    }
  }

  private static shouldRenderDefaultFill(shape: OfficeShape) {
    return shape.text?.kind !== 'wordart';
  }

  private static computeTextScale(shape: OfficeShape, width: number, height: number) {
    const baseWidth = shape.position.width || width;
    const baseHeight = shape.position.height || height;
    if (!baseWidth || !baseHeight) {
      return 1;
    }

    const scaleX = width / baseWidth;
    const scaleY = height / baseHeight;
    const scale = Math.min(scaleX, scaleY);
    if (!Number.isFinite(scale) || scale <= 0) {
      return 1;
    }

    return scale;
  }

  private static toCssColor(color: string | undefined, fallback = '#000000') {
    if (!color) {
      return fallback;
    }

    return color.startsWith('#') || color.startsWith('rgb') || color === 'transparent' ? color : `#${color}`;
  }

  private static computeWordArtLayoutConfig(text: NonNullable<OfficeShape['text']>, width: number, height: number) {
    const preset = text.warp?.preset || 'textArchUp';
    const adj = this.readWordArtAdjustment(text);

    if (preset === 'textCircle') {
      const span = Math.PI * (1.2 + adj * 0.75);
      const radius = Math.max(Math.min(width, height) * (0.28 + (1 - adj) * 0.1), 1);
      return {
        centerX: width / 2,
        centerY: height / 2,
        radiusX: radius,
        radiusY: radius,
        span,
        startAngle: -span / 2,
        verticalDirection: -1,
        rotationOffset: Math.PI / 2
      };
    }

    if (preset === 'textButton') {
      const span = Math.PI * (0.35 + adj * 0.55);
      const radiusX = Math.max(width * (0.28 + adj * 0.12), 1);
      const radiusY = Math.max(height * (0.4 + adj * 0.2), 1);
      return {
        centerX: width / 2,
        centerY: height * 0.58,
        radiusX,
        radiusY,
        span,
        startAngle: -span / 2,
        verticalDirection: -1,
        rotationOffset: Math.PI / 2
      };
    }

    const arcDown = preset === 'textArchDown' || preset === 'textCurveDown';
    const curved = preset === 'textCurveUp' || preset === 'textCurveDown';
    const span = Math.PI * (0.35 + adj * (curved ? 0.45 : 0.75));
    const radiusX = Math.max(width * (0.28 + (1 - adj) * 0.18), 1);
    const radiusY = Math.max(height * (0.35 + (1 - adj) * (curved ? 0.12 : 0.22)), 1);

    return {
      centerX: width / 2,
      centerY: arcDown ? height * 0.12 : height * 0.88,
      radiusX,
      radiusY,
      span,
      startAngle: -span / 2,
      verticalDirection: arcDown ? 1 : -1,
      rotationOffset: arcDown ? -Math.PI / 2 : Math.PI / 2
    };
  }

  private static readWordArtAdjustment(text: NonNullable<OfficeShape['text']>) {
    const raw = text.warp?.adjustments?.adj;
    if (typeof raw !== 'number' || Number.isNaN(raw)) {
      return 0.5;
    }

    return Math.min(Math.max(raw / 100000, 0), 1);
  }
}
