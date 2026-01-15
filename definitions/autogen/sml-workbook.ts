import { CT_ExtensionList, ST_Formula, ST_Ref, ST_UnsignedShortHex, ST_Xstring } from './sml-baseTypes';
import { ST_Guid } from './wml';

/**
 * sml-workbook.xsd
 */

/** Visibility Types */
export enum ST_Visibility {
    /** Visible */
    visible = "visible",
    /** Hidden */
    hidden = "hidden",
    /** Very Hidden */
    veryHidden = "veryHidden",
}

/** Comment Display Types */
export enum ST_Comments {
    /** No Comments */
    commNone = "commNone",
    /** Show Comment Indicator */
    commIndicator = "commIndicator",
    /** Show Comment &amp; Indicator */
    commIndAndComment = "commIndAndComment",
}

/** Object Display Types */
export enum ST_Objects {
    /** All */
    all = "all",
    /** Show Placeholders */
    placeholders = "placeholders",
    /** None */
    none = "none",
}

/** Sheet Visibility Types */
export enum ST_SheetState {
    /** Visible */
    visible = "visible",
    /** Hidden */
    hidden = "hidden",
    /** Very Hidden */
    veryHidden = "veryHidden",
}

/** Update Links Behavior Types */
export enum ST_UpdateLinks {
    /** User Set */
    userSet = "userSet",
    /** Never Update Links */
    never = "never",
    /** Always Update Links */
    always = "always",
}

/** Smart Tag Display Types */
export enum ST_SmartTagShow {
    /** All */
    all = "all",
    /** None */
    none = "none",
    /** No Smart Tag Indicator */
    noIndicator = "noIndicator",
}

/** Calculation Mode */
export enum ST_CalcMode {
    /** Manual Calculation Mode */
    manual = "manual",
    /** Automatic */
    auto = "auto",
    /** Automatic Calculation (No Tables) */
    autoNoTable = "autoNoTable",
}

/** Reference Mode */
export enum ST_RefMode {
    /** A1 Mode */
    A1 = "A1",
    /** R1C1 Reference Mode */
    R1C1 = "R1C1",
}

/** Target Screen Size Types */
export enum ST_TargetScreenSize {
    /** 544 x 376 Resolution */
    _544x376 = "544x376",
    /** 640 x 480 Resolution */
    _640x480 = "640x480",
    /** 720 x 512 Resolution */
    _720x512 = "720x512",
    /** 800 x 600 Resolution */
    _800x600 = "800x600",
    /** 1024 x 768 Resolution */
    _1024x768 = "1024x768",
    /** 1152 x 882 Resolution */
    _1152x882 = "1152x882",
    /** 1152 x 900 Resolution */
    _1152x900 = "1152x900",
    /** 1280 x 1024 Resolution */
    _1280x1024 = "1280x1024",
    /** 1600 x 1200 Resolution */
    _1600x1200 = "1600x1200",
    /** 1800 x 1440 Resolution */
    _1800x1440 = "1800x1440",
    /** 1920 x 1200 Resolution */
    _1920x1200 = "1920x1200",
}

/** File Version */
export interface CT_Workbook {
    fileVersion?: CT_FileVersion;
    fileSharing?: CT_FileSharing;
    workbookPr?: CT_WorkbookPr;
    workbookProtection?: CT_WorkbookProtection;
    bookViews?: CT_BookViews;
    sheets: CT_Sheets;
    functionGroups?: CT_FunctionGroups;
    externalReferences?: CT_ExternalReferences;
    definedNames?: CT_DefinedNames;
    calcPr?: CT_CalcPr;
    oleSize?: CT_OleSize;
    customWorkbookViews?: CT_CustomWorkbookViews;
    pivotCaches?: CT_PivotCaches;
    smartTagPr?: CT_SmartTagPr;
    smartTagTypes?: CT_SmartTagTypes;
    webPublishing?: CT_WebPublishing;
    fileRecoveryPr?: CT_FileRecoveryPr[];
    webPublishObjects?: CT_WebPublishObjects;
    extLst?: CT_ExtensionList;
}

/** Application Name */
export interface CT_FileVersion {
    appName?: string;
    lastEdited?: string;
    lowestEdited?: string;
    rupBuild?: string;
    codeName?: ST_Guid;
}

/** Workbook View */
export interface CT_BookViews {
    workbookView: CT_BookView[];
}

/** Visibility */
export interface CT_BookView {
    visibility?: ST_Visibility;
    minimized?: boolean;
    showHorizontalScroll?: boolean;
    showVerticalScroll?: boolean;
    showSheetTabs?: boolean;
    xWindow?: number;
    yWindow?: number;
    windowWidth?: number;
    windowHeight?: number;
    tabRatio?: number;
    firstSheet?: number;
    activeTab?: number;
    autoFilterDateGrouping?: boolean;
    extLst?: CT_ExtensionList;
}

/** Custom Workbook View */
export interface CT_CustomWorkbookViews {
    customWorkbookView: any[];
}

/** Custom View Name */
export interface CT_CustomWorkbookView {
    name: ST_Xstring;
    guid: ST_Guid;
    autoUpdate?: boolean;
    mergeInterval?: number;
    changesSavedWin?: boolean;
    onlySync?: boolean;
    personalView?: boolean;
    includePrintSettings?: boolean;
    includeHiddenRowCol?: boolean;
    maximized?: boolean;
    minimized?: boolean;
    showHorizontalScroll?: boolean;
    showVerticalScroll?: boolean;
    showSheetTabs?: boolean;
    xWindow?: number;
    yWindow?: number;
    windowWidth: number;
    windowHeight: number;
    tabRatio?: number;
    activeSheetId: number;
    showFormulaBar?: boolean;
    showStatusbar?: boolean;
    showComments?: ST_Comments;
    showObjects?: ST_Objects;
    extLst?: any;
}

/** Sheet Information */
export interface CT_Sheets {
    sheet: CT_Sheet[];
}

/** Sheet Name */
export interface CT_Sheet {
    name: ST_Xstring;
    sheetId: number;
    state?: ST_SheetState;
    id: string;
}

/** Date 1904 */
export interface CT_WorkbookPr {
    date1904?: boolean;
    showObjects?: ST_Objects;
    showBorderUnselectedTables?: boolean;
    filterPrivacy?: boolean;
    promptedSolutions?: boolean;
    showInkAnnotation?: boolean;
    backupFile?: boolean;
    saveExternalLinkValues?: boolean;
    updateLinks?: ST_UpdateLinks;
    codeName?: string;
    hidePivotFieldList?: boolean;
    showPivotChartFilter?: boolean;
    allowRefreshQuery?: boolean;
    publishItems?: boolean;
    checkCompatibility?: boolean;
    autoCompressPictures?: boolean;
    refreshAllConnections?: boolean;
    defaultThemeVersion?: number;
}

/** Embed SmartTags */
export interface CT_SmartTagPr {
    embed?: boolean;
    show?: ST_SmartTagShow;
}

/** Smart Tag Type */
export interface CT_SmartTagTypes {
    smartTagType?: CT_SmartTagType[];
}

/** SmartTag Namespace URI */
export interface CT_SmartTagType {
    namespaceUri?: ST_Xstring;
    name?: ST_Xstring;
    url?: ST_Xstring;
}

/** Auto Recover */
export interface CT_FileRecoveryPr {
    autoRecover?: boolean;
    crashSave?: boolean;
    dataExtractLoad?: boolean;
    repairLoad?: boolean;
}

/** Calculation Id */
export interface CT_CalcPr {
    calcId?: number;
    calcMode?: ST_CalcMode;
    fullCalcOnLoad?: boolean;
    refMode?: ST_RefMode;
    iterate?: boolean;
    iterateCount?: number;
    iterateDelta?: number;
    fullPrecision?: boolean;
    calcCompleted?: boolean;
    calcOnSave?: boolean;
    concurrentCalc?: boolean;
    concurrentManualCount?: number;
    forceFullCalc?: boolean;
}

/** Defined Name */
export interface CT_DefinedNames {
    definedName?: CT_DefinedName[];
}

/** Defined Name */
export interface CT_DefinedName { val?: ST_Formula; 
    name: ST_Xstring;
    comment?: ST_Xstring;
    customMenu?: ST_Xstring;
    description?: ST_Xstring;
    help?: ST_Xstring;
    statusBar?: ST_Xstring;
    localSheetId?: number;
    hidden?: boolean;
    function?: boolean;
    vbProcedure?: boolean;
    xlm?: boolean;
    functionGroupId?: number;
    shortcutKey?: ST_Xstring;
    publishToServer?: boolean;
    workbookParameter?: boolean;
}

/** External Reference */
export interface CT_ExternalReferences {
    externalReference: CT_ExternalReference[];
}

/** Relationship Id */
export interface CT_ExternalReference {
    id: string;
}

/** Relationship Id */
export interface CT_SheetBackgroundPicture {
    id: string;
}

/** PivotCache */
export interface CT_PivotCaches {
    pivotCache: CT_PivotCache[];
}

/** PivotCache Id */
export interface CT_PivotCache {
    cacheId: number;
    id: string;
}

/** Read Only Recommended */
export interface CT_FileSharing {
    readOnlyRecommended?: boolean;
    userName?: ST_Xstring;
    reservationPassword?: ST_UnsignedShortHex;
}

/** Reference */
export interface CT_OleSize {
    ref: ST_Ref;
}

/** Workbook Password */
export interface CT_WorkbookProtection {
    workbookPassword?: ST_UnsignedShortHex;
    revisionsPassword?: ST_UnsignedShortHex;
    lockStructure?: boolean;
    lockWindows?: boolean;
    lockRevision?: boolean;
}

/** Use CSS */
export interface CT_WebPublishing {
    css?: boolean;
    thicket?: boolean;
    longFileNames?: boolean;
    vml?: boolean;
    allowPng?: boolean;
    targetScreenSize?: ST_TargetScreenSize;
    dpi?: number;
    codePage?: number;
}

/** Function Group */
export interface CT_FunctionGroups {
    builtInGroupCount?: number;
    functionGroup?: CT_FunctionGroup;
}

/** Name */
export interface CT_FunctionGroup {
    name?: ST_Xstring;
}

/** Web Publishing Object */
export interface CT_WebPublishObjects {
    count?: number;
    webPublishObject: CT_WebPublishObject[];
}

/** Id */
export interface CT_WebPublishObject {
    id: number;
    divId: ST_Xstring;
    sourceObject?: ST_Xstring;
    destinationFile: ST_Xstring;
    title?: ST_Xstring;
    autoRepublish?: boolean;
}

