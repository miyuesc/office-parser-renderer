import { ST_Xstring } from './sml-baseTypes';
import {
  CT_BooleanProperty,
  CT_FontName,
  CT_FontScheme,
  CT_FontSize,
  CT_IntProperty,
  CT_UnderlineProperty,
  CT_VerticalAlignFontProperty,
  ST_FontId
} from './sml-styles';
import { CT_Color } from './wml';

/**
 * sml-sharedStringTable.xsd
 */

/** Phonetic Type */
export enum ST_PhoneticType {
  /** Half-Width Katakana */
  halfwidthKatakana = 'halfwidthKatakana',
  /** Full-Width Katakana */
  fullwidthKatakana = 'fullwidthKatakana',
  /** Hiragana */
  Hiragana = 'Hiragana',
  /** No Conversion */
  noConversion = 'noConversion'
}

/** Phonetic Alignment Types */
export enum ST_PhoneticAlignment {
  /** No Control */
  noControl = 'noControl',
  /** Left Alignment */
  left = 'left',
  /** Center Alignment */
  center = 'center',
  /** Distributed */
  distributed = 'distributed'
}

/** String Item */
export interface CT_Sst {
  count?: number;
  uniqueCount?: number;
  si?: CT_Rst[];
  extLst?: any;
}

/** Text */
export interface CT_PhoneticRun {
  sb: number;
  eb: number;
  t: ST_Xstring;
}

/** Run Properties */
export interface CT_RElt {
  rPr?: CT_RPrElt;
  t: ST_Xstring;
}

/** Font */
export interface CT_RPrElt {
  rFont?: CT_FontName;
  charset?: CT_IntProperty;
  family?: CT_IntProperty;
  b?: CT_BooleanProperty;
  i?: CT_BooleanProperty;
  strike?: CT_BooleanProperty;
  outline?: CT_BooleanProperty;
  shadow?: CT_BooleanProperty;
  condense?: CT_BooleanProperty;
  extend?: CT_BooleanProperty;
  color?: CT_Color;
  sz?: CT_FontSize;
  u?: CT_UnderlineProperty;
  vertAlign?: CT_VerticalAlignFontProperty;
  scheme?: CT_FontScheme;
}

/** Text */
export interface CT_Rst {
  t?: ST_Xstring;
  r?: CT_RElt[];
  rPh?: CT_PhoneticRun[];
  phoneticPr?: any;
}

/** Font Id */
export interface CT_PhoneticPr {
  fontId: ST_FontId;
  type?: ST_PhoneticType;
  alignment?: ST_PhoneticAlignment;
}
