import { PresetGeometries } from './PresetGeometries';

/**
 * Engine for generating SVG paths from DrawingML geometries.
 */
export class ShapeEngine {
  /**
   * Generates SVG path data for a given preset geometry.
   * @param prst The preset geometry name (e.g., 'rect', 'ellipse').
   * @param width Width of the shape in pixels.
   * @param height Height of the shape in pixels.
   * @param adjustments Optional adjustment values.
   */
  static getShapePath(prst: string, width: number, height: number, adjustments?: Record<string, number>): string {
    return PresetGeometries.getPath(prst, width, height, adjustments);
  }
}
