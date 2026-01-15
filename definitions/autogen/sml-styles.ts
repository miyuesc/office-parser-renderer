import { CT_ExtensionList, ST_UnsignedIntHex, ST_Xstring } from './sml-baseTypes';

/**
 * sml-styles.xsd
 */

/** Border Line Styles */
export enum ST_BorderStyle {
    /** None */
    none = "none",
    /** Thin Border */
    thin = "thin",
    /** Medium Border */
    medium = "medium",
    /** Dashed */
    dashed = "dashed",
    /** Dotted */
    dotted = "dotted",
    /** Thick Line Border */
    thick = "thick",
    /** Double Line */
    double = "double",
    /** Hairline Border */
    hair = "hair",
    /** Medium Dashed */
    mediumDashed = "mediumDashed",
    /** Dash Dot */
    dashDot = "dashDot",
    /** Medium Dash Dot */
    mediumDashDot = "mediumDashDot",
    /** Dash Dot Dot */
    dashDotDot = "dashDotDot",
    /** Medium Dash Dot Dot */
    mediumDashDotDot = "mediumDashDotDot",
    /** Slant Dash Dot */
    slantDashDot = "slantDashDot",
}

/** Pattern Type */
export enum ST_PatternType {
    /** None */
    none = "none",
    /** Solid */
    solid = "solid",
    /** Medium Gray */
    mediumGray = "mediumGray",
    /** Dary Gray */
    darkGray = "darkGray",
    /** Light Gray */
    lightGray = "lightGray",
    /** Dark Horizontal */
    darkHorizontal = "darkHorizontal",
    /** Dark Vertical */
    darkVertical = "darkVertical",
    /** Dark Down */
    darkDown = "darkDown",
    /** Dark Up */
    darkUp = "darkUp",
    /** Dark Grid */
    darkGrid = "darkGrid",
    /** Dark Trellis */
    darkTrellis = "darkTrellis",
    /** Light Horizontal */
    lightHorizontal = "lightHorizontal",
    /** Light Vertical */
    lightVertical = "lightVertical",
    /** Light Down */
    lightDown = "lightDown",
    /** Light Up */
    lightUp = "lightUp",
    /** Light Grid */
    lightGrid = "lightGrid",
    /** Light Trellis */
    lightTrellis = "lightTrellis",
    /** Gray 0.125 */
    gray125 = "gray125",
    /** Gray 0.0625 */
    gray0625 = "gray0625",
}

/** Gradient Type */
export enum ST_GradientType {
    /** Linear Gradient */
    linear = "linear",
    /** Path */
    path = "path",
}

/** Horizontal Alignment Type */
export enum ST_HorizontalAlignment {
    /** General Horizontal Alignment */
    general = "general",
    /** Left Horizontal Alignment */
    left = "left",
    /** Centered Horizontal Alignment */
    center = "center",
    /** Right Horizontal Alignment */
    right = "right",
    /** Fill */
    fill = "fill",
    /** Justify */
    justify = "justify",
    /** Center Continuous Horizontal Alignment */
    centerContinuous = "centerContinuous",
    /** Distributed Horizontal Alignment */
    distributed = "distributed",
}

/** Vertical Alignment Types */
export enum ST_VerticalAlignment {
    /** Align Top */
    top = "top",
    /** Centered Vertical Alignment */
    center = "center",
    /** Aligned To Bottom */
    bottom = "bottom",
    /** Justified Vertically */
    justify = "justify",
    /** Distributed Vertical Alignment */
    distributed = "distributed",
}

/** Number Format Id */
export type ST_NumFmtId = string;

/** Font Id */
export type ST_FontId = string;

/** Fill Id */
export type ST_FillId = string;

/** Border Id */
export type ST_BorderId = string;

/** Cell Style Format Id */
export type ST_CellStyleXfId = string;

/** Format Id */
export type ST_DxfId = string;

/** Table Style Type */
export enum ST_TableStyleType {
    /** Whole Table Style */
    wholeTable = "wholeTable",
    /** Header Row Style */
    headerRow = "headerRow",
    /** Total Row Style */
    totalRow = "totalRow",
    /** First Column Style */
    firstColumn = "firstColumn",
    /** Last Column Style */
    lastColumn = "lastColumn",
    /** First Row Stripe Style */
    firstRowStripe = "firstRowStripe",
    /** Second Row Stripe Style */
    secondRowStripe = "secondRowStripe",
    /** First Column Stripe Style */
    firstColumnStripe = "firstColumnStripe",
    /** Second Column Stipe Style */
    secondColumnStripe = "secondColumnStripe",
    /** First Header Row Style */
    firstHeaderCell = "firstHeaderCell",
    /** Last Header Style */
    lastHeaderCell = "lastHeaderCell",
    /** First Total Row Style */
    firstTotalCell = "firstTotalCell",
    /** Last Total Row Style */
    lastTotalCell = "lastTotalCell",
    /** First Subtotal Column Style */
    firstSubtotalColumn = "firstSubtotalColumn",
    /** Second Subtotal Column Style */
    secondSubtotalColumn = "secondSubtotalColumn",
    /** Third Subtotal Column Style */
    thirdSubtotalColumn = "thirdSubtotalColumn",
    /** First Subtotal Row Style */
    firstSubtotalRow = "firstSubtotalRow",
    /** Second Subtotal Row Style */
    secondSubtotalRow = "secondSubtotalRow",
    /** Third Subtotal Row Style */
    thirdSubtotalRow = "thirdSubtotalRow",
    /** Blank Row Style */
    blankRow = "blankRow",
    /** First Column Subheading Style */
    firstColumnSubheading = "firstColumnSubheading",
    /** Second Column Subheading Style */
    secondColumnSubheading = "secondColumnSubheading",
    /** Third Column Subheading Style */
    thirdColumnSubheading = "thirdColumnSubheading",
    /** First Row Subheading Style */
    firstRowSubheading = "firstRowSubheading",
    /** Second Row Subheading Style */
    secondRowSubheading = "secondRowSubheading",
    /** Third Row Subheading Style */
    thirdRowSubheading = "thirdRowSubheading",
    /** Page Field Labels Style */
    pageFieldLabels = "pageFieldLabels",
    /** Page Field Values Style */
    pageFieldValues = "pageFieldValues",
}

/** Vertical Alignment Run Types */
export enum ST_VerticalAlignRun {
    /** Baseline */
    baseline = "baseline",
    /** Superscript */
    superscript = "superscript",
    /** Subscript */
    subscript = "subscript",
}

/** Font scheme Styles */
export enum ST_FontScheme {
    /** None */
    none = "none",
    /** Major Font */
    major = "major",
    /** Minor Font */
    minor = "minor",
}

/** Underline Types */
export enum ST_UnderlineValues {
    /** Single Underline */
    single = "single",
    /** Double Underline */
    double = "double",
    /** Accounting Single Underline */
    singleAccounting = "singleAccounting",
    /** Accounting Double Underline */
    doubleAccounting = "doubleAccounting",
    /** None */
    none = "none",
}

/** Number Formats */
export interface CT_Stylesheet {
    numFmts?: CT_NumFmts;
    fonts?: CT_Fonts;
    fills?: CT_Fills;
    borders?: CT_Borders;
    cellStyleXfs?: CT_CellStyleXfs;
    cellXfs?: CT_CellXfs;
    cellStyles?: CT_CellStyles;
    dxfs?: CT_Dxfs;
    tableStyles?: CT_TableStyles;
    colors?: CT_Colors;
    extLst?: CT_ExtensionList;
}

/** Horizontal Alignment */
export interface CT_CellAlignment {
    horizontal?: ST_HorizontalAlignment;
    vertical?: ST_VerticalAlignment;
    textRotation?: number;
    wrapText?: boolean;
    indent?: number;
    relativeIndent?: number;
    justifyLastLine?: boolean;
    shrinkToFit?: boolean;
    readingOrder?: number;
}

/** Border */
export interface CT_Borders {
    count?: number;
    border?: CT_Border[];
}

/** Left Border */
export interface CT_Border {
    diagonalUp?: boolean;
    diagonalDown?: boolean;
    outline?: boolean;
    left?: CT_BorderPr;
    right?: CT_BorderPr;
    top?: CT_BorderPr;
    bottom?: CT_BorderPr;
    diagonal?: CT_BorderPr;
    vertical?: CT_BorderPr;
    horizontal?: CT_BorderPr;
}

/** Color */
export interface CT_BorderPr {
    style?: ST_BorderStyle;
    color?: CT_Color;
}

/** Cell Locked */
export interface CT_CellProtection {
    locked?: boolean;
    hidden?: boolean;
}

/** Font */
export interface CT_Fonts {
    count?: number;
    font?: CT_Font[];
}

/** Fill */
export interface CT_Fills {
    count?: number;
    fill?: CT_Fill[];
}

/** Pattern */
export interface CT_Fill {
    patternFill?: CT_PatternFill;
    gradientFill?: CT_GradientFill;
}

/** Foreground Color */
export interface CT_PatternFill {
    patternType?: ST_PatternType;
    fgColor?: CT_Color;
    bgColor?: CT_Color;
}

/** Automatic */
export interface CT_Color {
    auto?: boolean;
    indexed?: number;
    rgb?: ST_UnsignedIntHex;
    theme?: number;
    tint?: number;
}

/** Gradient Stop */
export interface CT_GradientFill {
    type?: ST_GradientType;
    degree?: number;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    stop?: CT_GradientStop[];
}

/** Color */
export interface CT_GradientStop {
    position: number;
    color: CT_Color;
}

/** Number Formats */
export interface CT_NumFmts {
    count?: number;
    numFmt?: CT_NumFmt[];
}

/** Number Format Id */
export interface CT_NumFmt {
    numFmtId: ST_NumFmtId;
    formatCode: ST_Xstring;
}

/** Formatting Elements */
export interface CT_CellStyleXfs {
    count?: number;
    xf: CT_Xf[];
}

/** Format */
export interface CT_CellXfs {
    count?: number;
    xf: CT_Xf[];
}

/** Alignment */
export interface CT_Xf {
    numFmtId?: ST_NumFmtId;
    fontId?: ST_FontId;
    fillId?: ST_FillId;
    borderId?: ST_BorderId;
    xfId?: ST_CellStyleXfId;
    quotePrefix?: boolean;
    pivotButton?: boolean;
    applyNumberFormat?: boolean;
    applyFont?: boolean;
    applyFill?: boolean;
    applyBorder?: boolean;
    applyAlignment?: boolean;
    applyProtection?: boolean;
    alignment?: CT_CellAlignment;
    protection?: CT_CellProtection;
    extLst?: CT_ExtensionList;
}

/** Cell Style */
export interface CT_CellStyles {
    count?: number;
    cellStyle: CT_CellStyle[];
}

/** Future Feature Data Storage Area */
export interface CT_CellStyle {
    name?: ST_Xstring;
    xfId: ST_CellStyleXfId;
    builtinId?: number;
    iLevel?: number;
    hidden?: boolean;
    customBuiltin?: boolean;
    extLst?: CT_ExtensionList;
}

/** Formatting */
export interface CT_Dxfs {
    count?: number;
    dxf?: CT_Dxf[];
}

/** Font Properties */
export interface CT_Dxf {
    font?: CT_Font;
    numFmt?: CT_NumFmt;
    fill?: CT_Fill;
    alignment?: CT_CellAlignment;
    border?: CT_Border;
    protection?: CT_CellProtection;
    extLst?: CT_ExtensionList;
}

/** Color Indexes */
export interface CT_Colors {
    indexedColors?: CT_IndexedColors;
    mruColors?: CT_MRUColors;
}

/** RGB Color */
export interface CT_IndexedColors {
    rgbColor: CT_RgbColor[];
}

/** Color */
export interface CT_MRUColors {
    color: CT_Color[];
}

/** Alpha Red Green Blue */
export interface CT_RgbColor {
    rgb?: ST_UnsignedIntHex;
}

/** Table Style */
export interface CT_TableStyles {
    count?: number;
    defaultTableStyle?: string;
    defaultPivotStyle?: string;
    tableStyle?: CT_TableStyle[];
}

/** Table Style */
export interface CT_TableStyle {
    name: string;
    pivot?: boolean;
    table?: boolean;
    count?: number;
    tableStyleElement?: CT_TableStyleElement[];
}

/** Table Style Type */
export interface CT_TableStyleElement {
    type: ST_TableStyleType;
    size?: number;
    dxfId?: ST_DxfId;
}

/** Value */
export interface CT_BooleanProperty {
    val?: boolean;
}

/** Value */
export interface CT_FontSize {
    val: number;
}

/** Value */
export interface CT_IntProperty {
    val: number;
}

/** String Value */
export interface CT_FontName {
    val: ST_Xstring;
}

/** Value */
export interface CT_VerticalAlignFontProperty {
    val: ST_VerticalAlignRun;
}

/** Font Scheme */
export interface CT_FontScheme {
    val: ST_FontScheme;
}

/** Underline Value */
export interface CT_UnderlineProperty {
    val?: ST_UnderlineValues;
}

/** Font Name */
export interface CT_Font {
    name?: CT_FontName;
    charset?: CT_IntProperty;
    family?: CT_IntProperty;
    b?: CT_BooleanProperty;
    i?: CT_BooleanProperty;
    strike?: CT_BooleanProperty;
    outline?: CT_BooleanProperty;
    shadow?: CT_BooleanProperty;
    condense?: CT_BooleanProperty;
    extend?: CT_BooleanProperty;
    color?: CT_Color;
    sz?: CT_FontSize;
    u?: CT_UnderlineProperty;
    vertAlign?: CT_VerticalAlignFontProperty;
    scheme?: CT_FontScheme;
}

