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
      color?: string; // Hex with alpha
      opacity?: number;
    };
    stroke?: {
      color?: string;
      width?: number; // pixels
      type?: 'solid' | 'dash' | 'dot' | 'none';
      headEnd?: { type: string; width?: string; length?: string };
      tailEnd?: { type: string; width?: string; length?: string };
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
      color?: string;
    }>;
    align?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
  };
}
