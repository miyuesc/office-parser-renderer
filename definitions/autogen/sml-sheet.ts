import { CT_AutoFilter, CT_SortState, ST_IconSetType } from './sml-autoFilter';
import { CT_ExtensionList, ST_CellRef, ST_Formula, ST_Ref, ST_Sqref, ST_UnsignedShortHex, ST_Xstring } from './sml-baseTypes';
import { CT_PivotArea, ST_Axis } from './sml-pivotTableShared';
import { CT_PhoneticPr, CT_Rst } from './sml-sharedStringTable';
import { ST_DxfId, ST_NumFmtId } from './sml-styles';
import { CT_SheetBackgroundPicture, ST_SheetState } from './sml-workbook';
import { CT_Color, ST_Guid } from './wml';

/**
 * sml-sheet.xsd
 */

/** Cell Span Type */
export type ST_CellSpan = string;

/** Cell Spans */
export type ST_CellSpans = string;

/** Cell Type */
export enum ST_CellType {
    /** Boolean */
    b = "b",
    /** Number */
    n = "n",
    /** Error */
    e = "e",
    /** Shared String */
    s = "s",
    /** String */
    str = "str",
    /** Inline String */
    inlineStr = "inlineStr",
}

/** Formula Type */
export enum ST_CellFormulaType {
    /** Normal */
    normal = "normal",
    /** Array Entered */
    array = "array",
    /** Table Formula */
    dataTable = "dataTable",
    /** Shared Formula */
    shared = "shared",
}

/** Pane Types */
export enum ST_Pane {
    /** Bottom Right Pane */
    bottomRight = "bottomRight",
    /** Top Right Pane */
    topRight = "topRight",
    /** Bottom Left Pane */
    bottomLeft = "bottomLeft",
    /** Top Left Pane */
    topLeft = "topLeft",
}

/** Sheet View Type */
export enum ST_SheetViewType {
    /** Normal View */
    normal = "normal",
    /** Page Break Preview */
    pageBreakPreview = "pageBreakPreview",
    /** Page Layout View */
    pageLayout = "pageLayout",
}

/** Data Consolidation Functions */
export enum ST_DataConsolidateFunction {
    /** Average */
    average = "average",
    /** Count */
    count = "count",
    /** CountNums */
    countNums = "countNums",
    /** Maximum */
    max = "max",
    /** Minimum */
    min = "min",
    /** Product */
    product = "product",
    /** StdDev */
    stdDev = "stdDev",
    /** StdDevP */
    stdDevp = "stdDevp",
    /** Sum */
    sum = "sum",
    /** Variance */
    var = "var",
    /** VarP */
    varp = "varp",
}

/** Data Validation Type */
export enum ST_DataValidationType {
    /** None */
    none = "none",
    /** Whole Number */
    whole = "whole",
    /** Decimal */
    decimal = "decimal",
    /** List */
    list = "list",
    /** Date */
    date = "date",
    /** Time */
    time = "time",
    /** Text Length */
    textLength = "textLength",
    /** Custom */
    custom = "custom",
}

/** Data Validation Operator */
export enum ST_DataValidationOperator {
    /** Between */
    between = "between",
    /** Not Between */
    notBetween = "notBetween",
    /** Equal */
    equal = "equal",
    /** Not Equal */
    notEqual = "notEqual",
    /** Less Than */
    lessThan = "lessThan",
    /** Less Than Or Equal */
    lessThanOrEqual = "lessThanOrEqual",
    /** Greater Than */
    greaterThan = "greaterThan",
    /** Greater Than Or Equal */
    greaterThanOrEqual = "greaterThanOrEqual",
}

/** Data Validation Error Styles */
export enum ST_DataValidationErrorStyle {
    /** Stop Icon */
    stop = "stop",
    /** Warning Icon */
    warning = "warning",
    /** Information Icon */
    information = "information",
}

/** Data Validation IME Mode */
export enum ST_DataValidationImeMode {
    /** IME Mode Not Controlled */
    noControl = "noControl",
    /** IME Off */
    off = "off",
    /** IME On */
    on = "on",
    /** Disabled IME Mode */
    disabled = "disabled",
    /** Hiragana IME Mode */
    hiragana = "hiragana",
    /** Full Katakana IME Mode */
    fullKatakana = "fullKatakana",
    /** Half-Width Katakana */
    halfKatakana = "halfKatakana",
    /** Full-Width Alpha-Numeric IME Mode */
    fullAlpha = "fullAlpha",
    /** Half Alpha IME */
    halfAlpha = "halfAlpha",
    /** Full Width Hangul */
    fullHangul = "fullHangul",
    /** Half-Width Hangul IME Mode */
    halfHangul = "halfHangul",
}

/** Conditional Format Type */
export enum ST_CfType {
    /** Expression */
    expression = "expression",
    /** Cell Is */
    cellIs = "cellIs",
    /** Color Scale */
    colorScale = "colorScale",
    /** Data Bar */
    dataBar = "dataBar",
    /** Icon Set */
    iconSet = "iconSet",
    /** Top 10 */
    top10 = "top10",
    /** Unique Values */
    uniqueValues = "uniqueValues",
    /** Duplicate Values */
    duplicateValues = "duplicateValues",
    /** Contains Text */
    containsText = "containsText",
    /** Does Not Contain Text */
    notContainsText = "notContainsText",
    /** Begins With */
    beginsWith = "beginsWith",
    /** Ends With */
    endsWith = "endsWith",
    /** Contains Blanks */
    containsBlanks = "containsBlanks",
    /** Contains No Blanks */
    notContainsBlanks = "notContainsBlanks",
    /** Contains Errors */
    containsErrors = "containsErrors",
    /** Contains No Errors */
    notContainsErrors = "notContainsErrors",
    /** Time Period */
    timePeriod = "timePeriod",
    /** Above or Below Average */
    aboveAverage = "aboveAverage",
}

/** Time Period Types */
export enum ST_TimePeriod {
    /** Today */
    today = "today",
    /** Yesterday */
    yesterday = "yesterday",
    /** Tomorrow */
    tomorrow = "tomorrow",
    /** Last 7 Days */
    last7Days = "last7Days",
    /** This Month */
    thisMonth = "thisMonth",
    /** Last Month */
    lastMonth = "lastMonth",
    /** Next Month */
    nextMonth = "nextMonth",
    /** This Week */
    thisWeek = "thisWeek",
    /** Last Week */
    lastWeek = "lastWeek",
    /** Next Week */
    nextWeek = "nextWeek",
}

/** Conditional Format Operators */
export enum ST_ConditionalFormattingOperator {
    /** Less Than */
    lessThan = "lessThan",
    /** Less Than Or Equal */
    lessThanOrEqual = "lessThanOrEqual",
    /** Equal */
    equal = "equal",
    /** Not Equal */
    notEqual = "notEqual",
    /** Greater Than Or Equal */
    greaterThanOrEqual = "greaterThanOrEqual",
    /** Greater Than */
    greaterThan = "greaterThan",
    /** Between */
    between = "between",
    /** Not Between */
    notBetween = "notBetween",
    /** Contains */
    containsText = "containsText",
    /** Does Not Contain */
    notContains = "notContains",
    /** Begins With */
    beginsWith = "beginsWith",
    /** Ends With */
    endsWith = "endsWith",
}

/** Conditional Format Value Object Type */
export enum ST_CfvoType {
    /** Number */
    num = "num",
    /** Percent */
    percent = "percent",
    /** Maximum */
    max = "max",
    /** Minimum */
    min = "min",
    /** Formula */
    formula = "formula",
    /** Percentile */
    percentile = "percentile",
}

/** Page Order */
export enum ST_PageOrder {
    /** Down Then Over */
    downThenOver = "downThenOver",
    /** Over Then Down */
    overThenDown = "overThenDown",
}

/** Orientation */
export enum ST_Orientation {
    /** Default */
    default = "default",
    /** Portrait */
    portrait = "portrait",
    /** Landscape */
    landscape = "landscape",
}

/** Cell Comments */
export enum ST_CellComments {
    /** None */
    none = "none",
    /** Print Comments As Displayed */
    asDisplayed = "asDisplayed",
    /** Print At End */
    atEnd = "atEnd",
}

/** Print Errors */
export enum ST_PrintError {
    /** Display Cell Errors */
    displayed = "displayed",
    /** Show Cell Errors As Blank */
    blank = "blank",
    /** Dash Cell Errors */
    dash = "dash",
    /** NA */
    NA = "NA",
}

/** Data View Aspect Type */
export enum ST_DvAspect {
    /** Object Display Content */
    DVASPECT_CONTENT = "DVASPECT_CONTENT",
    /** Object Display Icon */
    DVASPECT_ICON = "DVASPECT_ICON",
}

/** OLE Update Types */
export enum ST_OleUpdate {
    /** Always Update OLE */
    OLEUPDATE_ALWAYS = "OLEUPDATE_ALWAYS",
    /** Update OLE On Call */
    OLEUPDATE_ONCALL = "OLEUPDATE_ONCALL",
}

/** Web Source Type */
export enum ST_WebSourceType {
    /** All Sheet Content */
    sheet = "sheet",
    /** Print Area */
    printArea = "printArea",
    /** AutoFilter */
    autoFilter = "autoFilter",
    /** Range */
    range = "range",
    /** Chart */
    chart = "chart",
    /** PivotTable */
    pivotTable = "pivotTable",
    /** QueryTable */
    query = "query",
    /** Label */
    label = "label",
}

/** Pane State */
export enum ST_PaneState {
    /** Split */
    split = "split",
    /** Frozen */
    frozen = "frozen",
    /** Frozen Split */
    frozenSplit = "frozenSplit",
}

/** Sheet Properties */
export interface CT_Macrosheet {
    sheetPr?: CT_SheetPr;
    dimension?: CT_SheetDimension;
    sheetViews?: CT_SheetViews;
    sheetFormatPr?: CT_SheetFormatPr;
    cols?: CT_Cols[];
    sheetData: CT_SheetData;
    sheetProtection?: CT_SheetProtection;
    autoFilter?: CT_AutoFilter;
    sortState?: CT_SortState;
    dataConsolidate?: CT_DataConsolidate;
    customSheetViews?: CT_CustomSheetViews;
    phoneticPr?: CT_PhoneticPr;
    conditionalFormatting?: CT_ConditionalFormatting[];
    printOptions?: CT_PrintOptions;
    pageMargins?: CT_PageMargins;
    pageSetup?: CT_PageSetup;
    headerFooter?: CT_HeaderFooter;
    rowBreaks?: CT_PageBreak;
    colBreaks?: CT_PageBreak;
    customProperties?: CT_CustomProperties;
    drawing?: CT_Drawing;
    legacyDrawing?: CT_LegacyDrawing;
    legacyDrawingHF?: CT_LegacyDrawing;
    picture?: CT_SheetBackgroundPicture;
    oleObjects?: CT_OleObjects;
    extLst?: any;
}

/** Sheet Properties */
export interface CT_Dialogsheet {
    sheetPr?: any;
    sheetViews?: any;
    sheetFormatPr?: any;
    sheetProtection?: CT_SheetProtection;
    customSheetViews?: any;
    printOptions?: any;
    pageMargins?: any;
    pageSetup?: any;
    headerFooter?: any;
    drawing?: any;
    legacyDrawing?: any;
    legacyDrawingHF?: CT_LegacyDrawing;
    oleObjects?: CT_OleObjects;
    extLst?: any;
}

/** Worksheet Properties */
export interface CT_Worksheet {
    sheetPr?: CT_SheetPr;
    dimension?: CT_SheetDimension;
    sheetViews?: CT_SheetViews;
    sheetFormatPr?: CT_SheetFormatPr;
    cols?: CT_Cols[];
    sheetData: CT_SheetData;
    sheetCalcPr?: CT_SheetCalcPr;
    sheetProtection?: CT_SheetProtection;
    protectedRanges?: CT_ProtectedRanges;
    scenarios?: CT_Scenarios;
    autoFilter?: CT_AutoFilter;
    sortState?: CT_SortState;
    dataConsolidate?: CT_DataConsolidate;
    customSheetViews?: CT_CustomSheetViews;
    mergeCells?: CT_MergeCells;
    phoneticPr?: CT_PhoneticPr;
    conditionalFormatting?: CT_ConditionalFormatting[];
    dataValidations?: CT_DataValidations;
    hyperlinks?: CT_Hyperlinks;
    printOptions?: CT_PrintOptions;
    pageMargins?: CT_PageMargins;
    pageSetup?: CT_PageSetup;
    headerFooter?: CT_HeaderFooter;
    rowBreaks?: CT_PageBreak;
    colBreaks?: CT_PageBreak;
    customProperties?: CT_CustomProperties;
    cellWatches?: CT_CellWatches;
    ignoredErrors?: CT_IgnoredErrors;
    smartTags?: CT_SmartTags;
    drawing?: CT_Drawing;
    legacyDrawing?: CT_LegacyDrawing;
    legacyDrawingHF?: CT_LegacyDrawing;
    picture?: CT_SheetBackgroundPicture;
    oleObjects?: CT_OleObjects;
    controls?: CT_Controls;
    webPublishItems?: CT_WebPublishItems;
    tableParts?: CT_TableParts;
    extLst?: CT_ExtensionList;
}

/** Row */
export interface CT_SheetData {
    row?: CT_Row[];
}

/** Full Calculation On Load */
export interface CT_SheetCalcPr {
    fullCalcOnLoad?: boolean;
}

/** Base Column Width */
export interface CT_SheetFormatPr {
    baseColWidth?: number;
    defaultColWidth?: number;
    defaultRowHeight: number;
    customHeight?: boolean;
    zeroHeight?: boolean;
    thickTop?: boolean;
    thickBottom?: boolean;
    outlineLevelRow?: number;
    outlineLevelCol?: number;
}

/** Column Width &amp; Formatting */
export interface CT_Cols {
    col: CT_Col[];
}

/** Minimum Column */
export interface CT_Col {
    min: number;
    max: number;
    width?: number;
    style?: number;
    hidden?: boolean;
    bestFit?: boolean;
    customWidth?: boolean;
    phonetic?: boolean;
    outlineLevel?: number;
    collapsed?: boolean;
}

/** Cell */
export interface CT_Row {
    r?: number;
    spans?: ST_CellSpans;
    s?: number;
    customFormat?: boolean;
    ht?: number;
    hidden?: boolean;
    customHeight?: boolean;
    outlineLevel?: number;
    collapsed?: boolean;
    thickTop?: boolean;
    thickBot?: boolean;
    ph?: boolean;
    c?: CT_Cell[];
    extLst?: any;
}

/** Formula */
export interface CT_Cell {
    r?: ST_CellRef;
    s?: number;
    t?: ST_CellType;
    cm?: number;
    vm?: number;
    ph?: boolean;
    f?: CT_CellFormula;
    v?: ST_Xstring;
    is?: CT_Rst;
    extLst?: any;
}

/** Sheet Tab Color */
export interface CT_SheetPr {
    syncHorizontal?: boolean;
    syncVertical?: boolean;
    syncRef?: ST_Ref;
    transitionEvaluation?: boolean;
    transitionEntry?: boolean;
    published?: boolean;
    codeName?: string;
    filterMode?: boolean;
    enableFormatConditionsCalculation?: boolean;
    tabColor?: CT_Color;
    outlinePr?: CT_OutlinePr;
    pageSetUpPr?: CT_PageSetUpPr;
}

/** Reference */
export interface CT_SheetDimension {
    ref: ST_Ref;
}

/** Worksheet View */
export interface CT_SheetViews {
    sheetView: CT_SheetView[];
    extLst?: CT_ExtensionList;
}

/** View Pane */
export interface CT_SheetView {
    windowProtection?: boolean;
    showFormulas?: boolean;
    showGridLines?: boolean;
    showRowColHeaders?: boolean;
    showZeros?: boolean;
    rightToLeft?: boolean;
    tabSelected?: boolean;
    showRuler?: boolean;
    showOutlineSymbols?: boolean;
    defaultGridColor?: boolean;
    showWhiteSpace?: boolean;
    view?: ST_SheetViewType;
    topLeftCell?: ST_CellRef;
    colorId?: number;
    zoomScale?: number;
    zoomScaleNormal?: number;
    zoomScaleSheetLayoutView?: number;
    zoomScalePageLayoutView?: number;
    workbookViewId: number;
    pane?: CT_Pane;
    selection?: CT_Selection[];
    pivotSelection?: CT_PivotSelection[];
    extLst?: any;
}

/** Horizontal Split Position */
export interface CT_Pane {
    xSplit?: number;
    ySplit?: number;
    topLeftCell?: ST_CellRef;
    activePane?: ST_Pane;
    state?: ST_PaneState;
}

/** Pivot Area */
export interface CT_PivotSelection {
    pane?: ST_Pane;
    showHeader?: boolean;
    label?: boolean;
    data?: boolean;
    extendable?: boolean;
    count?: number;
    axis?: ST_Axis;
    dimension?: number;
    start?: number;
    min?: number;
    max?: number;
    activeRow?: number;
    activeCol?: number;
    previousRow?: number;
    previousCol?: number;
    click?: number;
    id: string;
    pivotArea: CT_PivotArea;
}

/** Pane */
export interface CT_Selection {
    pane?: ST_Pane;
    activeCell?: ST_CellRef;
    activeCellId?: number;
    sqref?: ST_Sqref;
}

/** Break */
export interface CT_PageBreak {
    count?: number;
    manualBreakCount?: number;
    brk?: CT_Break[];
}

/** Id */
export interface CT_Break {
    id?: number;
    min?: number;
    max?: number;
    man?: boolean;
    pt?: boolean;
}

/** Apply Styles in Outline */
export interface CT_OutlinePr {
    applyStyles?: boolean;
    summaryBelow?: boolean;
    summaryRight?: boolean;
    showOutlineSymbols?: boolean;
}

/** Show Auto Page Breaks */
export interface CT_PageSetUpPr {
    autoPageBreaks?: boolean;
    fitToPage?: boolean;
}

/** Data Consolidation References */
export interface CT_DataConsolidate {
    function?: ST_DataConsolidateFunction;
    leftLabels?: boolean;
    topLabels?: boolean;
    link?: boolean;
    dataRefs?: CT_DataRefs;
}

/** Data Consolidation Reference */
export interface CT_DataRefs {
    count?: number;
    dataRef?: CT_DataRef[];
}

/** Reference */
export interface CT_DataRef {
    ref?: ST_Ref;
    name?: ST_Xstring;
    sheet?: ST_Xstring;
    id: string;
}

/** Merged Cell */
export interface CT_MergeCells {
    count?: number;
    mergeCell: CT_MergeCell[];
}

/** Reference */
export interface CT_MergeCell {
    ref: ST_Ref;
}

/** Cell Smart Tags */
export interface CT_SmartTags {
    cellSmartTags: CT_CellSmartTags[];
}

/** Cell Smart Tag */
export interface CT_CellSmartTags {
    r: ST_CellRef;
    cellSmartTag: CT_CellSmartTag[];
}

/** Smart Tag Properties */
export interface CT_CellSmartTag {
    type: number;
    deleted?: boolean;
    xmlBased?: boolean;
    cellSmartTagPr?: any[];
}

/** Key Name */
export interface CT_CellSmartTagPr {
    key: ST_Xstring;
    val: ST_Xstring;
}

/** Relationship id */
export interface CT_Drawing {
    id: string;
}

/** Relationship Id */
export interface CT_LegacyDrawing {
    id: string;
}

/** Custom Sheet View */
export interface CT_CustomSheetViews {
    customSheetView: any[];
}

/** Pane Split Information */
export interface CT_CustomSheetView {
    guid: ST_Guid;
    scale?: number;
    colorId?: number;
    showPageBreaks?: boolean;
    showFormulas?: boolean;
    showGridLines?: boolean;
    showRowCol?: boolean;
    outlineSymbols?: boolean;
    zeroValues?: boolean;
    fitToPage?: boolean;
    printArea?: boolean;
    filter?: boolean;
    showAutoFilter?: boolean;
    hiddenRows?: boolean;
    hiddenColumns?: boolean;
    state?: ST_SheetState;
    filterUnique?: boolean;
    view?: ST_SheetViewType;
    showRuler?: boolean;
    topLeftCell?: ST_CellRef;
    pane?: CT_Pane;
    selection?: CT_Selection;
    rowBreaks?: CT_PageBreak;
    colBreaks?: CT_PageBreak;
    pageMargins?: CT_PageMargins;
    printOptions?: CT_PrintOptions;
    pageSetup?: CT_PageSetup;
    headerFooter?: CT_HeaderFooter;
    autoFilter?: CT_AutoFilter;
    extLst?: any;
}

/** Data Validation */
export interface CT_DataValidations {
    disablePrompts?: boolean;
    xWindow?: number;
    yWindow?: number;
    count?: number;
    dataValidation: CT_DataValidation[];
}

/** Formula 1 */
export interface CT_DataValidation {
    type?: ST_DataValidationType;
    errorStyle?: ST_DataValidationErrorStyle;
    imeMode?: ST_DataValidationImeMode;
    operator?: ST_DataValidationOperator;
    allowBlank?: boolean;
    showDropDown?: boolean;
    showInputMessage?: boolean;
    showErrorMessage?: boolean;
    errorTitle?: ST_Xstring;
    error?: ST_Xstring;
    promptTitle?: ST_Xstring;
    prompt?: ST_Xstring;
    sqref: ST_Sqref;
    formula1?: ST_Formula;
    formula2?: ST_Formula;
}

/** Conditional Formatting Rule */
export interface CT_ConditionalFormatting {
    pivot?: boolean;
    sqref?: ST_Sqref;
    cfRule: CT_CfRule[];
    extLst?: any;
}

/** Formula */
export interface CT_CfRule {
    type?: ST_CfType;
    dxfId?: ST_DxfId;
    priority: number;
    stopIfTrue?: boolean;
    aboveAverage?: boolean;
    percent?: boolean;
    bottom?: boolean;
    operator?: ST_ConditionalFormattingOperator;
    text?: string;
    timePeriod?: ST_TimePeriod;
    rank?: number;
    stdDev?: number;
    equalAverage?: boolean;
    formula?: ST_Formula[];
    colorScale?: CT_ColorScale;
    dataBar?: CT_DataBar;
    iconSet?: CT_IconSet;
    extLst?: any;
}

/** Hyperlink */
export interface CT_Hyperlinks {
    hyperlink: CT_Hyperlink[];
}

/** Reference */
export interface CT_Hyperlink {
    ref: ST_Ref;
    id: string;
    location?: ST_Xstring;
    tooltip?: ST_Xstring;
    display?: ST_Xstring;
}

/** Formula Type */
export interface CT_CellFormula { val?: ST_Formula; 
    t?: ST_CellFormulaType;
    aca?: boolean;
    ref?: ST_Ref;
    dt2D?: boolean;
    dtr?: boolean;
    del1?: boolean;
    del2?: boolean;
    r1?: ST_CellRef;
    r2?: ST_CellRef;
    ca?: boolean;
    si?: number;
    bx?: boolean;
}

/** Conditional Format Value Object */
export interface CT_ColorScale {
    cfvo: CT_Cfvo[];
    color: CT_Color[];
}

/** Conditional Format Value Object */
export interface CT_DataBar {
    minLength?: number;
    maxLength?: number;
    showValue?: boolean;
    cfvo: CT_Cfvo[];
    color: CT_Color;
}

/** Conditional Formatting Object */
export interface CT_IconSet {
    iconSet?: ST_IconSetType;
    showValue?: boolean;
    percent?: boolean;
    reverse?: boolean;
    cfvo: CT_Cfvo[];
}

/** Type */
export interface CT_Cfvo {
    type: ST_CfvoType;
    val?: ST_Xstring;
    gte?: boolean;
    extLst?: CT_ExtensionList;
}

/** Left Page Margin */
export interface CT_PageMargins {
    left: number;
    right: number;
    top: number;
    bottom: number;
    header: number;
    footer: number;
}

/** Horizontal Centered */
export interface CT_PrintOptions {
    horizontalCentered?: boolean;
    verticalCentered?: boolean;
    headings?: boolean;
    gridLines?: boolean;
    gridLinesSet?: boolean;
}

/** Paper Size */
export interface CT_PageSetup {
    paperSize?: number;
    scale?: number;
    firstPageNumber?: number;
    fitToWidth?: number;
    fitToHeight?: number;
    pageOrder?: ST_PageOrder;
    orientation?: ST_Orientation;
    usePrinterDefaults?: boolean;
    blackAndWhite?: boolean;
    draft?: boolean;
    cellComments?: ST_CellComments;
    useFirstPageNumber?: boolean;
    errors?: ST_PrintError;
    horizontalDpi?: number;
    verticalDpi?: number;
    copies?: number;
    id: string;
}

/** Odd Header */
export interface CT_HeaderFooter {
    differentOddEven?: boolean;
    differentFirst?: boolean;
    scaleWithDoc?: boolean;
    alignWithMargins?: boolean;
    oddHeader?: ST_Xstring;
    oddFooter?: ST_Xstring;
    evenHeader?: ST_Xstring;
    evenFooter?: ST_Xstring;
    firstHeader?: ST_Xstring;
    firstFooter?: ST_Xstring;
}

/** Scenario */
export interface CT_Scenarios {
    current?: number;
    show?: number;
    sqref?: ST_Sqref;
    scenario: CT_Scenario[];
}

/** Password */
export interface CT_SheetProtection {
    password?: ST_UnsignedShortHex;
    sheet?: boolean;
    objects?: boolean;
    scenarios?: boolean;
    formatCells?: boolean;
    formatColumns?: boolean;
    formatRows?: boolean;
    insertColumns?: boolean;
    insertRows?: boolean;
    insertHyperlinks?: boolean;
    deleteColumns?: boolean;
    deleteRows?: boolean;
    selectLockedCells?: boolean;
    sort?: boolean;
    autoFilter?: boolean;
    pivotTables?: boolean;
    selectUnlockedCells?: boolean;
}

/** Protected Range */
export interface CT_ProtectedRanges {
    protectedRange: CT_ProtectedRange[];
}

/** Password */
export interface CT_ProtectedRange {
    password?: ST_UnsignedShortHex;
    sqref: ST_Sqref;
    name: ST_Xstring;
    securityDescriptor?: string;
}

/** Input Cells */
export interface CT_Scenario {
    name: ST_Xstring;
    locked?: boolean;
    hidden?: boolean;
    count?: number;
    user?: ST_Xstring;
    comment?: ST_Xstring;
    inputCells: CT_InputCells[];
}

/** Reference */
export interface CT_InputCells {
    r: ST_CellRef;
    deleted?: boolean;
    undone?: boolean;
    val: ST_Xstring;
    numFmtId?: ST_NumFmtId;
}

/** Cell Watch Item */
export interface CT_CellWatches {
    cellWatch: CT_CellWatch[];
}

/** Reference */
export interface CT_CellWatch {
    r: ST_CellRef;
}

/** Chart Sheet Properties */
export interface CT_Chartsheet {
    sheetPr?: CT_ChartsheetPr;
    sheetViews: CT_ChartsheetViews;
    sheetProtection?: CT_ChartsheetProtection;
    customSheetViews?: CT_CustomChartsheetViews;
    pageMargins?: any;
    pageSetup?: CT_CsPageSetup;
    headerFooter?: any;
    drawing: CT_Drawing;
    legacyDrawing?: CT_LegacyDrawing;
    legacyDrawingHF?: CT_LegacyDrawing;
    picture?: CT_SheetBackgroundPicture;
    webPublishItems?: CT_WebPublishItems;
    extLst?: CT_ExtensionList;
}

/** Published */
export interface CT_ChartsheetPr {
    published?: boolean;
    codeName?: string;
    tabColor?: CT_Color;
}

/** Chart Sheet View */
export interface CT_ChartsheetViews {
    sheetView: CT_ChartsheetView[];
    extLst?: CT_ExtensionList;
}

/** Sheet Tab Selected */
export interface CT_ChartsheetView {
    tabSelected?: boolean;
    zoomScale?: number;
    workbookViewId: number;
    zoomToFit?: boolean;
    extLst?: CT_ExtensionList;
}

/** Password */
export interface CT_ChartsheetProtection {
    password?: ST_UnsignedShortHex;
    content?: boolean;
    objects?: boolean;
}

/** Paper Size */
export interface CT_CsPageSetup {
    paperSize?: number;
    firstPageNumber?: number;
    orientation?: ST_Orientation;
    usePrinterDefaults?: boolean;
    blackAndWhite?: boolean;
    draft?: boolean;
    useFirstPageNumber?: boolean;
    horizontalDpi?: number;
    verticalDpi?: number;
    copies?: number;
    id: string;
}

/** Custom Chart Sheet View */
export interface CT_CustomChartsheetViews {
    customSheetView?: any[];
}

/** Chart Sheet Page Setup */
export interface CT_CustomChartsheetView {
    guid: ST_Guid;
    scale?: number;
    state?: ST_SheetState;
    zoomToFit?: boolean;
    pageMargins?: CT_PageMargins;
    pageSetup?: CT_CsPageSetup;
    headerFooter?: CT_HeaderFooter;
}

/** Custom Property */
export interface CT_CustomProperties {
    customPr: CT_CustomProperty[];
}

/** Custom Property Name */
export interface CT_CustomProperty {
    name: ST_Xstring;
    id: string;
}

/** OLE Object */
export interface CT_OleObjects {
    oleObject: CT_OleObject[];
}

/** OLE ProgId */
export interface CT_OleObject {
    progId?: string;
    dvAspect?: ST_DvAspect;
    link?: ST_Xstring;
    oleUpdate?: ST_OleUpdate;
    autoLoad?: boolean;
    shapeId: number;
    id: string;
}

/** Web Publishing Item */
export interface CT_WebPublishItems {
    count?: number;
    webPublishItem: CT_WebPublishItem[];
}

/** Id */
export interface CT_WebPublishItem {
    id: number;
    divId: ST_Xstring;
    sourceType: ST_WebSourceType;
    sourceRef?: ST_Ref;
    sourceObject?: ST_Xstring;
    destinationFile: ST_Xstring;
    title?: ST_Xstring;
    autoRepublish?: boolean;
}

/** Embedded Control */
export interface CT_Controls {
    control: CT_Control[];
}

/** Shape Id */
export interface CT_Control {
    shapeId: number;
    id: string;
    name?: string;
}

/** Ignored Error */
export interface CT_IgnoredErrors {
    ignoredError: CT_IgnoredError[];
    extLst?: CT_ExtensionList;
}

/** Sequence of References */
export interface CT_IgnoredError {
    sqref: ST_Sqref;
    evalError?: boolean;
    twoDigitTextYear?: boolean;
    numberStoredAsText?: boolean;
    formula?: boolean;
    formulaRange?: boolean;
    unlockedFormula?: boolean;
    emptyCellReference?: boolean;
    listDataValidation?: boolean;
    calculatedColumn?: boolean;
}

/** Table Part */
export interface CT_TableParts {
    count?: number;
    tablePart?: CT_TablePart[];
}

/** Relationship Id */
export interface CT_TablePart {
    id: string;
}

