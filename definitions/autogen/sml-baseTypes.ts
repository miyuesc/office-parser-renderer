/**
 * sml-baseTypes.xsd
 */

/** Escaped String */
export type ST_Xstring = string;

/** Cell Reference */
export type ST_CellRef = string;

/** Cell References */
export type ST_Ref = string;

/** Single Cell Reference */
export type ST_RefA = string;

/** Reference Sequence */
export type ST_Sqref = string;

/** Formula */
export type ST_Formula = string;

/** Hex Unsigned Integer */
export type ST_UnsignedIntHex = string;

/** Unsigned Short Hex */
export type ST_UnsignedShortHex = string;

/** Globally Unique Identifier */
export type ST_Guid = string;

/** Value */
export interface CT_XStringElement {
    v: ST_Xstring;
}

/** URI */
export interface CT_Extension {
    uri?: string;
}

export interface CT_ExtensionList {
    ext?: CT_Extension[];
}

