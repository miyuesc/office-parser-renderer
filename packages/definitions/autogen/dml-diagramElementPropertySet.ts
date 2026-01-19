import { CT_LayoutVariablePropertySet } from './dml-diagramLayoutVariables';
import { CT_ShapeStyle } from './dml-shapeStyle';

/**
 * dml-diagramElementPropertySet.xsd
 */

/** Model Identifier */
export type ST_ModelId = string;

/** Presentation Layout Variables */
export interface CT_ElemPropSet {
  presAssocID?: ST_ModelId;
  presName?: string;
  presStyleLbl?: string;
  presStyleIdx?: number;
  presStyleCnt?: number;
  loTypeId?: string;
  loCatId?: string;
  qsTypeId?: string;
  qsCatId?: string;
  csTypeId?: string;
  csCatId?: string;
  coherent3DOff?: boolean;
  phldrT?: string;
  phldr?: boolean;
  custAng?: number;
  custFlipVert?: boolean;
  custFlipHor?: boolean;
  custSzX?: number;
  custSzY?: number;
  custScaleX?: number;
  custScaleY?: number;
  custT?: boolean;
  custLinFactX?: number;
  custLinFactY?: number;
  custLinFactNeighborX?: number;
  custLinFactNeighborY?: number;
  custRadScaleRad?: number;
  custRadScaleInc?: number;
  presLayoutVars?: CT_LayoutVariablePropertySet;
  style?: CT_ShapeStyle;
}
