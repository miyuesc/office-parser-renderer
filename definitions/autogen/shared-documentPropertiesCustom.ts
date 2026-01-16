/**
 * shared-documentPropertiesCustom.xsd
 */

/** Custom File Property */
export interface CT_Properties {
  property?: any[];
}

/** Vector */
export interface CT_Property {
  fmtid: string;
  pid: string;
  name?: any;
  linkTarget?: any;
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
