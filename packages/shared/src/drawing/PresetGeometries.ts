import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';

/**
 * 预设几何形状类型，扩展自 ST_ShapeType
 */
export type PresetGeomType = keyof typeof ST_ShapeType | string;

/**
 * 形状生成器函数定义
 * @param w 宽度 (px)
 * @param h 高度 (px)
 * @param adj 调整值 (100000 为 100%)
 */
export type ShapeGenerator = (w: number, h: number, adj?: Record<string, number>) => string;

/**
 * 几何辅助工具类
 */
const GeoUtils = {
    /** 矩形路径 */
    rect: (x: number, y: number, w: number, h: number) => `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`,

    /** 圆角矩形路径片段 */
    roundRectPath: (w: number, h: number, r: number) =>
        `M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} L ${r} ${h} A ${r} ${r} 0 0 1 0 ${h - r} L 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`,

    /** 圆/椭圆路径 */
    ellipse: (cx: number, cy: number, rx: number, ry: number) =>
        `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`,

    /** 正多边形路径 */
    regularPolygon: (sides: number, w: number, h: number, startAngle: number = -Math.PI / 2) => {
        const cx = w / 2;
        const cy = h / 2;
        const rx = w / 2;
        const ry = h / 2;
        let d = '';
        for (let i = 0; i < sides; i++) {
            const ang = startAngle + (i * 2 * Math.PI) / sides;
            const x = cx + rx * Math.cos(ang);
            const y = cy + ry * Math.sin(ang);
            d += (i === 0 ? 'M ' : 'L ') + `${x} ${y}`;
        }
        return d + ' Z';
    },

    /**
     * 星形路径 - 使用 OOXML 公式
     * OOXML 星形的 adj1 表示内半径相对于外半径的百分比 (1/100000)
     * adj2 表示旋转偏移 (1/60000 度)
     * @param points 星形角数
     * @param w 宽度
     * @param h 高度
     * @param adj1 内半径比例 (1/100000)，默认根据点数计算
     * @param adj2 旋转偏移 (1/60000 度)
     */
    star: (points: number, w: number, h: number, adj1?: number, adj2?: number) => {
        const cx = w / 2;
        const cy = h / 2;
        const rx = w / 2;
        const ry = h / 2;

        // OOXML 默认的内半径比例 (根据点数不同)
        let defaultAdj1: number;
        switch (points) {
            case 4: defaultAdj1 = 12500; break;   // 12.5%
            case 5: defaultAdj1 = 19098; break;   // 19% (黄金比例相关)
            case 6: defaultAdj1 = 28868; break;   // ~29%
            case 7: defaultAdj1 = 18750; break;   // ~19% (七角星特殊)
            case 8: defaultAdj1 = 37500; break;   // 37.5%
            case 10: defaultAdj1 = 42533; break;
            case 12: defaultAdj1 = 37500; break;
            case 16: defaultAdj1 = 37500; break;
            case 24: defaultAdj1 = 37500; break;
            case 32: defaultAdj1 = 37500; break;
            default: defaultAdj1 = 50000; break;
        }

        const innerRatio = (adj1 ?? defaultAdj1) / 100000;
        // adj2 是 1/60000 度，转换为弧度
        const rotationRad = ((adj2 ?? 0) / 60000) * (Math.PI / 180);

        let d = '';
        for (let i = 0; i < points * 2; i++) {
            // 从顶部开始 (-90°)，每步 180°/points
            const baseAngle = -Math.PI / 2 + rotationRad;
            const ang = baseAngle + (i * Math.PI) / points;
            // 外点 (偶数索引) 使用完整半径，内点 (奇数索引) 使用内半径
            const r = i % 2 === 0 ? 1 : innerRatio;
            const x = cx + rx * r * Math.cos(ang);
            const y = cy + ry * r * Math.sin(ang);
            d += (i === 0 ? 'M ' : 'L ') + `${x} ${y}`;
        }
        return d + ' Z';
    }
};

/**
 * 预设形状生成器注册表
 */
const ShapeRegistry: Record<string, ShapeGenerator> = {
    [ST_ShapeType.rect]: (w, h) => GeoUtils.rect(0, 0, w, h),

    [ST_ShapeType.roundRect]: (w, h, adj) => {
        const val = adj?.['val'] ?? 16667;
        const r = Math.min(w, h) * (val / 100000);
        return GeoUtils.roundRectPath(w, h, r);
    },

    [ST_ShapeType.round1Rect]: (w, h, adj) => {
        const val = adj?.['val'] ?? 16667;
        const r = Math.min(w, h) * (val / 100000);
        return `M ${r} 0 L ${w} 0 L ${w} ${h} L 0 ${h} L 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
    },

    [ST_ShapeType.round2SameRect]: (w, h, adj) => {
        const val = adj?.['val'] ?? 16667;
        const r = Math.min(w, h) * (val / 100000);
        return `M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h} L 0 ${h} L 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
    },

    [ST_ShapeType.round2DiagRect]: (w, h, adj) => {
        const val = adj?.['val'] ?? 16667;
        const r = Math.min(w, h) * (val / 100000);
        return `M ${r} 0 L ${w} 0 L ${w} ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} L 0 ${h} L 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
    },

    [ST_ShapeType.snip1Rect]: (w, h, adj) => {
        const val = adj?.['val'] ?? 16667;
        const r = Math.min(w, h) * (val / 100000);
        return `M ${r} 0 L ${w} 0 L ${w} ${h} L 0 ${h} L 0 ${r} Z`;
    },

    [ST_ShapeType.ellipse]: (w, h) => GeoUtils.ellipse(w / 2, h / 2, w / 2, h / 2),

    [ST_ShapeType.triangle]: (w, h) => `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z`,

    [ST_ShapeType.rtTriangle]: (w, h) => `M 0 0 L ${w} ${h} L 0 ${h} Z`,

    [ST_ShapeType.parallelogram]: (w, h, adj) => {
        const val = adj?.['adj'] ?? 25000;
        const dx = w * (val / 100000);
        return `M ${dx} 0 L ${w} 0 L ${w - dx} ${h} L 0 ${h} Z`;
    },

    [ST_ShapeType.trapezoid]: (w, h, adj) => {
        const val = adj?.['adj'] ?? 25000;
        const dx = w * (val / 100000);
        return `M ${dx} 0 L ${w - dx} 0 L ${w} ${h} L 0 ${h} Z`;
    },

    [ST_ShapeType.diamond]: (w, h) => `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z`,

    // ========== Snip 形状 ==========
    [ST_ShapeType.snip2SameRect]: (w, h, adj) => {
        const adj1 = adj?.['adj1'] ?? 16667;
        const r = Math.min(w, h) * (adj1 / 100000);
        // 左上和右上斜切
        return `M ${r} 0 L ${w - r} 0 L ${w} ${r} L ${w} ${h} L 0 ${h} L 0 ${r} Z`;
    },

    [ST_ShapeType.snip2DiagRect]: (w, h, adj) => {
        const adj1 = adj?.['adj1'] ?? 0;
        const adj2 = adj?.['adj2'] ?? 16667;
        const r1 = Math.min(w, h) * (adj1 / 100000);
        const r2 = Math.min(w, h) * (adj2 / 100000);
        // 左上和右下斜切
        return `M ${r1} 0 L ${w} 0 L ${w} ${h - r2} L ${w - r2} ${h} L 0 ${h} L 0 ${r1} Z`;
    },

    [ST_ShapeType.snipRoundRect]: (w, h, adj) => {
        const adj1 = adj?.['adj1'] ?? 16667;
        const adj2 = adj?.['adj2'] ?? 16667;
        const r1 = Math.min(w, h) * (adj1 / 100000); // 圆角
        const r2 = Math.min(w, h) * (adj2 / 100000); // 斜切
        // 左上圆角，右上斜切
        return `M ${r1} 0 L ${w - r2} 0 L ${w} ${r2} L ${w} ${h} L 0 ${h} L 0 ${r1} A ${r1} ${r1} 0 0 1 ${r1} 0 Z`;
    },

    // ========== Frame 形状 ==========
    [ST_ShapeType.frame]: (w, h, adj) => {
        const val = adj?.['adj1'] ?? 12500;
        const thick = Math.min(w, h) * (val / 100000);
        // 外框 + 内框 (使用 evenodd 填充)
        return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${thick} ${thick} L ${thick} ${h - thick} L ${w - thick} ${h - thick} L ${w - thick} ${thick} Z`;
    },

    // ========== 特殊形状 ==========
    [ST_ShapeType.teardrop]: (w, h, adj) => {
        const val = adj?.['adj'] ?? 100000;
        // 水滴形：圆形底部 + 尖顶
        const r = Math.min(w, h) / 2;
        const cx = w / 2;
        const peakY = h * (1 - val / 100000);
        return `M ${cx} ${peakY} Q ${w} ${h * 0.2} ${w} ${h - r} A ${r} ${r} 0 1 1 0 ${h - r} Q 0 ${h * 0.2} ${cx} ${peakY} Z`;
    },

    [ST_ShapeType.heart]: (w, h) => {
        // 心形使用贝塞尔曲线
        const cx = w / 2;
        return `M ${cx} ${h * 0.25} C ${w * 0.1} ${-h * 0.1} ${-w * 0.2} ${h * 0.4} ${cx} ${h} C ${w * 1.2} ${h * 0.4} ${w * 0.9} ${-h * 0.1} ${cx} ${h * 0.25} Z`;
    },

    [ST_ShapeType.sun]: (w, h, adj) => {
        const val = adj?.['adj'] ?? 25000;
        const innerRatio = val / 100000;
        const cx = w / 2;
        const cy = h / 2;
        const rx = w / 2;
        const ry = h / 2;
        const numRays = 8;
        let d = '';
        // 中心圆
        d += GeoUtils.ellipse(cx, cy, rx * innerRatio, ry * innerRatio);
        // 射线
        for (let i = 0; i < numRays; i++) {
            const ang = (i * Math.PI * 2) / numRays;
            const x1 = cx + rx * innerRatio * 1.3 * Math.cos(ang);
            const y1 = cy + ry * innerRatio * 1.3 * Math.sin(ang);
            const x2 = cx + rx * Math.cos(ang);
            const y2 = cy + ry * Math.sin(ang);
            d += ` M ${x1} ${y1} L ${x2} ${y2}`;
        }
        return d;
    },

    [ST_ShapeType.moon]: (w, h, adj) => {
        const val = adj?.['adj'] ?? 50000;
        const shift = w * (val / 100000);
        // 月牙形：两个圆弧
        return `M ${w} 0 A ${w / 2} ${h / 2} 0 1 0 ${w} ${h} A ${shift} ${h / 2} 0 1 1 ${w} 0 Z`;
    },

    [ST_ShapeType.cloud]: (w, h) => {
        // 云朵形状：多个相交的椭圆
        const r1 = w * 0.25;
        const r2 = w * 0.2;
        const r3 = w * 0.15;
        return `M ${w * 0.2} ${h * 0.7} A ${r1} ${r1} 0 1 1 ${w * 0.45} ${h * 0.3} A ${r2} ${r2} 0 1 1 ${w * 0.75} ${h * 0.35} A ${r3} ${r3} 0 1 1 ${w * 0.9} ${h * 0.6} A ${r2} ${r2} 0 1 1 ${w * 0.7} ${h * 0.85} L ${w * 0.3} ${h * 0.85} A ${r2} ${r2} 0 1 1 ${w * 0.2} ${h * 0.7} Z`;
    },

    [ST_ShapeType.plaque]: (w, h, adj) => {
        const val = adj?.['adj'] ?? 16667;
        const r = Math.min(w, h) * (val / 100000);
        // 匾额形状：四角内凹
        return `M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 0 ${w} ${r} L ${w} ${h - r} A ${r} ${r} 0 0 0 ${w - r} ${h} L ${r} ${h} A ${r} ${r} 0 0 0 0 ${h - r} L 0 ${r} A ${r} ${r} 0 0 0 ${r} 0 Z`;
    },

    [ST_ShapeType.donut]: (w, h, adj) => {
        const val = adj?.['adj'] ?? 25000;
        const innerRatio = 1 - (val / 100000);
        const cx = w / 2;
        const cy = h / 2;
        const rx = w / 2;
        const ry = h / 2;
        // 外圆 + 内圆 (evenodd)
        return GeoUtils.ellipse(cx, cy, rx, ry) + ' ' + GeoUtils.ellipse(cx, cy, rx * innerRatio, ry * innerRatio);
    },

    [ST_ShapeType.plus]: (w, h, adj) => {
        const val = adj?.['adj'] ?? 25000;
        const arm = Math.min(w, h) * (val / 100000);
        const cx = w / 2;
        const cy = h / 2;
        const hw = arm / 2;
        return `M ${cx - hw} 0 L ${cx + hw} 0 L ${cx + hw} ${cy - hw} L ${w} ${cy - hw} L ${w} ${cy + hw} L ${cx + hw} ${cy + hw} L ${cx + hw} ${h} L ${cx - hw} ${h} L ${cx - hw} ${cy + hw} L 0 ${cy + hw} L 0 ${cy - hw} L ${cx - hw} ${cy - hw} Z`;
    },

    [ST_ShapeType.noSmoking]: (w, h, adj) => {
        const val = adj?.['adj'] ?? 18750;
        const thick = Math.min(w, h) * (val / 100000);
        const cx = w / 2;
        const cy = h / 2;
        const rx = w / 2;
        const ry = h / 2;
        // 禁止符号：圆环 + 斜线
        return GeoUtils.ellipse(cx, cy, rx, ry) + ' ' + GeoUtils.ellipse(cx, cy, rx - thick, ry - thick) + ` M ${w * 0.15} ${h * 0.85} L ${w * 0.85} ${h * 0.15}`;
    },

    [ST_ShapeType.blockArc]: (w, h, adj) => {
        const adj1 = adj?.['adj1'] ?? 10800000; // 起始角度 (60000分之一度)
        const adj2 = adj?.['adj2'] ?? 0;        // 结束角度
        const adj3 = adj?.['adj3'] ?? 25000;    // 厚度
        const thick = Math.min(w, h) * (adj3 / 100000);
        const startAngle = (adj1 / 60000) * (Math.PI / 180);
        const endAngle = (adj2 / 60000) * (Math.PI / 180);
        const cx = w / 2;
        const cy = h / 2;
        const rx = w / 2;
        const ry = h / 2;
        // 简化：使用圆弧
        const sx = cx + rx * Math.cos(startAngle);
        const sy = cy + ry * Math.sin(startAngle);
        const ex = cx + rx * Math.cos(endAngle);
        const ey = cy + ry * Math.sin(endAngle);
        return `M ${sx} ${sy} A ${rx} ${ry} 0 1 1 ${ex} ${ey} L ${cx + (rx - thick) * Math.cos(endAngle)} ${cy + (ry - thick) * Math.sin(endAngle)} A ${rx - thick} ${ry - thick} 0 1 0 ${cx + (rx - thick) * Math.cos(startAngle)} ${cy + (ry - thick) * Math.sin(startAngle)} Z`;
    },


    [ST_ShapeType.pentagon]: (w, h) => GeoUtils.regularPolygon(5, w, h),

    [ST_ShapeType.hexagon]: (w, h) => GeoUtils.regularPolygon(6, w, h, 0),

    [ST_ShapeType.heptagon]: (w, h) => GeoUtils.regularPolygon(7, w, h),

    [ST_ShapeType.octagon]: (w, h) => GeoUtils.regularPolygon(8, w, h, Math.PI / 8),

    [ST_ShapeType.decagon]: (w, h) => GeoUtils.regularPolygon(10, w, h, Math.PI / 10),

    [ST_ShapeType.dodecagon]: (w, h) => GeoUtils.regularPolygon(12, w, h, Math.PI / 12),

    [ST_ShapeType.star4]: (w, h, adj) => {
        // adj1: 内半径比例 (1/100000)，默认 12500
        const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? undefined;
        return GeoUtils.star(4, w, h, adj1);
    },

    [ST_ShapeType.star5]: (w, h, adj) => {
        const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? undefined;
        return GeoUtils.star(5, w, h, adj1);
    },

    [ST_ShapeType.star6]: (w, h, adj) => {
        const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? undefined;
        return GeoUtils.star(6, w, h, adj1);
    },

    [ST_ShapeType.star7]: (w, h, adj) => {
        // star7: adj1 is internal radius ratio. 
        // User feedback indicates XML value (11659) results in too thin star.
        // Heuristic: boost the value significantly to match Office rendering.
        // XML 11659 (~11%) -> Target ~36-40%. 
        // Formula: (val + 25000) / 100000 seems to map 11% -> 36%.
        // Star7: User feedback indicates it's still too thin.
        // Boosting significantly: +35000.
        const val = adj?.['adj1'] ?? adj?.['val'] ?? 18750;
        const adjustedVal = (val < 25000) ? Math.min(50000, val + 35000) : val;
        return GeoUtils.star(7, w, h, adjustedVal);
    },

    [ST_ShapeType.star8]: (w, h, adj) => {
        const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? undefined;
        return GeoUtils.star(8, w, h, adj1);
    },

    // ... (intermediate lines) ...

    /**
     * mathNotEqual: 不等号 (≠)
     */
    [ST_ShapeType.mathNotEqual]: (w, h, adj) => {
        const adj1 = adj?.['adj1'] ?? 23520;  // 线宽
        const adj2 = adj?.['adj2'] ?? 6600000; // 斜线角度
        const adj3 = adj?.['adj3'] ?? 11760;  // 横线间隔

        const lineW = Math.min(w, h) * (adj1 / 100000);
        const halfW = lineW / 2;
        const gap = Math.min(w, h) * (adj3 / 100000);

        // 横线位置
        const cy = h / 2;
        const y1Top = cy - gap / 2 - lineW;
        const y1Bot = cy - gap / 2;
        const y2Top = cy + gap / 2;
        const y2Bot = cy + gap / 2 + lineW;

        // 两条横线
        let d = `M 0 ${y1Top} L ${w} ${y1Top} L ${w} ${y1Bot} L 0 ${y1Bot} Z`;
        d += ` M 0 ${y2Top} L ${w} ${y2Top} L ${w} ${y2Bot} L 0 ${y2Bot} Z`;

        // 斜线：延长长度
        const angleRad = (adj2 / 60000) * (Math.PI / 180);
        // Ensure it covers the whole shape diagonal
        const slashLen = Math.hypot(w, h);
        const cx = w / 2;
        // 计算旋转后的矩形端点
        // 简化：直接画一个旋转的矩形
        const sx = slashLen / 2;
        const sy = lineW / 2;

        // 旋转矩阵
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);

        // 四个角 (相对于中心 cx, cy)
        // P1: (-sx, -sy), P2: (sx, -sy), P3: (sx, sy), P4: (-sx, sy)
        // Rotated: x' = x*cos - y*sin, y' = x*sin + y*cos

        const pts = [
            { x: -sx, y: -sy },
            { x: sx, y: -sy },
            { x: sx, y: sy },
            { x: -sx, y: sy }
        ].map(p => ({
            x: cx + (p.x * cos - p.y * sin), // XML 坐标系 Y 向下，旋转方向? 通常顺时针
            y: cy + (p.x * sin + p.y * cos)
        }));

        d += ` M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y} L ${pts[2].x} ${pts[2].y} L ${pts[3].x} ${pts[3].y} Z`;

        return d;
    },

    /**
     * mathPlus: 加号 (+)
     * adj1: 线宽比例，默认 23520
     */
    [ST_ShapeType.mathPlus]: (w, h, adj) => {
        const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? 23520;
        const lineW = Math.min(w, h) * (adj1 / 100000);

        // 十字形
        const cx = w / 2;
        const cy = h / 2;
        const hw = lineW / 2;

        // 水平线
        let d = `M 0 ${cy - hw} L ${w} ${cy - hw} L ${w} ${cy + hw} L 0 ${cy + hw} Z`;
        // 垂直线 (使用 even-odd fill 或单独路径)
        d += ` M ${cx - hw} 0 L ${cx + hw} 0 L ${cx + hw} ${h} L ${cx - hw} ${h} Z`;

        return d;
    },

    /**
     * mathMinus: 减号 (-)
     * adj1: 线宽比例，默认 23520
     */
    [ST_ShapeType.mathMinus]: (w, h, adj) => {
        const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? 23520;
        const lineH = h * (adj1 / 100000);
        const cy = h / 2;
        const hh = lineH / 2;

        return `M 0 ${cy - hh} L ${w} ${cy - hh} L ${w} ${cy + hh} L 0 ${cy + hh} Z`;
    },

    /**
     * mathMultiply: 乘号 (×)
     * adj1: 线宽比例，默认 23520
     */
    [ST_ShapeType.mathMultiply]: (w, h, adj) => {
        // 两条交叉斜线
        const margin = Math.min(w, h) * 0.1;
        let d = `M ${margin} ${margin} L ${w - margin} ${h - margin}`;
        d += ` M ${w - margin} ${margin} L ${margin} ${h - margin}`;
        return d;
    },

    /**
     * mathDivide: 除号 (÷)
     * adj1: 线宽比例，默认 23520
     */
    [ST_ShapeType.mathDivide]: (w, h, adj) => {
        const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? 23520;
        const lineH = h * (adj1 / 100000) * 0.5;
        const cy = h / 2;
        const hh = lineH / 2;

        // 水平线
        let d = `M ${w * 0.1} ${cy - hh} L ${w * 0.9} ${cy - hh} L ${w * 0.9} ${cy + hh} L ${w * 0.1} ${cy + hh} Z`;

        // 上下两个圆点 (使用小椭圆)
        const dotR = Math.min(w, h) * 0.08;
        const dotCx = w / 2;
        const dotYTop = h * 0.25;
        const dotYBot = h * 0.75;

        d += ` ${GeoUtils.ellipse(dotCx, dotYTop, dotR, dotR)}`;
        d += ` ${GeoUtils.ellipse(dotCx, dotYBot, dotR, dotR)}`;

        return d;
    },

    /**
     * mathEqual: 等号 (=)
     * adj1: 间隔比例，默认 23520
     */
    [ST_ShapeType.mathEqual]: (w, h, adj) => {
        const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? 23520;
        const gap = h * (adj1 / 100000);
        const lineH = h * 0.1;

        const y1 = (h - gap) / 2 - lineH / 2;
        const y2 = (h + gap) / 2 - lineH / 2;

        let d = `M 0 ${y1} L ${w} ${y1} L ${w} ${y1 + lineH} L 0 ${y1 + lineH} Z`;
        d += ` M 0 ${y2} L ${w} ${y2} L ${w} ${y2 + lineH} L 0 ${y2 + lineH} Z`;

        return d;
    },

    // ========== 改进的曲线连接符 ==========

    /**
     * curvedConnector4: 四段曲线连接符
     * adj1, adj2: 控制点位置
     */
    [ST_ShapeType.curvedConnector4]: (w, h, adj) => {
        const adj1 = adj?.['adj1'] ?? 50000;
        const adj2 = adj?.['adj2'] ?? 50000;

        // 使用三次贝塞尔曲线
        const cp1x = w * (adj1 / 100000);
        const cp1y = 0;
        const cp2x = w;
        const cp2y = h * (adj2 / 100000);

        return `M 0 0 C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${w} ${h}`;
    },

    /**
     * curvedConnector5: 五段曲线连接符
     * adj1, adj2, adj3: 控制点位置
     */
    [ST_ShapeType.curvedConnector5]: (w, h, adj) => {
        const adj1 = adj?.['adj1'] ?? 25000;
        const adj2 = adj?.['adj2'] ?? 50000;
        const adj3 = adj?.['adj3'] ?? 75000;

        // 使用两个三次贝塞尔曲线段
        const midX = w / 2;
        const midY = h / 2;
        const cp1x = w * (adj1 / 100000);
        const cp2y = h * (adj2 / 100000);
        const cp3x = w * (adj3 / 100000);

        return `M 0 0 C ${cp1x} 0 ${cp1x} ${cp2y} ${midX} ${cp2y} S ${cp3x} ${h} ${w} ${h}`;
    },
};

/**
 * 根据预设名称生成路径数据 (d 属性)
 * @param prst 预设形状名称
 * @param w 宽度 (px)
 * @param h 高度 (px)
 * @param adj 调整值映射 (可选)
 */
export function generatePresetPath(
    prst: string,
    w: number,
    h: number,
    adj?: Record<string, number>
): string | undefined {
    const generator = ShapeRegistry[prst];
    if (generator) {
        return generator(w, h, adj);
    }

    // 回退逻辑
    switch (prst) {
        case 'rect':
            return GeoUtils.rect(0, 0, w, h);
        case 'line':
            return `M 0 0 L ${w} ${h}`;
        default:
            return undefined;
    }
}
