import { CT_HslColor, CT_OfficeArtExtensionList, CT_PresetColor, CT_SRgbColor, CT_ScRgbColor, CT_SchemeColor, CT_SystemColor } from './dml-baseTypes';

/**
 * dml-diagramColorTransform.xsd
 */

/** Color Application Method Type */
export enum ST_ClrAppMethod {
    /** Span */
    span = "span",
    /** Cycle */
    cycle = "cycle",
    /** Repeat */
    repeat = "repeat",
}

/** Hue Direction */
export enum ST_HueDir {
    /** Clockwise Hue Direction */
    cw = "cw",
    /** Counterclockwise Hue Direction */
    ccw = "ccw",
}

/** Language */
export interface CT_CTName {
    lang?: string;
    val: string;
}

/** Language */
export interface CT_CTDescription {
    lang?: string;
    val: string;
}

/** Category Type */
export interface CT_CTCategory {
    type: string;
    pri: number;
}

/** Color Transform Category */
export interface CT_CTCategories {
    cat?: CT_CTCategory[];
}

/** Color Application Method Type */
export interface CT_Colors {
    meth?: ST_ClrAppMethod;
    hueDir?: ST_HueDir;
    scrgbClr?: CT_ScRgbColor;
    srgbClr?: CT_SRgbColor;
    hslClr?: CT_HslColor;
    sysClr?: CT_SystemColor;
    schemeClr?: CT_SchemeColor;
    prstClr?: CT_PresetColor;
}

/** Fill Color List */
export interface CT_CTStyleLabel {
    name: string;
    fillClrLst?: CT_Colors;
    linClrLst?: CT_Colors;
    effectClrLst?: CT_Colors;
    txLinClrLst?: CT_Colors;
    txFillClrLst?: CT_Colors;
    txEffectClrLst?: CT_Colors;
    extLst?: CT_OfficeArtExtensionList;
}

/** Title */
export interface CT_ColorTransform {
    uniqueId?: string;
    minVer?: string;
    title?: CT_CTName[];
    desc?: CT_CTDescription[];
    catLst?: CT_CTCategories;
    styleLbl?: CT_CTStyleLabel[];
    extLst?: CT_OfficeArtExtensionList;
}

/** Title */
export interface CT_ColorTransformHeader {
    uniqueId: string;
    minVer?: string;
    resId?: number;
    title: CT_CTName[];
    desc: CT_CTDescription[];
    catLst?: CT_CTCategories;
    extLst?: CT_OfficeArtExtensionList;
}

/** Color Transform Definition Header */
export interface CT_ColorTransformHeaderLst {
    colorsDefHdr?: CT_ColorTransformHeader[];
}

