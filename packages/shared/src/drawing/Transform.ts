import { ITransform } from './types';
import { UnitConversion } from '../core/UnitConversion';

/**
 * Utilities for handling DrawingML transforms.
 */
export class Transform {
  /**
   * Generates a CSS transform string from an ITransform object.
   * Note: We usually apply position (off) via 'left'/'top' styles,
   * and rotation/flip via 'transform' property.
   * This method focuses on the 'transform' property (rotation, scale, flip).
   */
  static toCSSTransform(xfrm: ITransform): string {
    const transforms: string[] = [];

    // Rotation
    if (xfrm.rot) {
      // 60000th of a degree -> degree
      const deg = xfrm.rot / 60000;
      transforms.push(`rotate(${deg}deg)`);
    }

    // Flip
    if (xfrm.flipH) {
      transforms.push('scaleX(-1)');
    }
    if (xfrm.flipV) {
      transforms.push('scaleY(-1)');
    }

    return transforms.join(' ');
  }

  /**
   * Helper to get CSS style object for positioning.
   */
  static toCSSStyle(xfrm: ITransform): Record<string, string> {
    const left = UnitConversion.emuToPixel(xfrm.off.x);
    const top = UnitConversion.emuToPixel(xfrm.off.y);
    const width = UnitConversion.emuToPixel(xfrm.ext.cx);
    const height = UnitConversion.emuToPixel(xfrm.ext.cy);

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      transform: this.toCSSTransform(xfrm)
    };
  }
}
