import {
  ST_ImageAspect,
  ST_StrokeArrowLength,
  ST_StrokeArrowType,
  ST_StrokeArrowWidth,
  ST_StrokeEndCap,
  ST_StrokeJoinStyle,
  ST_StrokeLineStyle
} from './vml-main';

/**
 * vml-officeDrawing.xsd
 */

/** Rule Type */
export enum ST_RType {
  /** Arc Rule */
  arc = 'arc',
  /** Callout Rule */
  callout = 'callout',
  /** Connector Rule */
  connector = 'connector',
  /** Alignment Rule */
  align = 'align'
}

/** Alignment Type */
export enum ST_How {
  /** Top Alignment */
  top = 'top',
  /** Middle Alignment */
  middle = 'middle',
  /** Bottom Alignment */
  bottom = 'bottom',
  /** Left Alignment */
  left = 'left',
  /** Center Alignment */
  center = 'center',
  /** Right Alignment */
  right = 'right'
}

/** Black And White Modes */
export enum ST_BWMode {
  /** Color */
  color = 'color',
  /** Automatic */
  auto = 'auto',
  /** Grayscale */
  grayScale = 'grayScale',
  /** Light grayscale */
  lightGrayscale = 'lightGrayscale',
  /** Inverse Grayscale */
  inverseGray = 'inverseGray',
  /** Gray Outlines */
  grayOutline = 'grayOutline',
  /** Black And White */
  highContrast = 'highContrast',
  /** Black */
  black = 'black',
  /** White */
  white = 'white',
  /** Hide Object When Displayed in Black and White */
  hide = 'hide',
  /** Do Not Show */
  undrawn = 'undrawn',
  /** Black Text And Lines */
  blackTextAndLines = 'blackTextAndLines'
}

/** Screen Sizes Type */
export enum ST_ScreenSize {
  /** 544x376 pixels */
  _544_376 = '544,376',
  /** 640x480 pixels */
  _640_480 = '640,480',
  /** 720x512 pixels */
  _720_512 = '720,512',
  /** 800x600 pixels */
  _800_600 = '800,600',
  /** 1024x768 pixels */
  _1024_768 = '1024,768',
  /** 1152x862 pixels */
  _1152_862 = '1152,862'
}

/** Inset Margin Type */
export enum ST_InsetMode {
  /** Automatic Margins */
  auto = 'auto',
  /** Custom Margins */
  custom = 'custom'
}

/** Extrusion Color Types */
export enum ST_ColorMode {
  /** Use Shape Fill Color */
  auto = 'auto',
  /** Use Custom Color */
  custom = 'custom'
}

/** Color Type */
export type ST_ColorType = string;

/** Extrusion Type */
export enum ST_ExtrusionType {
  /** Perspective Projection */
  perspective = 'perspective',
  /** Parallel Projection */
  parallel = 'parallel'
}

/** Extrusion Rendering Types */
export enum ST_ExtrusionRender {
  /** Solid */
  solid = 'solid',
  /** Wireframe */
  wireFrame = 'wireFrame',
  /** Bounding Cube */
  boundingCube = 'boundingCube'
}

/** Extrusion Planes */
export enum ST_ExtrusionPlane {
  /** XY Plane */
  XY = 'XY',
  /** ZX Plane */
  ZX = 'ZX',
  /** YZ Plane */
  YZ = 'YZ'
}

/** Callout Angles */
export enum ST_Angle {
  /** Any Angle */
  any = 'any',
  /** 30 degrees */
  _30 = '30',
  /** 45 degrees */
  _45 = '45',
  /** 60 degrees */
  _60 = '60',
  /** 90 degrees */
  _90 = '90',
  /** Automatic Angle */
  auto = 'auto'
}

/** Callout Drop Location */
export type ST_CalloutDrop = string;

/** Callout Placement */
export enum ST_CalloutPlacement {
  /** Top placement */
  top = 'top',
  /** Center placement */
  center = 'center',
  /** Bottom placement */
  bottom = 'bottom',
  /** User-defined placement */
  user = 'user'
}

/** Connector Type */
export enum ST_ConnectorType {
  /** No Connector */
  none = 'none',
  /** Straight Connector */
  straight = 'straight',
  /** Elbow Connector */
  elbow = 'elbow',
  /** Curved Connector */
  curved = 'curved'
}

/** Alignment Type */
export enum ST_HrAlign {
  /** Left Alignment */
  left = 'left',
  /** Right Alignment */
  right = 'right',
  /** Center Alignment */
  center = 'center'
}

/** Connection Locations Type */
export enum ST_ConnectType {
  /** No */
  none = 'none',
  /** Four Connections */
  rect = 'rect',
  /** Edit Point Connections */
  segments = 'segments',
  /** Custom Connections */
  custom = 'custom'
}

/** Embedded Object Alternate Image Request Types */
export enum ST_OLELinkType {
  /** Other Image */
  Picture = 'Picture',
  /** Bitmap Image */
  Bitmap = 'Bitmap',
  /** Enhanced Metafile Image */
  EnhancedMetaFile = 'EnhancedMetaFile'
}

/** OLE Connection Type */
export enum ST_OLEType {
  /** Embedded Object */
  Embed = 'Embed',
  /** Linked Object */
  Link = 'Link'
}

/** OLE Object Representations */
export enum ST_OLEDrawAspect {
  /** Snapshot */
  Content = 'Content',
  /** Icon */
  Icon = 'Icon'
}

/** OLE Update Method Type */
export enum ST_OLEUpdateMode {
  /** Server Application Update */
  Always = 'Always',
  /** User Update */
  OnCall = 'OnCall'
}

/** 128-Bit GUID */
export type ST_Guid = string;

/** Explicit Relationship ID */
export type ST_RelationshipId = string;

/** Boolean Value */
export enum ST_TrueFalse {
  /** True */
  t = 't',
  /** False */
  f = 'f',
  /** True */
  true = 'true',
  /** False */
  false = 'false'
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

/** Shape Fill Type */
export enum ST_FillType {
  /** Centered Radial Gradient */
  gradientCenter = 'gradientCenter',
  /** Solid Fill */
  solid = 'solid',
  /** Image Pattern */
  pattern = 'pattern',
  /** Tiled Image */
  tile = 'tile',
  /** Stretch Image to Fit */
  frame = 'frame',
  /** Unscaled Gradient */
  gradientUnscaled = 'gradientUnscaled',
  /** Radial Gradient */
  gradientRadial = 'gradientRadial',
  /** Linear Gradient */
  gradient = 'gradient',
  /** Use Background Fill */
  background = 'background'
}

/** Callout */
export interface CT_ShapeDefaults {
  spidmax?: number;
  style?: string;
  fill?: ST_TrueFalse | any;
  fillcolor?: ST_ColorType;
  stroke?: ST_TrueFalse | any;
  strokecolor?: ST_ColorType;
  allowincell?: any;
  textbox?: any;
  shadow?: any;
  skew?: any;
  extrusion?: any;
  callout?: any;
  lock?: any;
  colormru?: any;
  colormenu?: any;
}

/** Ink Data */
export interface CT_Ink {
  i?: string;
  annotation?: ST_TrueFalse;
}

/** Signature Line Flag */
export interface CT_SignatureLine {
  issignatureline?: ST_TrueFalse;
  id?: ST_Guid;
  provid?: ST_Guid;
  signinginstructionsset?: ST_TrueFalse;
  allowcomments?: ST_TrueFalse;
  showsigndate?: ST_TrueFalse;
  suggestedsigner?: string;
  suggestedsigner2?: string;
  suggestedsigneremail?: string;
  signinginstructions?: string;
  addlxml?: string;
  sigprovurl?: string;
}

/** Shape ID Map */
export interface CT_ShapeLayout {
  idmap?: CT_IdMap;
  regrouptable?: CT_RegroupTable;
  rules?: CT_Rules;
}

/** Shape IDs */
export interface CT_IdMap {
  data?: string;
}

/** Regroup Entry */
export interface CT_RegroupTable {
  entry?: CT_Entry[];
}

/** New Group ID */
export interface CT_Entry {
  new?: number;
  old?: number;
}

/** Rule */
export interface CT_Rules {
  r?: CT_R[];
}

/** Shape Reference */
export interface CT_R {
  id: string;
  type?: ST_RType;
  how?: ST_How;
  idref?: string;
  proxy?: CT_Proxy[];
}

/** Start Point Connection Flag */
export interface CT_Proxy {
  start?: ST_TrueFalseBlank;
  end?: ST_TrueFalseBlank;
  idref?: string;
  connectloc?: number;
}

/** Diagram Relationship Table */
export interface CT_Diagram {
  dgmstyle?: number;
  autoformat?: ST_TrueFalse;
  reverse?: ST_TrueFalse;
  autolayout?: ST_TrueFalse;
  dgmscalex?: number;
  dgmscaley?: number;
  dgmfontsize?: number;
  constrainbounds?: string;
  dgmbasetextscale?: number;
  relationtable?: CT_RelationTable;
}

/** Diagram Relationship */
export interface CT_RelationTable {
  rel?: CT_Relation[];
}

/** Diagram Relationship Source Shape */
export interface CT_Relation {
  idsrc?: string;
  iddest?: string;
  idcntr?: string;
}

/** Recent colors */
export interface CT_ColorMru {
  colors?: string;
}

/** Default stroke color */
export interface CT_ColorMenu {
  strokecolor?: ST_ColorType;
  fillcolor?: ST_ColorType;
  shadowcolor?: ST_ColorType;
  extrusioncolor?: ST_ColorType;
}

/** Skew ID */
export interface CT_Skew {
  id?: string;
  on?: ST_TrueFalse;
  offset?: string;
  origin?: string;
  matrix?: string;
}

/** Extrusion Toggle */
export interface CT_Extrusion {
  on?: ST_TrueFalse;
  type?: ST_ExtrusionType;
  render?: ST_ExtrusionRender;
  viewpointorigin?: string;
  viewpoint?: string;
  plane?: ST_ExtrusionPlane;
  skewangle?: number;
  skewamt?: string;
  foredepth?: string;
  backdepth?: string;
  orientation?: string;
  orientationangle?: number;
  lockrotationcenter?: ST_TrueFalse;
  autorotationcenter?: ST_TrueFalse;
  rotationcenter?: string;
  rotationangle?: string;
  colormode?: ST_ColorMode;
  color?: ST_ColorType;
  shininess?: number;
  specularity?: string;
  diffusity?: string;
  metal?: ST_TrueFalse;
  edge?: string;
  facet?: string;
  lightface?: ST_TrueFalse;
  brightness?: string;
  lightposition?: string;
  lightlevel?: string;
  lightharsh?: ST_TrueFalse;
  lightposition2?: string;
  lightlevel2?: string;
  lightharsh2?: ST_TrueFalse;
}

/** Callout toggle */
export interface CT_Callout {
  on?: ST_TrueFalse;
  type?: string;
  gap?: string;
  angle?: ST_Angle;
  dropauto?: ST_TrueFalse;
  drop?: ST_CalloutDrop;
  distance?: string;
  lengthspecified?: ST_TrueFalse;
  length?: string;
  accentbar?: ST_TrueFalse;
  textborder?: ST_TrueFalse;
  minusx?: ST_TrueFalse;
  minusy?: ST_TrueFalse;
}

/** Position Lock */
export interface CT_Lock {
  position?: ST_TrueFalse;
  selection?: ST_TrueFalse;
  grouping?: ST_TrueFalse;
  ungrouping?: ST_TrueFalse;
  rotation?: ST_TrueFalse;
  cropping?: ST_TrueFalse;
  verticies?: ST_TrueFalse;
  adjusthandles?: ST_TrueFalse;
  text?: ST_TrueFalse;
  aspectratio?: ST_TrueFalse;
  shapetype?: ST_TrueFalse;
}

/** Embedded Object Alternate Image Request */
export interface CT_OLEObject {
  Type?: ST_OLEType;
  ProgID?: string;
  ShapeID?: string;
  DrawAspect?: ST_OLEDrawAspect;
  ObjectID?: string;
  id: string;
  UpdateMode?: ST_OLEUpdateMode;
  LinkType?: ST_OLELinkType;
  LockedField?: ST_TrueFalseBlank;
  FieldCodes?: string;
}

export interface CT_Complex {}

/** Stroke Toggle */
export interface CT_StrokeChild {
  on?: ST_TrueFalse;
  weight?: string;
  color?: ST_ColorType;
  color2?: ST_ColorType;
  opacity?: string;
  linestyle?: ST_StrokeLineStyle;
  miterlimit?: number;
  joinstyle?: ST_StrokeJoinStyle;
  endcap?: ST_StrokeEndCap;
  dashstyle?: string;
  insetpen?: ST_TrueFalse;
  filltype?: ST_FillType;
  src?: string;
  imageaspect?: ST_ImageAspect;
  imagesize?: string;
  imagealignshape?: ST_TrueFalse;
  startarrow?: ST_StrokeArrowType;
  startarrowwidth?: ST_StrokeArrowWidth;
  startarrowlength?: ST_StrokeArrowLength;
  endarrow?: ST_StrokeArrowType;
  endarrowwidth?: ST_StrokeArrowWidth;
  endarrowlength?: ST_StrokeArrowLength;
  href?: any;
  althref?: any;
  title?: any;
  forcedash?: any;
}

/** Path Definition */
export interface CT_ClipPath {
  v: string;
}

/** Fill Type */
export interface CT_Fill {
  type?: ST_FillType;
}
