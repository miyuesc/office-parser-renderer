import type { DrawingPosition } from './DrawingCommon';
import type { DrawingElement } from './DrawingElement';

export interface OfficeShape {
  id: string;
  name?: string;
  type: 'shape' | 'connector' | 'group';

  // Position and Transform (similar to Image)
  position: DrawingPosition;

  // Geometry
  geometry: {
    type: 'preset' | 'custom';
    preset?: string; // e.g., 'rect', 'ellipse', 'rightArrow'
    path?: string; // SVG Path for custom or converted preset
    adjustments?: Record<string, number>; // adjustment values (name -> value)
  };

  // Styling
  style: {
    fill?: {
      type: 'solid' | 'gradient' | 'pattern' | 'none';
      color?: string; // Hex with alpha (for solid)
      opacity?: number;
      gradient?: {
        type: 'linear' | 'radial';
        angle?: number; // degrees
        stops: Array<{ position: number; color: string }>;
      };
      pattern?: {
        preset: string; // e.g., 'diagStripe', 'cross'
        foregroundColor: string; // fgClr
        backgroundColor: string; // bgClr
      };
    };
    stroke?: {
      color?: string;
      width?: number; // pixels
      type?: 'solid' | 'dash' | 'dot' | 'none';
      headEnd?: { type: string; width?: string; length?: string };
      tailEnd?: { type: string; width?: string; length?: string };
    };
    effects?: {
      shadow?: {
        color: string;
        blur: number;
        offsetX: number;
        offsetY: number;
        alpha?: number;
      };
      glow?: {
        color: string;
        radius: number;
        alpha?: number;
      };
    };
  };

  // Text Content
  text?: {
    kind?: 'text' | 'wordart';
    content: string;
    runs?: Array<{
      text: string;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strike?: boolean;
      size?: number;
      font?: string;
      color?: string; // or fill?
      highlight?: string;
      fill?: {
        type: 'solid' | 'gradient' | 'pattern' | 'none';
        color?: string;
        gradient?: {
          type: 'linear' | 'radial';
          angle?: number;
          stops: Array<{ position: number; color: string }>;
        };
        pattern?: {
          preset: string; // e.g., 'diagStripe', 'cross'
          foregroundColor: string; // fgClr
          backgroundColor: string; // bgClr
        };
      };
      outline?: {
        color: string;
        width: number;
      };
      effects?: {
        shadow?: {
          color: string;
          blur: number;
          offsetX: number;
          offsetY: number;
          alpha?: number;
        };
        glow?: {
          color: string;
          radius: number;
          alpha?: number;
        };
      };
    }>;
    align?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
    warp?: {
      preset: string; // prstTxWarp
      adjustments?: Record<string, number>;
    };
    wrap?: boolean;
  };
  groupTransform?: {
    childOffsetX: number;
    childOffsetY: number;
    childWidth: number;
    childHeight: number;
    scaleX: number;
    scaleY: number;
  };
  children?: DrawingElement[];
}
