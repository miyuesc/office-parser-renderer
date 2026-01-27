import { ST_Ref } from './sml-baseTypes';

/**
 * sml-pivotTableShared.xsd
 */

/** Rule Type */
export enum ST_PivotAreaType {
  /** None */
  none = 'none',
  /** Normal */
  normal = 'normal',
  /** Data */
  data = 'data',
  /** All */
  all = 'all',
  /** Origin */
  origin = 'origin',
  /** Field Button */
  button = 'button',
  /** Top Right */
  topRight = 'topRight'
}

/** PivotTable Axis */
export enum ST_Axis {
  /** Row Axis */
  axisRow = 'axisRow',
  /** Column Axis */
  axisCol = 'axisCol',
  /** Include Count Filter */
  axisPage = 'axisPage',
  /** Values Axis */
  axisValues = 'axisValues'
}

/** References */
export interface CT_PivotArea {
  field?: any;
  type?: ST_PivotAreaType;
  dataOnly?: boolean;
  labelOnly?: boolean;
  grandRow?: boolean;
  grandCol?: boolean;
  cacheIndex?: boolean;
  outline?: boolean;
  offset?: ST_Ref;
  collapsedLevelsAreSubtotals?: boolean;
  axis?: ST_Axis;
  fieldPosition?: number;
  references?: any;
  extLst?: any;
}

/** Reference */
export interface CT_PivotAreaReferences {
  count?: number;
  reference: any[];
}

/** Field Item */
export interface CT_PivotAreaReference {
  field?: any;
  count?: number;
  selected?: boolean;
  byPosition?: boolean;
  relative?: boolean;
  defaultSubtotal?: boolean;
  sumSubtotal?: boolean;
  countASubtotal?: boolean;
  avgSubtotal?: boolean;
  maxSubtotal?: boolean;
  minSubtotal?: boolean;
  productSubtotal?: boolean;
  countSubtotal?: boolean;
  stdDevSubtotal?: boolean;
  stdDevPSubtotal?: boolean;
  varSubtotal?: boolean;
  varPSubtotal?: boolean;
  x?: any[];
  extLst?: any;
}

/** Shared Items Index */
export interface CT_Index {
  v: any;
}
