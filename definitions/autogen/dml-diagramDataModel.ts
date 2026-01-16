import { CT_OfficeArtExtensionList } from './dml-baseTypes';
import { CT_ElemPropSet, ST_ModelId } from './dml-diagramElementPropertySet';
import { CT_BackgroundFormatting, CT_WholeE2oFormatting } from './dml-graphicalObjectFormat';
import { CT_ShapeProperties } from './dml-shapeProperties';
import { CT_TextBody } from './dml-text';

/**
 * dml-diagramDataModel.xsd
 */

/** Point Type */
export enum ST_PtType {
  /** Node */
  node = 'node',
  /** Assistant Element */
  asst = 'asst',
  /** Document */
  doc = 'doc',
  /** Presentation */
  pres = 'pres',
  /** Parent Transition */
  parTrans = 'parTrans',
  /** Sibling Transition */
  sibTrans = 'sibTrans'
}

/** Connection Type */
export enum ST_CxnType {
  /** Parent Of */
  parOf = 'parOf',
  /** Presentation Of */
  presOf = 'presOf',
  /** Presentation Parent Of */
  presParOf = 'presParOf',
  /** Unknown Relationship */
  unknownRelationship = 'unknownRelationship'
}

/** Property Set */
export interface CT_Pt {
  modelId: ST_ModelId;
  type?: ST_PtType;
  cxnId?: ST_ModelId;
  prSet?: CT_ElemPropSet;
  spPr?: CT_ShapeProperties;
  t?: CT_TextBody;
  extLst?: CT_OfficeArtExtensionList;
}

/** Point */
export interface CT_PtList {
  pt?: CT_Pt[];
}

/** Model Identifier */
export interface CT_Cxn {
  modelId: ST_ModelId;
  type?: ST_CxnType;
  srcId: ST_ModelId;
  destId: ST_ModelId;
  srcOrd: number;
  destOrd: number;
  parTransId?: ST_ModelId;
  sibTransId?: ST_ModelId;
  presId?: string;
  extLst?: CT_OfficeArtExtensionList;
}

/** Connection */
export interface CT_CxnList {
  cxn?: CT_Cxn[];
}

/** Point List */
export interface CT_DataModel {
  ptLst: CT_PtList;
  cxnLst?: CT_CxnList;
  bg?: CT_BackgroundFormatting;
  whole?: CT_WholeE2oFormatting;
  extLst?: CT_OfficeArtExtensionList;
}
