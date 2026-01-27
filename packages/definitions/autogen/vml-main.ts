import { ST_ColorType, ST_TrueFalse } from './common-types';
/**
 * vml-main.xsd
 */

/** VML Extension Handling Behaviors */
export enum ST_Ext {
  /** Not renderable */
  view = 'view',
  /** Editable */
  edit = 'edit',
  /** Renderable */
  backwardCompatible = 'backwardCompatible'
}

/** Boolean Value */

/** Color Type */

/** Shape Fill Type */
export enum ST_FillType {
  /** Solid Fill */
  solid = 'solid',
  /** Linear Gradient */
  gradient = 'gradient',
  /** Radial Gradient */
  gradientRadial = 'gradientRadial',
  /** Tiled Image */
  tile = 'tile',
  /** Image Pattern */
  pattern = 'pattern',
  /** Stretch Image to Fit */
  frame = 'frame'
}

/** Gradient Fill Computation Type */
export enum ST_FillMethod {
  /** No Gradient Fill */
  none = 'none',
  /** Linear Fill */
  linear = 'linear',
  /** Sigma Fill */
  sigma = 'sigma',
  /** Application Default Fill */
  any = 'any',
  /** Linear Sigma Fill */
  linear_sigma = 'linear sigma'
}

/** Shadow Type */
export enum ST_ShadowType {
  /** Single Shadow */
  single = 'single',
  /** Double Shadow */
  double = 'double',
  /** Embossed Shadow */
  emboss = 'emboss',
  /** Perspective Shadow */
  perspective = 'perspective'
}

/** Stroke Line Style */
export enum ST_StrokeLineStyle {
  /** Single Line */
  single = 'single',
  /** Two Thin Lines */
  thinThin = 'thinThin',
  /** Thin Line Outside Thick Line */
  thinThick = 'thinThick',
  /** Thick Line Outside Thin Line */
  thickThin = 'thickThin',
  /** Thck Line Between Thin Lines */
  thickBetweenThin = 'thickBetweenThin'
}

/** Line Join Type */
export enum ST_StrokeJoinStyle {
  /** Round Joint */
  round = 'round',
  /** Bevel Joint */
  bevel = 'bevel',
  /** Miter Joint */
  miter = 'miter'
}

/** Stroke End Cap Type */
export enum ST_StrokeEndCap {
  /** Flat End */
  flat = 'flat',
  /** Square End */
  square = 'square',
  /** Round End */
  round = 'round'
}

/** Stroke Arrowhead Length */
export enum ST_StrokeArrowLength {
  /** Short Arrowhead */
  short = 'short',
  /** Medium Arrowhead */
  medium = 'medium',
  /** Long Arrowhead */
  long = 'long'
}

/** Stroke Arrowhead Width */
export enum ST_StrokeArrowWidth {
  /** Narrow Arrowhead */
  narrow = 'narrow',
  /** Medium Arrowhead */
  medium = 'medium',
  /** Wide Arrowhead */
  wide = 'wide'
}

/** Stroke Arrowhead Type */
export enum ST_StrokeArrowType {
  /** No Arrowhead */
  none = 'none',
  /** Block Arrowhead */
  block = 'block',
  /** Classic Arrowhead */
  classic = 'classic',
  /** Oval Arrowhead */
  oval = 'oval',
  /** Diamond Arrowhead */
  diamond = 'diamond',
  /** Open Arrowhead */
  open = 'open'
}

/** Image Scaling Behavior */
export enum ST_ImageAspect {
  /** Ignore Aspect Ratio */
  ignore = 'ignore',
  /** At Most */
  atMost = 'atMost',
  /** At Least */
  atLeast = 'atLeast'
}

/** Boolean Value with Blank [False] State */
export enum ST_TrueFalseBlank {
  /** Logical True */
  t = 't',
  /** Logical False */
  f = 'f',
  /** Logical True */
  true = 'true',
  /** Logical False */
  false = 'false'
}

/** Shape Grouping Types */
export enum ST_EditAs {
  /** Shape Canvas */
  canvas = 'canvas',
  /** Organization Chart Diagram */
  orgchart = 'orgchart',
  /** Radial Diagram */
  radial = 'radial',
  /** Cycle Diagram */
  cycle = 'cycle',
  /** Pyramid Diagram */
  stacked = 'stacked',
  /** Venn Diagram */
  venn = 'venn',
  /** Bullseye Diagram */
  bullseye = 'bullseye'
}

/** Encoded Package */
export interface CT_Shape {
  gfxdata?: any;
  equationxml?: string;
  path?: any;
  formulas?: any;
  handles?: any;
  fill?: any;
  stroke?: any;
  shadow?: any;
  textbox?: any;
  textpath?: any;
  imagedata?: any;
  skew?: any;
  extrusion?: any;
  callout?: any;
  lock?: any;
  clippath?: any;
  signatureline?: any;
  wrap?: any;
  anchorlock?: any;
  bordertop?: any;
  borderbottom?: any;
  borderleft?: any;
  borderright?: any;
  ClientData?: any;
  textdata?: any;
  ink: any;
  iscomment: any;
}

/** Master Element Toggle */
export interface CT_Shapetype {
  master?: any;
  path?: any;
  formulas?: any;
  handles?: any;
  fill?: any;
  stroke?: any;
  shadow?: any;
  textbox?: any;
  textpath?: any;
  imagedata?: any;
  skew?: any;
  extrusion?: any;
  callout?: any;
  lock?: any;
  clippath?: any;
  signatureline?: any;
  wrap?: any;
  anchorlock?: any;
  bordertop?: any;
  borderbottom?: any;
  borderleft?: any;
  borderright?: any;
  ClientData?: any;
  textdata?: any;
  complex?: any;
}

/** Group Diagram Type */
export interface CT_Group {
  editas?: ST_EditAs;
  tableproperties?: any;
  tablelimits?: any;
  path?: any;
  formulas?: any;
  handles?: any;
  fill?: any;
  stroke?: any;
  shadow?: any;
  textbox?: any;
  textpath?: any;
  imagedata?: any;
  skew?: any;
  extrusion?: any;
  callout?: any;
  lock?: any;
  clippath?: any;
  signatureline?: any;
  wrap?: any;
  anchorlock?: any;
  bordertop?: any;
  borderbottom?: any;
  borderleft?: any;
  borderright?: any;
  ClientData?: any;
  textdata?: any;
  group: any;
  shape: any;
  shapetype: any;
  arc: any;
  curve: any;
  image: any;
  line: any;
  oval?: any;
  polyline: any;
  rect: any;
  roundrect: any;
  diagram: any;
}

/** Black-and-White Mode */
export interface CT_Background {
  bwmode?: any;
  bwpure?: any;
  bwnormal?: any;
  targetscreensize?: any;
  fill?: any;
}

/** Fill Type */
export interface CT_Fill {
  type?: ST_FillType;
  on?: ST_TrueFalse;
  color?: ST_ColorType;
  opacity?: string;
  color2?: ST_ColorType;
  src?: string;
  href?: any;
  althref?: any;
  size?: string;
  origin?: string;
  position?: string;
  aspect?: ST_ImageAspect;
  colors?: string;
  angle?: number;
  alignshape?: ST_TrueFalse;
  focus?: string;
  focussize?: string;
  focusposition?: string;
  method?: ST_FillMethod;
  detectmouseclick?: any;
  title?: any;
  opacity2?: any;
  recolor?: ST_TrueFalse;
  rotate?: ST_TrueFalse;
  id: string;
  relid: string;
  fill?: any;
}

/** Single Formula */
export interface CT_Formulas {
  f?: CT_F[];
}

/** Equation */
export interface CT_F {
  eqn?: string;
}

/** Shape Handle */
export interface CT_Handles {
  h?: CT_H[];
}

/** Handle Position */
export interface CT_H {
  position?: string;
  polar?: string;
  map?: string;
  invx?: ST_TrueFalse;
  invy?: ST_TrueFalse;
  switch?: ST_TrueFalseBlank;
  xrange?: string;
  yrange?: string;
  radiusrange?: string;
}

/** Embossed Color */
export interface CT_ImageData {
  embosscolor?: ST_ColorType;
  recolortarget?: ST_ColorType;
  href?: any;
  althref?: any;
  title?: any;
  oleid: string;
  detectmouseclick?: any;
  movie?: any;
  relid: string;
  id: string;
  pict?: any;
}

/** Path Definition */
export interface CT_Path {
  v?: string;
  limo?: string;
  textboxrect?: string;
  fillok?: ST_TrueFalse;
  strokeok?: ST_TrueFalse;
  shadowok?: ST_TrueFalse;
  arrowok?: ST_TrueFalse;
  gradientshapeok?: ST_TrueFalse;
  textpathok?: ST_TrueFalse;
  insetpenok?: ST_TrueFalse;
  connecttype?: any;
  connectlocs?: any;
  connectangles?: any;
  extrusionok?: any;
}

/** Shadow Toggle */
export interface CT_Shadow {
  on?: ST_TrueFalse;
  type?: ST_ShadowType;
  obscured?: ST_TrueFalse;
  color?: ST_ColorType;
  opacity?: string;
  offset?: string;
  color2?: ST_ColorType;
  offset2?: string;
  origin?: string;
  matrix?: string;
}

export interface CT_Stroke {
  left?: any;
  top?: any;
  right?: any;
  bottom?: any;
  column?: any;
}

/** Text Box Inset */
export interface CT_Textbox {
  inset?: string;
  singleclick?: any;
  insetmode?: any;
  txbxContent?: any;
}

/** Text Path Toggle */
export interface CT_TextPath {
  on?: ST_TrueFalse;
  fitshape?: ST_TrueFalse;
  fitpath?: ST_TrueFalse;
  trim?: ST_TrueFalse;
  xscale?: ST_TrueFalse;
  string?: string;
}

/** Starting Angle */
export interface CT_Arc {
  startAngle?: number;
  endAngle?: number;
  path?: any;
  formulas?: any;
  handles?: any;
  fill?: any;
  stroke?: any;
  shadow?: any;
  textbox?: any;
  textpath?: any;
  imagedata?: any;
  skew?: any;
  extrusion?: any;
  callout?: any;
  lock?: any;
  clippath?: any;
  signatureline?: any;
  wrap?: any;
  anchorlock?: any;
  bordertop?: any;
  borderbottom?: any;
  borderleft?: any;
  borderright?: any;
  ClientData?: any;
  textdata?: any;
}

/** Curve Starting Point */
export interface CT_Curve {
  from?: string;
  control1?: string;
  control2?: string;
  to?: string;
  path?: any;
  formulas?: any;
  handles?: any;
  fill?: any;
  stroke?: any;
  shadow?: any;
  textbox?: any;
  textpath?: any;
  imagedata?: any;
  skew?: any;
  extrusion?: any;
  callout?: any;
  lock?: any;
  clippath?: any;
  signatureline?: any;
  wrap?: any;
  anchorlock?: any;
  bordertop?: any;
  borderbottom?: any;
  borderleft?: any;
  borderright?: any;
  ClientData?: any;
  textdata?: any;
}

export interface CT_Image {
  path?: any;
  formulas?: any;
  handles?: any;
  fill?: any;
  stroke?: any;
  shadow?: any;
  textbox?: any;
  textpath?: any;
  imagedata?: any;
  skew?: any;
  extrusion?: any;
  callout?: any;
  lock?: any;
  clippath?: any;
  signatureline?: any;
  wrap?: any;
  anchorlock?: any;
  bordertop?: any;
  borderbottom?: any;
  borderleft?: any;
  borderright?: any;
  ClientData?: any;
  textdata?: any;
}

/** Line Start */
export interface CT_Line {
  from?: string;
  to?: string;
  path?: any;
  formulas?: any;
  handles?: any;
  fill?: any;
  stroke?: any;
  shadow?: any;
  textbox?: any;
  textpath?: any;
  imagedata?: any;
  skew?: any;
  extrusion?: any;
  callout?: any;
  lock?: any;
  clippath?: any;
  signatureline?: any;
  wrap?: any;
  anchorlock?: any;
  bordertop?: any;
  borderbottom?: any;
  borderleft?: any;
  borderright?: any;
  ClientData?: any;
  textdata?: any;
}

export interface CT_Oval {
  path?: any;
  formulas?: any;
  handles?: any;
  fill?: any;
  stroke?: any;
  shadow?: any;
  textbox?: any;
  textpath?: any;
  imagedata?: any;
  skew?: any;
  extrusion?: any;
  callout?: any;
  lock?: any;
  clippath?: any;
  signatureline?: any;
  wrap?: any;
  anchorlock?: any;
  bordertop?: any;
  borderbottom?: any;
  borderleft?: any;
  borderright?: any;
  ClientData?: any;
  textdata?: any;
}

/** Points for Compound Line */
export interface CT_PolyLine {
  points?: string;
  path?: any;
  formulas?: any;
  handles?: any;
  fill?: any;
  stroke?: any;
  shadow?: any;
  textbox?: any;
  textpath?: any;
  imagedata?: any;
  skew?: any;
  extrusion?: any;
  callout?: any;
  lock?: any;
  clippath?: any;
  signatureline?: any;
  wrap?: any;
  anchorlock?: any;
  bordertop?: any;
  borderbottom?: any;
  borderleft?: any;
  borderright?: any;
  ClientData?: any;
  textdata?: any;
  ink: any;
}

export interface CT_Rect {
  path?: any;
  formulas?: any;
  handles?: any;
  fill?: any;
  stroke?: any;
  shadow?: any;
  textbox?: any;
  textpath?: any;
  imagedata?: any;
  skew?: any;
  extrusion?: any;
  callout?: any;
  lock?: any;
  clippath?: any;
  signatureline?: any;
  wrap?: any;
  anchorlock?: any;
  bordertop?: any;
  borderbottom?: any;
  borderleft?: any;
  borderright?: any;
  ClientData?: any;
  textdata?: any;
}

/** Rounded Corner Arc Size */
export interface CT_RoundRect {
  arcsize?: string;
  path?: any;
  formulas?: any;
  handles?: any;
  fill?: any;
  stroke?: any;
  shadow?: any;
  textbox?: any;
  textpath?: any;
  imagedata?: any;
  skew?: any;
  extrusion?: any;
  callout?: any;
  lock?: any;
  clippath?: any;
  signatureline?: any;
  wrap?: any;
  anchorlock?: any;
  bordertop?: any;
  borderbottom?: any;
  borderleft?: any;
  borderright?: any;
  ClientData?: any;
  textdata?: any;
}
