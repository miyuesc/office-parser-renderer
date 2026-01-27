/**
 * 自定义几何解析器
 *
 * 解析 DrawingML 中的自定义几何形状定义 (a:custGeom)，
 * 将 OOXML 路径命令转换为 SVG 路径数据
 */
import { XmlUtils } from '../../core/xml';

export class CustomGeometryParser {
  /**
   * 解析自定义几何形状
   *
   * 支持的路径命令：
   * - moveTo: 移动到点
   * - lnTo: 直线到点
   * - cubicBezTo: 三次贝塞尔曲线
   * - quadBezTo: 二次贝塞尔曲线
   * - arcTo: 椭圆弧
   * - close: 闭合路径
   *
   * @param custGeom - custGeom 元素节点
   * @returns 包含 SVG 路径数据和坐标系尺寸的对象
   */
  static parseCustomGeometry(custGeom: Element): { path: string; w?: number; h?: number } {
    const pathLst = XmlUtils.query(custGeom, 'a\\:pathLst');
    if (!pathLst) return { path: '' };

    let d = '';
    let totalW: number | undefined;
    let totalH: number | undefined;

    /**
     * 解析坐标值
     * @param val - 坐标字符串
     * @returns 数值（变量字符串暂时返回 0，TODO: 支持 gdLst）
     */
    const getCoord = (val: string | null) => {
      if (!val) return 0;
      const num = parseInt(val, 10);
      return isNaN(num) ? 0 : num;
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
        const tagName = cmd.tagName.split(':').pop(); // 移除命名空间前缀
        switch (tagName) {
          case 'moveTo': {
            // 移动到点
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
            // 直线到点
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
            // 三次贝塞尔曲线（3 个控制点）
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
            // 二次贝塞尔曲线（2 个控制点）
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
            // 椭圆弧
            // OOXML arcTo 参数：wR(水平半径), hR(垂直半径),
            // stAng(起始角度), swAng(扫过角度)
            // 角度单位：60000 分之一度
            const wR = getCoord(cmd.getAttribute('wR'));
            const hR = getCoord(cmd.getAttribute('hR'));
            const stAng = parseInt(cmd.getAttribute('stAng') || '0', 10) / 60000;
            const swAng = parseInt(cmd.getAttribute('swAng') || '0', 10) / 60000;

            // 计算终点
            // 弧线是以某点 (cx, cy) 为中心的椭圆的一部分
            // 但 OOXML arcTo 不指定中心点，它从当前点开始
            // 当前点对应椭圆上 stAng 角度的位置
            // P_start = (cx + wR * cos(stAng), cy + hR * sin(stAng)) = (currentX, currentY)
            // 所以 cx = currentX - wR * cos(stAng)
            //      cy = currentY - hR * sin(stAng)

            const stRad = (stAng * Math.PI) / 180;
            const swRad = (swAng * Math.PI) / 180;
            const endRad = stRad + swRad;

            const cx = currentX - wR * Math.cos(stRad);
            const cy = currentY - hR * Math.sin(stRad);

            const endX = cx + wR * Math.cos(endRad);
            const endY = cy + hR * Math.sin(endRad);

            // SVG 弧线参数：A rx ry x-axis-rotation large-arc-flag sweep-flag x y
            const largeArcFlag = Math.abs(swAng) >= 180 ? 1 : 0;
            const sweepFlag = swAng > 0 ? 1 : 0;

            d += `A ${wR} ${hR} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY} `;

            currentX = endX;
            currentY = endY;
            break;
          }
          case 'close': {
            // 闭合路径
            d += 'Z ';
            break;
          }
        }
      });
    });
    return { path: d.trim(), w: totalW, h: totalH };
  }
}
