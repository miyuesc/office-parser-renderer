import { ST_CellRef, ST_Xstring } from './sml-baseTypes';
import { ST_CellType } from './sml-sheet';

/**
 * sml-supplementaryWorkbooks.xsd
 */

/** DDE Value Types */
export enum ST_DdeValueType {
    /** Nil */
    nil = "nil",
    /** Boolean */
    b = "b",
    /** Real Number */
    n = "n",
    /** Error */
    e = "e",
    /** String */
    str = "str",
}

/** External Workbook */
export interface CT_ExternalLink {
    externalBook?: CT_ExternalBook;
    ddeLink?: CT_DdeLink;
    oleLink?: CT_OleLink;
    extLst?: any;
}

/** Supporting Workbook Sheet Names */
export interface CT_ExternalBook {
    id: string;
    sheetNames?: CT_ExternalSheetNames;
    definedNames?: CT_ExternalDefinedNames;
    sheetDataSet?: CT_ExternalSheetDataSet;
}

/** Sheet Name */
export interface CT_ExternalSheetNames {
    sheetName: any[];
}

/** Sheet Name Value */
export interface CT_ExternalSheetName {
    val?: ST_Xstring;
}

/** Defined Name */
export interface CT_ExternalDefinedNames {
    definedName?: CT_ExternalDefinedName[];
}

/** Defined Name */
export interface CT_ExternalDefinedName {
    name: ST_Xstring;
    refersTo?: ST_Xstring;
    sheetId?: number;
}

/** External Sheet Data Set */
export interface CT_ExternalSheetDataSet {
    sheetData: CT_ExternalSheetData[];
}

/** Row */
export interface CT_ExternalSheetData {
    sheetId: number;
    refreshError?: boolean;
    row?: CT_ExternalRow[];
}

/** External Cell Data */
export interface CT_ExternalRow {
    r: number;
    cell?: CT_ExternalCell[];
}

/** Value */
export interface CT_ExternalCell {
    r?: ST_CellRef;
    t?: ST_CellType;
    vm?: number;
    v?: ST_Xstring;
}

/** DDE Items Collection */
export interface CT_DdeLink {
    ddeService: ST_Xstring;
    ddeTopic: ST_Xstring;
    ddeItems?: CT_DdeItems;
}

/** DDE Item definition */
export interface CT_DdeItems {
    ddeItem?: CT_DdeItem[];
}

/** DDE Name Values */
export interface CT_DdeItem {
    name?: ST_Xstring;
    ole?: boolean;
    advise?: boolean;
    preferPic?: boolean;
    values?: CT_DdeValues;
}

/** Value */
export interface CT_DdeValues {
    rows?: number;
    cols?: number;
    value: any[];
}

/** DDE Link Value */
export interface CT_DdeValue {
    t?: ST_DdeValueType;
    val: ST_Xstring;
}

/** OLE Link Items */
export interface CT_OleLink {
    id: string;
    progId: ST_Xstring;
    oleItems?: CT_OleItems;
}

/** OLE Link Item */
export interface CT_OleItems {
    oleItem?: CT_OleItem[];
}

/** OLE Name */
export interface CT_OleItem {
    name: ST_Xstring;
    icon?: boolean;
    advise?: boolean;
    preferPic?: boolean;
}

