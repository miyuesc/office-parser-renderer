import { CT_OfficeArtExtensionList, ST_Percentage } from './dml-baseTypes';
import { CT_LineProperties } from './dml-shapeLineProperties';
import { CT_Color, CT_Hyperlink } from './wml';

/**
 * dml-textCharacter.xsd
 */

/** Text Point */
export type ST_TextPoint = number;

/** Text Non-Negative Point */
export type ST_TextNonNegativePoint = number;

/** Text Font Size */
export type ST_TextFontSize = number;

/** Panose Type */
export type ST_Panose = string;

/** Text Typeface */
export type ST_TextTypeface = string;

/** Language ID */
export type ST_TextLanguageID = string;

/** Text Underline Types */
export enum ST_TextUnderlineType {
    /** Text Underline Enum ( None ) */
    none = "none",
    /** Text Underline Enum ( Words ) */
    words = "words",
    /** Text Underline Enum ( Single ) */
    sng = "sng",
    /** Text Underline Enum ( Double ) */
    dbl = "dbl",
    /** Text Underline Enum ( Heavy ) */
    heavy = "heavy",
    /** Text Underline Enum ( Dotted ) */
    dotted = "dotted",
    /** Text Underline Enum ( Heavy Dotted  ) */
    dottedHeavy = "dottedHeavy",
    /** Text Underline Enum ( Dashed ) */
    dash = "dash",
    /** Text Underline Enum ( Heavy Dashed ) */
    dashHeavy = "dashHeavy",
    /** Text Underline Enum ( Long Dashed ) */
    dashLong = "dashLong",
    /** Text Underline Enum ( Heavy Long Dashed ) */
    dashLongHeavy = "dashLongHeavy",
    /** Text Underline Enum ( Dot Dash ) */
    dotDash = "dotDash",
    /** Text Underline Enum ( Heavy Dot Dash ) */
    dotDashHeavy = "dotDashHeavy",
    /** Text Underline Enum ( Dot Dot Dash ) */
    dotDotDash = "dotDotDash",
    /** Text Underline Enum ( Heavy Dot Dot Dash ) */
    dotDotDashHeavy = "dotDotDashHeavy",
    /** Text Underline Enum ( Wavy ) */
    wavy = "wavy",
    /** Text Underline Enum ( Heavy Wavy ) */
    wavyHeavy = "wavyHeavy",
    /** Text Underline Enum ( Double Wavy ) */
    wavyDbl = "wavyDbl",
}

/** Text Strike Type */
export enum ST_TextStrikeType {
    /** Text Strike Enum ( No Strike ) */
    noStrike = "noStrike",
    /** Text Strike Enum ( Single Strike ) */
    sngStrike = "sngStrike",
    /** Text Strike Enum ( Double Strike ) */
    dblStrike = "dblStrike",
}

/** Text Cap Types */
export enum ST_TextCapsType {
    /** Text Caps Enum ( None ) */
    none = "none",
    /** Text Caps Enum ( Small ) */
    small = "small",
    /** Text Caps Enum ( All ) */
    all = "all",
}

/** Text Typeface */
export interface CT_TextFont {
    typeface?: ST_TextTypeface;
    panose?: ST_Panose;
    pitchFamily?: any;
    charset?: any;
}

export interface CT_TextUnderlineLineFollowText {
}

export interface CT_TextUnderlineFillFollowText {
}

export interface CT_TextUnderlineFillGroupWrapper {
}

/** Line */
export interface CT_TextCharacterProperties {
    kumimoji?: boolean;
    lang?: ST_TextLanguageID;
    altLang?: ST_TextLanguageID;
    sz?: ST_TextFontSize;
    b?: boolean;
    i?: boolean;
    u?: ST_TextUnderlineType;
    strike?: ST_TextStrikeType;
    kern?: ST_TextNonNegativePoint;
    cap?: ST_TextCapsType;
    spc?: ST_TextPoint;
    normalizeH?: boolean;
    baseline?: ST_Percentage;
    noProof?: boolean;
    dirty?: boolean;
    err?: boolean;
    smtClean?: boolean;
    smtId?: number;
    bmk?: string;
    ln?: CT_LineProperties;
    highlight?: CT_Color;
    latin?: CT_TextFont;
    ea?: CT_TextFont;
    cs?: CT_TextFont;
    sym?: CT_TextFont;
    hlinkClick?: CT_Hyperlink;
    hlinkMouseOver?: CT_Hyperlink;
    extLst?: CT_OfficeArtExtensionList;
}

