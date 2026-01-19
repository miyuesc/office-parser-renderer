import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';
import { ShapeGenerator } from './types';

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
    const adj4 = adj?.['adj4'] ?? 43750; // 弯曲位置

    const arrowW = w * (adj1 / 100000); // 箭头头部宽度
    const stemW = h * (adj2 / 100000); // 茎宽度
    const arrowH = h * (adj3 / 100000); // 箭头头部高度
    const bendPos = w * (adj4 / 100000); // 弯曲 X 位置

    // 圆角半径 - 基于茎宽度
    const cornerR = stemW * 0.8;

    // 箭头中心 X 位置
    const arrowCenterX = w - arrowW / 2;

    // 内外轨道的 X 坐标
    const outerBendX = bendPos;
    const innerBendX = bendPos + stemW;

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
   * OOXML 规范: 弧形曲线箭头，从左侧弧形弯曲指向右侧
   * 使用标准椭圆弧命令 (A) 实现平滑弧线
   * adj1: 箭头头部高度比例
   * adj2: 箭头茎宽度比例
   * adj3: 弧形比例
   */
  [ST_ShapeType.curvedRightArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000; // 箭头头部高度
    const adj2 = adj?.['adj2'] ?? 50000; // 茎宽度比例
    const adj3 = adj?.['adj3'] ?? 25000; // 弧形曲率

    // 箭头参数计算
    const arrowHeadH = h * (adj1 / 100000); // 箭头头部半高度
    const stemThick = h * (adj2 / 100000) * 0.3; // 茎厚度
    const cy = h / 2;

    // 弧线半径 - 外弧和内弧
    const rx = w * 0.85; // 椭圆 X 半径
    const ryOuter = h * 0.5; // 外椭圆 Y 半径
    const ryInner = h * 0.35; // 内椭圆 Y 半径

    // 箭头位置
    const arrowX = w * 0.85;
    const arrowTop = cy - arrowHeadH;
    const arrowBot = cy + arrowHeadH;
    const stemTop = cy - stemThick / 2;
    const stemBot = cy + stemThick / 2;

    return (
      `M 0 ${h} ` + // 左下起点
      `A ${rx} ${ryOuter} 0 0 1 ${arrowX} ${stemTop} ` + // 外弧到箭头茎上方
      `V ${arrowTop} ` + // 箭头上翼
      `L ${w} ${cy} ` + // 箭头尖端
      `L ${arrowX} ${arrowBot} ` + // 箭头下翼
      `V ${stemBot} ` + // 箭头茎下方
      `A ${rx * 0.7} ${ryInner} 0 0 0 ${w * 0.12} ${h} Z` // 内弧闭合
    );
  },

  /**
   * 曲线左箭头
   * OOXML 规范: 弧形曲线箭头，从右侧弧形弯曲指向左侧
   * curvedRightArrow 的镜像版本
   */
  [ST_ShapeType.curvedLeftArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 50000;
    const adj3 = adj?.['adj3'] ?? 25000;

    // 箭头参数计算
    const arrowHeadH = h * (adj1 / 100000);
    const stemThick = h * (adj2 / 100000) * 0.3;
    const cy = h / 2;

    // 弧线半径
    const rx = w * 0.85;
    const ryOuter = h * 0.5;
    const ryInner = h * 0.35;

    // 箭头位置 (镜像)
    const arrowX = w * 0.15;
    const arrowTop = cy - arrowHeadH;
    const arrowBot = cy + arrowHeadH;
    const stemTop = cy - stemThick / 2;
    const stemBot = cy + stemThick / 2;

    return (
      `M ${w} ${h} ` + // 右下起点
      `A ${rx} ${ryOuter} 0 0 0 ${arrowX} ${stemTop} ` + // 外弧到箭头茎上方
      `V ${arrowTop} ` + // 箭头上翼
      `L 0 ${cy} ` + // 箭头尖端
      `L ${arrowX} ${arrowBot} ` + // 箭头下翼
      `V ${stemBot} ` + // 箭头茎下方
      `A ${rx * 0.7} ${ryInner} 0 0 1 ${w * 0.88} ${h} Z` // 内弧闭合
    );
  },

  /**
   * 曲线上箭头
   * OOXML 规范: 弧形曲线箭头，从底部弧形弯曲向上指向
   * 使用横向弧线 + 箭头结构
   */
  [ST_ShapeType.curvedUpArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000; // 箭头宽度比例
    const adj2 = adj?.['adj2'] ?? 50000; // 茎宽度比例

    // 箭头头部参数
    const arrowHeadW = w * (adj1 / 100000) * 1.2; // 箭头宽度
    const arrowHeadH = h * 0.18; // 箭头高度
    // 茎厚度
    const stemThick = w * (adj2 / 100000) * 0.25;
    const cx = w / 2;

    // 弧线半径 - 较大以创建明显的弧形
    const rxOuter = w * 0.48;
    const ryOuter = h * 0.42;
    const rxInner = rxOuter - stemThick;
    const ryInner = ryOuter - stemThick;

    // 箭头位置
    const arrowLeft = cx - arrowHeadW / 2;
    const arrowRight = cx + arrowHeadW / 2;
    const stemLeft = cx - stemThick / 2;
    const stemRight = cx + stemThick / 2;

    return (
      `M ${w * 0.95} ${h} ` + // 右下起点
      `A ${rxOuter} ${ryOuter} 0 0 0 ${stemRight} ${arrowHeadH} ` + // 外弧到箭头茎右侧
      `H ${arrowRight} ` + // 箭头右翼
      `L ${cx} 0 ` + // 箭头尖端
      `L ${arrowLeft} ${arrowHeadH} ` + // 箭头左翼
      `H ${stemLeft} ` + // 箭头茎左侧
      `A ${rxInner} ${ryInner} 0 0 1 ${w * 0.05} ${h} ` + // 内弧闭合
      `Z`
    );
  },

  /**
   * 曲线下箭头
   * OOXML 规范: 弧形曲线箭头，从顶部弧形弯曲向下指向
   * curvedUpArrow 的镜像版本
   */
  [ST_ShapeType.curvedDownArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 50000;

    // 箭头头部参数
    const arrowHeadW = w * (adj1 / 100000) * 1.2;
    const arrowHeadH = h * 0.18;
    const stemThick = w * (adj2 / 100000) * 0.25;
    const cx = w / 2;
    const arrowY = h - arrowHeadH;

    // 弧线半径
    const rxOuter = w * 0.48;
    const ryOuter = h * 0.42;
    const rxInner = rxOuter - stemThick;
    const ryInner = ryOuter - stemThick;

    // 箭头位置
    const arrowLeft = cx - arrowHeadW / 2;
    const arrowRight = cx + arrowHeadW / 2;
    const stemLeft = cx - stemThick / 2;
    const stemRight = cx + stemThick / 2;

    return (
      `M ${w * 0.05} 0 ` + // 左上起点
      `A ${rxOuter} ${ryOuter} 0 0 1 ${stemLeft} ${arrowY} ` + // 外弧到箭头茎左侧
      `H ${arrowLeft} ` + // 箭头左翼
      `L ${cx} ${h} ` + // 箭头尖端
      `L ${arrowRight} ${arrowY} ` + // 箭头右翼
      `H ${stemRight} ` + // 箭头茎右侧
      `A ${rxInner} ${ryInner} 0 0 0 ${w * 0.95} 0 ` + // 内弧闭合
      `Z`
    );
  },

  /**
   * 弯曲向上箭头
   */
  [ST_ShapeType.bentUpArrow]: (w, h, adj) => {
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
  [ST_ShapeType.leftUpArrow]: (w, h, adj) => {
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
  [ST_ShapeType.stripedRightArrow]: (w, h, adj) => {
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
   * OOXML 规范: 顺时针弧形箭头
   * 简化实现，使用标准椭圆弧命令
   * adj1-adj5: 各类调整参数
   */
  [ST_ShapeType.circularArrow]: (w, h, adj) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = (Math.min(w, h) / 2) * 0.92;
    const thick = r * 0.26;
    const ir = r - thick;
    const arrowW = thick * 1.4; // 箭头宽度
    const arrowL = r * 0.18; // 箭头长度

    // 从顶部开始，顺时针画到左侧，然后是箭头
    const startAngle = -Math.PI / 2; // 顶部 (-90°)
    const endAngle = Math.PI; // 左侧 (180°)

    // 外弧的起点和终点
    const osX = cx + r * Math.cos(startAngle);
    const osY = cy + r * Math.sin(startAngle);
    const oeX = cx + r * Math.cos(endAngle);
    const oeY = cy + r * Math.sin(endAngle);

    // 内弧的终点和起点
    const ieX = cx + ir * Math.cos(endAngle);
    const ieY = cy + ir * Math.sin(endAngle);
    const isX = cx + ir * Math.cos(startAngle);
    const isY = cy + ir * Math.sin(startAngle);

    // 箭头尖端位置 (向下)
    const arrowTipY = oeY + arrowL;
    const arrowCenterX = cx - ir + thick / 2;

    return (
      `M ${osX} ${osY} ` + // 外弧起点 (顶部)
      `A ${r} ${r} 0 1 1 ${oeX} ${oeY} ` + // 外弧 (270°)
      `L ${oeX - arrowW / 2} ${oeY} ` + // 箭头外侧
      `L ${arrowCenterX} ${arrowTipY} ` + // 箭头尖端
      `L ${ieX} ${ieY} ` + // 箭头内侧
      `A ${ir} ${ir} 0 1 0 ${isX} ${isY} Z` // 内弧闭合
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
    const adj4 = adj?.['adj4'] ?? 43750;
    const adj5 = adj?.['adj5'] ?? 75000;

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
   * 逆时针弧形箭头 - circularArrow 的镜像版本
   */
  [ST_ShapeType.leftCircularArrow]: (w, h, adj) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = (Math.min(w, h) / 2) * 0.92;
    const thick = r * 0.26;
    const ir = r - thick;
    const arrowW = thick * 1.4;
    const arrowL = r * 0.18;

    // 逆时针: 从顶部开始，逆时针画到右侧
    const startAngle = -Math.PI / 2; // 顶部
    const endAngle = 0; // 右侧

    // 外弧坐标
    const osX = cx + r * Math.cos(startAngle);
    const osY = cy + r * Math.sin(startAngle);
    const oeX = cx + r * Math.cos(endAngle);
    const oeY = cy + r * Math.sin(endAngle);

    // 内弧坐标
    const ieX = cx + ir * Math.cos(endAngle);
    const ieY = cy + ir * Math.sin(endAngle);
    const isX = cx + ir * Math.cos(startAngle);
    const isY = cy + ir * Math.sin(startAngle);

    // 箭头尖端 (向右)
    const arrowTipX = oeX + arrowL;
    const arrowCenterY = cy + ir - thick / 2;

    return (
      `M ${osX} ${osY} ` + // 外弧起点 (顶部)
      `A ${r} ${r} 0 1 0 ${oeX} ${oeY} ` + // 外弧 (逆时针 270°)
      `L ${oeX} ${oeY + arrowW / 2} ` + // 箭头外侧
      `L ${arrowTipX} ${arrowCenterY} ` + // 箭头尖端
      `L ${ieX} ${ieY} ` + // 箭头内侧
      `A ${ir} ${ir} 0 1 1 ${isX} ${isY} Z` // 内弧闭合
    );
  },

  /**
   * 双向圆形箭头
   * 两端都有箭头的圆弧
   */
  [ST_ShapeType.leftRightCircularArrow]: (w, h, adj) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = (Math.min(w, h) / 2) * 0.92;
    const thick = r * 0.22;
    const ir = r - thick;
    const arrowL = r * 0.14;
    const arrowW = thick * 1.2;

    // 左右两个箭头的弧
    return (
      // 右侧箭头
      `M ${cx + r} ${cy - arrowW / 2} ` + // 右侧箭头外
      `L ${cx + r + arrowL} ${cy} ` + // 右侧箭头尖端
      `L ${cx + r} ${cy + arrowW / 2} ` + // 右侧箭头内
      `L ${cx + ir} ${cy} ` + // 内弧右端
      // 上半内弧
      `A ${ir} ${ir} 0 1 1 ${cx - ir} ${cy} ` +
      // 左侧箭头
      `L ${cx - r} ${cy + arrowW / 2} ` + // 左侧箭头内
      `L ${cx - r - arrowL} ${cy} ` + // 左侧箭头尖端
      `L ${cx - r} ${cy - arrowW / 2} ` + // 左侧箭头外
      // 上半外弧闭合
      `A ${r} ${r} 0 1 1 ${cx + r} ${cy - arrowW / 2} Z`
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
  }
};
