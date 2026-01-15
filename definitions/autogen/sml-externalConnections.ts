import { CT_XStringElement } from './sml-baseTypes';
import { CT_Index } from './sml-pivotTableShared';

/**
 * sml-externalConnections.xsd
 */

/** Credentials Method */
export enum ST_CredMethod {
    /** Integrated Authentication */
    integrated = "integrated",
    /** No Credentials */
    none = "none",
    /** Stored Credentials */
    stored = "stored",
    /** Prompt Credentials */
    prompt = "prompt",
}

/** HTML Formatting Handling */
export enum ST_HtmlFmt {
    /** No Formatting */
    none = "none",
    /** Honor Rich Text */
    rtf = "rtf",
    /** All */
    all = "all",
}

/** Parameter Type */
export enum ST_ParameterType {
    /** Prompt on Refresh */
    prompt = "prompt",
    /** Value */
    value = "value",
    /** Parameter From Cell */
    cell = "cell",
}

/** File Type */
export enum ST_FileType {
    /** Macintosh */
    mac = "mac",
    /** Windows (ANSI) */
    win = "win",
    /** DOS */
    dos = "dos",
}

/** Qualifier */
export enum ST_Qualifier {
    /** Double Quote */
    doubleQuote = "doubleQuote",
    /** Single Quote */
    singleQuote = "singleQuote",
    /** No Text Qualifier */
    none = "none",
}

/** Text Field Datatype */
export enum ST_ExternalConnectionType {
    /** General */
    general = "general",
    /** Text */
    text = "text",
    /** Month Day Year */
    MDY = "MDY",
    /** Day Month Year */
    DMY = "DMY",
    /** Year Month Day */
    YMD = "YMD",
    /** Month Day Year */
    MYD = "MYD",
    /** Day Year Month */
    DYM = "DYM",
    /** Year Day Month */
    YDM = "YDM",
    /** Skip Field */
    skip = "skip",
    /** East Asian Year Month Day */
    EMD = "EMD",
}

/** Connection */
export interface CT_Connections {
    connection: any[];
}

/** ODBC &amp; OLE DB Properties */
export interface CT_Connection {
    id: string;
    sourceFile?: any;
    odcFile?: any;
    keepAlive?: any;
    interval?: any;
    name?: any;
    description?: any;
    type?: any;
    reconnectionMethod?: any;
    refreshedVersion: any;
    minRefreshableVersion?: any;
    savePassword?: any;
    new?: any;
    deleted?: any;
    onlyUseConnectionFile?: any;
    background?: any;
    refreshOnLoad?: any;
    saveData?: any;
    credentials?: any;
    singleSignOnId?: any;
    dbPr?: any;
    olapPr?: any;
    webPr?: any;
    textPr?: any;
    parameters?: any;
    extLst?: any;
}

/** Connection String */
export interface CT_DbPr {
    connection: any;
    command?: any;
    serverCommand?: any;
    commandType?: any;
}

/** Local Cube */
export interface CT_OlapPr {
    local?: any;
    localConnection?: any;
    localRefresh?: any;
    sendLocale?: any;
    rowDrillCount?: any;
    serverFill?: any;
    serverNumberFormat?: any;
    serverFont?: any;
    serverFontColor?: any;
}

/** Tables */
export interface CT_WebPr {
    xml?: any;
    sourceData?: any;
    parsePre?: any;
    consecutive?: any;
    firstRow?: any;
    xl97?: any;
    textDates?: any;
    xl2000?: any;
    url?: any;
    post?: any;
    htmlTables?: any;
    htmlFormat?: any;
    editPage?: any;
    tables?: any;
}

/** Parameter Properties */
export interface CT_Parameters {
    count?: any;
    parameter: any[];
}

/** Parameter Name */
export interface CT_Parameter {
    name?: any;
    sqlType?: any;
    parameterType?: any;
    refreshOnChange?: any;
    prompt?: any;
    boolean?: any;
    double?: any;
    integer?: any;
    string?: any;
    cell?: any;
}

/** No Value */
export interface CT_Tables {
    count?: any;
    m: CT_TableMissing;
    s: CT_XStringElement;
    x: CT_Index;
}

export interface CT_TableMissing {
}

/** Fields */
export interface CT_TextPr {
    prompt?: any;
    fileType?: any;
    codePage?: any;
    firstRow?: any;
    sourceFile?: any;
    delimited?: any;
    decimal?: any;
    thousands?: any;
    tab?: any;
    space?: any;
    comma?: any;
    semicolon?: any;
    consecutive?: any;
    qualifier?: any;
    delimiter?: any;
    textFields?: any;
}

/** Text Import Field Settings */
export interface CT_TextFields {
    count?: any;
    textField: any[];
}

/** Field Type */
export interface CT_TextField {
    type?: any;
    position?: any;
}

