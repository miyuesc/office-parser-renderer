import { ST_Guid } from './common-types';
/**
 * dml-graphicalObjectAnimation.xsd
 */
/** Chart Animation Build Step */
export enum ST_ChartBuildStep {
  /** Category */
  category = 'category',
  /** Category Points */
  ptInCategory = 'ptInCategory',
  /** Series */
  series = 'series',
  /** Series Points */
  ptInSeries = 'ptInSeries',
  /** All Points */
  allPts = 'allPts',
  /** Grid and Legend */
  gridLegend = 'gridLegend'
}
/** Diagram Animation Build Steps */
export enum ST_DgmBuildStep {
  /** Shape */
  sp = 'sp',
  /** Background */
  bg = 'bg'
}
/** Animation Build Type */
export enum ST_AnimationBuildType {
  /** Animate At Once */
  allAtOnce = 'allAtOnce'
}
/** Diagram only Animation Types */
export enum ST_AnimationDgmOnlyBuildType {
  /** Elements One-by-One */
  one = 'one',
  /** Level One-by-One */
  lvlOne = 'lvlOne',
  /** Each Level at Once */
  lvlAtOnce = 'lvlAtOnce'
}
/** Diagram Animation Build Type */
export type ST_AnimationDgmBuildType = string;
/** Chart only Animation Types */
export enum ST_AnimationChartOnlyBuildType {
  /** Series */
  series = 'series',
  /** Catefory */
  category = 'category',
  /** Series Element */
  seriesEl = 'seriesEl',
  /** Category Element */
  categoryEl = 'categoryEl'
}
/** Chart Animation Build Type */
export type ST_AnimationChartBuildType = string;
/** Identifier */
export interface CT_AnimationDgmElement {
  id?: ST_Guid;
  bldStep?: ST_DgmBuildStep;
}
/** Series Index */
export interface CT_AnimationChartElement {
  seriesIdx?: number;
  categoryIdx?: number;
  bldStep: ST_ChartBuildStep;
}
/** Diagram to Animate */
export interface CT_AnimationElementChoice {
  dgm: CT_AnimationDgmElement;
  chart: CT_AnimationChartElement;
}
/** Build */
export interface CT_AnimationDgmBuildProperties {
  bld?: ST_AnimationDgmBuildType;
  rev?: boolean;
}
/** Build */
export interface CT_AnimationChartBuildProperties {
  bld?: ST_AnimationChartBuildType;
  animBg?: boolean;
}
/** Build Diagram */
export interface CT_AnimationGraphicalObjectBuildProperties {
  bldDgm?: CT_AnimationDgmBuildProperties;
  bldChart?: CT_AnimationChartBuildProperties;
}
