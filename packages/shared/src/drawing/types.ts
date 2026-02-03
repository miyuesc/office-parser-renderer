/**
 * Core interfaces for DrawingML.
 */

export interface ITransform {
  off: { x: number; y: number }; // Offset (EMU)
  ext: { cx: number; cy: number }; // Extent (EMU)
  rot?: number; // Rotation (60000th of a degree)
  flipH?: boolean;
  flipV?: boolean;
}

export interface IGeometry {
  type: 'preset' | 'custom';
  prst?: string; // e.g., 'rect'
  path?: string; // SVG Path data
}

export interface IShape {
  id: string;
  name: string;
  xfrm: ITransform;
  geometry: IGeometry;
  style?: any; // To be linked with shared/styles later
}
