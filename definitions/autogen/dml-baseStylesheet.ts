import { CT_HslColor, CT_OfficeArtExtensionList, CT_PresetColor, CT_SRgbColor, CT_ScRgbColor, CT_SchemeColor, CT_SystemColor } from './dml-baseTypes';
import { CT_Scene3D } from './dml-shape3DScene';
import { CT_Shape3D } from './dml-shape3DStyles';
import { CT_BlipFillProperties, CT_GradientFillProperties, CT_GroupFillProperties, CT_NoFillProperties, CT_PatternFillProperties, CT_SolidColorFillProperties } from './dml-shapeEffects';
import { CT_LineProperties } from './dml-shapeLineProperties';
import { CT_TextFont, ST_TextTypeface } from './dml-textCharacter';
import { CT_Color } from './wml';

/**
 * dml-baseStylesheet.xsd
 */

/** Style Matrix Column Index */
export type ST_StyleMatrixColumnIndex = string;

/** Font Collection Index */
export enum ST_FontCollectionIndex {
    /** Major Font */
    major = "major",
    /** Minor Font */
    minor = "minor",
    /** None */
    none = "none",
}

/** Theme Color Reference */
export enum ST_ColorSchemeIndex {
    /** Dark 1 */
    dk1 = "dk1",
    /** Light 1 */
    lt1 = "lt1",
    /** Dark 2 */
    dk2 = "dk2",
    /** Light 2 */
    lt2 = "lt2",
    /** Accent 1 */
    accent1 = "accent1",
    /** Accent 2 */
    accent2 = "accent2",
    /** Accent 3 */
    accent3 = "accent3",
    /** Accent 4 */
    accent4 = "accent4",
    /** Accent 5 */
    accent5 = "accent5",
    /** Accent 6 */
    accent6 = "accent6",
    /** Hyperlink */
    hlink = "hlink",
    /** Followed Hyperlink */
    folHlink = "folHlink",
}

/** Dark 1 */
export interface CT_ColorScheme {
    name: string;
    dk1: CT_Color;
    lt1: CT_Color;
    dk2: CT_Color;
    lt2: CT_Color;
    accent1: CT_Color;
    accent2: CT_Color;
    accent3: CT_Color;
    accent4: CT_Color;
    accent5: CT_Color;
    accent6: CT_Color;
    hlink: CT_Color;
    folHlink: CT_Color;
    extLst?: CT_OfficeArtExtensionList;
}

/** Name */
export interface CT_CustomColor {
    name?: string;
    scrgbClr?: CT_ScRgbColor;
    srgbClr?: CT_SRgbColor;
    hslClr?: CT_HslColor;
    sysClr?: CT_SystemColor;
    schemeClr?: CT_SchemeColor;
    prstClr?: CT_PresetColor;
}

/** Script */
export interface CT_SupplementalFont {
    script: string;
    typeface: ST_TextTypeface;
}

/** Custom color */
export interface CT_CustomColorList {
    custClr?: CT_CustomColor[];
}

/** Latin Font */
export interface CT_FontCollection {
    latin: CT_TextFont;
    ea: CT_TextFont;
    cs: CT_TextFont;
    font?: CT_SupplementalFont[];
    extLst?: CT_OfficeArtExtensionList;
}

/** 3D Scene Properties */
export interface CT_EffectStyleItem {
    scene3d?: CT_Scene3D;
    sp3d?: CT_Shape3D;
}

/** Major Font */
export interface CT_FontScheme {
    name: string;
    majorFont: CT_FontCollection;
    minorFont: CT_FontCollection;
    extLst?: CT_OfficeArtExtensionList;
}

export interface CT_FillStyleList {
    noFill?: CT_NoFillProperties;
    solidFill?: CT_SolidColorFillProperties;
    gradFill?: CT_GradientFillProperties;
    blipFill?: CT_BlipFillProperties;
    pattFill?: CT_PatternFillProperties;
    grpFill?: CT_GroupFillProperties;
}

export interface CT_LineStyleList {
    ln: CT_LineProperties[];
}

/** Effect Style */
export interface CT_EffectStyleList {
    effectStyle: CT_EffectStyleItem[];
}

export interface CT_BackgroundFillStyleList {
    noFill?: CT_NoFillProperties;
    solidFill?: CT_SolidColorFillProperties;
    gradFill?: CT_GradientFillProperties;
    blipFill?: CT_BlipFillProperties;
    pattFill?: CT_PatternFillProperties;
    grpFill?: CT_GroupFillProperties;
}

/** Fill Style List */
export interface CT_StyleMatrix {
    name?: string;
    fillStyleLst: CT_FillStyleList;
    lnStyleLst: CT_LineStyleList;
    effectStyleLst: CT_EffectStyleList;
    bgFillStyleLst: CT_BackgroundFillStyleList;
}

/** Font Scheme */
export interface CT_BaseStyles {
    clrScheme: CT_ColorScheme;
    fontScheme: CT_FontScheme;
    fmtScheme: CT_StyleMatrix;
    extLst?: CT_OfficeArtExtensionList;
}

