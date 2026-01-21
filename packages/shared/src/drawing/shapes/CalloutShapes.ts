import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';
import { ShapeGenerator, ShapeResult } from './types';
import { GeoUtils } from './GeoUtils';

/**
 * 标注形状
 * wedge 系列：主体 + 尖角，作为一个整体填充
 * callout 系列：主体（填充）+ 连线（noFill），需要分开处理
 */
export const CalloutShapes: Record<string, ShapeGenerator> = {
  // Wedge 系列 - 一体式形状，正常填充
  [ST_ShapeType.wedgeRectCallout]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 66667; // tail X position

    const bh = h * 0.75; // box height
    const tailX = w * (adj1 / 100000);
    const tailY = h;
    const wedgeW = w * 0.15;
    return (
      `M 0 0 L ${w} 0 L ${w} ${bh} ` +
      `L ${tailX + wedgeW / 2} ${bh} L ${tailX} ${tailY} L ${tailX - wedgeW / 2} ${bh} ` +
      `L 0 ${bh} Z`
    );
  },

  [ST_ShapeType.wedgeRoundRectCallout]: (w, h, _adj) => {
    const r = Math.min(w, h) * 0.1;
    const bh = h * 0.75;
    const tailX = w * 0.5;
    const tailY = h;
    const wedgeW = w * 0.15;
    return (
      `M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${bh - r} A ${r} ${r} 0 0 1 ${w - r} ${bh} ` +
      `L ${tailX + wedgeW / 2} ${bh} L ${tailX} ${tailY} L ${tailX - wedgeW / 2} ${bh} ` +
      `L ${r} ${bh} A ${r} ${r} 0 0 1 0 ${bh - r} L 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`
    );
  },

  /**
   * 椭圆形标注
   * OOXML 规范: 椭圆主体 + 楔形尖角指示器
   * adj1: 尖角 X 位置（相对于中心的偏移）
   * adj2: 尖角 Y 位置
   */
  [ST_ShapeType.wedgeEllipseCallout]: (w, h, adj) => {
    // 默认尖角在左下方
    const adj1 = adj?.['adj1'] ?? -20833;
    const adj2 = adj?.['adj2'] ?? 120000;

    // 椭圆参数：椭圆占据上半部分
    const rx = w / 2;
    const ry = h * 0.35;
    const cx = w / 2;
    const cy = ry;

    // 尖角目标位置
    const tailX = cx + (w * adj1) / 100000;
    const tailY = Math.min((h * adj2) / 100000, h);

    // 尖角连接点：椭圆底部两侧
    // 根据尖角方向确定连接点角度
    const tailDir = tailX < cx ? 1 : -1; // 尖角在左边还是右边
    const angle1 = Math.PI / 2 + tailDir * 0.3; // 约 117° 或 63°
    const angle2 = Math.PI / 2 + tailDir * 0.8; // 约 135° 或 45°

    const x1 = cx + rx * Math.cos(angle1);
    const y1 = cy + ry * Math.sin(angle1);
    const x2 = cx + rx * Math.cos(angle2);
    const y2 = cy + ry * Math.sin(angle2);

    // 从椭圆顶部开始顺时针绘制，在尖角位置插入楔形
    return (
      // 从椭圆顶部中央开始
      `M ${cx} 0 ` +
      // 画右半椭圆到 x1, y1（第一个连接点）
      `A ${rx} ${ry} 0 0 1 ${x1} ${y1} ` +
      // 画尖角
      `L ${tailX} ${tailY} ` +
      `L ${x2} ${y2} ` +
      // 继续画剩余椭圆，回到起点
      `A ${rx} ${ry} 0 0 1 ${cx} 0 Z`
    );
  },

  [ST_ShapeType.cloudCallout]: (w, h, _adj) => {
    // 云朵形状 + 尖角
    const cloud =
      `M ${w * 0.2} ${h * 0.55} ` +
      `C ${w * 0.05} ${h * 0.55} ${w * 0.05} ${h * 0.3} ${w * 0.2} ${h * 0.25} ` +
      `C ${w * 0.2} ${h * 0.1} ${w * 0.4} ${h * 0.05} ${w * 0.5} ${h * 0.15} ` +
      `C ${w * 0.6} ${h * 0.05} ${w * 0.85} ${h * 0.1} ${w * 0.85} ${h * 0.3} ` +
      `C ${w} ${h * 0.35} ${w} ${h * 0.55} ${w * 0.85} ${h * 0.6} ` +
      `C ${w * 0.9} ${h * 0.75} ${w * 0.7} ${h * 0.75} ${w * 0.6} ${h * 0.7} ` +
      `C ${w * 0.5} ${h * 0.8} ${w * 0.3} ${h * 0.75} ${w * 0.2} ${h * 0.55} Z`;
    // 小云朵泡泡作为尖角
    const tail =
      GeoUtils.ellipse(w * 0.15, h * 0.85, w * 0.05, h * 0.05) +
      ' ' +
      GeoUtils.ellipse(w * 0.1, h * 0.93, w * 0.03, h * 0.03);
    return cloud + ' ' + tail;
  },

  // Border/Accent Callouts - 返回 ShapeResult，连线部分 noFill
  // 注意：这些形状在 OOXML 中通常作为两部分：矩形主体 + 连线
  // 为简化处理，我们将连线作为路径的一部分，并在渲染层处理 noFill

  [ST_ShapeType.borderCallout1]: (w, h, adj): ShapeResult => {
    const adj1 = adj?.['adj1'] ?? 18750;
    const adj2 = adj?.['adj2'] ?? -8333;
    const adj3 = adj?.['adj3'] ?? 112500;
    const adj4 = adj?.['adj4'] ?? -38333;

    const bx = w * (adj1 / 100000);
    const by = h * (adj2 / 100000 + 1);
    const tx = w * (adj3 / 100000);
    const ty = h * (adj4 / 100000 + 1);

    // 主体矩形（填充）
    const box = `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
    // 连线（只描边）
    const line = `M ${bx} ${Math.min(by, h)} L ${tx} ${ty}`;

    return {
      path: box,
      noFill: false,
      strokePath: line
    };
  },

  [ST_ShapeType.borderCallout2]: (w, h): ShapeResult => {
    const boxH = h * 0.7;
    const box = `M 0 0 L ${w} 0 L ${w} ${boxH} L 0 ${boxH} Z`;
    const line = `M ${w * 0.5} ${boxH} L ${w * 0.3} ${h * 0.85} L ${w * 0.2} ${h}`;

    return {
      path: box,
      noFill: false,
      strokePath: line
    };
  },

  [ST_ShapeType.borderCallout3]: (w, h): ShapeResult => {
    const boxH = h * 0.7;
    const box = `M 0 0 L ${w} 0 L ${w} ${boxH} L 0 ${boxH} Z`;
    const line = `M ${w * 0.5} ${boxH} L ${w * 0.5} ${h * 0.8} L ${w * 0.3} ${h * 0.8} L ${w * 0.2} ${h}`;

    return {
      path: box,
      noFill: false,
      strokePath: line
    };
  },

  // Accent Callouts - 带强调线的标注
  // 主体矩形（填充）+ 强调线 + 指示线（strokePath）

  /**
   * 强调标注1
   * OOXML 规范: 矩形 + 左侧强调线 + 直线指示器
   */
  [ST_ShapeType.accentCallout1]: (w, h, adj): ShapeResult => {
    const adj4 = adj?.['adj4'] ?? -38333;
    const boxH = h * 0.7;
    const accentX = w * 0.08;
    const lineEndX = w * (adj4 / 100000 + 1);

    const box = `M 0 0 L ${w} 0 L ${w} ${boxH} L 0 ${boxH} Z`;
    // 强调线 + 指示线作为 strokePath
    const strokeLines = `M ${accentX} 0 L ${accentX} ${boxH} M ${w * 0.5} ${boxH} L ${lineEndX} ${h}`;

    return {
      path: box,
      noFill: false,
      strokePath: strokeLines
    };
  },

  /**
   * 强调标注2
   * OOXML 规范: 矩形 + 左侧强调线 + 折线指示器
   */
  [ST_ShapeType.accentCallout2]: (w, h): ShapeResult => {
    const boxH = h * 0.7;
    const accentX = w * 0.08;

    const box = `M 0 0 L ${w} 0 L ${w} ${boxH} L 0 ${boxH} Z`;
    const strokeLines = `M ${accentX} 0 L ${accentX} ${boxH} M ${w * 0.5} ${boxH} L ${w * 0.3} ${h * 0.85} L ${
      w * 0.2
    } ${h}`;

    return {
      path: box,
      noFill: false,
      strokePath: strokeLines
    };
  },

  /**
   * 强调标注3
   * OOXML 规范: 矩形 + 左侧强调线 + 双折线指示器
   */
  [ST_ShapeType.accentCallout3]: (w, h): ShapeResult => {
    const boxH = h * 0.7;
    const accentX = w * 0.08;

    const box = `M 0 0 L ${w} 0 L ${w} ${boxH} L 0 ${boxH} Z`;
    const strokeLines = `M ${accentX} 0 L ${accentX} ${boxH} M ${w * 0.5} ${boxH} L ${w * 0.5} ${h * 0.8} L ${
      w * 0.3
    } ${h * 0.8} L ${w * 0.2} ${h}`;

    return {
      path: box,
      noFill: false,
      strokePath: strokeLines
    };
  },

  // 普通 Callouts - 使用 strokePath 分离指示线
  [ST_ShapeType.callout1]: (w, h): ShapeResult => {
    const boxH = h * 0.7;
    return {
      path: `M 0 0 L ${w} 0 L ${w} ${boxH} L 0 ${boxH} Z`,
      noFill: false,
      strokePath: `M ${w * 0.5} ${boxH} L ${w * 0.2} ${h}`
    };
  },

  [ST_ShapeType.callout2]: (w, h): ShapeResult => {
    const boxH = h * 0.7;
    return {
      path: `M 0 0 L ${w} 0 L ${w} ${boxH} L 0 ${boxH} Z`,
      noFill: false,
      strokePath: `M ${w * 0.5} ${boxH} L ${w * 0.3} ${h * 0.85} L ${w * 0.2} ${h}`
    };
  },

  [ST_ShapeType.callout3]: (w, h): ShapeResult => {
    const boxH = h * 0.7;
    return {
      path: `M 0 0 L ${w} 0 L ${w} ${boxH} L 0 ${boxH} Z`,
      noFill: false,
      strokePath: `M ${w * 0.5} ${boxH} L ${w * 0.5} ${h * 0.8} L ${w * 0.3} ${h * 0.8} L ${w * 0.2} ${h}`
    };
  },

  // Accent Border Callouts - 使用 strokePath 分离指示线和强调线
  [ST_ShapeType.accentBorderCallout1]: (w, h): ShapeResult => {
    const boxH = h * 0.7;
    const accentX = w * 0.08;
    return {
      path: `M 0 0 L ${w} 0 L ${w} ${boxH} L 0 ${boxH} Z`,
      noFill: false,
      strokePath: `M ${accentX} 0 L ${accentX} ${boxH} M ${w * 0.5} ${boxH} L ${w * 0.2} ${h}`
    };
  },

  [ST_ShapeType.accentBorderCallout2]: (w, h): ShapeResult => {
    const boxH = h * 0.7;
    const accentX = w * 0.08;
    return {
      path: `M 0 0 L ${w} 0 L ${w} ${boxH} L 0 ${boxH} Z`,
      noFill: false,
      strokePath: `M ${accentX} 0 L ${accentX} ${boxH} M ${w * 0.5} ${boxH} L ${w * 0.3} ${h * 0.85} L ${w * 0.2} ${h}`
    };
  },

  [ST_ShapeType.accentBorderCallout3]: (w, h): ShapeResult => {
    const boxH = h * 0.7;
    const accentX = w * 0.08;
    return {
      path: `M 0 0 L ${w} 0 L ${w} ${boxH} L 0 ${boxH} Z`,
      noFill: false,
      strokePath: `M ${accentX} 0 L ${accentX} ${boxH} M ${w * 0.5} ${boxH} L ${w * 0.5} ${h * 0.8} L ${w * 0.3} ${
        h * 0.8
      } L ${w * 0.2} ${h}`
    };
  }
};
