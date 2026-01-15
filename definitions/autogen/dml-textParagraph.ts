import { CT_OfficeArtExtensionList, ST_Coordinate32, ST_Percentage } from './dml-baseTypes';
import { CT_TextCharacterProperties } from './dml-textCharacter';
import { ST_Guid } from './wml';

/**
 * dml-textParagraph.xsd
 */

/** Text Spacing Point */
export type ST_TextSpacingPoint = number;

/** Text Spacing Percent */
export type ST_TextSpacingPercent = ST_Percentage;

/** Text Margin */
export type ST_TextMargin = ST_Coordinate32;

/** Text Indentation */
export type ST_TextIndent = ST_Coordinate32;

/** Text Tab Alignment Types */
export enum ST_TextTabAlignType {
    /** Text Tab Alignment Enum ( Left) */
    l = "l",
    /** Text Tab Alignment Enum ( Center ) */
    ctr = "ctr",
    /** Text Tab Alignment Enum ( Right ) */
    r = "r",
    /** Text Tab Alignment Enum ( Decimal ) */
    dec = "dec",
}

/** Text Alignment Types */
export enum ST_TextAlignType {
    /** Text Alignment Enum ( Left ) */
    l = "l",
    /** Text Alignment Enum ( Center ) */
    ctr = "ctr",
    /** Text Alignment Enum ( Right ) */
    r = "r",
    /** Text Alignment Enum ( Justified ) */
    just = "just",
    /** Text Alignment Enum ( Justified Low ) */
    justLow = "justLow",
    /** Text Alignment Enum ( Distributed ) */
    dist = "dist",
    /** Text Alignment Enum ( Thai Distributed ) */
    thaiDist = "thaiDist",
}

/** Font Alignment Types */
export enum ST_TextFontAlignType {
    /** Font Alignment Enum ( Automatic ) */
    auto = "auto",
    /** Font Alignment Enum ( Top ) */
    t = "t",
    /** Font Alignment Enum ( Center ) */
    ctr = "ctr",
    /** Font Alignment Enum ( Baseline ) */
    base = "base",
    /** Font Alignment Enum ( Bottom ) */
    b = "b",
}

/** Text Indent Level Type */
export type ST_TextIndentLevelType = number;

/** Value */
export interface CT_TextSpacingPercent {
    val: ST_TextSpacingPercent;
}

/** Value */
export interface CT_TextSpacingPoint {
    val: ST_TextSpacingPoint;
}

/** Tab Position */
export interface CT_TextTabStop {
    pos?: ST_Coordinate32;
    algn?: ST_TextTabAlignType;
}

/** Tab Stop */
export interface CT_TextTabStopList {
    tab?: CT_TextTabStop[];
}

/** Text Run Properties */
export interface CT_TextLineBreak {
    rPr?: CT_TextCharacterProperties;
}

/** Spacing Percent */
export interface CT_TextSpacing {
    spcPct?: CT_TextSpacingPercent;
    spcPts?: CT_TextSpacingPoint;
}

/** Line Spacing */
export interface CT_TextParagraphProperties {
    marL?: ST_TextMargin;
    marR?: ST_TextMargin;
    lvl?: ST_TextIndentLevelType;
    indent?: ST_TextIndent;
    algn?: ST_TextAlignType;
    defTabSz?: ST_Coordinate32;
    rtl?: boolean;
    eaLnBrk?: boolean;
    fontAlgn?: ST_TextFontAlignType;
    latinLnBrk?: boolean;
    hangingPunct?: boolean;
    lnSpc?: CT_TextSpacing;
    spcBef?: CT_TextSpacing;
    spcAft?: CT_TextSpacing;
    tabLst?: CT_TextTabStopList;
    defRPr?: CT_TextCharacterProperties;
    extLst?: CT_OfficeArtExtensionList;
}

/** Text Character Properties */
export interface CT_TextField {
    id: ST_Guid;
    type?: string;
    rPr?: CT_TextCharacterProperties;
    pPr?: CT_TextParagraphProperties;
    t?: string;
}

