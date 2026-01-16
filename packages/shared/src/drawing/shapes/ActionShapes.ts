import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';
import { ShapeGenerator } from './types';
import { GeoUtils } from './GeoUtils';
import { Rectangles } from './Rectangles';

// Helper to create a button background + icon path
const createButton = (w: number, h: number, iconPath: string) => {
  // 1. Background: standard rounded rect or rect
  // But since we return a single path string, we concatenate.
  // However, 'd' attribute can just be concatenated paths.
  // Background:
  const bg = Rectangles[ST_ShapeType.roundRect](w, h); // Standard button shape
  return `${bg} ${iconPath}`;
};

export const ActionShapes: Record<string, ShapeGenerator> = {
  [ST_ShapeType.actionButtonBlank]: (w, h) => Rectangles[ST_ShapeType.roundRect](w, h),

  [ST_ShapeType.actionButtonHome]: (w, h) => {
    // House icon
    const iconW = w * 0.5;
    const iconH = h * 0.5;
    const cx = w / 2;
    const cy = h / 2;
    // Roof
    const roof = `M ${cx} ${cy - iconH / 2} L ${cx + iconW / 2} ${cy - iconH * 0.1} L ${cx - iconW / 2} ${
      cy - iconH * 0.1
    } Z`;
    // Body
    const body = `M ${cx - iconW * 0.35} ${cy - iconH * 0.1} L ${cx + iconW * 0.35} ${cy - iconH * 0.1} L ${
      cx + iconW * 0.35
    } ${cy + iconH / 2} L ${cx - iconW * 0.35} ${cy + iconH / 2} Z`;
    // Door
    const door = `M ${cx - iconW * 0.1} ${cy + iconH / 2} L ${cx - iconW * 0.1} ${cy + iconH * 0.2} L ${
      cx + iconW * 0.1
    } ${cy + iconH * 0.2} L ${cx + iconW * 0.1} ${cy + iconH / 2} Z`;

    return createButton(w, h, `${roof} ${body} ${door}`);
  },

  [ST_ShapeType.actionButtonHelp]: (w, h) => {
    // Question Mark
    // Simplified ? shape
    const cx = w / 2,
      cy = h / 2;
    const s = Math.min(w, h) * 0.15;
    // Dot
    const dot = GeoUtils.ellipse(cx, cy + s * 2, s / 2, s / 2);
    // Hook
    const hook = `M ${cx - s} ${cy - s} Q ${cx - s} ${cy - s * 3} ${cx} ${cy - s * 3} Q ${cx + s} ${cy - s * 3} ${
      cx + s
    } ${cy - s} Q ${cx + s} ${cy} ${cx} ${cy} L ${cx} ${cy + s}`;
    return createButton(w, h, `${dot} ${hook} M ${cx} ${cy + s} L ${cx} ${cy + s * 1.5}`);
  },

  [ST_ShapeType.actionButtonInformation]: (w, h) => {
    // i icon
    const cx = w / 2,
      cy = h / 2;
    const s = Math.min(w, h) * 0.1;
    // Dot
    const dot = GeoUtils.ellipse(cx, cy - s * 3, s, s);
    // Line
    const line = `M ${cx - s} ${cy - s} L ${cx + s} ${cy - s} L ${cx + s} ${cy + s * 3} L ${cx - s} ${cy + s * 3} Z`;
    return createButton(w, h, `${dot} ${line}`);
  },

  [ST_ShapeType.actionButtonForwardNext]: (w, h) => {
    // Right Triangle
    const cx = w / 2,
      cy = h / 2;
    const s = Math.min(w, h) * 0.25;
    const tri = `M ${cx - s * 0.5} ${cy - s} L ${cx + s} ${cy} L ${cx - s * 0.5} ${cy + s} Z`;
    return createButton(w, h, tri);
  },

  [ST_ShapeType.actionButtonBackPrevious]: (w, h) => {
    // Left Triangle
    const cx = w / 2,
      cy = h / 2;
    const s = Math.min(w, h) * 0.25;
    const tri = `M ${cx + s * 0.5} ${cy - s} L ${cx - s} ${cy} L ${cx + s * 0.5} ${cy + s} Z`;
    return createButton(w, h, tri);
  },

  [ST_ShapeType.actionButtonEnd]: (w, h) => {
    // Skip forward: Bar + Triangle
    const cx = w / 2,
      cy = h / 2;
    const s = Math.min(w, h) * 0.25;
    const tri = `M ${cx - s * 0.5} ${cy - s} L ${cx + s * 0.8} ${cy} L ${cx - s * 0.5} ${cy + s} Z`;
    const bar = `M ${cx + s * 0.8} ${cy - s} L ${cx + s * 1.2} ${cy - s} L ${cx + s * 1.2} ${cy + s} L ${
      cx + s * 0.8
    } ${cy + s} Z`;
    return createButton(w, h, `${tri} ${bar}`);
  },

  [ST_ShapeType.actionButtonBeginning]: (w, h) => {
    // Skip back: Bar + Triangle
    const cx = w / 2,
      cy = h / 2;
    const s = Math.min(w, h) * 0.25;
    const tri = `M ${cx + s * 0.5} ${cy - s} L ${cx - s * 0.8} ${cy} L ${cx + s * 0.5} ${cy + s} Z`;
    const bar = `M ${cx - s * 1.2} ${cy - s} L ${cx - s * 0.8} ${cy - s} L ${cx - s * 0.8} ${cy + s} L ${
      cx - s * 1.2
    } ${cy + s} Z`;
    return createButton(w, h, `${tri} ${bar}`);
  },

  [ST_ShapeType.actionButtonReturn]: (w, h) => {
    // U-turn arrow
    const cx = w / 2,
      cy = h / 2;
    const s = Math.min(w, h) * 0.25;
    // Simplified: <|___
    //             |
    const d = `M ${cx - s} ${cy} L ${cx + s * 0.5} ${cy} L ${cx + s * 0.5} ${cy - s * 0.5} L ${cx - s} ${
      cy - s * 0.5
    } M ${cx - s} ${cy - s} L ${cx - s * 1.5} ${cy - s * 0.25} L ${cx - s} ${cy + 0.5 * s} Z`;
    return createButton(w, h, d);
  },

  [ST_ShapeType.actionButtonDocument]: (w, h) => {
    // Document icon
    const cx = w / 2,
      cy = h / 2;
    const s = Math.min(w, h) * 0.25;
    const doc = `M ${cx - s} ${cy - s} L ${cx + s * 0.5} ${cy - s} L ${cx + s} ${cy - s * 0.5} L ${cx + s} ${
      cy + s
    } L ${cx - s} ${cy + s} Z`;
    return createButton(w, h, doc);
  },

  [ST_ShapeType.actionButtonSound]: (w, h) => {
    // Speaker icon
    const cx = w / 2,
      cy = h / 2;
    const s = Math.min(w, h) * 0.25;
    const spk = `M ${cx - s * 0.5} ${cy - s * 0.5} L ${cx} ${cy - s * 0.5} L ${cx + s} ${cy - s} L ${cx + s} ${
      cy + s
    } L ${cx} ${cy + s * 0.5} L ${cx - s * 0.5} ${cy + s * 0.5} Z`;
    return createButton(w, h, spk);
  },

  [ST_ShapeType.actionButtonMovie]: (w, h) => {
    // Film strip or camera
    const cx = w / 2,
      cy = h / 2;
    const s = Math.min(w, h) * 0.3;
    const cam = `M ${cx - s} ${cy - s * 0.6} L ${cx + s * 0.6} ${cy - s * 0.6} L ${cx + s * 0.6} ${cy + s * 0.6} L ${
      cx - s
    } ${cy + s * 0.6} Z M ${cx + s * 0.6} ${cy - s * 0.3} L ${cx + s} ${cy - s * 0.6} L ${cx + s} ${cy + s * 0.6} L ${
      cx + s * 0.6
    } ${cy + s * 0.3} Z`;
    return createButton(w, h, cam);
  }
};
