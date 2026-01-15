import { CT_Point2D, CT_PositiveSize2D, ST_Coordinate } from './dml-baseTypes';
import { CT_NonVisualDrawingProps, CT_NonVisualGraphicFrameProperties } from './dml-documentProperties';

/**
 * dml-wordprocessingDrawing.xsd
 */

/** Distance from Text */
export type ST_WrapDistance = string;

/** Text Wrapping Location */
export enum ST_WrapText {
    /** Both Sides */
    bothSides = "bothSides",
    /** Left Side Only */
    left = "left",
    /** Right Side Only */
    right = "right",
    /** Largest Side Only */
    largest = "largest",
}

/** Absolute Position Offset Value */
export type ST_PositionOffset = string;

/** Relative Horizontal Alignment Positions */
export enum ST_AlignH {
    /** Left Alignment */
    left = "left",
    /** Right Alignment */
    right = "right",
    /** Center Alignment */
    center = "center",
    /** Inside */
    inside = "inside",
    /** Outside */
    outside = "outside",
}

/** Horizontal Relative Positioning */
export enum ST_RelFromH {
    /** Page Margin */
    margin = "margin",
    /** Page Edge */
    page = "page",
    /** Column */
    column = "column",
    /** Character */
    character = "character",
    /** Left Margin */
    leftMargin = "leftMargin",
    /** Right Margin */
    rightMargin = "rightMargin",
    /** Inside Margin */
    insideMargin = "insideMargin",
    /** Outside Margin */
    outsideMargin = "outsideMargin",
}

/** Vertical Alignment Definition */
export enum ST_AlignV {
    /** Top */
    top = "top",
    /** Bottom */
    bottom = "bottom",
    /** Center Alignment */
    center = "center",
    /** Inside */
    inside = "inside",
    /** Outside */
    outside = "outside",
}

/** Vertical Relative Positioning */
export enum ST_RelFromV {
    /** Page Margin */
    margin = "margin",
    /** Page Edge */
    page = "page",
    /** Paragraph */
    paragraph = "paragraph",
    /** Line */
    line = "line",
    /** Top Margin */
    topMargin = "topMargin",
    /** Bottom Margin */
    bottomMargin = "bottomMargin",
    /** Inside Margin */
    insideMargin = "insideMargin",
    /** Outside Margin */
    outsideMargin = "outsideMargin",
}

/** Additional Extent on Left Edge */
export interface CT_EffectExtent {
    l: ST_Coordinate;
    t: ST_Coordinate;
    r: ST_Coordinate;
    b: ST_Coordinate;
}

/** Drawing Object Size */
export interface CT_Inline {
    distT?: ST_WrapDistance;
    distB?: ST_WrapDistance;
    distL?: ST_WrapDistance;
    distR?: ST_WrapDistance;
    extent: CT_PositiveSize2D;
    effectExtent?: CT_EffectExtent;
    docPr: CT_NonVisualDrawingProps;
    cNvGraphicFramePr?: CT_NonVisualGraphicFrameProperties;
    graphic: any;
}

/** Wrapping Polygon Start */
export interface CT_WrapPath {
    edited?: boolean;
    start: CT_Point2D;
    lineTo: CT_Point2D[];
}

export interface CT_WrapNone {
}

/** Object Extents Including Effects */
export interface CT_WrapSquare {
    wrapText: ST_WrapText;
    distT?: ST_WrapDistance;
    distB?: ST_WrapDistance;
    distL?: ST_WrapDistance;
    distR?: ST_WrapDistance;
    effectExtent?: CT_EffectExtent;
}

/** Tight Wrapping Extents Polygon */
export interface CT_WrapTight {
    wrapText: ST_WrapText;
    distL?: ST_WrapDistance;
    distR?: ST_WrapDistance;
    wrapPolygon: CT_WrapPath;
}

/** Wrapping Polygon */
export interface CT_WrapThrough {
    wrapText: ST_WrapText;
    distL?: ST_WrapDistance;
    distR?: ST_WrapDistance;
    wrapPolygon: CT_WrapPath;
}

/** Wrapping Boundaries */
export interface CT_WrapTopBottom {
    distT?: ST_WrapDistance;
    distB?: ST_WrapDistance;
    effectExtent?: CT_EffectExtent;
}

/** Relative Horizontal Alignment */
export interface CT_PosH {
    relativeFrom: ST_RelFromH;
    align: ST_AlignH;
    posOffset: ST_PositionOffset;
}

/** Relative Vertical Alignment */
export interface CT_PosV {
    relativeFrom: ST_RelFromV;
    align: ST_AlignV;
    posOffset: ST_PositionOffset;
}

/** Simple Positioning Coordinates */
export interface CT_Anchor {
    distT?: ST_WrapDistance;
    distB?: ST_WrapDistance;
    distL?: ST_WrapDistance;
    distR?: ST_WrapDistance;
    simplePos?: boolean | CT_Point2D;
    relativeHeight: number;
    behindDoc: boolean;
    locked: boolean;
    layoutInCell: boolean;
    hidden?: boolean;
    allowOverlap: boolean;
    positionH: CT_PosH;
    positionV: CT_PosV;
    extent: CT_PositiveSize2D;
    effectExtent?: CT_EffectExtent;
    wrapNone: CT_WrapNone;
    wrapSquare: CT_WrapSquare;
    wrapTight: CT_WrapTight;
    wrapThrough: CT_WrapThrough;
    wrapTopAndBottom: CT_WrapTopBottom;
    docPr: CT_NonVisualDrawingProps;
    cNvGraphicFramePr?: CT_NonVisualGraphicFrameProperties;
    graphic: any;
}

