import { generators } from './geometries';
import { getStarPath, getRect } from './geometries/primitives';

export class PresetGeometries {
  static getPath(prst: string, w: number, h: number, adj?: Record<string, number>): string {
    const fn = generators[prst];
    if (fn) return fn(w, h, adj);

    // Fallbacks
    if (prst.startsWith('star')) {
      const pts = parseInt(prst.replace('star', ''));
      if (!isNaN(pts)) return getStarPath(w, h, pts, adj);
    }

    // Default to Rect
    return getRect(w, h, adj);
  }
}
