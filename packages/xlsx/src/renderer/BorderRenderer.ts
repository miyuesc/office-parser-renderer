import { Worksheet, Styles, BorderPr, Border } from '../parser/types';
import { BorderConflictResolver, IBorder, BorderStyle } from '@opr/shared';

export interface DrawCmd {
  x: number;
  y: number;
  len: number;
  isVertical: boolean; // true = vertical (Left/Right), false = horizontal (Top/Bottom)
  border: IBorder;
}

export class BorderRenderer {
  /**
   * Calculate border drawing commands for a single cell.
   * Resolves conflicts with neighbors and aggregates commands into a Map.
   */
  static calculateBordersForCell(
    worksheet: Worksheet,
    styles: Styles,
    cmds: Map<string, DrawCmd>,
    r: number,
    c: number,
    rowSpan: number,
    colSpan: number,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    const getStyleBorder = (rr: number, cc: number): Border | undefined => {
      const row = worksheet.rows.get(rr);
      if (!row) return undefined;
      const cell = row.cells.get(cc);
      if (!cell || cell.styleId === undefined) return undefined;
      const xf = styles.cellXfs[cell.styleId];
      if (!xf) return undefined;
      return styles.borders[xf.borderId];
    };

    const myBorder = getStyleBorder(r, c);

    const toShared = (pr?: BorderPr): IBorder | undefined => {
      if (!pr || !pr.style || pr.style === 'none') return undefined;
      let style: BorderStyle = 'solid';
      let width = 1;
      switch (pr.style) {
        case 'medium':
          width = 2;
          break;
        case 'thick':
          width = 3;
          break;
        case 'double':
          width = 3;
          style = 'double';
          break;
        case 'dashed':
          style = 'dashed';
          break;
        case 'dotted':
          style = 'dotted';
          break;
        default:
          width = 1;
          style = 'solid';
      }
      return { style, width, color: pr.color || '#000000' };
    };

    const resolve = (b1?: BorderPr, b2?: BorderPr) => {
      return BorderConflictResolver.resolve(toShared(b1), toShared(b2));
    };

    // 1. Right Edge
    const rightKey = `V-${r}-${c + colSpan}`;
    if (!cmds.has(rightKey)) {
      const neighbor = getStyleBorder(r, c + colSpan);
      const winner = resolve(myBorder?.right, neighbor?.left);
      if (winner) {
        cmds.set(rightKey, {
          x: x + w,
          y: y,
          len: h,
          isVertical: true,
          border: winner
        });
      }
    }

    // 2. Bottom Edge
    const bottomKey = `H-${r + rowSpan}-${c}`;
    if (!cmds.has(bottomKey)) {
      // Neighbor is row + rowSpan
      const neighbor = getStyleBorder(r + rowSpan, c);
      const winner = resolve(myBorder?.bottom, neighbor?.top);
      if (winner) {
        cmds.set(bottomKey, {
          x: x,
          y: y + h,
          len: w,
          isVertical: false,
          border: winner
        });
      }
    }

    // 3. Left Edge
    const leftKey = `V-${r}-${c}`;
    if (!cmds.has(leftKey)) {
      const neighbor = getStyleBorder(r, c - 1);
      const winner = resolve(myBorder?.left, neighbor?.right);
      if (winner) {
        cmds.set(leftKey, { x, y, len: h, isVertical: true, border: winner });
      }
    }

    // 4. Top Edge
    const topKey = `H-${r}-${c}`;
    if (!cmds.has(topKey)) {
      const neighbor = getStyleBorder(r - 1, c);
      const winner = resolve(myBorder?.top, neighbor?.bottom);
      if (winner) {
        cmds.set(topKey, { x, y, len: w, isVertical: false, border: winner });
      }
    }
  }

  /**
   * Render a single border command to the canvas.
   * Handles clipping logic for frozen panes.
   */
  static renderCmd(
    ctx: CanvasRenderingContext2D,
    cmd: DrawCmd,
    frozenRows: number,
    frozenCols: number,
    fixedWidth: number,
    fixedHeight: number
  ) {
    const cx = cmd.isVertical ? cmd.x : cmd.x + cmd.len / 2;
    const cy = cmd.isVertical ? cmd.y + cmd.len / 2 : cmd.y;

    ctx.save();
    ctx.beginPath();

    // Clipping Logic to handle scrolling under locked panes
    if (cx <= fixedWidth && cy <= fixedHeight) {
      // Top-Left corner (locked-locked)
      ctx.rect(0, 0, fixedWidth + 1, fixedHeight + 1);
    } else if (cx <= fixedWidth) {
      // Left pane (locked col, scrolling row)
      ctx.rect(0, fixedHeight, fixedWidth + 1, 99999);
    } else if (cy <= fixedHeight) {
      // Top pane (scrolling col, locked row)
      ctx.rect(fixedWidth, 0, 99999, fixedHeight + 1);
    } else {
      // Main body (scrolling both)
      ctx.rect(fixedWidth, fixedHeight, 99999, 99999);
    }
    ctx.clip();

    ctx.lineWidth = cmd.border.width;
    ctx.strokeStyle = cmd.border.color;

    if (cmd.border.style === 'dashed') ctx.setLineDash([5, 5]);
    else if (cmd.border.style === 'dotted') ctx.setLineDash([2, 2]);
    else ctx.setLineDash([]);

    ctx.beginPath();
    // Offset by 0.5 to align with pixel grid for 1px width
    const offset = cmd.border.width % 2 !== 0 ? 0.5 : 0;

    if (cmd.isVertical) {
      ctx.moveTo(Math.floor(cmd.x) + offset, Math.floor(cmd.y));
      ctx.lineTo(Math.floor(cmd.x) + offset, Math.floor(cmd.y + cmd.len));
    } else {
      ctx.moveTo(Math.floor(cmd.x), Math.floor(cmd.y) + offset);
      ctx.lineTo(Math.floor(cmd.x + cmd.len), Math.floor(cmd.y) + offset);
    }
    ctx.stroke();
    ctx.restore();
  }
}
