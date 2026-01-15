
// Define local types to ensure we have all properties and avoid shared module issues
export interface OfficeShape {
    id: string;
    name?: string;
    type?: string;
    fill?: any;
    stroke?: any;
    geometry?: string;
    path?: string; // Custom geometry path
    pathWidth?: number;
    pathHeight?: number;
    effects?: any[]; // Shadow, glow, etc.
    rotation?: number;
    flipH?: boolean;
    flipV?: boolean;
    textBody?: any;
    style?: any;
    anchor: any;
    adjustValues?: Record<string, number>;
}

export interface OfficeImage {
    id: string;
    embedId: string;
    name?: string;
    src: string;
    data?: ArrayBuffer;
    mimeType?: string;
    rotation?: number;
    anchor: any;
    stroke?: any;
    effects?: any[];
    geometry?: string;
    adjustValues?: Record<string, number>;
    flipH?: boolean;
    flipV?: boolean;
}

export interface OfficeConnector {
    id: string;
    name?: string;
    type?: string;
    geometry?: string;
    stroke?: any;
    anchor: any;
    rotation?: number;
    flipH?: boolean;
    flipV?: boolean;
    startArrow?: string;
    endArrow?: string;
    style?: any;
    adjustValues?: Record<string, number>;
}

export interface OfficeStyle {
    fillRef?: { idx: number, color?: string };
    lnRef?: { idx: number, color?: string };
    effectRef?: { idx: number, color?: string };
    fontRef?: { idx: string, color?: string };
}

export interface OfficeGroupShape {
    id: string;
    name?: string;
    rotation?: number;
    flipH?: boolean;
    flipV?: boolean;
    anchor: any;
    shapes: OfficeShape[];
    images: OfficeImage[];
    connectors: OfficeConnector[];
    groups: OfficeGroupShape[];
}

/**
 * 图表系列数据
 */
export interface ChartSeries {
    /** 系列索引 */
    index: number;
    /** 系列名称 */
    name?: string;
    /** 分类数据 (X轴标签) */
    categories: string[];
    /** 数值数据 (Y轴值) */
    values: number[];
    /** 填充颜色 */
    fillColor?: string;
}

/**
 * 图表数据
 */
export interface OfficeChart {
    /** 图表 ID */
    id: string;
    /** 图表类型 */
    type: 'barChart' | 'pieChart' | 'lineChart' | 'areaChart' | 'scatterChart' | 'other';
    /** 图表标题 */
    title?: string;
    /** 数据系列 */
    series: ChartSeries[];
    /** 柱状图方向 (barChart only) */
    barDirection?: 'col' | 'bar';
    /** 柱状图分组方式 */
    grouping?: 'clustered' | 'stacked' | 'percentStacked';
    /** 锚点信息 */
    anchor: any;
}

export interface XlsxWorkbook {
    sheets: XlsxSheet[];
    styles: XlsxStyles;
    sharedStrings: string[];
    theme?: XlsxTheme;
    date1904?: boolean;
}

export interface XlsxSheet {
    name: string;
    id: string; // r:id
    state?: 'visible' | 'hidden' | 'veryHidden';
    rows: Record<number, XlsxRow>; // sparse array
    merges: XlsxMergeCell[];
    cols: XlsxColumn[]; // width info (ranges)
    pageMargins?: XlsxPageMargins;
    pageSetup?: XlsxPageSetup;
    headerFooter?: XlsxHeaderFooter;
    // drawings?: XlsxDrawing[]; // To be added later
    drawingId?: string; // r:id to drawing xml
    images?: OfficeImage[];
    shapes?: OfficeShape[];
    connectors?: OfficeConnector[];
    groupShapes?: OfficeGroupShape[];
    charts?: OfficeChart[];
}

export interface XlsxAnchor {
    col: number;
    colOff: number; // EMU
    row: number;
    rowOff: number; // EMU
}

export interface XlsxRow {
    index: number;
    height?: number;
    customHeight: boolean;
    hidden?: boolean;
    cells: Record<number, XlsxCell>;
}

export interface XlsxColumn {
    min: number;
    max: number;
    width: number;
    customWidth: boolean;
    hidden?: boolean;
}

export interface XlsxCell {
    type: 's' | 'n' | 'b' | 'e' | 'str' | 'inlineStr' | 'd'; // s=sharedString, n=number, b=boolean, e=error, str=string, d=date
    value: string | number | boolean | Date;
    formula?: string;
    styleIndex?: number;
}

export interface XlsxMergeCell {
    s: { r: number, c: number };
    e: { r: number, c: number };
}

export interface XlsxStyles {
    fonts: XlsxFont[];
    fills: XlsxFill[];
    borders: XlsxBorder[];
    cellXfs: XlsxCellXf[];
    numFmts: Record<number, string>; // ID -> Format Code
}

export interface XlsxFont {
    sz: number;
    name: string;
    family?: number;
    charset?: number;
    b?: boolean;
    i?: boolean;
    u?: boolean | string; // boolean or underline type
    strike?: boolean;
    color?: XlsxColor;
}

export interface XlsxFill {
    patternType?: string;
    fgColor?: XlsxColor;
    bgColor?: XlsxColor;
}

export interface XlsxBorder {
    left?: XlsxBorderSide;
    right?: XlsxBorderSide;
    top?: XlsxBorderSide;
    bottom?: XlsxBorderSide;
    diagonal?: XlsxBorderSide;
}

export interface XlsxBorderSide {
    style: string;
    color?: XlsxColor;
}

export interface XlsxCellXf {
    fontId: number;
    fillId: number;
    borderId: number;
    numFmtId: number;
    xfId?: number;
    applyAlignment?: boolean;
    alignment?: {
        horizontal?: 'general' | 'left' | 'center' | 'right' | 'fill' | 'justify' | 'centerContinuous' | 'distributed';
        vertical?: 'top' | 'center' | 'bottom' | 'justify' | 'distributed';
        wrapText?: boolean;
        indent?: number;
        textRotation?: number;
    };
}

export interface XlsxColor {
    auto?: boolean;
    rgb?: string; // Hex ARGB
    theme?: number;
    tint?: number;
    indexed?: number;
}

export interface XlsxTheme {
    colorScheme: Record<string, string>; // Name -> RGB
}

export interface XlsxPageMargins {
    left: number;
    right: number;
    top: number;
    bottom: number;
    header: number;
    footer: number;
}

export interface XlsxPageSetup {
    paperSize?: number;
    orientation?: 'default' | 'portrait' | 'landscape';
    scale?: number;
    fitToWidth?: number;
    fitToHeight?: number;
}

export interface XlsxHeaderFooter {
    oddHeader?: string;
    oddFooter?: string;
    evenHeader?: string;
    evenFooter?: string;
    firstHeader?: string;
    firstFooter?: string;
    alignWithMargins?: boolean;
    differentFirst?: boolean;
    differentOddEven?: boolean;
}
