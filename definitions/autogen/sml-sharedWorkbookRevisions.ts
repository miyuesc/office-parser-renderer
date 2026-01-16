import { ST_CellRef, ST_Formula, ST_Ref, ST_RefA, ST_Sqref, ST_Xstring } from './sml-baseTypes';
import { CT_Cell } from './sml-sheet';
import { CT_Dxf, ST_NumFmtId } from './sml-styles';
import { ST_Guid } from './wml';

/**
 * sml-sharedWorkbookRevisions.xsd
 */

/** Row Column Action Type */
export enum ST_rwColActionType {
  /** Insert Row */
  insertRow = 'insertRow',
  /** Delete Row */
  deleteRow = 'deleteRow',
  /** Column Insert */
  insertCol = 'insertCol',
  /** Delete Column */
  deleteCol = 'deleteCol'
}

/** Revision Action Types */
export enum ST_RevisionAction {
  /** Add */
  add = 'add',
  /** Delete */
  delete = 'delete'
}

/** Formula Expression Type */
export enum ST_FormulaExpression {
  /** Reference */
  ref = 'ref',
  /** Reference Is Error */
  refError = 'refError',
  /** Area */
  area = 'area',
  /** Area Error */
  areaError = 'areaError',
  /** Computed Area */
  computedArea = 'computedArea'
}

/** Header */
export interface CT_RevisionHeaders {
  guid: ST_Guid;
  lastGuid?: ST_Guid;
  shared?: boolean;
  diskRevisions?: boolean;
  history?: boolean;
  trackRevisions?: boolean;
  exclusive?: boolean;
  revisionId?: number;
  version?: number;
  keepChangeHistory?: boolean;
  protected?: boolean;
  preserveHistory?: number;
  header: CT_RevisionHeader[];
}

/** Revision Row Column Insert Delete */
export interface CT_Revisions {
  rrc?: CT_RevisionRowColumn[];
  rm?: CT_RevisionMove[];
  rcv?: CT_RevisionCustomView[];
  rsnm?: CT_RevisionSheetRename[];
  ris?: CT_RevisionInsertSheet[];
  rcc?: CT_RevisionCellChange[];
  rfmt?: CT_RevisionFormatting[];
  raf?: CT_RevisionAutoFormatting[];
  rdn?: CT_RevisionDefinedName[];
  rcmt?: CT_RevisionComment[];
  rqt?: CT_RevisionQueryTableField[];
  rcft?: CT_RevisionConflict[];
}

/** Sheet Id Map */
export interface CT_RevisionHeader {
  guid: ST_Guid;
  dateTime: any;
  maxSheetId: number;
  userName: ST_Xstring;
  id: string;
  minRId?: number;
  maxRId?: number;
  sheetIdMap: any;
  reviewedList?: any;
  extLst?: any;
}

/** Sheet Id */
export interface CT_SheetIdMap {
  count?: number;
  sheetId: CT_SheetId[];
}

/** Sheet Id */
export interface CT_SheetId {
  val: number;
}

/** Reviewed */
export interface CT_ReviewedRevisions {
  count?: number;
  reviewed: CT_Reviewed[];
}

/** revision Id */
export interface CT_Reviewed {
  rId: number;
}

/** Index */
export interface CT_UndoInfo {
  index: number;
  exp: ST_FormulaExpression;
  ref3D?: boolean;
  array?: boolean;
  v?: boolean;
  nf?: boolean;
  cs?: boolean;
  dr: ST_RefA;
  dn?: ST_Xstring;
  r?: ST_CellRef;
  sId?: number;
}

/** Undo */
export interface CT_RevisionRowColumn {
  sId: number;
  eol?: boolean;
  ref: ST_Ref;
  action: ST_rwColActionType;
  edge?: boolean;
  undo?: CT_UndoInfo[];
  rcc?: CT_RevisionCellChange[];
  rfmt?: CT_RevisionFormatting[];
}

/** Undo */
export interface CT_RevisionMove {
  sheetId: number;
  source: ST_Ref;
  destination: ST_Ref;
  sourceSheetId?: number;
  undo?: CT_UndoInfo[];
  rcc?: CT_RevisionCellChange[];
  rfmt?: CT_RevisionFormatting[];
}

/** GUID */
export interface CT_RevisionCustomView {
  guid: ST_Guid;
  action: ST_RevisionAction;
}

/** Sheet Id */
export interface CT_RevisionSheetRename {
  sheetId: number;
  oldName: ST_Xstring;
  newName: ST_Xstring;
  extLst?: any;
}

/** Sheet Id */
export interface CT_RevisionInsertSheet {
  sheetId: number;
  name: ST_Xstring;
  sheetPosition: number;
}

/** Old Cell Data */
export interface CT_RevisionCellChange {
  sId: number;
  odxf?: boolean | CT_Dxf;
  xfDxf?: boolean;
  s?: boolean;
  dxf?: boolean;
  numFmtId?: ST_NumFmtId;
  quotePrefix?: boolean;
  oldQuotePrefix?: boolean;
  ph?: boolean;
  oldPh?: boolean;
  endOfListFormulaUpdate?: boolean;
  oc?: CT_Cell;
  nc: CT_Cell;
  ndxf?: CT_Dxf;
  extLst?: any;
}

/** Formatting */
export interface CT_RevisionFormatting {
  sheetId: number;
  xfDxf?: boolean;
  s?: boolean;
  sqref: ST_Sqref;
  start?: number;
  length?: number;
  dxf?: CT_Dxf;
  extLst?: any;
}

/** Sheet Id */
export interface CT_RevisionAutoFormatting {
  sheetId: number;
  ref: ST_Ref;
}

/** Sheet Id */
export interface CT_RevisionComment {
  sheetId: number;
  cell: ST_CellRef;
  guid: ST_Guid;
  action?: ST_RevisionAction;
  alwaysShow?: boolean;
  old?: boolean;
  hiddenRow?: boolean;
  hiddenColumn?: boolean;
  author: ST_Xstring;
  oldLength?: number;
  newLength?: number;
}

/** Formula */
export interface CT_RevisionDefinedName {
  localSheetId?: number;
  customView?: boolean;
  name: ST_Xstring;
  function?: boolean;
  oldFunction?: boolean;
  functionGroupId?: number;
  oldFunctionGroupId?: number;
  shortcutKey?: number;
  oldShortcutKey?: number;
  hidden?: boolean;
  oldHidden?: boolean;
  customMenu?: ST_Xstring;
  oldCustomMenu?: ST_Xstring;
  description?: ST_Xstring;
  oldDescription?: ST_Xstring;
  help?: ST_Xstring;
  oldHelp?: ST_Xstring;
  statusBar?: ST_Xstring;
  oldStatusBar?: ST_Xstring;
  comment?: ST_Xstring;
  oldComment?: ST_Xstring;
  formula?: ST_Formula;
  oldFormula?: ST_Formula;
  extLst?: any;
}

/** Sheet Id */
export interface CT_RevisionConflict {
  sheetId?: number;
}

/** Sheet Id */
export interface CT_RevisionQueryTableField {
  sheetId: number;
  ref: ST_Ref;
  fieldId: number;
}
