import { CT_OfficeArtExtensionList, ST_Coordinate32, ST_Percentage, ST_PositiveCoordinate32 } from './dml-baseTypes';
import { CT_Scene3D } from './dml-shape3DScene';
import { CT_PresetTextShape } from './dml-shapeGeometry';
import { CT_TextCharacterProperties } from './dml-textCharacter';
import { CT_TextParagraphProperties, ST_TextSpacingPercent } from './dml-textParagraph';
import { ST_Angle } from './vml-officeDrawing';

/**
 * dml-text.xsd
 */

/** Text Anchoring Types */
export enum ST_TextAnchoringType {
  /** Text Anchoring Type Enum ( Top ) */
  t = 't',
  /** Text Anchor Enum ( Center ) */
  ctr = 'ctr',
  /** Text Anchor Enum ( Bottom ) */
  b = 'b',
  /** Text Anchor Enum ( Justified ) */
  just = 'just',
  /** Text Anchor Enum ( Distributed ) */
  dist = 'dist'
}

/** Text Vertical Overflow */
export enum ST_TextVertOverflowType {
  /** Text Overflow Enum ( Overflow ) */
  overflow = 'overflow',
  /** Text Overflow Enum ( Ellipsis ) */
  ellipsis = 'ellipsis',
  /** Text Overflow Enum ( Clip ) */
  clip = 'clip'
}

/** Text Horizontal Overflow Types */
export enum ST_TextHorzOverflowType {
  /** Text Horizontal Overflow Enum ( Overflow ) */
  overflow = 'overflow',
  /** Text Horizontal Overflow Enum ( Clip ) */
  clip = 'clip'
}

/** Vertical Text Types */
export enum ST_TextVerticalType {
  /** Vertical Text Type Enum ( Horizontal ) */
  horz = 'horz',
  /** Vertical Text Type Enum ( Vertical ) */
  vert = 'vert',
  /** Vertical Text Type Enum ( Vertical 270 ) */
  vert270 = 'vert270',
  /** Vertical Text Type Enum ( WordArt Vertical ) */
  wordArtVert = 'wordArtVert',
  /** Vertical Text Type Enum ( East Asian Vertical ) */
  eaVert = 'eaVert',
  /** Vertical Text Type Enum ( Mongolian Vertical ) */
  mongolianVert = 'mongolianVert',
  /** Vertical WordArt Right to Left */
  wordArtVertRtl = 'wordArtVertRtl'
}

/** Text Wrapping Types */
export enum ST_TextWrappingType {
  /** Text Wrapping Type Enum ( None ) */
  none = 'none',
  /** Text Wrapping Type Enum ( Square ) */
  square = 'square'
}

/** Text Column Count */
export type ST_TextColumnCount = number;

/** Text Font Scale Percentage */
export type ST_TextFontScalePercent = ST_Percentage;

/** Text Paragraph Properties */
export interface CT_TextParagraph {
  pPr?: CT_TextParagraphProperties;
  endParaRPr?: CT_TextCharacterProperties;
}

/** Default Paragraph Style */
export interface CT_TextListStyle {
  defPPr?: CT_TextParagraphProperties;
  lvl1pPr?: CT_TextParagraphProperties;
  lvl2pPr?: CT_TextParagraphProperties;
  lvl3pPr?: CT_TextParagraphProperties;
  lvl4pPr?: CT_TextParagraphProperties;
  lvl5pPr?: CT_TextParagraphProperties;
  lvl6pPr?: CT_TextParagraphProperties;
  lvl7pPr?: CT_TextParagraphProperties;
  lvl8pPr?: CT_TextParagraphProperties;
  lvl9pPr?: CT_TextParagraphProperties;
  extLst?: CT_OfficeArtExtensionList;
}

/** Font Scale */
export interface CT_TextNormalAutofit {
  fontScale?: ST_TextFontScalePercent;
  lnSpcReduction?: ST_TextSpacingPercent;
}

export interface CT_TextShapeAutofit {}

export interface CT_TextNoAutofit {}

/** Preset Text Shape */
export interface CT_TextBodyProperties {
  rot?: ST_Angle;
  spcFirstLastPara?: boolean;
  vertOverflow?: ST_TextVertOverflowType;
  horzOverflow?: ST_TextHorzOverflowType;
  vert?: ST_TextVerticalType;
  wrap?: ST_TextWrappingType;
  lIns?: ST_Coordinate32;
  tIns?: ST_Coordinate32;
  rIns?: ST_Coordinate32;
  bIns?: ST_Coordinate32;
  numCol?: ST_TextColumnCount;
  spcCol?: ST_PositiveCoordinate32;
  rtlCol?: boolean;
  fromWordArt?: boolean;
  anchor?: ST_TextAnchoringType;
  anchorCtr?: boolean;
  forceAA?: boolean;
  upright?: boolean;
  compatLnSpc?: boolean;
  prstTxWarp?: CT_PresetTextShape;
  scene3d?: CT_Scene3D;
  extLst?: CT_OfficeArtExtensionList;
}

/** Body Properties */
export interface CT_TextBody {
  bodyPr: CT_TextBodyProperties;
  lstStyle?: CT_TextListStyle;
  p: CT_TextParagraph[];
}
