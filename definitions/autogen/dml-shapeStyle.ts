import { ST_FontCollectionIndex, ST_StyleMatrixColumnIndex } from './dml-baseStylesheet';
import { CT_HslColor, CT_PresetColor, CT_SRgbColor, CT_ScRgbColor, CT_SchemeColor, CT_SystemColor } from './dml-baseTypes';

/**
 * dml-shapeStyle.xsd
 */

/** Style Matrix Index */
export interface CT_StyleMatrixReference {
    idx: ST_StyleMatrixColumnIndex;
    scrgbClr?: CT_ScRgbColor;
    srgbClr?: CT_SRgbColor;
    hslClr?: CT_HslColor;
    sysClr?: CT_SystemColor;
    schemeClr?: CT_SchemeColor;
    prstClr?: CT_PresetColor;
}

/** Identifier */
export interface CT_FontReference {
    idx: ST_FontCollectionIndex;
    scrgbClr?: CT_ScRgbColor;
    srgbClr?: CT_SRgbColor;
    hslClr?: CT_HslColor;
    sysClr?: CT_SystemColor;
    schemeClr?: CT_SchemeColor;
    prstClr?: CT_PresetColor;
}

/** Font Reference */
export interface CT_ShapeStyle {
    lnRef: CT_StyleMatrixReference;
    fillRef: CT_StyleMatrixReference;
    effectRef: CT_StyleMatrixReference;
    fontRef: CT_FontReference;
}

