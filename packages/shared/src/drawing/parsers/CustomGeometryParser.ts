import { XmlUtils } from '../../xml';

export class CustomGeometryParser {
  static parseCustomGeometry(custGeom: Element): { path: string; w?: number; h?: number } {
    const pathLst = XmlUtils.query(custGeom, 'a\\:pathLst');
    if (!pathLst) return { path: '' };

    let d = '';
    let totalW: number | undefined;
    let totalH: number | undefined;

    // Helper to parse coordinate
    const getCoord = (val: string | null) => {
      if (!val) return 0;
      const num = parseInt(val, 10);
      return isNaN(num) ? 0 : num; // If it's a variable string, we default to 0 for now (TODO: gdLst support)
    };

    const paths = XmlUtils.queryAll(pathLst, 'a\\:path');
    paths.forEach(p => {
      const w = parseInt(p.getAttribute('w') || '0', 10);
      const h = parseInt(p.getAttribute('h') || '0', 10);
      if (!totalW && w > 0) totalW = w;
      if (!totalH && h > 0) totalH = h;

      let currentX = 0;
      let currentY = 0;

      Array.from(p.children).forEach(cmd => {
        const tagName = cmd.tagName.split(':').pop(); // remove prefix
        switch (tagName) {
          case 'moveTo': {
            const pt = XmlUtils.query(cmd, 'a\\:pt');
            if (pt) {
              const x = getCoord(pt.getAttribute('x'));
              const y = getCoord(pt.getAttribute('y'));
              d += `M ${x} ${y} `;
              currentX = x;
              currentY = y;
            }
            break;
          }
          case 'lnTo': {
            const pt = XmlUtils.query(cmd, 'a\\:pt');
            if (pt) {
              const x = getCoord(pt.getAttribute('x'));
              const y = getCoord(pt.getAttribute('y'));
              d += `L ${x} ${y} `;
              currentX = x;
              currentY = y;
            }
            break;
          }
          case 'cubicBezTo': {
            const pts = XmlUtils.queryAll(cmd, 'a\\:pt');
            if (pts.length === 3) {
              const x1 = getCoord(pts[0].getAttribute('x'));
              const y1 = getCoord(pts[0].getAttribute('y'));
              const x2 = getCoord(pts[1].getAttribute('x'));
              const y2 = getCoord(pts[1].getAttribute('y'));
              const x3 = getCoord(pts[2].getAttribute('x'));
              const y3 = getCoord(pts[2].getAttribute('y'));
              d += `C ${x1} ${y1} ${x2} ${y2} ${x3} ${y3} `;
              currentX = x3;
              currentY = y3;
            }
            break;
          }
          case 'quadBezTo': {
            const pts = XmlUtils.queryAll(cmd, 'a\\:pt');
            if (pts.length === 2) {
              const x1 = getCoord(pts[0].getAttribute('x'));
              const y1 = getCoord(pts[0].getAttribute('y'));
              const x2 = getCoord(pts[1].getAttribute('x'));
              const y2 = getCoord(pts[1].getAttribute('y'));
              d += `Q ${x1} ${y1} ${x2} ${y2} `;
              currentX = x2;
              currentY = y2;
            }
            break;
          }
          case 'arcTo': {
            // OOXML arcTo: wR, hR, stAng (start angle), swAng (swing angle)
            // Angles in 60000ths of a degree.
            const wR = getCoord(cmd.getAttribute('wR'));
            const hR = getCoord(cmd.getAttribute('hR'));
            const stAng = parseInt(cmd.getAttribute('stAng') || '0', 10) / 60000;
            const swAng = parseInt(cmd.getAttribute('swAng') || '0', 10) / 60000;

            // Calculate end point
            // The arc is part of an ellipse centered at some point (cx, cy).
            // BUT OOXML arcTo does not specify center. It starts at current point.
            // Current point corresponds to angle stAng on the ellipse.
            // P_start = (cx + wR * cos(stAng), cy + hR * sin(stAng)) = (currentX, currentY)
            // So cx = currentX - wR * cos(stAng)
            //    cy = currentY - hR * sin(stAng)

            const stRad = (stAng * Math.PI) / 180;
            const swRad = (swAng * Math.PI) / 180;
            const endRad = stRad + swRad;

            const cx = currentX - wR * Math.cos(stRad);
            const cy = currentY - hR * Math.sin(stRad);

            const endX = cx + wR * Math.cos(endRad);
            const endY = cy + hR * Math.sin(endRad);

            // SVG Arc: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
            const largeArcFlag = Math.abs(swAng) >= 180 ? 1 : 0;
            const sweepFlag = swAng > 0 ? 1 : 0;

            d += `A ${wR} ${hR} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY} `;

            currentX = endX;
            currentY = endY;
            break;
          }
          case 'close': {
            d += 'Z ';
            break;
          }
        }
      });
    });
    return { path: d.trim(), w: totalW, h: totalH };
  }
}
