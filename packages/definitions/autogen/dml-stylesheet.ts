import { CT_BaseStyles, CT_ColorScheme, CT_CustomColorList, CT_StyleMatrix } from './dml-baseStylesheet';
import { CT_OfficeArtExtensionList } from './dml-baseTypes';
import { CT_ObjectStyleDefaults } from './dml-styleDefaults';
import { CT_FontScheme } from './sml-styles';
import { ST_ColorSchemeIndex } from './wml';

/**
 * dml-stylesheet.xsd
 */

export interface CT_EmptyElement {}

/** Background 1 */
export interface CT_ColorMapping {
  bg1: ST_ColorSchemeIndex;
  tx1: ST_ColorSchemeIndex;
  bg2: ST_ColorSchemeIndex;
  tx2: ST_ColorSchemeIndex;
  accent1: ST_ColorSchemeIndex;
  accent2: ST_ColorSchemeIndex;
  accent3: ST_ColorSchemeIndex;
  accent4: ST_ColorSchemeIndex;
  accent5: ST_ColorSchemeIndex;
  accent6: ST_ColorSchemeIndex;
  hlink: ST_ColorSchemeIndex;
  folHlink: ST_ColorSchemeIndex;
  extLst?: CT_OfficeArtExtensionList;
}

/** Master Color Mapping */
export interface CT_ColorMappingOverride {
  masterClrMapping: CT_EmptyElement;
  overrideClrMapping: CT_ColorMapping;
}

export interface CT_ColorSchemeAndMapping {
  clrScheme: CT_ColorScheme;
  clrMap?: CT_ColorMapping;
}

/** Extra Color Scheme */
export interface CT_ColorSchemeList {
  extraClrScheme?: CT_ColorSchemeAndMapping[];
}

/** Theme Elements */
export interface CT_OfficeStyleSheet {
  name?: string;
  themeElements: CT_BaseStyles;
  objectDefaults?: CT_ObjectStyleDefaults;
  extraClrSchemeLst?: CT_ColorSchemeList;
  custClrLst?: CT_CustomColorList;
  extLst?: CT_OfficeArtExtensionList;
}

/** Color Scheme */
export interface CT_BaseStylesOverride {
  clrScheme?: CT_ColorScheme;
  fontScheme?: CT_FontScheme;
  fmtScheme?: CT_StyleMatrix;
}

/** Color Map */
export interface CT_ClipboardStyleSheet {
  themeElements: CT_BaseStyles;
  clrMap: CT_ColorMapping;
}
