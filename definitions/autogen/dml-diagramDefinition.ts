import { CT_OfficeArtExtensionList } from './dml-baseTypes';
import { CT_DataModel } from './dml-diagramDataModel';
import { CT_LayoutVariablePropertySet } from './dml-diagramLayoutVariables';

/**
 * dml-diagramDefinition.xsd
 */

/** 1-Based Index */
export type ST_Index1 = number;

/** Parameter Values */
export type ST_ParameterVal = string;

/** Operator */
export interface CT_Constraint {
  op?: ST_BoolOperator;
  val?: number;
  fact?: number;
  extLst?: CT_OfficeArtExtensionList;
}

/** Constraint */
export interface CT_Constraints {
  constr?: CT_Constraint[];
}

/** Value */
export interface CT_NumericRule {
  val?: number;
  fact?: number;
  max?: number;
  extLst?: CT_OfficeArtExtensionList;
}

/** Rule */
export interface CT_Rules {
  rule?: CT_NumericRule[];
}

export interface CT_PresentationOf {
  extLst?: CT_OfficeArtExtensionList;
}

/** Adjust Handle Index */
export interface CT_Adj {
  idx: ST_Index1;
  val: number;
}

/** Shape Adjust */
export interface CT_AdjLst {
  adj?: CT_Adj[];
}

/** Shape Adjust List */
export interface CT_Shape {
  rot?: number;
  type?: ST_LayoutShapeType;
  blip?: any;
  zOrderOff?: number;
  hideGeom?: boolean;
  lkTxEntry?: boolean;
  blipPhldr?: boolean;
  adjLst?: CT_AdjLst;
  extLst?: CT_OfficeArtExtensionList;
}

/** Parameter Type */
export interface CT_Parameter {
  type: ST_ParameterId;
  val: ST_ParameterVal;
}

/** Parameter */
export interface CT_Algorithm {
  type: ST_AlgorithmType;
  rev?: number;
  param?: CT_Parameter[];
  extLst?: CT_OfficeArtExtensionList;
}

/** Algorithm */
export interface CT_LayoutNode {
  name?: string;
  styleLbl?: string;
  chOrder?: ST_ChildOrderType;
  moveWith?: string;
  alg?: CT_Algorithm;
  shape?: CT_Shape;
  presOf?: CT_PresentationOf;
  constrLst?: CT_Constraints;
  ruleLst?: CT_Rules;
  varLst?: CT_LayoutVariablePropertySet;
  forEach: CT_ForEach;
  layoutNode: CT_LayoutNode;
  choose: CT_Choose;
  extLst?: CT_OfficeArtExtensionList;
}

/** Algorithm */
export interface CT_ForEach {
  name?: string;
  ref?: string;
  alg?: CT_Algorithm;
  shape?: CT_Shape;
  presOf?: CT_PresentationOf;
  constrLst?: CT_Constraints;
  ruleLst?: CT_Rules;
  forEach: CT_ForEach;
  layoutNode: CT_LayoutNode;
  choose: CT_Choose;
  extLst?: CT_OfficeArtExtensionList;
}

/** Algorithm */
export interface CT_When {
  name?: string;
  func: ST_FunctionType;
  arg?: ST_FunctionArgument;
  op: ST_FunctionOperator;
  val: ST_FunctionValue;
  alg?: CT_Algorithm;
  shape?: CT_Shape;
  presOf?: CT_PresentationOf;
  constrLst?: CT_Constraints;
  ruleLst?: CT_Rules;
  forEach: CT_ForEach;
  layoutNode: CT_LayoutNode;
  choose: CT_Choose;
  extLst?: CT_OfficeArtExtensionList;
}

/** Algorithm */
export interface CT_Otherwise {
  name?: string;
  alg?: CT_Algorithm;
  shape?: CT_Shape;
  presOf?: CT_PresentationOf;
  constrLst?: CT_Constraints;
  ruleLst?: CT_Rules;
  forEach: CT_ForEach;
  layoutNode: CT_LayoutNode;
  choose: CT_Choose;
  extLst?: CT_OfficeArtExtensionList;
}

/** If */
export interface CT_Choose {
  name?: string;
  if: CT_When[];
  else?: CT_Otherwise;
}

/** Data Model */
export interface CT_SampleData {
  useDef?: boolean;
  dataModel?: CT_DataModel;
}

/** Category Type */
export interface CT_Category {
  type: string;
  pri: number;
}

/** Category */
export interface CT_Categories {
  cat?: CT_Category[];
}

/** Language */
export interface CT_Name {
  lang?: string;
  val: string;
}

/** Language */
export interface CT_Description {
  lang?: string;
  val: string;
}

/** Title */
export interface CT_DiagramDefinition {
  uniqueId?: string;
  minVer?: string;
  defStyle?: string;
  title?: CT_Name[];
  desc?: CT_Description[];
  catLst?: CT_Categories;
  sampData?: CT_SampleData;
  styleData?: CT_SampleData;
  clrData?: CT_SampleData;
  layoutNode: CT_LayoutNode;
  extLst?: CT_OfficeArtExtensionList;
}

/** Title */
export interface CT_DiagramDefinitionHeader {
  uniqueId: string;
  minVer?: string;
  defStyle?: string;
  resId?: number;
  title: CT_Name[];
  desc: CT_Description[];
  catLst?: CT_Categories;
  extLst?: CT_OfficeArtExtensionList;
}

/** Layout Definition Header */
export interface CT_DiagramDefinitionHeaderLst {
  layoutDefHdr?: CT_DiagramDefinitionHeader[];
}

/** Explicit Relationship to Diagram Data Part */
export interface CT_RelIds {
  dm: any;
  lo: any;
  qs: any;
  cs: any;
}

// Fallback definitions for missing types
export type ST_AlgorithmType = any;
export type ST_BoolOperator = any;
export type ST_ChildOrderType = any;
export type ST_FunctionArgument = any;
export type ST_FunctionOperator = any;
export type ST_FunctionType = any;
export type ST_FunctionValue = any;
export type ST_LayoutShapeType = any;
export type ST_ParameterId = any;
