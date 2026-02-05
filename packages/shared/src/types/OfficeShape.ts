export interface OfficeShape {
  id: string;
  name?: string;
  type: 'shape' | 'connector' | 'group';

  // Position and Transform (similar to Image)
  position: {
    type: 'absolute' | 'oneCellAnchor' | 'twoCellAnchor';
    x?: number; // pixel (absolute)
    y?: number; // pixel
    width: number; // pixel
    height: number; // pixel

    // Anchors (Excel specific, but good to keep in structure)
    from?: { col: number; colOff: number; row: number; rowOff: number };
    to?: { col: number; colOff: number; row: number; rowOff: number };

    rotation?: number; // degrees
    flipH?: boolean;
    flipV?: boolean;
  };

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
    content: string;
    runs?: Array<{
      text: string;
      bold?: boolean;
      italic?: boolean;
      size?: number;
      font?: string;
      color?: string; // or fill?
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
}
