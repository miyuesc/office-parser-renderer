import { CT_AutoFilter, CT_SortState } from './sml-autoFilter';
import { CT_ExtensionList, ST_Formula, ST_Ref, ST_Xstring } from './sml-baseTypes';
import { ST_DxfId } from './sml-styles';

/**
 * sml-table.xsd
 */

/** Table Type */
export enum ST_TableType {
  /** Worksheet */
  worksheet = 'worksheet',
  /** XML */
  xml = 'xml',
  /** Query Table */
  queryTable = 'queryTable'
}

/** Totals Row Function Types */
export enum ST_TotalsRowFunction {
  /** None */
  none = 'none',
  /** Sum */
  sum = 'sum',
  /** Minimum */
  min = 'min',
  /** Maximum */
  max = 'max',
  /** Average */
  average = 'average',
  /** Non Empty Cell Count */
  count = 'count',
  /** Count Numbers */
  countNums = 'countNums',
  /** StdDev */
  stdDev = 'stdDev',
  /** Var */
  var = 'var',
  /** Custom Formula */
  custom = 'custom'
}

/** XML Data Types */
export enum ST_XmlDataType {
  /** String */
  string = 'string',
  /** Normalized String */
  normalizedString = 'normalizedString',
  /** Token */
  token = 'token',
  /** Byte */
  byte = 'byte',
  /** Unsigned Byte */
  unsignedByte = 'unsignedByte',
  /** Base 64 Encoded Binary */
  base64Binary = 'base64Binary',
  /** Hex Binary */
  hexBinary = 'hexBinary',
  /** Integer */
  integer = 'integer',
  /** Positive Integer */
  positiveInteger = 'positiveInteger',
  /** Negative Integer */
  negativeInteger = 'negativeInteger',
  /** Non Positive Integer */
  nonPositiveInteger = 'nonPositiveInteger',
  /** Non Negative Integer */
  nonNegativeInteger = 'nonNegativeInteger',
  /** Integer */
  int = 'int',
  /** Unsigned Integer */
  unsignedInt = 'unsignedInt',
  /** Long */
  long = 'long',
  /** Unsigned Long */
  unsignedLong = 'unsignedLong',
  /** Short */
  short = 'short',
  /** Unsigned Short */
  unsignedShort = 'unsignedShort',
  /** Decimal */
  decimal = 'decimal',
  /** Float */
  float = 'float',
  /** Double */
  double = 'double',
  /** Boolean */
  boolean = 'boolean',
  /** Time */
  time = 'time',
  /** Date Time */
  dateTime = 'dateTime',
  /** Duration */
  duration = 'duration',
  /** Date */
  date = 'date',
  /** gMonth */
  gMonth = 'gMonth',
  /** gYear */
  gYear = 'gYear',
  /** gYearMonth */
  gYearMonth = 'gYearMonth',
  /** gDay */
  gDay = 'gDay',
  /** gMonthDays */
  gMonthDay = 'gMonthDay',
  /** Name */
  Name = 'Name',
  /** Qname */
  QName = 'QName',
  /** NCName */
  NCName = 'NCName',
  /** Any URI */
  anyURI = 'anyURI',
  /** Language */
  language = 'language',
  /** ID */
  ID = 'ID',
  /** IDREF */
  IDREF = 'IDREF',
  /** IDREFS */
  IDREFS = 'IDREFS',
  /** ENTITY */
  ENTITY = 'ENTITY',
  /** ENTITIES */
  ENTITIES = 'ENTITIES',
  /** Notation */
  NOTATION = 'NOTATION',
  /** NMTOKEN */
  NMTOKEN = 'NMTOKEN',
  /** NMTOKENS */
  NMTOKENS = 'NMTOKENS',
  /** Any Type */
  anyType = 'anyType'
}

/** Table AutoFilter */
export interface CT_Table {
  id: number;
  name?: ST_Xstring;
  displayName: ST_Xstring;
  comment?: ST_Xstring;
  ref: ST_Ref;
  tableType?: ST_TableType;
  headerRowCount?: number;
  insertRow?: boolean;
  insertRowShift?: boolean;
  totalsRowCount?: number;
  totalsRowShown?: boolean;
  published?: boolean;
  headerRowDxfId?: ST_DxfId;
  dataDxfId?: ST_DxfId;
  totalsRowDxfId?: ST_DxfId;
  headerRowBorderDxfId?: ST_DxfId;
  tableBorderDxfId?: ST_DxfId;
  totalsRowBorderDxfId?: ST_DxfId;
  headerRowCellStyle?: ST_Xstring;
  dataCellStyle?: ST_Xstring;
  totalsRowCellStyle?: ST_Xstring;
  connectionId?: number;
  autoFilter?: CT_AutoFilter;
  sortState?: CT_SortState;
  tableColumns: CT_TableColumns;
  tableStyleInfo?: CT_TableStyleInfo;
  extLst?: CT_ExtensionList;
}

/** Style Name */
export interface CT_TableStyleInfo {
  name?: ST_Xstring;
  showFirstColumn?: boolean;
  showLastColumn?: boolean;
  showRowStripes?: boolean;
  showColumnStripes?: boolean;
}

/** Table Column */
export interface CT_TableColumns {
  count?: number;
  tableColumn: CT_TableColumn[];
}

/** Calculated Column Formula */
export interface CT_TableColumn {
  id: number;
  uniqueName?: ST_Xstring;
  name: ST_Xstring;
  totalsRowFunction?: ST_TotalsRowFunction;
  totalsRowLabel?: ST_Xstring;
  queryTableFieldId?: number;
  headerRowDxfId?: ST_DxfId;
  dataDxfId?: ST_DxfId;
  totalsRowDxfId?: ST_DxfId;
  headerRowCellStyle?: ST_Xstring;
  dataCellStyle?: ST_Xstring;
  totalsRowCellStyle?: ST_Xstring;
  calculatedColumnFormula?: CT_TableFormula;
  totalsRowFormula?: CT_TableFormula;
  xmlColumnPr?: CT_XmlColumnPr;
  extLst?: CT_ExtensionList;
}

/** Array */
export interface CT_TableFormula {
  val?: ST_Formula;
  array?: boolean;
}

/** Future Feature Data Storage Area */
export interface CT_XmlColumnPr {
  mapId: number;
  xpath: ST_Xstring;
  denormalized?: boolean;
  xmlDataType: ST_XmlDataType;
  extLst?: CT_ExtensionList;
}
