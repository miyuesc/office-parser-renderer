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
    } else if (shape.type === 'shape') {
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
      ctx.strokeStyle = `#${shape.style.stroke.color || '000000'}`;
      ctx.stroke(path);
    }

    // Reset effects for text (text has its own effects)
    this.resetEffects(ctx);

    // Text
    if (shape.text) {
      this.renderText(ctx, shape.text, width, height);
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
      ctx.fillStyle = `#${fill.color}`;
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
        gradient.addColorStop(stop.position, `#${stop.color}`);
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
    ptrCtx.fillStyle = `#${pattern.backgroundColor}`;
    ptrCtx.fillRect(0, 0, size, size);

    // Foreground Pattern (Simplified)
    // Always draw a strong diagonal for now if it's a stripe or generic pattern
    ptrCtx.strokeStyle = `#${pattern.foregroundColor}`;
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
      ctx.shadowColor = `#${effects.shadow.color}`;
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
        ctx.shadowColor = `#${effects.glow.color}`;
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

  private static renderText(
    ctx: CanvasRenderingContext2D,
    text: NonNullable<OfficeShape['text']>,
    width: number,
    height: number
  ) {
    if (!text.runs || text.runs.length === 0) {
      if (text.content) {
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text.content, width / 2, height / 2);
      }
      return;
    }

    const maxTextWidth = width - 10; // Padding

    // DEBUG LOGGING
    if (true) {
      // Enable logs
      console.log('[ShapeRenderer] Rendering Text:', text.content?.substring(0, 10), {
        width,
        maxTextWidth,
        wrap: text.wrap,
        runsCount: text.runs.length
      });
    }

    // 1. Pre-process runs for wrapping if needed
    let processedRuns = text.runs;
    if (text.wrap) {
      processedRuns = [];
      text.runs.forEach(run => {
        if (run.text === '\n') {
          processedRuns.push(run);
          return;
        }

        const font = `${run.italic ? 'italic ' : ''}${run.bold ? 'bold ' : ''}${run.size || 11}px ${run.font || 'Arial'}`;
        ctx.font = font;

        // Check if run fits in one line or needs split
        const m = ctx.measureText(run.text);

        if (run.text.includes('请在此处')) {
          console.log('[ShapeRenderer] Checking Wrapping:', {
            text: run.text,
            measureWidth: m.width,
            maxTextWidth,
            diff: maxTextWidth - m.width,
            font: font
          });
        }

        if (m.width < maxTextWidth) {
          processedRuns.push(run);
        } else {
          // Need to split
          if (run.text.includes('请在此处')) console.log('[ShapeRenderer] Splitting Run...');

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

      const font = `${run.italic ? 'italic ' : ''}${run.bold ? 'bold ' : ''}${run.size || 11}px ${run.font || 'Arial'}, serif`; // Add fallback for fonts
      ctx.font = font;
      const m = ctx.measureText(run.text);
      const w = m.width;
      // Estimate height and ascender since standard TextMetrics not always full
      // Simple estimation: height ~ size * 1.2, ascender ~ size * 0.9
      const size = run.size || 11;
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

        // Apply Effects
        this.resetEffects(ctx);
        if (run.effects) {
          this.applyEffects(ctx, run.effects);
        }

        // Fill
        if (run.fill) {
          if (run.fill.type === 'gradient' && run.fill.gradient) {
            const g = run.fill.gradient;
            // Text Gradient Box: bounding box of this run
            // Text Gradient Box: bounding box of this run
            const angle = g.angle !== undefined ? g.angle : 90;
            // Removed unused angle for now or use it if needed for linear gradient direction calculation
            // const angleRad = (angle * Math.PI) / 180;

            // Simplified vertical gradient mapping for text
            // For text, especially simple WordArt, vertical gradient usually spans the text height
            const gx1 = currentX;
            // Top of text bounding box approx
            const gy1 = baselineY - item.ascender;
            const gx2 = currentX;
            const gy2 = baselineY + (item.height - item.ascender); // descender part

            const gradient = ctx.createLinearGradient(gx1, gy1, gx1, gy2);
            g.stops.forEach(stop => {
              gradient.addColorStop(stop.position, `#${stop.color}`);
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
              pCtx.fillStyle = `#${p.backgroundColor}`;
              pCtx.fillRect(0, 0, size, size);
              pCtx.strokeStyle = `#${p.foregroundColor}`;
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
            ctx.fillStyle = `#${run.fill.color}`;
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
          ctx.strokeStyle = `#${run.outline.color}`;
          ctx.strokeText(run.text, currentX, baselineY);
        }

        currentX += runW;
      });

      // Move to next line
      currentY += line.maxHeight;
    });
  }
}
