import { CT_OfficeArtExtensionList, ST_Coordinate32, ST_PositivePercentage } from './dml-baseTypes';
import {
  CT_GradientFillProperties,
  CT_NoFillProperties,
  CT_PatternFillProperties,
  CT_SolidColorFillProperties
} from './dml-shapeEffects';

/**
 * dml-shapeLineProperties.xsd
 */

/** Line End Type */
export enum ST_LineEndType {
  /** None */
  none = 'none',
  /** Triangle Arrow Head */
  triangle = 'triangle',
  /** Stealth Arrow */
  stealth = 'stealth',
  /** Diamond */
  diamond = 'diamond',
  /** Oval */
  oval = 'oval',
  /** Arrow Head */
  arrow = 'arrow'
}

/** Line End Width */
export enum ST_LineEndWidth {
  /** Small */
  sm = 'sm',
  /** Medium */
  med = 'med',
  /** Large */
  lg = 'lg'
}

/** Line End Length */
export enum ST_LineEndLength {
  /** Small */
  sm = 'sm',
  /** Medium */
  med = 'med',
  /** Large */
  lg = 'lg'
}

/** Preset Line Dash Value */
export enum ST_PresetLineDashVal {
  /** Solid */
  solid = 'solid',
  /** Dot */
  dot = 'dot',
  /** Dash */
  dash = 'dash',
  /** Large Dash */
  lgDash = 'lgDash',
  /** Dash Dot */
  dashDot = 'dashDot',
  /** Large Dash Dot */
  lgDashDot = 'lgDashDot',
  /** Large Dash Dot Dot */
  lgDashDotDot = 'lgDashDotDot',
  /** System Dash */
  sysDash = 'sysDash',
  /** System Dot */
  sysDot = 'sysDot',
  /** System Dash Dot */
  sysDashDot = 'sysDashDot',
  /** System Dash Dot Dot */
  sysDashDotDot = 'sysDashDotDot'
}

/** End Line Cap */
export enum ST_LineCap {
  /** Round Line Cap */
  rnd = 'rnd',
  /** Square Line Cap */
  sq = 'sq',
  /** Flat Line Cap */
  flat = 'flat'
}

/** Line Width */
export type ST_LineWidth = ST_Coordinate32;

/** Alignment Type */
export enum ST_PenAlignment {
  /** Center Alignment */
  ctr = 'ctr',
  /** Inset Alignment */
  in = 'in'
}

/** Compound Line Type */
export enum ST_CompoundLine {
  /** Single Line */
  sng = 'sng',
  /** Double Lines */
  dbl = 'dbl',
  /** Thick Thin Double Lines */
  thickThin = 'thickThin',
  /** Thin Thick Double Lines */
  thinThick = 'thinThick',
  /** Thin Thick Thin Triple Lines */
  tri = 'tri'
}

/** Line Head/End Type */
export interface CT_LineEndProperties {
  type?: ST_LineEndType;
  w?: ST_LineEndWidth;
  len?: ST_LineEndLength;
}

export interface CT_LineJoinBevel {}

export interface CT_LineJoinRound {}

/** Miter Join Limit */
export interface CT_LineJoinMiterProperties {
  lim?: ST_PositivePercentage;
}

/** Value */
export interface CT_PresetLineDashProperties {
  val?: ST_PresetLineDashVal;
}

/** Dash Length */
export interface CT_DashStop {
  d: ST_PositivePercentage;
  sp: ST_PositivePercentage;
}

/** Dash Stop */
export interface CT_DashStopList {
  ds?: CT_DashStop[];
}

/** Line Head/End Style */
export interface CT_LineProperties {
  w?: ST_LineWidth;
  cap?: ST_LineCap;
  cmpd?: ST_CompoundLine;
  algn?: ST_PenAlignment;
  noFill?: CT_NoFillProperties;
  solidFill?: CT_SolidColorFillProperties;
  gradFill?: CT_GradientFillProperties;
  pattFill?: CT_PatternFillProperties;
  prstDash?: CT_PresetLineDashProperties;
  custDash?: CT_DashStopList;
  round?: CT_LineJoinRound;
  bevel?: CT_LineJoinBevel;
  miter?: CT_LineJoinMiterProperties;
  headEnd?: CT_LineEndProperties;
  tailEnd?: CT_LineEndProperties;
  extLst?: CT_OfficeArtExtensionList;
}
