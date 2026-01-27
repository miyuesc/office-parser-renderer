/**
 * dml-baseTypes.xsd
 */

/** Coordinate */
export type ST_Coordinate = number;

/** Coordinate Point */
export type ST_Coordinate32 = string;

/** Positive Coordinate */
export type ST_PositiveCoordinate = number;

/** Positive Coordinate Point */
export type ST_PositiveCoordinate32 = ST_Coordinate32;

/** Angle */
export type ST_Angle = string;

/** Fixed Angle */
export type ST_FixedAngle = ST_Angle;

/** Positive Fixed Angle */
export type ST_PositiveFixedAngle = ST_Angle;

/** Percentage */
export type ST_Percentage = string;

/** Positive Percentage */
export type ST_PositivePercentage = ST_Percentage;

/** Fixed Percentage */
export type ST_FixedPercentage = ST_Percentage;

/** Positive Fixed Percentage */
export type ST_PositiveFixedPercentage = ST_Percentage;

/** Hex Binary of Length 3 */
export type ST_HexBinary3 = string;

/** System Color Value */
export enum ST_SystemColorVal {
  /** Scroll Bar System Color */
  scrollBar = 'scrollBar',
  /** Background System Color */
  background = 'background',
  /** Active Caption System Color */
  activeCaption = 'activeCaption',
  /** Inactive Caption System Color */
  inactiveCaption = 'inactiveCaption',
  /** Menu System Color */
  menu = 'menu',
  /** Window System Color */
  window = 'window',
  /** Window Frame System Color */
  windowFrame = 'windowFrame',
  /** Menu Text System Color */
  menuText = 'menuText',
  /** Window Text System Color */
  windowText = 'windowText',
  /** Caption Text System Color */
  captionText = 'captionText',
  /** Active Border System Color */
  activeBorder = 'activeBorder',
  /** Inactive Border System Color */
  inactiveBorder = 'inactiveBorder',
  /** Application Workspace System Color */
  appWorkspace = 'appWorkspace',
  /** Highlight System Color */
  highlight = 'highlight',
  /** Highlight Text System Color */
  highlightText = 'highlightText',
  /** Button Face System Color */
  btnFace = 'btnFace',
  /** Button Shadow System Color */
  btnShadow = 'btnShadow',
  /** Gray Text System Color */
  grayText = 'grayText',
  /** Button Text System Color */
  btnText = 'btnText',
  /** Inactive Caption Text System Color */
  inactiveCaptionText = 'inactiveCaptionText',
  /** Button Highlight System Color */
  btnHighlight = 'btnHighlight',
  /** 3D Dark System Color */
  _3dDkShadow = '3dDkShadow',
  /** 3D Light System Color */
  _3dLight = '3dLight',
  /** Info Text System Color */
  infoText = 'infoText',
  /** Info Back System Color */
  infoBk = 'infoBk',
  /** Hot Light System Color */
  hotLight = 'hotLight',
  /** Gradient Active Caption System Color */
  gradientActiveCaption = 'gradientActiveCaption',
  /** Gradient Inactive Caption System Color */
  gradientInactiveCaption = 'gradientInactiveCaption',
  /** Menu Highlight System Color */
  menuHighlight = 'menuHighlight',
  /** Menu Bar System Color */
  menuBar = 'menuBar'
}

/** Scheme Color */
export enum ST_SchemeColorVal {
  /** Background Color 1 */
  bg1 = 'bg1',
  /** Text Color 1 */
  tx1 = 'tx1',
  /** Background Color 2 */
  bg2 = 'bg2',
  /** Text Color 2 */
  tx2 = 'tx2',
  /** Accent Color 1 */
  accent1 = 'accent1',
  /** Accent Color 2 */
  accent2 = 'accent2',
  /** Accent Color 3 */
  accent3 = 'accent3',
  /** Accent Color 4 */
  accent4 = 'accent4',
  /** Accent Color 5 */
  accent5 = 'accent5',
  /** Accent Color 6 */
  accent6 = 'accent6',
  /** Hyperlink Color */
  hlink = 'hlink',
  /** Followed Hyperlink Color */
  folHlink = 'folHlink',
  /** Style Color */
  phClr = 'phClr',
  /** Dark Color 1 */
  dk1 = 'dk1',
  /** Light Color 1 */
  lt1 = 'lt1',
  /** Dark Color 2 */
  dk2 = 'dk2',
  /** Light Color 2 */
  lt2 = 'lt2'
}

/** Preset Color Value */
export enum ST_PresetColorVal {
  /** Alice Blue Preset Color */
  aliceBlue = 'aliceBlue',
  /** Antique White Preset Color */
  antiqueWhite = 'antiqueWhite',
  /** Aqua Preset Color */
  aqua = 'aqua',
  /** Aquamarine Preset Color */
  aquamarine = 'aquamarine',
  /** Azure Preset Color */
  azure = 'azure',
  /** Beige Preset Color */
  beige = 'beige',
  /** Bisque Preset Color */
  bisque = 'bisque',
  /** Black Preset Color */
  black = 'black',
  /** Blanched Almond Preset Color */
  blanchedAlmond = 'blanchedAlmond',
  /** Blue Preset Color */
  blue = 'blue',
  /** Blue Violet Preset Color */
  blueViolet = 'blueViolet',
  /** Brown Preset Color */
  brown = 'brown',
  /** Burly Wood Preset Color */
  burlyWood = 'burlyWood',
  /** Cadet Blue Preset Color */
  cadetBlue = 'cadetBlue',
  /** Chartreuse Preset Color */
  chartreuse = 'chartreuse',
  /** Chocolate Preset Color */
  chocolate = 'chocolate',
  /** Coral Preset Color */
  coral = 'coral',
  /** Cornflower Blue Preset Color */
  cornflowerBlue = 'cornflowerBlue',
  /** Cornsilk Preset Color */
  cornsilk = 'cornsilk',
  /** Crimson Preset Color */
  crimson = 'crimson',
  /** Cyan Preset Color */
  cyan = 'cyan',
  /** Dark Blue Preset Color */
  dkBlue = 'dkBlue',
  /** Dark Cyan Preset Color */
  dkCyan = 'dkCyan',
  /** Dark Goldenrod Preset Color */
  dkGoldenrod = 'dkGoldenrod',
  /** Dark Gray Preset Color */
  dkGray = 'dkGray',
  /** Dark Green Preset Color */
  dkGreen = 'dkGreen',
  /** Dark Khaki Preset Color */
  dkKhaki = 'dkKhaki',
  /** Dark Magenta Preset Color */
  dkMagenta = 'dkMagenta',
  /** Dark Olive Green Preset Color */
  dkOliveGreen = 'dkOliveGreen',
  /** Dark Orange Preset Color */
  dkOrange = 'dkOrange',
  /** Dark Orchid Preset Color */
  dkOrchid = 'dkOrchid',
  /** Dark Red Preset Color */
  dkRed = 'dkRed',
  /** Dark Salmon Preset Color */
  dkSalmon = 'dkSalmon',
  /** Dark Sea Green Preset Color */
  dkSeaGreen = 'dkSeaGreen',
  /** Dark Slate Blue Preset Color */
  dkSlateBlue = 'dkSlateBlue',
  /** Dark Slate Gray Preset Color */
  dkSlateGray = 'dkSlateGray',
  /** Dark Turquoise Preset Color */
  dkTurquoise = 'dkTurquoise',
  /** Dark Violet Preset Color */
  dkViolet = 'dkViolet',
  /** Deep Pink Preset Color */
  deepPink = 'deepPink',
  /** Deep Sky Blue Preset Color */
  deepSkyBlue = 'deepSkyBlue',
  /** Dim Gray Preset Color */
  dimGray = 'dimGray',
  /** Dodger Blue Preset Color */
  dodgerBlue = 'dodgerBlue',
  /** Firebrick Preset Color */
  firebrick = 'firebrick',
  /** Floral White Preset Color */
  floralWhite = 'floralWhite',
  /** Forest Green Preset Color */
  forestGreen = 'forestGreen',
  /** Fuchsia Preset Color */
  fuchsia = 'fuchsia',
  /** Gainsboro Preset Color */
  gainsboro = 'gainsboro',
  /** Ghost White Preset Color */
  ghostWhite = 'ghostWhite',
  /** Gold Preset Color */
  gold = 'gold',
  /** Goldenrod Preset Color */
  goldenrod = 'goldenrod',
  /** Gray Preset Color */
  gray = 'gray',
  /** Green Preset Color */
  green = 'green',
  /** Green Yellow Preset Color */
  greenYellow = 'greenYellow',
  /** Honeydew Preset Color */
  honeydew = 'honeydew',
  /** Hot Pink Preset Color */
  hotPink = 'hotPink',
  /** Indian Red Preset Color */
  indianRed = 'indianRed',
  /** Indigo Preset Color */
  indigo = 'indigo',
  /** Ivory Preset Color */
  ivory = 'ivory',
  /** Khaki Preset Color */
  khaki = 'khaki',
  /** Lavender Preset Color */
  lavender = 'lavender',
  /** Lavender Blush Preset Color */
  lavenderBlush = 'lavenderBlush',
  /** Lawn Green Preset Color */
  lawnGreen = 'lawnGreen',
  /** Lemon Chiffon Preset Color */
  lemonChiffon = 'lemonChiffon',
  /** Light Blue Preset Color */
  ltBlue = 'ltBlue',
  /** Light Coral Preset Color */
  ltCoral = 'ltCoral',
  /** Light Cyan Preset Color */
  ltCyan = 'ltCyan',
  /** Light Goldenrod Yellow Preset Color */
  ltGoldenrodYellow = 'ltGoldenrodYellow',
  /** Light Gray Preset Color */
  ltGray = 'ltGray',
  /** Light Green Preset Color */
  ltGreen = 'ltGreen',
  /** Light Pink Preset Color */
  ltPink = 'ltPink',
  /** Light Salmon Preset Color */
  ltSalmon = 'ltSalmon',
  /** Light Sea Green Preset Color */
  ltSeaGreen = 'ltSeaGreen',
  /** Light Sky Blue Preset Color */
  ltSkyBlue = 'ltSkyBlue',
  /** Light Slate Gray Preset Color */
  ltSlateGray = 'ltSlateGray',
  /** Light Steel Blue Preset Color */
  ltSteelBlue = 'ltSteelBlue',
  /** Light Yellow Preset Color */
  ltYellow = 'ltYellow',
  /** Lime Preset Color */
  lime = 'lime',
  /** Lime Green Preset Color */
  limeGreen = 'limeGreen',
  /** Linen Preset Color */
  linen = 'linen',
  /** Magenta Preset Color */
  magenta = 'magenta',
  /** Maroon Preset Color */
  maroon = 'maroon',
  /** Medium Aquamarine Preset Color */
  medAquamarine = 'medAquamarine',
  /** Medium Blue Preset Color */
  medBlue = 'medBlue',
  /** Medium Orchid Preset Color */
  medOrchid = 'medOrchid',
  /** Medium Purple Preset Color */
  medPurple = 'medPurple',
  /** Medium Sea Green Preset Color */
  medSeaGreen = 'medSeaGreen',
  /** Medium Slate Blue Preset Color */
  medSlateBlue = 'medSlateBlue',
  /** Medium Spring Green Preset Color */
  medSpringGreen = 'medSpringGreen',
  /** Medium Turquoise Preset Color */
  medTurquoise = 'medTurquoise',
  /** Medium Violet Red Preset Color */
  medVioletRed = 'medVioletRed',
  /** Midnight Blue Preset Color */
  midnightBlue = 'midnightBlue',
  /** Mint Cream Preset Color */
  mintCream = 'mintCream',
  /** Misty Rose Preset Color */
  mistyRose = 'mistyRose',
  /** Moccasin Preset Color */
  moccasin = 'moccasin',
  /** Navajo White Preset Color */
  navajoWhite = 'navajoWhite',
  /** Navy Preset Color */
  navy = 'navy',
  /** Old Lace Preset Color */
  oldLace = 'oldLace',
  /** Olive Preset Color */
  olive = 'olive',
  /** Olive Drab Preset Color */
  oliveDrab = 'oliveDrab',
  /** Orange Preset Color */
  orange = 'orange',
  /** Orange Red Preset Color */
  orangeRed = 'orangeRed',
  /** Orchid Preset Color */
  orchid = 'orchid',
  /** Pale Goldenrod Preset Color */
  paleGoldenrod = 'paleGoldenrod',
  /** Pale Green Preset Color */
  paleGreen = 'paleGreen',
  /** Pale Turquoise Preset Color */
  paleTurquoise = 'paleTurquoise',
  /** Pale Violet Red Preset Color */
  paleVioletRed = 'paleVioletRed',
  /** Papaya Whip Preset Color */
  papayaWhip = 'papayaWhip',
  /** Peach Puff Preset Color */
  peachPuff = 'peachPuff',
  /** Peru Preset Color */
  peru = 'peru',
  /** Pink Preset Color */
  pink = 'pink',
  /** Plum Preset Color */
  plum = 'plum',
  /** Powder Blue Preset Color */
  powderBlue = 'powderBlue',
  /** Purple Preset Color */
  purple = 'purple',
  /** Red Preset Color */
  red = 'red',
  /** Rosy Brown Preset Color */
  rosyBrown = 'rosyBrown',
  /** Royal Blue Preset Color */
  royalBlue = 'royalBlue',
  /** Saddle Brown Preset Color */
  saddleBrown = 'saddleBrown',
  /** Salmon Preset Color */
  salmon = 'salmon',
  /** Sandy Brown Preset Color */
  sandyBrown = 'sandyBrown',
  /** Sea Green Preset Color */
  seaGreen = 'seaGreen',
  /** Sea Shell Preset Color */
  seaShell = 'seaShell',
  /** Sienna Preset Color */
  sienna = 'sienna',
  /** Silver Preset Color */
  silver = 'silver',
  /** Sky Blue Preset Color */
  skyBlue = 'skyBlue',
  /** Slate Blue Preset Color */
  slateBlue = 'slateBlue',
  /** Slate Gray Preset Color */
  slateGray = 'slateGray',
  /** Snow Preset Color */
  snow = 'snow',
  /** Spring Green Preset Color */
  springGreen = 'springGreen',
  /** Steel Blue Preset Color */
  steelBlue = 'steelBlue',
  /** Tan Preset Color */
  tan = 'tan',
  /** Teal Preset Color */
  teal = 'teal',
  /** Thistle Preset Color */
  thistle = 'thistle',
  /** Tomato Preset Color */
  tomato = 'tomato',
  /** Turquoise Preset Color */
  turquoise = 'turquoise',
  /** Violet Preset Color */
  violet = 'violet',
  /** Wheat Preset Color */
  wheat = 'wheat',
  /** White Preset Color */
  white = 'white',
  /** White Smoke Preset Color */
  whiteSmoke = 'whiteSmoke',
  /** Yellow Preset Color */
  yellow = 'yellow',
  /** Yellow Green Preset Color */
  yellowGreen = 'yellowGreen'
}

/** Rectangle Alignments */
export enum ST_RectAlignment {
  /** Rectangle Alignment Enum ( Top Left ) */
  tl = 'tl',
  /** Rectangle Alignment Enum ( Top ) */
  t = 't',
  /** Rectangle Alignment Enum ( Top Right ) */
  tr = 'tr',
  /** Rectangle Alignment Enum ( Left ) */
  l = 'l',
  /** Rectangle Alignment Enum ( Center ) */
  ctr = 'ctr',
  /** Rectangle Alignment Enum ( Right ) */
  r = 'r',
  /** Rectangle Alignment Enum ( Bottom Left ) */
  bl = 'bl',
  /** Rectangle Alignment Enum ( Bottom ) */
  b = 'b',
  /** Rectangle Alignment Enum ( Bottom Right ) */
  br = 'br'
}

/** GUID Method */
export type ST_Guid = string;

/** Black and White Mode */
export enum ST_BlackWhiteMode {
  /** Color */
  clr = 'clr',
  /** Automatic */
  auto = 'auto',
  /** Gray */
  gray = 'gray',
  /** Light Gray */
  ltGray = 'ltGray',
  /** Inverse Gray */
  invGray = 'invGray',
  /** Gray and White */
  grayWhite = 'grayWhite',
  /** Black and Gray */
  blackGray = 'blackGray',
  /** Black and White */
  blackWhite = 'blackWhite',
  /** Black */
  black = 'black',
  /** White */
  white = 'white',
  /** Hidden */
  hidden = 'hidden'
}

/** Drawing Element ID */
export type ST_DrawingElementId = number;

/** Uniform Resource Identifier */
export interface CT_OfficeArtExtension {
  uri?: string;
}

/** Value */
export interface CT_Angle {
  val: ST_Angle;
}

/** Value */
export interface CT_PositiveFixedAngle {
  val: ST_PositiveFixedAngle;
}

/** Value */
export interface CT_Percentage {
  val: ST_Percentage;
}

/** Value */
export interface CT_PositivePercentage {
  val: ST_PositivePercentage;
}

/** Value */
export interface CT_FixedPercentage {
  val: ST_FixedPercentage;
}

/** Value */
export interface CT_PositiveFixedPercentage {
  val: ST_PositiveFixedPercentage;
}

/** Numerator */
export interface CT_Ratio {
  n: number;
  d: number;
}

/** X-Axis Coordinate */
export interface CT_Point2D {
  x: ST_Coordinate;
  y: ST_Coordinate;
}

/** Extent Length */
export interface CT_PositiveSize2D {
  cx: ST_PositiveCoordinate;
  cy: ST_PositiveCoordinate;
}

export interface CT_ComplementTransform {}

export interface CT_InverseTransform {}

export interface CT_GrayscaleTransform {}

export interface CT_GammaTransform {}

export interface CT_InverseGammaTransform {}

/** Red */
export interface CT_ScRgbColor {
  r: ST_Percentage;
  g: ST_Percentage;
  b: ST_Percentage;
}

/** Value */
export interface CT_SRgbColor {
  val: ST_HexBinary3;
}

/** Hue */
export interface CT_HslColor {
  hue: ST_PositiveFixedAngle;
  sat: ST_Percentage;
  lum: ST_Percentage;
}

/** Value */
export interface CT_SystemColor {
  val: ST_SystemColorVal;
  lastClr?: ST_HexBinary3;
}

/** Value */
export interface CT_SchemeColor {
  val: ST_SchemeColorVal;
}

/** Value */
export interface CT_PresetColor {
  val?: ST_PresetColorVal;
}

export interface CT_OfficeArtExtensionList {
  ext?: CT_OfficeArtExtension[];
}

/** Horizontal Ratio */
export interface CT_Scale2D {
  sx: CT_Ratio;
  sy: CT_Ratio;
}

/** Offset */
export interface CT_Transform2D {
  rot?: ST_Angle;
  flipH?: boolean;
  flipV?: boolean;
  off?: CT_Point2D;
  ext?: CT_PositiveSize2D;
}

/** Offset */
export interface CT_GroupTransform2D {
  rot?: ST_Angle;
  flipH?: boolean;
  flipV?: boolean;
  off?: CT_Point2D;
  ext?: CT_PositiveSize2D;
  chOff?: CT_Point2D;
  chExt?: CT_PositiveSize2D;
}

/** X-Coordinate in 3D */
export interface CT_Point3D {
  x: ST_Coordinate;
  y: ST_Coordinate;
  z: ST_Coordinate;
}

/** Distance along X-axis in 3D */
export interface CT_Vector3D {
  dx: ST_Coordinate;
  dy: ST_Coordinate;
  dz: ST_Coordinate;
}

/** Latitude */
export interface CT_SphereCoords {
  lat: ST_PositiveFixedAngle;
  lon: ST_PositiveFixedAngle;
  rev: ST_PositiveFixedAngle;
}

/** Left Offset */
export interface CT_RelativeRect {
  l?: ST_Percentage;
  t?: ST_Percentage;
  r?: ST_Percentage;
  b?: ST_Percentage;
}

export interface CT_Color {
  scrgbClr?: CT_ScRgbColor;
  srgbClr?: CT_SRgbColor;
  hslClr?: CT_HslColor;
  sysClr?: CT_SystemColor;
  schemeClr?: CT_SchemeColor;
  prstClr?: CT_PresetColor;
}

export interface CT_ColorMRU {
  scrgbClr?: CT_ScRgbColor;
  srgbClr?: CT_SRgbColor;
  hslClr?: CT_HslColor;
  sysClr?: CT_SystemColor;
  schemeClr?: CT_SchemeColor;
  prstClr?: CT_PresetColor;
}

/** Embedded Audio File Relationship ID */
export interface CT_EmbeddedWAVAudioFile {
  embed: string;
  name?: string;
  builtIn?: boolean;
}

/** Hyperlink Sound */
export interface CT_Hyperlink {
  id: string;
  invalidUrl?: string;
  action?: string;
  tgtFrame?: string;
  tooltip?: string;
  history?: boolean;
  highlightClick?: boolean;
  endSnd?: boolean;
  snd?: CT_EmbeddedWAVAudioFile;
  extLst?: CT_OfficeArtExtensionList;
}
