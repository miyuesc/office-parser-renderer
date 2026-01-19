import { CT_OfficeArtExtensionList, ST_Coordinate, ST_PositiveCoordinate } from './dml-baseTypes';
import { CT_Color } from './wml';

/**
 * dml-shape3DStyles.xsd
 */

/** Bevel Presets */
export enum ST_BevelPresetType {
  /** Relaxed Inset */
  relaxedInset = 'relaxedInset',
  /** Circle */
  circle = 'circle',
  /** Slope */
  slope = 'slope',
  /** Cross */
  cross = 'cross',
  /** Angle */
  angle = 'angle',
  /** Soft Round */
  softRound = 'softRound',
  /** Convex */
  convex = 'convex',
  /** Cool Slant */
  coolSlant = 'coolSlant',
  /** Divot */
  divot = 'divot',
  /** Riblet */
  riblet = 'riblet',
  /** Hard Edge */
  hardEdge = 'hardEdge',
  /** Art Deco */
  artDeco = 'artDeco'
}

/** Preset Material Type */
export enum ST_PresetMaterialType {
  /** Legacy Matte */
  legacyMatte = 'legacyMatte',
  /** Legacy Plastic */
  legacyPlastic = 'legacyPlastic',
  /** Legacy Metal */
  legacyMetal = 'legacyMetal',
  /** Legacy Wireframe */
  legacyWireframe = 'legacyWireframe',
  /** Matte */
  matte = 'matte',
  /** Plastic */
  plastic = 'plastic',
  /** Metal */
  metal = 'metal',
  /** Warm Matte */
  warmMatte = 'warmMatte',
  /** Translucent Powder */
  translucentPowder = 'translucentPowder',
  /** Powder */
  powder = 'powder',
  /** Dark Edge */
  dkEdge = 'dkEdge',
  /** Soft Edge */
  softEdge = 'softEdge',
  /** Clear */
  clear = 'clear',
  /** Flat */
  flat = 'flat',
  /** Soft Metal */
  softmetal = 'softmetal'
}

/** Width */
export interface CT_Bevel {
  w?: ST_PositiveCoordinate;
  h?: ST_PositiveCoordinate;
  prst?: ST_BevelPresetType;
}

/** Top Bevel */
export interface CT_Shape3D {
  z?: ST_Coordinate;
  extrusionH?: ST_PositiveCoordinate;
  contourW?: ST_PositiveCoordinate;
  prstMaterial?: ST_PresetMaterialType;
  bevelT?: CT_Bevel;
  bevelB?: CT_Bevel;
  extrusionClr?: CT_Color;
  contourClr?: CT_Color;
  extLst?: CT_OfficeArtExtensionList;
}

/** Z Coordinate */
export interface CT_FlatText {
  z?: ST_Coordinate;
}
