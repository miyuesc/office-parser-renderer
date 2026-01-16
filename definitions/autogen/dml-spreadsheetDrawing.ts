import { CT_Point2D, CT_PositiveSize2D, CT_Transform2D, ST_Coordinate } from './dml-baseTypes';
import {
  CT_NonVisualConnectorProperties,
  CT_NonVisualDrawingProps,
  CT_NonVisualDrawingShapeProps,
  CT_NonVisualGraphicFrameProperties,
  CT_NonVisualGroupDrawingShapeProps,
  CT_NonVisualPictureProperties
} from './dml-documentProperties';
import { CT_BlipFillProperties } from './dml-shapeEffects';
import { CT_GroupShapeProperties, CT_ShapeProperties } from './dml-shapeProperties';
import { CT_ShapeStyle } from './dml-shapeStyle';
import { CT_TextBody } from './dml-text';

/**
 * dml-spreadsheetDrawing.xsd
 */

/** Column ID */
export type ST_ColID = number;

/** Row ID */
export type ST_RowID = number;

/** Resizing Behaviors */
export enum ST_EditAs {
  /** Move and Resize With Anchor Cells */
  twoCell = 'twoCell',
  /** Move With Cells but Do Not Resize */
  oneCell = 'oneCell',
  /** Do Not Move or Resize With Underlying Rows/Columns */
  absolute = 'absolute'
}

/** Locks With Sheet Flag */
export interface CT_AnchorClientData {
  fLocksWithSheet?: boolean;
  fPrintsWithSheet?: boolean;
}

/** Non-Visual Drawing Properties */
export interface CT_ShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvSpPr: CT_NonVisualDrawingShapeProps;
}

/** Non-Visual Properties for a Shape */
export interface CT_Shape {
  macro?: string;
  textlink?: string;
  fLocksText?: boolean;
  fPublished?: boolean;
  nvSpPr: CT_ShapeNonVisual;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  txBody?: CT_TextBody;
}

/** Connection Non-Visual Properties */
export interface CT_ConnectorNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvCxnSpPr: CT_NonVisualConnectorProperties;
}

/** Non-Visual Properties for a Connection Shape */
export interface CT_Connector {
  macro?: string;
  fPublished?: boolean;
  nvCxnSpPr: CT_ConnectorNonVisual;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
}

/** Non-Visual Picture Drawing Properties */
export interface CT_PictureNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvPicPr: CT_NonVisualPictureProperties;
}

/** Non-Visual Properties for a Picture */
export interface CT_Picture {
  macro?: string;
  fPublished?: boolean;
  nvPicPr: CT_PictureNonVisual;
  blipFill: CT_BlipFillProperties;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
}

/** Connection Non-Visual Properties */
export interface CT_GraphicalObjectFrameNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGraphicFramePr: CT_NonVisualGraphicFrameProperties;
}

/** Non-Visual Properties for a Graphic Frame */
export interface CT_GraphicalObjectFrame {
  macro?: string;
  fPublished?: boolean;
  nvGraphicFramePr: CT_GraphicalObjectFrameNonVisual;
  xfrm: CT_Transform2D;
  graphic: any;
}

/** Connection Non-Visual Properties */
export interface CT_GroupShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGrpSpPr: CT_NonVisualGroupDrawingShapeProps;
}

/** Non-Visual Properties for a Group Shape */
export interface CT_GroupShape {
  nvGrpSpPr: CT_GroupShapeNonVisual;
  grpSpPr: CT_GroupShapeProperties;
  sp: CT_Shape;
  grpSp: CT_GroupShape;
  graphicFrame: CT_GraphicalObjectFrame;
  cxnSp: CT_Connector;
  pic: CT_Picture;
}

/** Column) */
export interface CT_Marker {
  col: ST_ColID;
  colOff: ST_Coordinate;
  row: ST_RowID;
  rowOff: ST_Coordinate;
}

/** Starting Anchor Point */
export interface CT_TwoCellAnchor {
  editAs?: ST_EditAs;
  from: CT_Marker;
  to: CT_Marker;
  sp: CT_Shape;
  grpSp: CT_GroupShape;
  graphicFrame: CT_GraphicalObjectFrame;
  cxnSp: CT_Connector;
  pic: CT_Picture;
  clientData: CT_AnchorClientData;
}

export interface CT_OneCellAnchor {
  from: CT_Marker;
  ext: CT_PositiveSize2D;
  sp: CT_Shape;
  grpSp: CT_GroupShape;
  graphicFrame: CT_GraphicalObjectFrame;
  cxnSp: CT_Connector;
  pic: CT_Picture;
  clientData: CT_AnchorClientData;
}

/** Position */
export interface CT_AbsoluteAnchor {
  pos: CT_Point2D;
  ext: CT_PositiveSize2D;
  sp: CT_Shape;
  grpSp: CT_GroupShape;
  graphicFrame: CT_GraphicalObjectFrame;
  cxnSp: CT_Connector;
  pic: CT_Picture;
  clientData: CT_AnchorClientData;
}

export interface CT_Drawing {
  twoCellAnchor?: CT_TwoCellAnchor;
  oneCellAnchor?: CT_OneCellAnchor;
  absoluteAnchor?: CT_AbsoluteAnchor;
}
