import { CT_Extension, CT_ExtensionList, ST_Guid, ST_Xstring } from './common-types';
/**
 * sml-baseTypes.xsd
 */

/** Escaped String */

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

/** Value */
export interface CT_XStringElement {
  v: ST_Xstring;
}

/** URI */

