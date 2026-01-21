import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';
import { ShapeGenerator, ShapeResult } from './types';

/**
 * 装饰形状
 * 基于 OOXML 规范和 C-Rex 参考实现
 */
export const DecorationShapes: Record<string, ShapeGenerator> = {
  /**
   * 波浪形状
   */
  [ST_ShapeType.wave]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 12500;

    const amp = h * (adj1 / 100000);

    return (
      `M 0 ${h * 0.3 + amp} ` +
      `Q ${w * 0.25} ${h * 0.3 - amp} ${w * 0.5} ${h * 0.3} ` +
      `Q ${w * 0.75} ${h * 0.3 + amp} ${w} ${h * 0.3 - amp} ` +
      `L ${w} ${h - amp} ` +
      `Q ${w * 0.75} ${h + amp} ${w * 0.5} ${h} ` +
      `Q ${w * 0.25} ${h - amp} 0 ${h} Z`
    );
  },

  /**
   * 双波浪形状
   * OOXML 规范: 上下两条波浪线，相位相反
   * adj1: 波幅比例
   * adj2: 水平偏移
   */
  [ST_ShapeType.doubleWave]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 6500;

    const amp = h * (adj1 / 100000);

    // 上边波浪线（从左开始，先下后上）
    // 下边波浪线（相位相反，先上后下）
    const topY = h * 0.2;
    const botY = h * 0.8;

    return (
      // 上边波浪
      `M 0 ${topY + amp} ` +
      `C ${w * 0.25} ${topY - amp} ${w * 0.25} ${topY - amp} ${w * 0.5} ${topY} ` +
      `C ${w * 0.75} ${topY + amp} ${w * 0.75} ${topY + amp} ${w} ${topY - amp} ` +
      // 右边连接
      `L ${w} ${botY + amp} ` +
      // 下边波浪（相位相反）
      `C ${w * 0.75} ${botY - amp} ${w * 0.75} ${botY - amp} ${w * 0.5} ${botY} ` +
      `C ${w * 0.25} ${botY + amp} ${w * 0.25} ${botY + amp} 0 ${botY - amp} Z`
    );
  },

  /**
   * 丝带形状 (Ribbon)
   * OOXML 规范: 横幅式丝带，中间部分凸起，两端向下垂
   * adj1: 尾部宽度比例
   * adj2: 主带高度比例
   */
  [ST_ShapeType.ribbon]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 16667;
    const adj2 = adj?.['adj2'] ?? 50000;

    const tailW = w * (adj1 / 100000); // 尾部宽度
    const bandH = h * (adj2 / 100000); // 主带高度
    const notchH = bandH * 0.4; // 内凹高度
    const notchW = tailW * 0.6; // 内凹宽度

    // 主带：中间凸起的横幅 + 两侧下垂尾部 + 前后遮挡
    return (
      // 左尾部（前面部分）
      `M 0 ${bandH * 0.5} ` + // 左尾顶部
      `L ${tailW} ${bandH} ` + // 左尾底部向右
      `L ${tailW} ${bandH + notchH} ` + // 左内凹
      `L ${tailW - notchW} ${bandH} ` + // 左带底边
      // 主带底部（弧形）
      `Q ${w * 0.5} ${bandH * 0.6} ${w - tailW + notchW} ${bandH} ` +
      // 右尾部
      `L ${w - tailW} ${bandH + notchH} ` + // 右内凹
      `L ${w - tailW} ${bandH} ` + // 右尾底
      `L ${w} ${bandH * 0.5} ` + // 右尾顶
      // 主带顶部（弧形）
      `L ${w - tailW} ${0} ` + // 右上角
      `Q ${w * 0.5} ${bandH * 0.3} ${tailW} ${0} ` + // 顶部弧
      `L 0 ${bandH * 0.5} Z` // 左上角闭合
    );
  },

  /**
   * 丝带2形状 (Ribbon2)
   * OOXML 规范: 倒置丝带，尾部向上
   */
  [ST_ShapeType.ribbon2]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 16667;
    const adj2 = adj?.['adj2'] ?? 50000;

    const tailW = w * (adj1 / 100000);
    const bandTop = h * (1 - adj2 / 100000); // 主带顶部 Y
    const notchH = (h - bandTop) * 0.4;
    const notchW = tailW * 0.6;

    return (
      // 左尾部（向上）
      `M 0 ${bandTop + (h - bandTop) * 0.5} ` + // 左尾底
      `L ${tailW} ${bandTop} ` + // 左尾顶
      `L ${tailW} ${bandTop - notchH} ` + // 左内凹
      `L ${tailW - notchW} ${bandTop} ` + // 左带顶边
      // 主带顶部（弧形）
      `Q ${w * 0.5} ${bandTop * 0.6} ${w - tailW + notchW} ${bandTop} ` +
      // 右尾部
      `L ${w - tailW} ${bandTop - notchH} ` +
      `L ${w - tailW} ${bandTop} ` +
      `L ${w} ${bandTop + (h - bandTop) * 0.5} ` +
      // 主带底部
      `L ${w - tailW} ${h} ` +
      `Q ${w * 0.5} ${h - (h - bandTop) * 0.3} ${tailW} ${h} ` +
      `L 0 ${bandTop + (h - bandTop) * 0.5} Z`
    );
  },

  /**
   * 垂直卷轴形状
   * OOXML 规范: 纸卷外观，顶部和底部有明显的卷曲效果
   * adj: 卷曲部分比例（默认12500 = 12.5%）
   */
  [ST_ShapeType.verticalScroll]: (w, h, adj) => {
    const adjVal = adj?.['adj'] ?? 12500;
    // 卷曲半径基于宽度计算更合理
    const rollR = w * (adjVal / 100000);
    const rollD = rollR * 2;

    // 主体左边距（给顶部卷曲留空间）
    const bodyLeft = rollR;
    // 主体上边距
    const bodyTop = rollD;
    // 主体右边距（给底部卷曲留空间）
    const bodyRight = w - rollR;
    // 主体下边距
    const bodyBottom = h - rollD;

    return (
      // 主体轮廓 - 从左上角开始
      `M ${bodyLeft} ${bodyTop} ` +
      // 顶部边缘
      `L ${bodyRight} ${bodyTop} ` +
      // 右侧边缘
      `L ${bodyRight} ${bodyBottom} ` +
      // 底部卷曲 - 完整的卷起效果
      `C ${bodyRight} ${h - rollR} ${w - rollR} ${h - rollR} ${w} ${h - rollD} ` +
      `A ${rollR} ${rollR} 0 0 1 ${w - rollD} ${h - rollR} ` +
      `L ${rollD} ${h - rollR} ` +
      `A ${rollR} ${rollR} 0 0 1 ${0} ${h - rollD} ` +
      `C ${rollR} ${h - rollR} ${bodyLeft} ${h - rollR} ${bodyLeft} ${bodyBottom} ` +
      // 左侧边缘
      `L ${bodyLeft} ${bodyTop} Z ` +
      // 顶部卷曲装饰 - 完整的卷轴头
      `M ${rollD} ${rollR} ` +
      `A ${rollR} ${rollR} 0 0 1 ${rollD} ${rollD} ` +
      `L ${bodyRight - rollR} ${rollD} ` +
      `A ${rollR} ${rollR} 0 0 1 ${bodyRight - rollR} ${rollR} ` +
      `L ${rollD} ${rollR} Z ` +
      // 顶部卷曲圆形
      `M 0 ${rollR} ` +
      `A ${rollR} ${rollR} 0 1 1 ${rollD} ${rollR} ` +
      `A ${rollR} ${rollR} 0 1 1 0 ${rollR} Z`
    );
  },

  /**
   * 水平卷轴形状
   * OOXML 规范: 水平方向的纸卷效果
   */
  [ST_ShapeType.horizontalScroll]: (w, h, adj) => {
    const adjVal = adj?.['adj'] ?? 12500;
    // 卷曲半径基于高度计算
    const rollR = h * (adjVal / 100000);
    const rollD = rollR * 2;

    // 主体边界
    const bodyLeft = rollD;
    const bodyTop = rollR;
    const bodyRight = w - rollD;
    const bodyBottom = h - rollR;

    return (
      // 主体轮廓 - 从左上角开始
      `M ${bodyLeft} ${bodyTop} ` +
      // 顶部边缘
      `L ${bodyRight} ${bodyTop} ` +
      // 右侧卷曲 - 完整的卷起效果
      `C ${w - rollR} ${bodyTop} ${w - rollR} ${rollR} ${w - rollD} 0 ` +
      `A ${rollR} ${rollR} 0 0 1 ${w - rollR} ${rollD} ` +
      `L ${w - rollR} ${bodyBottom - rollR} ` +
      `A ${rollR} ${rollR} 0 0 1 ${w - rollD} ${h} ` +
      `C ${w - rollR} ${h - rollR} ${w - rollR} ${bodyBottom} ${bodyRight} ${bodyBottom} ` +
      // 底部边缘
      `L ${bodyLeft} ${bodyBottom} ` +
      // 左侧边缘回到起点
      `L ${bodyLeft} ${bodyTop} Z ` +
      // 左侧卷曲装饰 - 完整的卷轴头
      `M ${rollR} ${rollD} ` +
      `A ${rollR} ${rollR} 0 0 1 ${rollD} ${rollD} ` +
      `L ${rollD} ${bodyBottom - rollR} ` +
      `A ${rollR} ${rollR} 0 0 1 ${rollR} ${bodyBottom - rollR} ` +
      `L ${rollR} ${rollD} Z ` +
      // 左侧卷曲圆形
      `M ${rollR} 0 ` +
      `A ${rollR} ${rollR} 0 1 1 ${rollR} ${rollD} ` +
      `A ${rollR} ${rollR} 0 1 1 ${rollR} 0 Z`
    );
  },

  /**
   * 椭圆丝带
   * OOXML 规范: 椭圆形丝带，带有下垂尾部
   */
  [ST_ShapeType.ellipseRibbon]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000; // 丝带高度
    const adj2 = adj?.['adj2'] ?? 50000; // 椭圆比例
    const adj3 = adj?.['adj3'] ?? 12500; // 尾部宽度

    const ribH = h * (adj1 / 100000); // 丝带主体高度
    const ellH = h * (adj2 / 100000) * 0.3; // 椭圆高度
    const tailW = w * (adj3 / 100000); // 尾部宽度
    const cx = w / 2;
    const ribTop = ellH;
    const ribBot = ribTop + ribH;

    // 椭圆主体 + 两侧下垂尾部
    return (
      // 主体椭圆部分
      `M ${tailW} ${ribTop} ` + // 左上
      `A ${cx - tailW} ${ellH} 0 0 1 ${w - tailW} ${ribTop} ` + // 顶部椭圆弧
      `L ${w - tailW} ${ribBot} ` + // 右侧
      `A ${cx - tailW} ${ellH} 0 0 0 ${tailW} ${ribBot} Z ` + // 底部椭圆弧
      // 左尾部
      `M 0 ${ribTop + ribH * 0.3} ` + // 左尾顶
      `L ${tailW} ${ribBot} ` + // 向右下
      `L ${tailW} ${h - ellH} ` + // 向下
      `L ${tailW * 1.5} ${h} ` + // 尾部尖端
      `L ${tailW * 2} ${ribBot + (h - ribBot) * 0.5} ` + // 回折
      // 右尾部
      `M ${w} ${ribTop + ribH * 0.3} ` +
      `L ${w - tailW} ${ribBot} ` +
      `L ${w - tailW} ${h - ellH} ` +
      `L ${w - tailW * 1.5} ${h} ` +
      `L ${w - tailW * 2} ${ribBot + (h - ribBot) * 0.5}`
    );
  },

  /**
   * 椭圆丝带2
   * OOXML 规范: 倒置的椭圆丝带
   */
  [ST_ShapeType.ellipseRibbon2]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 50000;
    const adj3 = adj?.['adj3'] ?? 12500;

    const ribH = h * (adj1 / 100000);
    const ellH = h * (adj2 / 100000) * 0.3;
    const tailW = w * (adj3 / 100000);
    const cx = w / 2;
    const ribBot = h - ellH;
    const ribTop = ribBot - ribH;

    return (
      // 主体椭圆部分
      `M ${tailW} ${ribBot} ` +
      `A ${cx - tailW} ${ellH} 0 0 0 ${w - tailW} ${ribBot} ` +
      `L ${w - tailW} ${ribTop} ` +
      `A ${cx - tailW} ${ellH} 0 0 1 ${tailW} ${ribTop} Z ` +
      // 左尾部（向上）
      `M 0 ${ribBot - ribH * 0.3} ` +
      `L ${tailW} ${ribTop} ` +
      `L ${tailW} ${ellH} ` +
      `L ${tailW * 1.5} 0 ` +
      `L ${tailW * 2} ${ribTop - ribTop * 0.5} ` +
      // 右尾部
      `M ${w} ${ribBot - ribH * 0.3} ` +
      `L ${w - tailW} ${ribTop} ` +
      `L ${w - tailW} ${ellH} ` +
      `L ${w - tailW * 1.5} 0 ` +
      `L ${w - tailW * 2} ${ribTop - ribTop * 0.5}`
    );
  },

  /**
   * 左右丝带
   */
  [ST_ShapeType.leftRightRibbon]: (w, h, _adj) => {
    const foldW = w * 0.2;
    const bandH = h * 0.6;
    const notchD = h * 0.15;

    return (
      `M 0 ${notchD} L ${foldW} 0 L ${foldW} ${bandH * 0.3} ` +
      `L ${w - foldW} ${bandH * 0.3} L ${w - foldW} 0 L ${w} ${notchD} ` +
      `L ${w} ${bandH - notchD} L ${w - foldW} ${bandH} ` +
      `L ${w - foldW} ${bandH * 0.7} L ${foldW} ${bandH * 0.7} ` +
      `L ${foldW} ${bandH} L 0 ${bandH - notchD} Z`
    );
  },

  /**
   * 左方括号
   * OOXML 规范: 开放路径，左侧有圆角的 [ 形，noFill
   * adj: 圆角比例（默认8333 = 约1/12高度）
   */
  [ST_ShapeType.leftBracket]: (w, h, adj): ShapeResult => {
    const adj1 = adj?.['adj'] ?? 8333;
    // 圆角半径基于高度计算，更合理
    const curveR = Math.min(w * 0.5, h * (adj1 / 100000));

    // 开放路径：上横线 -> 左上圆角 -> 左竖线 -> 左下圆角 -> 下横线
    const path =
      `M ${w} 0 ` +
      `L ${curveR} 0 ` +
      `C 0 0 0 0 0 ${curveR} ` +
      `L 0 ${h - curveR} ` +
      `C 0 ${h} 0 ${h} ${curveR} ${h} ` +
      `L ${w} ${h}`;
    return { path, noFill: true };
  },

  /**
   * 右方括号
   * OOXML 规范: 开放路径，右侧有圆角的 ] 形，noFill
   * adj: 圆角比例（默认8333 = 约1/12高度）
   */
  [ST_ShapeType.rightBracket]: (w, h, adj): ShapeResult => {
    const adj1 = adj?.['adj'] ?? 8333;
    // 圆角半径基于高度计算
    const curveR = Math.min(w * 0.5, h * (adj1 / 100000));

    // 开放路径：上横线 -> 右上圆角 -> 右竖线 -> 右下圆角 -> 下横线
    const path =
      `M 0 0 ` +
      `L ${w - curveR} 0 ` +
      `C ${w} 0 ${w} 0 ${w} ${curveR} ` +
      `L ${w} ${h - curveR} ` +
      `C ${w} ${h} ${w} ${h} ${w - curveR} ${h} ` +
      `L 0 ${h}`;
    return { path, noFill: true };
  },

  /**
   * 左花括号
   * OOXML 规范: 开放路径，标准花括号 { 形状，由上下两段平滑 S 形曲线组成，noFill
   * adj1: 曲线弧度比例（默认8333）
   * adj2: 中间尖点垂直位置（默认50000 = 50%高度）
   */
  [ST_ShapeType.leftBrace]: (w, h, adj): ShapeResult => {
    const adj1 = adj?.['adj1'] ?? 8333;
    const adj2 = adj?.['adj2'] ?? 50000;

    // 曲率控制：使用高度相关的值
    const curveHeight = h * (adj1 / 100000);
    // 中间尖点的 Y 坐标
    const midY = h * (adj2 / 100000);
    // 主体偏移：花括号主体距离右边的距离
    const mainX = w * 0.7;

    // 计算关键点
    const topCurveEnd = curveHeight; // 上部曲线过渡点
    const midCurveStart = midY - curveHeight; // 中部尖点前
    const midCurveEnd = midY + curveHeight; // 中部尖点后
    const botCurveStart = h - curveHeight; // 下部曲线开始点

    const path =
      // 从右上角开始
      `M ${w} 0 ` +
      // 上部圆角：从右上向左弯到主体
      `C ${mainX} 0 ${mainX} 0 ${mainX} ${topCurveEnd} ` +
      // 上半段直线
      `L ${mainX} ${midCurveStart} ` +
      // 中部尖点：S 形曲线到达最左端
      `C ${mainX} ${midY - curveHeight * 0.3} ${w * 0.3} ${midY} 0 ${midY} ` +
      // 中部尖点：从最左端回到主体
      `C ${w * 0.3} ${midY} ${mainX} ${midY + curveHeight * 0.3} ${mainX} ${midCurveEnd} ` +
      // 下半段直线
      `L ${mainX} ${botCurveStart} ` +
      // 下部圆角：从主体弯回右下
      `C ${mainX} ${h} ${mainX} ${h} ${w} ${h}`;
    return { path, noFill: true };
  },

  /**
   * 右花括号
   * OOXML 规范: 开放路径，标准花括号 } 形状，与左花括号镜像，noFill
   * adj1: 曲线弧度比例（默认8333）
   * adj2: 中间尖点垂直位置（默认50000 = 50%高度）
   */
  [ST_ShapeType.rightBrace]: (w, h, adj): ShapeResult => {
    const adj1 = adj?.['adj1'] ?? 8333;
    const adj2 = adj?.['adj2'] ?? 50000;

    // 曲率控制
    const curveHeight = h * (adj1 / 100000);
    // 中间尖点的 Y 坐标
    const midY = h * (adj2 / 100000);
    // 主体偏移：花括号主体距离左边的距离
    const mainX = w * 0.3;

    // 计算关键点
    const topCurveEnd = curveHeight;
    const midCurveStart = midY - curveHeight;
    const midCurveEnd = midY + curveHeight;
    const botCurveStart = h - curveHeight;

    const path =
      // 从左上角开始
      `M 0 0 ` +
      // 上部圆角：从左上向右弯到主体
      `C ${mainX} 0 ${mainX} 0 ${mainX} ${topCurveEnd} ` +
      // 上半段直线
      `L ${mainX} ${midCurveStart} ` +
      // 中部尖点：S 形曲线到达最右端
      `C ${mainX} ${midY - curveHeight * 0.3} ${w * 0.7} ${midY} ${w} ${midY} ` +
      // 中部尖点：从最右端回到主体
      `C ${w * 0.7} ${midY} ${mainX} ${midY + curveHeight * 0.3} ${mainX} ${midCurveEnd} ` +
      // 下半段直线
      `L ${mainX} ${botCurveStart} ` +
      // 下部圆角：从主体弯回左下
      `C ${mainX} ${h} ${mainX} ${h} 0 ${h}`;
    return { path, noFill: true };
  },

  /**
   * 角标签 (Corner Tabs)
   * 4个小三角形位于各个角落
   */
  [ST_ShapeType.cornerTabs]: (w, h, adj) => {
    const adj1 = adj?.['adj'] ?? 20000;
    const t = Math.min(w, h) * (adj1 / 100000);

    return (
      `M 0 0 L ${t} 0 L 0 ${t} Z ` +
      `M ${w} 0 L ${w - t} 0 L ${w} ${t} Z ` +
      `M ${w} ${h} L ${w - t} ${h} L ${w} ${h - t} Z ` +
      `M 0 ${h} L ${t} ${h} L 0 ${h - t} Z`
    );
  },

  /**
   * 方形标签 (Square Tabs)
   * 4个小正方形位于各个角落
   */
  [ST_ShapeType.squareTabs]: (w, h, adj) => {
    const adj1 = adj?.['adj'] ?? 20000;
    const t = Math.min(w, h) * (adj1 / 100000);

    return (
      `M 0 0 L ${t} 0 L ${t} ${t} L 0 ${t} Z ` +
      `M ${w - t} 0 L ${w} 0 L ${w} ${t} L ${w - t} ${t} Z ` +
      `M ${w - t} ${h - t} L ${w} ${h - t} L ${w} ${h} L ${w - t} ${h} Z ` +
      `M 0 ${h - t} L ${t} ${h - t} L ${t} ${h} L 0 ${h} Z`
    );
  },

  /**
   * 牌匾标签 (Plaque Tabs)
   * 4个圆角切口位于各个角落
   */
  [ST_ShapeType.plaqueTabs]: (w, h, adj) => {
    const adj1 = adj?.['adj'] ?? 20000;
    const t = Math.min(w, h) * (adj1 / 100000);

    // 每个角是一个 quarter-circle arc
    return (
      `M 0 0 L ${t} 0 A ${t} ${t} 0 0 0 0 ${t} Z ` + // 左上
      `M ${w} 0 L ${w} ${t} A ${t} ${t} 0 0 0 ${w - t} 0 Z ` + // 右上
      `M ${w} ${h} L ${w - t} ${h} A ${t} ${t} 0 0 0 ${w} ${h - t} Z ` + // 右下
      `M 0 ${h} L 0 ${h - t} A ${t} ${t} 0 0 0 ${t} ${h} Z`
    ); // 左下
  }
};
