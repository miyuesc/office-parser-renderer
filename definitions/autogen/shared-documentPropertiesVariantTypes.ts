/**
 * shared-documentPropertiesVariantTypes.xsd
 */

/** Vector Base Type Simple Type */
export enum ST_VectorBaseType {
  /** Variant Base Type */
  variant = 'variant',
  /** Vector Base Type Enumeration Value */
  i1 = 'i1',
  /** 2-Byte Signed Integer Base Type */
  i2 = 'i2',
  /** 4-Byte Signed Integer Base Type */
  i4 = 'i4',
  /** 8-Byte Signed Integer Base Type */
  i8 = 'i8',
  /** 1-Byte Unsigned Integer Base Type */
  ui1 = 'ui1',
  /** 2-Byte Unisigned Integer Base Type */
  ui2 = 'ui2',
  /** 4-Byte Unsigned Integer Base Type */
  ui4 = 'ui4',
  /** 8-Byte Unsigned Integer Base Type */
  ui8 = 'ui8',
  /** 4-Byte Real Number Base Type */
  r4 = 'r4',
  /** 8-Byte Real Number Base Type */
  r8 = 'r8',
  /** LPSTR Base Type */
  lpstr = 'lpstr',
  /** LPWSTR Base Type */
  lpwstr = 'lpwstr',
  /** Basic String Base Type */
  bstr = 'bstr',
  /** Date and Time Base Type */
  date = 'date',
  /** File Time Base Type */
  filetime = 'filetime',
  /** Boolean Base Type */
  bool = 'bool',
  /** Currency Base Type */
  cy = 'cy',
  /** Error Status Code Base Type */
  error = 'error',
  /** Class ID Base Type */
  clsid = 'clsid',
  /** Clipboard Data Base Type */
  cf = 'cf'
}

/** Array Base Type Simple Type */
export enum ST_ArrayBaseType {
  /** Variant Base Type */
  variant = 'variant',
  /** 1-Byte Signed Integer Base Type */
  i1 = 'i1',
  /** 2-Byte Signed Integer Base Type */
  i2 = 'i2',
  /** 4-Byte Signed Integer Base Type */
  i4 = 'i4',
  /** Integer Base Type */
  int = 'int',
  /** 1-Byte Unsigned Integer Base Type */
  ui1 = 'ui1',
  /** 2-Byte Unsigned Integer Base Type */
  ui2 = 'ui2',
  /** 4-Byte Unsigned Integer Base Type */
  ui4 = 'ui4',
  /** Unsigned Integer Base Type */
  uint = 'uint',
  /** 4-Byte Real Number Base Type */
  r4 = 'r4',
  /** 8-Byte Real Number Base Type */
  r8 = 'r8',
  /** Decimal Base Type */
  decimal = 'decimal',
  /** Basic String Base Type */
  bstr = 'bstr',
  /** Date and Time Base Type */
  date = 'date',
  /** Boolean Base Type */
  bool = 'bool',
  /** Curency Base Type */
  cy = 'cy',
  /** Error Status Code Base Type */
  error = 'error'
}

/** Currency Simple Type */
export type ST_Cy = string;

/** Error Status Code Simple Type */
export type ST_Error = string;

/** Class ID Simple Type */
export type ST_Clsid = string;

/** Format Simple Type */
export type ST_Format = string;

export interface CT_Empty {}

export interface CT_Null {}

/** Variant */
export interface CT_Vector {
  baseType: ST_VectorBaseType;
  size: number;
  variant: any;
  i1: any;
  i2: any;
  i4: any;
  i8: any;
  ui1: any;
  ui2: any;
  ui4: any;
  ui8: any;
  r4: any;
  r8: any;
  lpstr: any;
  lpwstr: any;
  bstr: any;
  date: any;
  filetime: any;
  bool: any;
  cy: any;
  error: any;
  clsid: string;
  cf: any;
}

/** Variant */
export interface CT_Array {
  lBounds: number;
  uBounds: number;
  baseType: ST_ArrayBaseType;
  variant: any;
  i1: any;
  i2: any;
  i4: any;
  int: any;
  ui1: any;
  ui2: any;
  ui4: any;
  uint: any;
  r4: any;
  r8: any;
  decimal: any;
  bstr: any;
  date: any;
  bool: any;
  error: any;
  cy: any;
}

/** Variant */
export interface CT_Variant {
  variant: any;
  vector: any;
  array: any;
  blob: any;
  oblob: any;
  empty: any;
  null: any;
  i1: any;
  i2: any;
  i4: any;
  i8: any;
  int: any;
  ui1: any;
  ui2: any;
  ui4: any;
  ui8: any;
  uint: any;
  r4: any;
  r8: any;
  decimal: any;
  lpstr: any;
  lpwstr: any;
  bstr: any;
  date: any;
  filetime: any;
  bool: any;
  cy: any;
  error: any;
  stream: any;
  ostream: any;
  storage: any;
  ostorage: any;
  vstream: any;
  clsid: string;
  cf: any;
}

/** VSTREAM Version Attribute */
export interface CT_Vstream {
  val?: string;
  version?: ST_Clsid;
}

/** Format Attribute */
export interface CT_Cf {
  val?: string;
  format?: ST_Format;
}
