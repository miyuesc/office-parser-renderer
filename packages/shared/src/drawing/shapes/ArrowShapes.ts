import { ST_ShapeType } from '@ai-space/definitions/dml-shapeGeometry';
import { ShapeGenerator } from '../../types/shapes';

/**
 * 箭头形状
 * 基于 OOXML 规范实现
 */
export const ArrowShapes: Record<string, ShapeGenerator> = {
  /**
   * 右箭头
   */
  [ST_ShapeType.rightArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 50000;

    const headW = w * (adj2 / 100000);
    const neckH = h * (adj1 / 100000);
    const cy = h / 2;

    return (
      `M 0 ${cy - neckH / 2} ` +
      `L ${w - headW} ${cy - neckH / 2} ` +
      `L ${w - headW} 0 ` +
      `L ${w} ${cy} ` +
      `L ${w - headW} ${h} ` +
      `L ${w - headW} ${cy + neckH / 2} ` +
      `L 0 ${cy + neckH / 2} Z`
    );
  },

  /**
   * 左箭头
   */
  [ST_ShapeType.leftArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 50000;

    const headW = w * (adj2 / 100000);
    const neckH = h * (adj1 / 100000);
    const cy = h / 2;

    return (
      `M ${w} ${cy - neckH / 2} ` +
      `L ${headW} ${cy - neckH / 2} ` +
      `L ${headW} 0 ` +
      `L 0 ${cy} ` +
      `L ${headW} ${h} ` +
      `L ${headW} ${cy + neckH / 2} ` +
      `L ${w} ${cy + neckH / 2} Z`
    );
  },

  /**
   * 上箭头
   */
  [ST_ShapeType.upArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 50000;

    const headH = h * (adj2 / 100000);
    const neckW = w * (adj1 / 100000);
    const cx = w / 2;

    return (
      `M ${cx - neckW / 2} ${h} ` +
      `L ${cx - neckW / 2} ${headH} ` +
      `L 0 ${headH} ` +
      `L ${cx} 0 ` +
      `L ${w} ${headH} ` +
      `L ${cx + neckW / 2} ${headH} ` +
      `L ${cx + neckW / 2} ${h} Z`
    );
  },

  /**
   * 下箭头
   */
  [ST_ShapeType.downArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 50000;

    const headH = h * (adj2 / 100000);
    const neckW = w * (adj1 / 100000);
    const cx = w / 2;

    return (
      `M ${cx - neckW / 2} 0 ` +
      `L ${cx - neckW / 2} ${h - headH} ` +
      `L 0 ${h - headH} ` +
      `L ${cx} ${h} ` +
      `L ${w} ${h - headH} ` +
      `L ${cx + neckW / 2} ${h - headH} ` +
      `L ${cx + neckW / 2} 0 Z`
    );
  },

  /**
   * 左右双向箭头
   */
  [ST_ShapeType.leftRightArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 25000;

    const headW = w * (adj2 / 100000);
    const neckH = h * (adj1 / 100000);
    const cy = h / 2;
    const stemTop = cy - neckH / 2;
    const stemBot = cy + neckH / 2;

    // 从左箭头尖端开始顺时针绘制
    return (
      `M 0 ${cy} ` + // 左箭头尖端
      `L ${headW} 0 ` + // 左箭头上翼尖
      `L ${headW} ${stemTop} ` + // 左翼内角
      `L ${w - headW} ${stemTop} ` + // 柄顶边
      `L ${w - headW} 0 ` + // 右翼外角
      `L ${w} ${cy} ` + // 右箭头尖端
      `L ${w - headW} ${h} ` + // 右翼下尖
      `L ${w - headW} ${stemBot} ` + // 右翼内角
      `L ${headW} ${stemBot} ` + // 柄底边
      `L ${headW} ${h} Z` // 左翼下尖,闭合
    );
  },

  /**
   * 上下双向箭头
   */
  [ST_ShapeType.upDownArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 25000;

    const headH = h * (adj2 / 100000);
    const neckW = w * (adj1 / 100000);
    const cx = w / 2;
    const stemL = cx - neckW / 2;
    const stemR = cx + neckW / 2;

    return (
      `M ${cx} 0 ` + // 上箭头尖端
      `L ${w} ${headH} ` + // 上箭头右翼尖
      `L ${stemR} ${headH} ` + // 右翼内角
      `L ${stemR} ${h - headH} ` + // 柄右边
      `L ${w} ${h - headH} ` + // 下箭头右翼外角
      `L ${cx} ${h} ` + // 下箭头尖端
      `L 0 ${h - headH} ` + // 下箭头左翼尖
      `L ${stemL} ${h - headH} ` + // 左翼内角
      `L ${stemL} ${headH} ` + // 柄左边
      `L 0 ${headH} Z` // 上箭头左翼尖,闭合
    );
  },

  /**
   * 弯曲箭头 (L形)
   * OOXML 规范: 从底部开始，向右弯曲后向上指向
   * 使用贝塞尔曲线 (C 命令) 实现圆角弯曲效果
   * adj1: 箭头头部宽度比例 (默认 25000)
   * adj2: 箭头茎宽度比例 (默认 25000)
   * adj3: 箭头头部高度比例 (默认 25000)
   * adj4: 弯曲位置比例 (默认 43750)
   */
  [ST_ShapeType.bentArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000; // 箭头宽度
    const adj2 = adj?.['adj2'] ?? 25000; // 茎宽度
    const adj3 = adj?.['adj3'] ?? 25000; // 箭头高度

    const arrowW = w * (adj1 / 100000); // 箭头头部宽度
    const stemW = h * (adj2 / 100000); // 茎宽度
    const arrowH = h * (adj3 / 100000); // 箭头头部高度

    // 圆角半径 - 基于茎宽度
    const cornerR = stemW * 0.8;

    // 箭头中心 X 位置
    const arrowCenterX = w - arrowW / 2;

    // 内外轨道的 X 坐标

    // 从左下开始，顺时针绘制，使用贝塞尔曲线实现圆角
    return (
      `M 0 ${h} ` + // 左下角
      `V ${h - stemW + cornerR} ` + // 向上到外弧起点
      `C 0 ${h - stemW} ${cornerR} ${h - stemW} ${cornerR} ${h - stemW} ` + // 外圆角
      `H ${arrowCenterX - stemW / 2} ` + // 水平到箭头茎左边
      `V ${arrowH} ` + // 向上到箭头底部
      `H ${arrowCenterX - arrowW / 2} ` + // 箭头左翼
      `L ${w} 0 ` + // 箭头尖端
      `L ${arrowCenterX + arrowW / 2} ${arrowH} ` + // 箭头右翼
      `H ${arrowCenterX + stemW / 2} ` + // 回到茎右边
      `V ${h} Z` // 向下闭合
    );
  },

  /**
   * 曲线右箭头
   * OOXML 规范：弧形曲线箭头，从左侧弧形弯曲指向右侧
   * adj1: 箭头头部高度比例（默认 25000，范围 0-50000）
   * adj2: 茎宽度比例（默认 50000，范围 0-100000）
   * adj3: 弧线起始位置比例（默认 25000，范围 0-50000）
   */
  [ST_ShapeType.curvedRightArrow]: (w, h, adj) => {
    // 获取调整参数
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 50000;
    const adj3 = adj?.['adj3'] ?? 25000;

    // 基于 OOXML guide formulas 计算
    // 箭头头部高度
    const arrowHeadHeight = h * (adj1 / 100000);
    // 茎宽度（影响内外弧的间距）
    const stemWidth = h * (adj2 / 100000);
    // 弧线起始 Y 位置
    const arcStartY = h * (adj3 / 100000);

    // 弧线参数
    const outerRx = w;
    const outerRy = h * 0.5;
    const innerRx = w * 0.7;
    const innerRy = outerRy - stemWidth * 0.5;

    // 箭头尖端位置（右侧中偏下）
    const arrowTipX = w;
    const arrowTipY = h * 0.5 + arcStartY * 0.5;

    // 箭头翼位置
    const arrowWingX = w * 0.75;
    const arrowTopWingY = arrowTipY - arrowHeadHeight;
    const arrowBotWingY = arrowTipY + arrowHeadHeight;

    // 茎上下边界
    const stemTopY = arrowTipY - stemWidth * 0.25;
    const stemBotY = arrowTipY + stemWidth * 0.25;

    return (
      // 外弧起点（左上）
      `M 0 ${arcStartY} ` +
      // 外弧到箭头翼位置
      `A ${outerRx} ${outerRy} 0 0 0 ${arrowWingX} ${stemTopY} ` +
      // 到上翼尖
      `L ${arrowWingX} ${arrowTopWingY} ` +
      // 箭头尖端
      `L ${arrowTipX} ${arrowTipY} ` +
      // 下翼尖
      `L ${arrowWingX} ${arrowBotWingY} ` +
      // 回到茎下边
      `L ${arrowWingX} ${stemBotY} ` +
      // 内弧回到起点附近
      `A ${innerRx} ${innerRy} 0 0 1 ${w * 0.1} ${arcStartY + stemWidth * 0.5} ` +
      `Z`
    );
  },
  /**
   * 曲线左箭头
   * OOXML 规范：弧形曲线箭头，从右侧弧形弯曲指向左侧
   * adj1: 箭头头部高度比例（默认 25000）
   * adj2: 茎宽度比例（默认 50000）
   * adj3: 弧线起始位置比例（默认 25000）
   */
  [ST_ShapeType.curvedLeftArrow]: (w, h, adj) => {
    // 获取调整参数
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 50000;
    const adj3 = adj?.['adj3'] ?? 25000;

    // 基于 OOXML guide formulas 计算
    const arrowHeadHeight = h * (adj1 / 100000);
    const stemWidth = h * (adj2 / 100000);
    const arcStartY = h * (adj3 / 100000);

    // 弧线参数（镜像版本）
    const outerRx = w;
    const outerRy = h * 0.5;
    const innerRx = w * 0.7;
    const innerRy = outerRy - stemWidth * 0.5;

    // 箭头尖端位置（左侧中偏下）
    const arrowTipX = 0;
    const arrowTipY = h * 0.5 + arcStartY * 0.5;

    // 箭头翼位置
    const arrowWingX = w * 0.25;
    const arrowTopWingY = arrowTipY - arrowHeadHeight;
    const arrowBotWingY = arrowTipY + arrowHeadHeight;

    // 茎上下边界
    const stemTopY = arrowTipY - stemWidth * 0.25;
    const stemBotY = arrowTipY + stemWidth * 0.25;

    return (
      // 外弧起点（右上）
      `M ${w} ${arcStartY} ` +
      // 外弧到箭头翼位置
      `A ${outerRx} ${outerRy} 0 0 1 ${arrowWingX} ${stemTopY} ` +
      // 到上翼尖
      `L ${arrowWingX} ${arrowTopWingY} ` +
      // 箭头尖端
      `L ${arrowTipX} ${arrowTipY} ` +
      // 下翼尖
      `L ${arrowWingX} ${arrowBotWingY} ` +
      // 回到茎下边
      `L ${arrowWingX} ${stemBotY} ` +
      // 内弧回到起点附近
      `A ${innerRx} ${innerRy} 0 0 0 ${w * 0.9} ${arcStartY + stemWidth * 0.5} ` +
      `Z`
    );
  },

  /**
   * 曲线上箭头
   * OOXML 规范：弧形曲线箭头，从底部弧形弯曲向上指向
   * adj1: 箭头头部宽度比例（默认 25000）
   * adj2: 茎宽度比例（默认 50000）
   * adj3: 弧线起始位置比例（默认 25000）
   */
  [ST_ShapeType.curvedUpArrow]: (w, h, adj) => {
    // 获取调整参数
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 50000;
    const adj3 = adj?.['adj3'] ?? 25000;

    // 基于 OOXML guide formulas 计算
    const arrowHeadWidth = w * (adj1 / 100000);
    const stemWidth = w * (adj2 / 100000);
    const arcStartX = w * (adj3 / 100000);

    // 弧线参数
    const outerRx = w * 0.5;
    const outerRy = h;
    const innerRx = outerRx - stemWidth * 0.5;
    const innerRy = h * 0.7;

    // 箭头尖端位置（顶部中偏右）
    const arrowTipX = w * 0.5 + arcStartX * 0.5;
    const arrowTipY = 0;

    // 箭头翼位置
    const arrowWingY = h * 0.25;
    const arrowLeftWingX = arrowTipX - arrowHeadWidth;
    const arrowRightWingX = arrowTipX + arrowHeadWidth;

    // 茎左右边界
    const stemLeftX = arrowTipX - stemWidth * 0.25;
    const stemRightX = arrowTipX + stemWidth * 0.25;

    return (
      // 外弧起点（左下）
      `M ${arcStartX} ${h} ` +
      // 外弧到箭头翼位置
      `A ${outerRx} ${outerRy} 0 0 0 ${stemLeftX} ${arrowWingY} ` +
      // 到左翼尖
      `L ${arrowLeftWingX} ${arrowWingY} ` +
      // 箭头尖端
      `L ${arrowTipX} ${arrowTipY} ` +
      // 右翼尖
      `L ${arrowRightWingX} ${arrowWingY} ` +
      // 回到茎右边
      `L ${stemRightX} ${arrowWingY} ` +
      // 内弧回到起点附近
      `A ${innerRx} ${innerRy} 0 0 1 ${arcStartX + stemWidth * 0.5} ${h * 0.9} ` +
      `Z`
    );
  },

  /**
   * 曲线下箭头
   * OOXML 规范：弧形曲线箭头，从顶部弧形弯曲向下指向
   * adj1: 箭头头部宽度比例（默认 25000）
   * adj2: 茎宽度比例（默认 50000）
   * adj3: 弧线起始位置比例（默认 25000）
   */
  [ST_ShapeType.curvedDownArrow]: (w, h, adj) => {
    // 获取调整参数
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 50000;
    const adj3 = adj?.['adj3'] ?? 25000;

    // 基于 OOXML guide formulas 计算
    const arrowHeadWidth = w * (adj1 / 100000);
    const stemWidth = w * (adj2 / 100000);
    const arcStartX = w * (adj3 / 100000);

    // 弧线参数
    const outerRx = w * 0.5;
    const outerRy = h;
    const innerRx = outerRx - stemWidth * 0.5;
    const innerRy = h * 0.7;

    // 箭头尖端位置（底部中偏右）
    const arrowTipX = w * 0.5 + arcStartX * 0.5;
    const arrowTipY = h;

    // 箭头翼位置
    const arrowWingY = h * 0.75;
    const arrowLeftWingX = arrowTipX - arrowHeadWidth;
    const arrowRightWingX = arrowTipX + arrowHeadWidth;

    // 茎左右边界
    const stemLeftX = arrowTipX - stemWidth * 0.25;
    const stemRightX = arrowTipX + stemWidth * 0.25;

    return (
      // 外弧起点（左上）
      `M ${arcStartX} 0 ` +
      // 外弧到箭头翼位置
      `A ${outerRx} ${outerRy} 0 0 1 ${stemLeftX} ${arrowWingY} ` +
      // 到左翼尖
      `L ${arrowLeftWingX} ${arrowWingY} ` +
      // 箭头尖端
      `L ${arrowTipX} ${arrowTipY} ` +
      // 右翼尖
      `L ${arrowRightWingX} ${arrowWingY} ` +
      // 回到茎右边
      `L ${stemRightX} ${arrowWingY} ` +
      // 内弧回到起点附近
      `A ${innerRx} ${innerRy} 0 0 0 ${arcStartX + stemWidth * 0.5} ${h * 0.1} ` +
      `Z`
    );
  },

  /**
   * 弯曲向上箭头
   */
  [ST_ShapeType.bentUpArrow]: (w, h, _adj) => {
    const stemW = Math.min(w, h) * 0.2;
    const arrowH = h * 0.25;
    const arrowW = w * 0.35;

    return (
      `M 0 ${h} ` +
      `L 0 ${h - stemW} ` +
      `L ${w - arrowW / 2 - stemW / 2} ${h - stemW} ` +
      `L ${w - arrowW / 2 - stemW / 2} ${arrowH} ` +
      `L ${w - arrowW} ${arrowH} ` +
      `L ${w - arrowW / 2} 0 ` +
      `L ${w} ${arrowH} ` +
      `L ${w - arrowW / 2 + stemW / 2} ${arrowH} ` +
      `L ${w - arrowW / 2 + stemW / 2} ${h} Z`
    );
  },

  /**
   * 左上箭头
   */
  [ST_ShapeType.leftUpArrow]: (w, h, _adj) => {
    const stemW = Math.min(w, h) * 0.18;
    const arrowSize = Math.min(w, h) * 0.3;

    return (
      `M ${arrowSize} 0 ` +
      `L ${arrowSize * 2} ${arrowSize} ` +
      `L ${arrowSize + stemW / 2} ${arrowSize} ` +
      `L ${arrowSize + stemW / 2} ${h - arrowSize - stemW / 2} ` +
      `L ${w - arrowSize} ${h - arrowSize - stemW / 2} ` +
      `L ${w - arrowSize} ${h - arrowSize * 2} ` +
      `L ${w} ${h - arrowSize} ` +
      `L ${w - arrowSize} ${h} ` +
      `L ${w - arrowSize} ${h - arrowSize + stemW / 2} ` +
      `L ${arrowSize - stemW / 2} ${h - arrowSize + stemW / 2} ` +
      `L ${arrowSize - stemW / 2} ${arrowSize} ` +
      `L 0 ${arrowSize} Z`
    );
  },

  /**
   * 缺口右箭头
   * OOXML 规范: 右箭头，左侧有向右的凹口
   * adj1: 茎高度比例
   * adj2: 箭头头部宽度比例
   */
  [ST_ShapeType.notchedRightArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 50000;

    const headW = w * (adj2 / 100000);
    const neckH = h * (adj1 / 100000);
    const cy = h / 2;
    // 缺口深度 = 箭头头部宽度的一部分
    const notchD = headW * 0.5;

    return (
      `M 0 ${cy - neckH / 2} ` + // 左上
      `L ${w - headW} ${cy - neckH / 2} ` + // 茎上边
      `L ${w - headW} 0 ` + // 箭头上翼外角
      `L ${w} ${cy} ` + // 箭头尖端
      `L ${w - headW} ${h} ` + // 箭头下翼外角
      `L ${w - headW} ${cy + neckH / 2} ` + // 茎下边
      `L 0 ${cy + neckH / 2} ` + // 左下
      `L ${notchD} ${cy} Z` // 凹口（向右凹入）
    );
  },

  /**
   * 条纹右箭头
   */
  [ST_ShapeType.stripedRightArrow]: (w, h, _adj) => {
    const neckH = h * 0.5;
    const headW = w * 0.3;
    const stripeW = w * 0.035;
    const gapW = w * 0.02;
    const cy = h / 2;

    let stripes = '';
    for (let i = 0; i < 4; i++) {
      const x = i * (stripeW + gapW);
      stripes +=
        `M ${x} ${cy - neckH / 2} ` +
        `L ${x + stripeW} ${cy - neckH / 2} ` +
        `L ${x + stripeW} ${cy + neckH / 2} ` +
        `L ${x} ${cy + neckH / 2} Z `;
    }

    const arrowX = 4 * (stripeW + gapW) + gapW;
    const arrow =
      `M ${arrowX} ${cy - neckH / 2} ` +
      `L ${w - headW} ${cy - neckH / 2} ` +
      `L ${w - headW} 0 ` +
      `L ${w} ${cy} ` +
      `L ${w - headW} ${h} ` +
      `L ${w - headW} ${cy + neckH / 2} ` +
      `L ${arrowX} ${cy + neckH / 2} Z`;

    return stripes + arrow;
  },

  /**
   * 本垒板
   */
  [ST_ShapeType.homePlate]: (w, h, adj) => {
    const adj1 = adj?.['adj'] ?? 50000;
    const pointX = w * (adj1 / 100000);

    return `M 0 0 L ${w - pointX} 0 L ${w} ${h / 2} L ${w - pointX} ${h} L 0 ${h} Z`;
  },

  /**
   * V形
   */
  [ST_ShapeType.chevron]: (w, h, adj) => {
    const adj1 = adj?.['adj'] ?? 50000;
    const pointW = w * (adj1 / 100000);

    return `M 0 0 L ${w - pointW} 0 L ${w} ${h / 2} L ${w - pointW} ${h} L 0 ${h} L ${pointW} ${h / 2} Z`;
  },

  /**
   * 四向箭头
   * OOXML 规范: 四个方向的箭头
   * adj1: 箭头头部宽度比例
   * adj2: 箭头茎宽度比例
   * adj3: 箭头头部长度比例
   */
  [ST_ShapeType.quadArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 22500; // 箭头头部宽度
    const adj2 = adj?.['adj2'] ?? 22500; // 茎宽度
    const adj3 = adj?.['adj3'] ?? 22500; // 箭头头部长度

    const headW = Math.min(w, h) * (adj1 / 100000);
    const armW = Math.min(w, h) * (adj2 / 100000);
    const headL = Math.min(w, h) * (adj3 / 100000);
    const cx = w / 2;
    const cy = h / 2;

    return (
      `M ${cx} 0 ` + // 上箭头尖
      `L ${cx + headW} ${headL} ` + // 上箭头右翼
      `L ${cx + armW / 2} ${headL} ` + // 上箭头茎右
      `L ${cx + armW / 2} ${cy - armW / 2} ` + // 到中心
      `L ${w - headL} ${cy - armW / 2} ` + // 走到右箭头茎
      `L ${w - headL} ${cy - headW} ` + // 右箭头上翼
      `L ${w} ${cy} ` + // 右箭头尖
      `L ${w - headL} ${cy + headW} ` + // 右箭头下翼
      `L ${w - headL} ${cy + armW / 2} ` + // 右箭头茎下
      `L ${cx + armW / 2} ${cy + armW / 2} ` + // 回到中心
      `L ${cx + armW / 2} ${h - headL} ` + // 走到下箭头茎
      `L ${cx + headW} ${h - headL} ` + // 下箭头右翼
      `L ${cx} ${h} ` + // 下箭头尖
      `L ${cx - headW} ${h - headL} ` + // 下箭头左翼
      `L ${cx - armW / 2} ${h - headL} ` + // 下箭头茎左
      `L ${cx - armW / 2} ${cy + armW / 2} ` + // 回到中心
      `L ${headL} ${cy + armW / 2} ` + // 走到左箭头茎
      `L ${headL} ${cy + headW} ` + // 左箭头下翼
      `L 0 ${cy} ` + // 左箭头尖
      `L ${headL} ${cy - headW} ` + // 左箭头上翼
      `L ${headL} ${cy - armW / 2} ` + // 左箭头茎上
      `L ${cx - armW / 2} ${cy - armW / 2} ` + // 回到中心
      `L ${cx - armW / 2} ${headL} ` + // 走到上箭头茎
      `L ${cx - headW} ${headL} Z` // 闭合
    );
  },

  /**
   * 圆形箭头
   * OOXML 规范：顺时针弧形箭头
   * adj1: 箭头头部宽度比例（默认 12500）
   * adj2: 弧线宽度比例（默认 21600000 / 360000 ≈ 12500）
   * adj3: 弧线起始角度（默认 0）
   * adj4: 弧线结束角度（默认 270°）
   * adj5: 内外比例（默认 25000）
   */
  [ST_ShapeType.circularArrow]: (w, h, adj) => {
    // 获取调整参数
    const adj1 = adj?.['adj1'] ?? 12500;
    const adj2 = adj?.['adj2'] ?? 12500;

    const cx = w / 2;
    const cy = h / 2;
    const minDim = Math.min(w, h);

    // 外环半径
    const outerR = (minDim / 2) * 0.9;
    // 弧线宽度
    const arcWidth = outerR * (adj2 / 100000);
    // 内环半径
    const innerR = outerR - arcWidth;
    // 箭头头部宽度
    const arrowHeadW = arcWidth * (adj1 / 25000);
    // 箭头长度
    const arrowL = outerR * 0.2;

    // 从右侧开始（0°），顺时针画约 270° 的弧，箭头在顶部

    // 外弧起点（右侧）
    const outerStartX = cx + outerR;
    const outerStartY = cy;

    // 外弧终点（约在左上方向，箭头位置前）
    const arrowInnerAngle = -Math.PI / 2; // 顶部
    const arrowOuterX = cx + outerR * Math.cos(arrowInnerAngle);
    const arrowOuterY = cy + outerR * Math.sin(arrowInnerAngle);
    const arrowInnerX = cx + innerR * Math.cos(arrowInnerAngle);
    const arrowInnerY = cy + innerR * Math.sin(arrowInnerAngle);

    // 箭头尖端位置
    const arrowTipX = arrowOuterX - arrowL;
    const arrowTipY = cy + innerR + arcWidth / 2;

    // 内弧终点（右侧）
    const innerEndX = cx + innerR;
    const innerEndY = cy;

    return (
      // 外弧起点
      `M ${outerStartX} ${outerStartY} ` +
      // 外弧到箭头位置（大弧）
      `A ${outerR} ${outerR} 0 1 1 ${arrowOuterX} ${arrowOuterY} ` +
      // 箭头外翼
      `L ${arrowOuterX} ${arrowOuterY - arrowHeadW / 2} ` +
      // 箭头尖端
      `L ${arrowTipX} ${arrowTipY - arcWidth / 2} ` +
      // 箭头内翼
      `L ${arrowInnerX} ${arrowInnerY} ` +
      // 内弧回到起点（逆时针）
      `A ${innerR} ${innerR} 0 1 0 ${innerEndX} ${innerEndY} ` +
      `Z`
    );
  },

  /**
   * 流线型箭头
   * OOXML 规范: 平滑流线型曲线箭头，从左下向右上
   * 使用 S (光滑贝塞尔) 和 Q (二次贝塞尔) 命令实现更平滑的曲线
   */
  [ST_ShapeType.swooshArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000; // 尾部宽度
    const adj2 = adj?.['adj2'] ?? 16667; // 箭头高度

    // 箭头参数
    const tailW = w * (adj1 / 100000);
    const arrowSize = h * (adj2 / 100000);

    // 关键控制点
    const ctrlX1 = w * 0.35;
    const ctrlY1 = h * 0.6;
    const ctrlX2 = w * 0.65;
    const ctrlY2 = h * 0.2;

    return (
      `M 0 ${h} ` + // 左下起点
      `Q ${ctrlX1} ${h} ${ctrlX1} ${ctrlY1} ` + // 第一段二次贝塞尔
      `S ${ctrlX2} ${ctrlY2} ${w} 0 ` + // 光滑贝塞尔到箭头尖端
      `L ${w - arrowSize * 0.7} ${arrowSize * 0.5} ` + // 箭头右边缘
      `L ${w - arrowSize * 0.25} 0 ` + // 箭头内角
      `Q ${ctrlX2 * 0.9} ${ctrlY2 * 1.2} ${ctrlX1 * 1.1} ${ctrlY1 * 1.05} ` + // 内曲线
      `Q ${tailW * 1.5} ${h * 0.9} ${tailW} ${h} Z` // 回到底部闭合
    );
  },

  /**
   * U形转弯箭头
   * OOXML 规范: 从底部左侧向上，180度转弯，向下指向底部右侧
   * 使用多个小弧段实现平滑 U 形转弯
   */
  [ST_ShapeType.uturnArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 25000;
    const adj3 = adj?.['adj3'] ?? 25000;

    const arrowW = w * (adj1 / 100000); // 箭头头部宽度
    const stemW = w * (adj2 / 100000); // 茎宽度
    const arcR = w * (adj3 / 100000); // 外弧半径
    const arcInnerR = Math.max(arcR - stemW, stemW * 0.5); // 内弧半径 (确保最小值)
    const arrowH = h * 0.15; // 箭头高度
    const arcCenterY = arcR * 1.1; // 弧心 Y 位置

    // 箭头中心 X 位置
    const rightCenterX = stemW + arcR + stemW / 2;

    return (
      `M 0 ${h} ` + // 左下角
      `V ${arcCenterY} ` + // 向上到弧底部
      `A ${arcR} ${arcR} 0 0 1 ${arcR * 2} ${arcCenterY} ` + // 外弧 (180度)
      `V ${h - arrowH} ` + // 向下到箭头位置
      `H ${arcR * 2 - (arrowW - stemW) / 2} ` + // 箭头左外边
      `L ${rightCenterX} ${h} ` + // 箭头尖端
      `L ${arcR * 2 + stemW + (arrowW - stemW) / 2} ${h - arrowH} ` + // 箭头右外边
      `H ${arcR * 2 + stemW} ` + // 右侧茎顶部
      `V ${arcCenterY} ` + // 向上到内弧
      `A ${arcInnerR} ${arcInnerR} 0 0 0 ${stemW} ${arcCenterY} ` + // 内弧
      `V ${h} Z` // 闭合
    );
  },

  // Aliases - 箭头标注类
  [ST_ShapeType.leftRightArrowCallout]: (w, h) => ArrowShapes[ST_ShapeType.leftRightArrow](w, h),
  [ST_ShapeType.upArrowCallout]: (w, h) => ArrowShapes[ST_ShapeType.upArrow](w, h),
  [ST_ShapeType.downArrowCallout]: (w, h) => ArrowShapes[ST_ShapeType.downArrow](w, h),
  [ST_ShapeType.leftArrowCallout]: (w, h) => ArrowShapes[ST_ShapeType.leftArrow](w, h),
  [ST_ShapeType.rightArrowCallout]: (w, h) => ArrowShapes[ST_ShapeType.rightArrow](w, h),
  [ST_ShapeType.upDownArrowCallout]: (w, h) => ArrowShapes[ST_ShapeType.upDownArrow](w, h),

  /**
   * 四向箭头标注
   * 带有中间标注区域的四向箭头
   */
  [ST_ShapeType.quadArrowCallout]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 22500;
    const adj2 = adj?.['adj2'] ?? 22500;
    const adj3 = adj?.['adj3'] ?? 22500;
    const adj4 = adj?.['adj4'] ?? 10000; // 标注区域大小

    const headW = Math.min(w, h) * (adj1 / 100000);
    const armW = Math.min(w, h) * (adj2 / 100000);
    const headL = Math.min(w, h) * (adj3 / 100000);
    const calloutS = Math.min(w, h) * (adj4 / 100000);
    const cx = w / 2;
    const cy = h / 2;

    // 与 quadArrow 类似，但中心有标注区域
    return (
      `M ${cx} 0 ` +
      `L ${cx + headW} ${headL} ` +
      `L ${cx + armW / 2} ${headL} ` +
      `L ${cx + armW / 2} ${cy - calloutS} ` +
      `L ${cx + calloutS} ${cy - calloutS} ` +
      `L ${cx + calloutS} ${cy - armW / 2} ` +
      `L ${w - headL} ${cy - armW / 2} ` +
      `L ${w - headL} ${cy - headW} ` +
      `L ${w} ${cy} ` +
      `L ${w - headL} ${cy + headW} ` +
      `L ${w - headL} ${cy + armW / 2} ` +
      `L ${cx + calloutS} ${cy + armW / 2} ` +
      `L ${cx + calloutS} ${cy + calloutS} ` +
      `L ${cx + armW / 2} ${cy + calloutS} ` +
      `L ${cx + armW / 2} ${h - headL} ` +
      `L ${cx + headW} ${h - headL} ` +
      `L ${cx} ${h} ` +
      `L ${cx - headW} ${h - headL} ` +
      `L ${cx - armW / 2} ${h - headL} ` +
      `L ${cx - armW / 2} ${cy + calloutS} ` +
      `L ${cx - calloutS} ${cy + calloutS} ` +
      `L ${cx - calloutS} ${cy + armW / 2} ` +
      `L ${headL} ${cy + armW / 2} ` +
      `L ${headL} ${cy + headW} ` +
      `L 0 ${cy} ` +
      `L ${headL} ${cy - headW} ` +
      `L ${headL} ${cy - armW / 2} ` +
      `L ${cx - calloutS} ${cy - armW / 2} ` +
      `L ${cx - calloutS} ${cy - calloutS} ` +
      `L ${cx - armW / 2} ${cy - calloutS} ` +
      `L ${cx - armW / 2} ${headL} ` +
      `L ${cx - headW} ${headL} Z`
    );
  },

  /**
   * 左向圆形箭头
   * OOXML 规范：逆时针弧形箭头 - circularArrow 的镜像版本
   * adj1: 箭头头部宽度比例（默认 12500）
   * adj2: 弧线宽度比例（默认 12500）
   * adj5: 内外比例（默认 25000）
   */
  [ST_ShapeType.leftCircularArrow]: (w, h, adj) => {
    // 获取调整参数
    const adj1 = adj?.['adj1'] ?? 12500;
    const adj2 = adj?.['adj2'] ?? 12500;

    const cx = w / 2;
    const cy = h / 2;
    const minDim = Math.min(w, h);

    // 外环半径
    const outerR = (minDim / 2) * 0.9;
    // 弧线宽度
    const arcWidth = outerR * (adj2 / 100000);
    // 内环半径
    const innerR = outerR - arcWidth;
    // 箭头头部宽度
    const arrowHeadW = arcWidth * (adj1 / 25000);
    // 箭头长度
    const arrowL = outerR * 0.2;

    // 从左侧开始（180°），逆时针画约 270° 的弧，箭头在顶部
    const startAngle = Math.PI;
    const arrowAngle = -Math.PI / 2; // 顶部

    // 外弧起点（左侧）
    const outerStartX = cx + outerR * Math.cos(startAngle);
    const outerStartY = cy + outerR * Math.sin(startAngle);

    // 箭头位置（顶部）
    const arrowOuterX = cx + outerR * Math.cos(arrowAngle);
    const arrowOuterY = cy + outerR * Math.sin(arrowAngle);
    const arrowInnerX = cx + innerR * Math.cos(arrowAngle);
    const arrowInnerY = cy + innerR * Math.sin(arrowAngle);

    // 箭头尖端位置（指向右侧）
    const arrowTipX = arrowOuterX + arrowL;
    const arrowTipY = cy - innerR - arcWidth / 2;

    // 内弧终点（左侧）
    const innerEndX = cx + innerR * Math.cos(startAngle);
    const innerEndY = cy + innerR * Math.sin(startAngle);

    return (
      // 外弧起点
      `M ${outerStartX} ${outerStartY} ` +
      // 外弧到箭头位置（逆时针大弧）
      `A ${outerR} ${outerR} 0 1 0 ${arrowOuterX} ${arrowOuterY} ` +
      // 箭头外翼
      `L ${arrowOuterX} ${arrowOuterY - arrowHeadW / 2} ` +
      // 箭头尖端
      `L ${arrowTipX} ${arrowTipY + arcWidth / 2} ` +
      // 箭头内翼
      `L ${arrowInnerX} ${arrowInnerY} ` +
      // 内弧回到起点（顺时针）
      `A ${innerR} ${innerR} 0 1 1 ${innerEndX} ${innerEndY} ` +
      `Z`
    );
  },

  /**
   * 双向圆形箭头
   * OOXML 规范：两端都有箭头的圆弧
   * adj1: 箭头头部宽度比例（默认 12500）
   * adj2: 弧线宽度比例（默认 12500）
   * adj3: 左箭头角度
   * adj4: 右箭头角度
   * adj5: 内外比例（默认 25000）
   */
  [ST_ShapeType.leftRightCircularArrow]: (w, h, adj) => {
    // 获取调整参数
    const adj1 = adj?.['adj1'] ?? 12500;
    const adj2 = adj?.['adj2'] ?? 12500;

    const cx = w / 2;
    const cy = h / 2;
    const minDim = Math.min(w, h);

    // 外环半径
    const outerR = (minDim / 2) * 0.9;
    // 弧线宽度
    const arcWidth = outerR * (adj2 / 100000);
    // 内环半径
    const innerR = outerR - arcWidth;
    // 箭头头部宽度
    const arrowHeadW = arcWidth * (adj1 / 25000);
    // 箭头长度
    const arrowL = outerR * 0.15;

    // 右侧箭头和左侧箭头
    return (
      // 右侧箭头外翼
      `M ${cx + outerR} ${cy - arrowHeadW / 2} ` +
      // 右侧箭头尖端
      `L ${cx + outerR + arrowL} ${cy} ` +
      // 右侧箭头内翼
      `L ${cx + outerR} ${cy + arrowHeadW / 2} ` +
      // 右侧内弧点
      `L ${cx + innerR} ${cy} ` +
      // 上半内弧（顺时针到左侧）
      `A ${innerR} ${innerR} 0 1 1 ${cx - innerR} ${cy} ` +
      // 左侧箭头内翼
      `L ${cx - outerR} ${cy + arrowHeadW / 2} ` +
      // 左侧箭头尖端
      `L ${cx - outerR - arrowL} ${cy} ` +
      // 左侧箭头外翼
      `L ${cx - outerR} ${cy - arrowHeadW / 2} ` +
      // 上半外弧闭合（逆时针回到右侧）
      `A ${outerR} ${outerR} 0 1 1 ${cx + outerR} ${cy - arrowHeadW / 2} Z`
    );
  },

  /**
   * 左右上三向箭头
   * 左、右、上三个方向的箭头
   */
  [ST_ShapeType.leftRightUpArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 25000;
    const adj3 = adj?.['adj3'] ?? 25000;

    const headW = Math.min(w, h) * (adj1 / 100000);
    const armW = Math.min(w, h) * (adj2 / 100000);
    const headL = Math.min(w, h) * (adj3 / 100000);
    const cx = w / 2;
    const bottomY = h - headL;

    return (
      `M ${cx} 0 ` + // 上箭头尖
      `L ${cx + headW} ${headL} ` + // 上箭头右翼
      `L ${cx + armW / 2} ${headL} ` + // 上箭头茎右
      `L ${cx + armW / 2} ${bottomY - armW / 2} ` + // 向下到交叉点
      `L ${w - headL} ${bottomY - armW / 2} ` + // 向右到右箭头茎
      `L ${w - headL} ${bottomY - headW} ` + // 右箭头上翼
      `L ${w} ${bottomY} ` + // 右箭头尖
      `L ${w - headL} ${bottomY + headW} ` + // 右箭头下翼
      `L ${w - headL} ${bottomY + armW / 2} ` + // 右箭头茎下
      `L ${cx + armW / 2} ${bottomY + armW / 2} ` + // 回到中心
      `L ${cx + armW / 2} ${h} ` + // 下边缘
      `L ${cx - armW / 2} ${h} ` + // 下边缘
      `L ${cx - armW / 2} ${bottomY + armW / 2} ` + // 回到中心
      `L ${headL} ${bottomY + armW / 2} ` + // 向左到左箭头茎
      `L ${headL} ${bottomY + headW} ` + // 左箭头下翼
      `L 0 ${bottomY} ` + // 左箭头尖
      `L ${headL} ${bottomY - headW} ` + // 左箭头上翼
      `L ${headL} ${bottomY - armW / 2} ` + // 左箭头茎上
      `L ${cx - armW / 2} ${bottomY - armW / 2} ` + // 回到中心
      `L ${cx - armW / 2} ${headL} ` + // 向上到上箭头茎
      `L ${cx - headW} ${headL} Z` // 闭合
    );
  },
};
