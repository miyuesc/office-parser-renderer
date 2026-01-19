import {
  CT_HslColor,
  CT_OfficeArtExtensionList,
  CT_PresetColor,
  CT_RelativeRect,
  CT_SRgbColor,
  CT_ScRgbColor,
  CT_SchemeColor,
  CT_SystemColor,
  ST_Coordinate,
  ST_FixedAngle,
  ST_FixedPercentage,
  ST_Percentage,
  ST_PositiveCoordinate,
  ST_PositiveFixedAngle,
  ST_PositiveFixedPercentage,
  ST_PositivePercentage,
  ST_RectAlignment
} from './dml-baseTypes';
import { CT_Color } from './wml';

/**
 * dml-shapeEffects.xsd
 */

/** Preset Shadow Type */
export enum ST_PresetShadowVal {
  /** Top Left Drop Shadow */
  shdw1 = 'shdw1',
  /** Top Right Drop Shadow */
  shdw2 = 'shdw2',
  /** Back Left Perspective Shadow */
  shdw3 = 'shdw3',
  /** Back Right Perspective Shadow */
  shdw4 = 'shdw4',
  /** Bottom Left Drop Shadow */
  shdw5 = 'shdw5',
  /** Bottom Right Drop Shadow */
  shdw6 = 'shdw6',
  /** Front Left Perspective Shadow */
  shdw7 = 'shdw7',
  /** Front Right Perspective Shadow */
  shdw8 = 'shdw8',
  /** Top Left Small Drop Shadow */
  shdw9 = 'shdw9',
  /** Top Left Large Drop Shadow */
  shdw10 = 'shdw10',
  /** Back Left Long Perspective Shadow */
  shdw11 = 'shdw11',
  /** Back Right Long Perspective Shadow */
  shdw12 = 'shdw12',
  /** Top Left Double Drop Shadow */
  shdw13 = 'shdw13',
  /** Bottom Right Small Drop Shadow */
  shdw14 = 'shdw14',
  /** Front Left Long Perspective Shadow */
  shdw15 = 'shdw15',
  /** Front Right LongPerspective Shadow */
  shdw16 = 'shdw16',
  /** 3D Outer Box Shadow */
  shdw17 = 'shdw17',
  /** 3D Inner Box Shadow */
  shdw18 = 'shdw18',
  /** Back Center Perspective Shadow */
  shdw19 = 'shdw19',
  /** Front Bottom Shadow */
  shdw20 = 'shdw20'
}

/** Path Shade Type */
export enum ST_PathShadeType {
  /** Shape */
  shape = 'shape',
  /** Circle */
  circle = 'circle',
  /** Rectangle */
  rect = 'rect'
}

/** Tile Flip Mode */
export enum ST_TileFlipMode {
  /** None */
  none = 'none',
  /** Horizontal */
  x = 'x',
  /** Vertical */
  y = 'y',
  /** Horizontal and Vertical */
  xy = 'xy'
}

/** Blip Compression Type */
export enum ST_BlipCompression {
  /** Email Compression */
  email = 'email',
  /** Screen Viewing Compression */
  screen = 'screen',
  /** Printing Compression */
  print = 'print',
  /** High Quality Printing Compression */
  hqprint = 'hqprint',
  /** No Compression */
  none = 'none'
}

/** Preset Pattern Value */
export enum ST_PresetPatternVal {
  /** 5% */
  pct5 = 'pct5',
  /** 10% */
  pct10 = 'pct10',
  /** 20% */
  pct20 = 'pct20',
  /** 25% */
  pct25 = 'pct25',
  /** 30% */
  pct30 = 'pct30',
  /** 40% */
  pct40 = 'pct40',
  /** 50% */
  pct50 = 'pct50',
  /** 60% */
  pct60 = 'pct60',
  /** 70% */
  pct70 = 'pct70',
  /** 75% */
  pct75 = 'pct75',
  /** 80% */
  pct80 = 'pct80',
  /** 90% */
  pct90 = 'pct90',
  /** Horizontal */
  horz = 'horz',
  /** Vertical */
  vert = 'vert',
  /** Light Horizontal */
  ltHorz = 'ltHorz',
  /** Light Vertical */
  ltVert = 'ltVert',
  /** Dark Horizontal */
  dkHorz = 'dkHorz',
  /** Dark Vertical */
  dkVert = 'dkVert',
  /** Narrow Horizontal */
  narHorz = 'narHorz',
  /** Narrow Vertical */
  narVert = 'narVert',
  /** Dashed Horizontal */
  dashHorz = 'dashHorz',
  /** Dashed Vertical */
  dashVert = 'dashVert',
  /** Cross */
  cross = 'cross',
  /** Downward Diagonal */
  dnDiag = 'dnDiag',
  /** Upward Diagonal */
  upDiag = 'upDiag',
  /** Light Downward Diagonal */
  ltDnDiag = 'ltDnDiag',
  /** Light Upward Diagonal */
  ltUpDiag = 'ltUpDiag',
  /** Dark Downward Diagonal */
  dkDnDiag = 'dkDnDiag',
  /** Dark Upward Diagonal */
  dkUpDiag = 'dkUpDiag',
  /** Wide Downward Diagonal */
  wdDnDiag = 'wdDnDiag',
  /** Wide Upward Diagonal */
  wdUpDiag = 'wdUpDiag',
  /** Dashed Downward Diagonal */
  dashDnDiag = 'dashDnDiag',
  /** Dashed Upward DIagonal */
  dashUpDiag = 'dashUpDiag',
  /** Diagonal Cross */
  diagCross = 'diagCross',
  /** Small Checker Board */
  smCheck = 'smCheck',
  /** Large Checker Board */
  lgCheck = 'lgCheck',
  /** Small Grid */
  smGrid = 'smGrid',
  /** Large Grid */
  lgGrid = 'lgGrid',
  /** Dotted Grid */
  dotGrid = 'dotGrid',
  /** Small Confetti */
  smConfetti = 'smConfetti',
  /** Large Confetti */
  lgConfetti = 'lgConfetti',
  /** Horizontal Brick */
  horzBrick = 'horzBrick',
  /** Diagonal Brick */
  diagBrick = 'diagBrick',
  /** Solid Diamond */
  solidDmnd = 'solidDmnd',
  /** Open Diamond */
  openDmnd = 'openDmnd',
  /** Dotted Diamond */
  dotDmnd = 'dotDmnd',
  /** Plaid */
  plaid = 'plaid',
  /** Sphere */
  sphere = 'sphere',
  /** Weave */
  weave = 'weave',
  /** Divot */
  divot = 'divot',
  /** Shingle */
  shingle = 'shingle',
  /** Wave */
  wave = 'wave',
  /** Trellis */
  trellis = 'trellis',
  /** Zig Zag */
  zigZag = 'zigZag'
}

/** Blend Mode */
export enum ST_BlendMode {
  /** Overlay */
  over = 'over',
  /** Multiply */
  mult = 'mult',
  /** Screen */
  screen = 'screen',
  /** Darken */
  darken = 'darken',
  /** Lighten */
  lighten = 'lighten'
}

/** Effect Container Type */
export enum ST_EffectContainerType {
  /** Sibling */
  sib = 'sib',
  /** Tree */
  tree = 'tree'
}

/** Threshold */
export interface CT_AlphaBiLevelEffect {
  thresh: ST_PositiveFixedPercentage;
}

export interface CT_AlphaCeilingEffect {}

export interface CT_AlphaFloorEffect {}

export interface CT_AlphaInverseEffect {}

/** Amount */
export interface CT_AlphaModulateFixedEffect {
  amt?: ST_PositivePercentage;
}

/** Radius */
export interface CT_AlphaOutsetEffect {
  rad?: ST_Coordinate;
}

/** Alpha */
export interface CT_AlphaReplaceEffect {
  a: ST_PositiveFixedPercentage;
}

/** Threshold */
export interface CT_BiLevelEffect {
  thresh: ST_PositiveFixedPercentage;
}

/** Radius */
export interface CT_BlurEffect {
  rad?: ST_PositiveCoordinate;
  grow?: boolean;
}

/** Change Color From */
export interface CT_ColorChangeEffect {
  useA?: boolean;
  clrFrom: CT_Color;
  clrTo: CT_Color;
}

export interface CT_ColorReplaceEffect {}

export interface CT_DuotoneEffect {
  scrgbClr?: CT_ScRgbColor;
  srgbClr?: CT_SRgbColor;
  hslClr?: CT_HslColor;
  sysClr?: CT_SystemColor;
  schemeClr?: CT_SchemeColor;
  prstClr?: CT_PresetColor;
}

/** Radius */
export interface CT_GlowEffect {
  rad?: ST_PositiveCoordinate;
}

export interface CT_GrayscaleEffect {}

/** Hue */
export interface CT_HSLEffect {
  hue?: ST_PositiveFixedAngle;
  sat?: ST_FixedPercentage;
  lum?: ST_FixedPercentage;
}

/** Blur Radius */
export interface CT_InnerShadowEffect {
  blurRad?: ST_PositiveCoordinate;
  dist?: ST_PositiveCoordinate;
  dir?: ST_PositiveFixedAngle;
}

/** Brightness */
export interface CT_LuminanceEffect {
  bright?: ST_FixedPercentage;
  contrast?: ST_FixedPercentage;
}

/** Blur Radius */
export interface CT_OuterShadowEffect {
  blurRad?: ST_PositiveCoordinate;
  dist?: ST_PositiveCoordinate;
  dir?: ST_PositiveFixedAngle;
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  kx?: ST_FixedAngle;
  ky?: ST_FixedAngle;
  algn?: ST_RectAlignment;
  rotWithShape?: boolean;
}

/** Preset Shadow */
export interface CT_PresetShadowEffect {
  prst: ST_PresetShadowVal;
  dist?: ST_PositiveCoordinate;
  dir?: ST_PositiveFixedAngle;
}

/** Blur Radius */
export interface CT_ReflectionEffect {
  blurRad?: ST_PositiveCoordinate;
  stA?: ST_PositiveFixedPercentage;
  stPos?: ST_PositiveFixedPercentage;
  endA?: ST_PositiveFixedPercentage;
  endPos?: ST_PositiveFixedPercentage;
  dist?: ST_PositiveCoordinate;
  dir?: ST_PositiveFixedAngle;
  fadeDir?: ST_PositiveFixedAngle;
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  kx?: ST_FixedAngle;
  ky?: ST_FixedAngle;
  algn?: ST_RectAlignment;
  rotWithShape?: boolean;
}

/** Offset X */
export interface CT_RelativeOffsetEffect {
  tx?: ST_Percentage;
  ty?: ST_Percentage;
}

/** Radius */
export interface CT_SoftEdgesEffect {
  rad: ST_PositiveCoordinate;
}

/** Hue */
export interface CT_TintEffect {
  hue?: ST_PositiveFixedAngle;
  amt?: ST_FixedPercentage;
}

/** Horizontal Ratio */
export interface CT_TransformEffect {
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  kx?: ST_FixedAngle;
  ky?: ST_FixedAngle;
  tx?: ST_Coordinate;
  ty?: ST_Coordinate;
}

export interface CT_NoFillProperties {}

export interface CT_SolidColorFillProperties {}

/** Angle */
export interface CT_LinearShadeProperties {
  ang?: ST_PositiveFixedAngle;
  scaled?: boolean;
}

/** Fill To Rectangle */
export interface CT_PathShadeProperties {
  path?: ST_PathShadeType;
  fillToRect?: CT_RelativeRect;
}

/** Position */
export interface CT_GradientStop {
  pos: ST_PositiveFixedPercentage;
}

/** Gradient stops */
export interface CT_GradientStopList {
  gs: CT_GradientStop[];
}

/** Gradient Stop List */
export interface CT_GradientFillProperties {
  flip?: ST_TileFlipMode;
  rotWithShape?: boolean;
  gsLst?: CT_GradientStopList;
  lin?: CT_LinearShadeProperties;
  path?: CT_PathShadeProperties;
  tileRect?: CT_RelativeRect;
}

/** Horizontal Offset */
export interface CT_TileInfoProperties {
  tx?: ST_Coordinate;
  ty?: ST_Coordinate;
  sx?: ST_Percentage;
  sy?: ST_Percentage;
  flip?: ST_TileFlipMode;
  algn?: ST_RectAlignment;
}

/** Fill Rectangle */
export interface CT_StretchInfoProperties {
  fillRect?: CT_RelativeRect;
}

/** Alpha Bi-Level Effect */
export interface CT_Blip {
  cstate?: ST_BlipCompression;
  alphaBiLevel: CT_AlphaBiLevelEffect;
  alphaCeiling: CT_AlphaCeilingEffect;
  alphaFloor: CT_AlphaFloorEffect;
  alphaInv: CT_AlphaInverseEffect;
  alphaMod: CT_AlphaModulateEffect;
  alphaModFix: CT_AlphaModulateFixedEffect;
  alphaRepl: CT_AlphaReplaceEffect;
  biLevel: CT_BiLevelEffect;
  blur: CT_BlurEffect;
  clrChange: CT_ColorChangeEffect;
  clrRepl: CT_ColorReplaceEffect;
  duotone: CT_DuotoneEffect;
  fillOverlay: CT_FillOverlayEffect;
  grayscl: CT_GrayscaleEffect;
  hsl: CT_HSLEffect;
  lum: CT_LuminanceEffect;
  tint: CT_TintEffect;
  extLst?: CT_OfficeArtExtensionList;
}

/** Source Rectangle */
export interface CT_BlipFillProperties {
  dpi?: number;
  rotWithShape?: boolean;
  blip?: CT_Blip;
  srcRect?: CT_RelativeRect;
  tile?: CT_TileInfoProperties;
  stretch?: CT_StretchInfoProperties;
}

/** Foreground color */
export interface CT_PatternFillProperties {
  prst?: ST_PresetPatternVal;
  fgClr?: CT_Color;
  bgClr?: CT_Color;
}

export interface CT_GroupFillProperties {}

export interface CT_FillProperties {
  noFill?: CT_NoFillProperties;
  solidFill?: CT_SolidColorFillProperties;
  gradFill?: CT_GradientFillProperties;
  blipFill?: CT_BlipFillProperties;
  pattFill?: CT_PatternFillProperties;
  grpFill?: CT_GroupFillProperties;
}

export interface CT_FillEffect {}

/** Blend */
export interface CT_FillOverlayEffect {
  blend: ST_BlendMode;
}

/** Reference */
export interface CT_EffectReference {
  ref?: string;
}

/** Effect Container Type */
export interface CT_EffectContainer {
  type?: ST_EffectContainerType;
  name?: string;
  cont?: CT_EffectContainer;
  effect?: CT_EffectReference;
  alphaBiLevel?: CT_AlphaBiLevelEffect;
  alphaCeiling?: CT_AlphaCeilingEffect;
  alphaFloor?: CT_AlphaFloorEffect;
  alphaInv?: CT_AlphaInverseEffect;
  alphaMod?: CT_AlphaModulateEffect;
  alphaModFix?: CT_AlphaModulateFixedEffect;
  alphaOutset?: CT_AlphaOutsetEffect;
  alphaRepl?: CT_AlphaReplaceEffect;
  biLevel?: CT_BiLevelEffect;
  blend?: CT_BlendEffect;
  blur?: CT_BlurEffect;
  clrChange?: CT_ColorChangeEffect;
  clrRepl?: CT_ColorReplaceEffect;
  duotone?: CT_DuotoneEffect;
  fill?: CT_FillEffect;
  fillOverlay?: CT_FillOverlayEffect;
  glow?: CT_GlowEffect;
  grayscl?: CT_GrayscaleEffect;
  hsl?: CT_HSLEffect;
  innerShdw?: CT_InnerShadowEffect;
  lum?: CT_LuminanceEffect;
  outerShdw?: CT_OuterShadowEffect;
  prstShdw?: CT_PresetShadowEffect;
  reflection?: CT_ReflectionEffect;
  relOff?: CT_RelativeOffsetEffect;
  softEdge?: CT_SoftEdgesEffect;
  tint?: CT_TintEffect;
  xfrm?: CT_TransformEffect;
}

export interface CT_AlphaModulateEffect {
  cont: CT_EffectContainer;
}

/** Effect to blend */
export interface CT_BlendEffect {
  blend: ST_BlendMode;
  cont: CT_EffectContainer;
}

/** Blur Effect */
export interface CT_EffectList {
  blur?: CT_BlurEffect;
  fillOverlay?: CT_FillOverlayEffect;
  glow?: CT_GlowEffect;
  innerShdw?: CT_InnerShadowEffect;
  outerShdw?: CT_OuterShadowEffect;
  prstShdw?: CT_PresetShadowEffect;
  reflection?: CT_ReflectionEffect;
  softEdge?: CT_SoftEdgesEffect;
}

export interface CT_EffectProperties {
  effectLst?: CT_EffectList;
  effectDag?: CT_EffectContainer;
}
