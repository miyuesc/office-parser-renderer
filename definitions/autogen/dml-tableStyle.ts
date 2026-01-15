import { CT_FontCollection } from './dml-baseStylesheet';
import { CT_HslColor, CT_OfficeArtExtensionList, CT_PresetColor, CT_SRgbColor, CT_ScRgbColor, CT_SchemeColor, CT_SystemColor } from './dml-baseTypes';
import { CT_LightRig } from './dml-shape3DLighting';
import { CT_Bevel, ST_PresetMaterialType } from './dml-shape3DStyles';
import { CT_EffectProperties, CT_FillProperties } from './dml-shapeEffects';
import { CT_LineProperties } from './dml-shapeLineProperties';
import { CT_FontReference, CT_StyleMatrixReference } from './dml-shapeStyle';
import { ST_Guid } from './wml';

/**
 * dml-tableStyle.xsd
 */

/** On/Off Style Type */
export enum ST_OnOffStyleType {
    /** On */
    on = "on",
    /** Off */
    off = "off",
    /** Default */
    def = "def",
}

/** Bevel */
export interface CT_Cell3D {
    prstMaterial?: ST_PresetMaterialType;
    bevel: CT_Bevel;
    lightRig?: CT_LightRig;
    extLst?: CT_OfficeArtExtensionList;
}

/** Line Reference */
export interface CT_ThemeableLineStyle {
    ln?: CT_LineProperties;
    lnRef?: CT_StyleMatrixReference;
}

/** Bold */
export interface CT_TableStyleTextStyle {
    b?: ST_OnOffStyleType;
    i?: ST_OnOffStyleType;
    font?: CT_FontCollection;
    fontRef?: CT_FontReference;
    scrgbClr?: CT_ScRgbColor;
    srgbClr?: CT_SRgbColor;
    hslClr?: CT_HslColor;
    sysClr?: CT_SystemColor;
    schemeClr?: CT_SchemeColor;
    prstClr?: CT_PresetColor;
    extLst?: CT_OfficeArtExtensionList;
}

/** Left Border */
export interface CT_TableCellBorderStyle {
    left?: CT_ThemeableLineStyle;
    right?: CT_ThemeableLineStyle;
    top?: CT_ThemeableLineStyle;
    bottom?: CT_ThemeableLineStyle;
    insideH?: CT_ThemeableLineStyle;
    insideV?: CT_ThemeableLineStyle;
    tl2br?: CT_ThemeableLineStyle;
    tr2bl?: CT_ThemeableLineStyle;
    extLst?: CT_OfficeArtExtensionList;
}

export interface CT_TableBackgroundStyle {
    fill?: CT_FillProperties;
    fillRef?: CT_StyleMatrixReference;
    effect?: CT_EffectProperties;
    effectRef?: CT_StyleMatrixReference;
}

/** Table Cell Borders */
export interface CT_TableStyleCellStyle {
    tcBdr?: CT_TableCellBorderStyle;
    fill?: CT_FillProperties;
    fillRef?: CT_StyleMatrixReference;
    cell3D?: CT_Cell3D;
}

/** Table Cell Text Style */
export interface CT_TablePartStyle {
    tcTxStyle?: CT_TableStyleTextStyle;
    tcStyle?: CT_TableStyleCellStyle;
}

/** Table Background */
export interface CT_TableStyle {
    styleId: ST_Guid;
    styleName: string;
    tblBg?: CT_TableBackgroundStyle;
    wholeTbl?: CT_TablePartStyle;
    band1H?: CT_TablePartStyle;
    band2H?: CT_TablePartStyle;
    band1V?: CT_TablePartStyle;
    band2V?: CT_TablePartStyle;
    lastCol?: CT_TablePartStyle;
    firstCol?: CT_TablePartStyle;
    lastRow?: CT_TablePartStyle;
    seCell?: CT_TablePartStyle;
    swCell?: CT_TablePartStyle;
    firstRow?: CT_TablePartStyle;
    neCell?: CT_TablePartStyle;
    nwCell?: CT_TablePartStyle;
    extLst?: CT_OfficeArtExtensionList;
}

/** Table Style */
export interface CT_TableStyleList {
    def: ST_Guid;
    tblStyle?: CT_TableStyle[];
}

