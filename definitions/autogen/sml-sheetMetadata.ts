import { CT_XStringElement, ST_UnsignedIntHex, ST_Xstring } from './sml-baseTypes';

/**
 * sml-sheetMetadata.xsd
 */

/** MDX Function Type */
export enum ST_MdxFunctionType {
    /** Cube Member */
    m = "m",
    /** Cube Value */
    v = "v",
    /** Cube Set */
    s = "s",
    /** Cube Set Count */
    c = "c",
    /** Cube Ranked Member */
    r = "r",
    /** Cube Member Property */
    p = "p",
    /** Cube KPI Member */
    k = "k",
}

/** MDX Set Order */
export enum ST_MdxSetOrder {
    /** Unsorted */
    u = "u",
    /** Ascending */
    a = "a",
    /** Descending */
    d = "d",
    /** Alpha Ascending Sort Order */
    aa = "aa",
    /** Alpha Descending Sort Order */
    ad = "ad",
    /** Natural Ascending */
    na = "na",
    /** Natural Descending */
    nd = "nd",
}

/** MDX KPI Property */
export enum ST_MdxKPIProperty {
    /** Value */
    v = "v",
    /** Goal */
    g = "g",
    /** Status */
    s = "s",
    /** Trend */
    t = "t",
    /** Weight */
    w = "w",
    /** Current Time Member */
    m = "m",
}

/** Metadata Types Collection */
export interface CT_Metadata {
    metadataTypes?: CT_MetadataTypes;
    metadataStrings?: CT_MetadataStrings;
    mdxMetadata?: CT_MdxMetadata;
    futureMetadata?: CT_FutureMetadata[];
    cellMetadata?: CT_MetadataBlocks;
    valueMetadata?: CT_MetadataBlocks;
    extLst?: any;
}

/** Metadata Type Information */
export interface CT_MetadataTypes {
    count?: number;
    metadataType: CT_MetadataType[];
}

/** Metadata Type Name */
export interface CT_MetadataType {
    name: ST_Xstring;
    minSupportedVersion: number;
    ghostRow?: boolean;
    ghostCol?: boolean;
    edit?: boolean;
    delete?: boolean;
    copy?: boolean;
    pasteAll?: boolean;
    pasteFormulas?: boolean;
    pasteValues?: boolean;
    pasteFormats?: boolean;
    pasteComments?: boolean;
    pasteDataValidation?: boolean;
    pasteBorders?: boolean;
    pasteColWidths?: boolean;
    pasteNumberFormats?: boolean;
    merge?: boolean;
    splitFirst?: boolean;
    splitAll?: boolean;
    rowColShift?: boolean;
    clearAll?: boolean;
    clearFormats?: boolean;
    clearContents?: boolean;
    clearComments?: boolean;
    assign?: boolean;
    coerce?: boolean;
    adjust?: boolean;
    cellMeta?: boolean;
}

/** Metadata Block */
export interface CT_MetadataBlocks {
    count?: number;
    bk: CT_MetadataBlock[];
}

/** Metadata Record */
export interface CT_MetadataBlock {
    rc: CT_MetadataRecord[];
}

/** Metadata Record Type Index */
export interface CT_MetadataRecord {
    t: number;
    v: number;
}

/** Future Metadata Block */
export interface CT_FutureMetadata {
    name: ST_Xstring;
    count?: number;
    bk?: CT_FutureMetadataBlock[];
    extLst?: any;
}

/** Future Feature Storage Area */
export interface CT_FutureMetadataBlock {
    extLst?: any;
}

/** MDX Metadata Record */
export interface CT_MdxMetadata {
    count?: number;
    mdx: CT_Mdx[];
}

/** Tuple MDX Metadata */
export interface CT_Mdx {
    n: number;
    f: ST_MdxFunctionType;
    t: CT_MdxTuple;
    ms: CT_MdxSet;
    p: CT_MdxMemeberProp;
    k: CT_MdxKPI;
}

/** Member Unique Name Index */
export interface CT_MdxTuple {
    c?: number;
    ct?: ST_Xstring;
    si?: number;
    fi?: number;
    bc?: ST_UnsignedIntHex;
    fc?: ST_UnsignedIntHex;
    i?: boolean;
    u?: boolean;
    st?: boolean;
    b?: boolean;
    n?: CT_MetadataStringIndex[];
}

/** Member Unique Name Index */
export interface CT_MdxSet {
    ns: number;
    c?: number;
    o?: ST_MdxSetOrder;
    n?: CT_MetadataStringIndex[];
}

/** Member Unique Name Index */
export interface CT_MdxMemeberProp {
    n: number;
    np: number;
}

/** Member Unique Name Index */
export interface CT_MdxKPI {
    n: number;
    np: number;
    p: ST_MdxKPIProperty;
}

/** Index Value */
export interface CT_MetadataStringIndex {
    x: number;
    s?: boolean;
}

/** MDX Metadata String */
export interface CT_MetadataStrings {
    count?: number;
    s: CT_XStringElement[];
}

