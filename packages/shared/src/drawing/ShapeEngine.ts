/**
 * Engine for generating SVG paths from DrawingML geometries.
 */
export class ShapeEngine {
  /**
   * Generates SVG path data for a given preset geometry.
   * @param prst The preset geometry name (e.g., 'rect', 'ellipse').
   * @param width Width of the shape in pixels.
   * @param height Height of the shape in pixels.
   */
  static getShapePath(prst: string, width: number, height: number): string {
    switch (prst) {
      case 'rect':
        return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`;

      case 'ellipse':
        // SVG Arc: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
        const rx = width / 2;
        const ry = height / 2;
        return `M 0 ${ry} A ${rx} ${ry} 0 1 1 ${width} ${ry} A ${rx} ${ry} 0 1 1 0 ${ry} Z`;

      case 'triangle':
        // Isosceles triangle
        return `M ${width / 2} 0 L ${width} ${height} L 0 ${height} Z`;

      case 'line':
        return `M 0 0 L ${width} ${height}`;

      default:
        // Fallback: full rectangle
        return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`;
    }
  }
}
