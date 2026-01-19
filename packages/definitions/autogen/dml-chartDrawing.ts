import { CT_PositiveSize2D, CT_Transform2D } from './dml-baseTypes';
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
import { CT_AbsoluteAnchor, CT_OneCellAnchor, CT_TwoCellAnchor } from './dml-spreadsheetDrawing';
import { CT_TextBody } from './dml-text';
import { CT_GraphicalObjectFrame } from './pml-slide';

/**
 * dml-chartDrawing.xsd
 */

/** Chart Marker Coordinate Value */
export type ST_MarkerCoordinate = number;

/** Chart Non Visual Properties */
export interface CT_ShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvSpPr: CT_NonVisualDrawingShapeProps;
}

/** Non-Visual Shape Properties */
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

/** Chart Non Visual Properties */
export interface CT_ConnectorNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvCxnSpPr: CT_NonVisualConnectorProperties;
}

/** Connector Non Visual Properties */
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

/** Non-Visual Picture Properties */
export interface CT_Picture {
  macro?: string;
  fPublished?: boolean;
  nvPicPr: CT_PictureNonVisual;
  blipFill: CT_BlipFillProperties;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
}

/** Non-Visual Drawing Properties */
export interface CT_GraphicFrameNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGraphicFramePr: CT_NonVisualGraphicFrameProperties;
}

/** Non-Visual Graphic Frame Properties */
export interface CT_GraphicFrame {
  macro?: string;
  fPublished?: boolean;
  nvGraphicFramePr: CT_GraphicFrameNonVisual;
  xfrm: CT_Transform2D;
  graphic: any;
}

/** Chart Non Visual Properties */
export interface CT_GroupShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGrpSpPr: CT_NonVisualGroupDrawingShapeProps;
}

/** Non-Visual Group Shape Properties */
export interface CT_GroupShape {
  nvGrpSpPr: CT_GroupShapeNonVisual;
  grpSpPr: CT_GroupShapeProperties;
  sp: CT_Shape;
  grpSp: CT_GroupShape;
  graphicFrame: CT_GraphicFrame;
  cxnSp: CT_Connector;
  pic: CT_Picture;
}

/** Relative X Coordinate */
export interface CT_Marker {
  x: ST_MarkerCoordinate;
  y: ST_MarkerCoordinate;
}

/** Starting Anchor Point */
export interface CT_RelSizeAnchor {
  from: CT_Marker;
  to: CT_Marker;
  sp: CT_Shape;
  grpSp: CT_GroupShape;
  graphicFrame: CT_GraphicalObjectFrame;
  cxnSp: CT_Connector;
  pic: CT_Picture;
}

/** Shape Extent */
export interface CT_AbsSizeAnchor {
  from: CT_Marker;
  ext: CT_PositiveSize2D;
  sp: CT_Shape;
  grpSp: CT_GroupShape;
  graphicFrame: CT_GraphicalObjectFrame;
  cxnSp: CT_Connector;
  pic: CT_Picture;
}

export interface CT_Drawing {
  twoCellAnchor?: CT_TwoCellAnchor;
  oneCellAnchor?: CT_OneCellAnchor;
  absoluteAnchor?: CT_AbsoluteAnchor;
}
