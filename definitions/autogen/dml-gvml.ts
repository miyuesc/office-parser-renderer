import { CT_OfficeArtExtensionList, CT_Transform2D } from './dml-baseTypes';
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
 * dml-gvml.xsd
 */

export interface CT_GvmlUseShapeRectangle {}

/** Shape Text Body */
export interface CT_GvmlTextShape {
  txBody: CT_TextBody;
  useSpRect?: CT_GvmlUseShapeRectangle;
  xfrm?: CT_Transform2D;
  extLst?: CT_OfficeArtExtensionList;
}

/** Non-Visual Shape Drawing Properties */
export interface CT_GvmlShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvSpPr: CT_NonVisualDrawingShapeProps;
}

/** Non-Visual Properties for a Shape */
export interface CT_GvmlShape {
  nvSpPr: CT_GvmlShapeNonVisual;
  spPr: CT_ShapeProperties;
  txSp?: CT_GvmlTextShape;
  style?: CT_ShapeStyle;
  extLst?: CT_OfficeArtExtensionList;
}

/** Non-Visual Drawing Properties */
export interface CT_GvmlConnectorNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvCxnSpPr: CT_NonVisualConnectorProperties;
}

/** Non-Visual Properties for a Connection Shape */
export interface CT_GvmlConnector {
  nvCxnSpPr: CT_GvmlConnectorNonVisual;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  extLst?: CT_OfficeArtExtensionList;
}

/** Non-Visual Picture Drawing Properties */
export interface CT_GvmlPictureNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvPicPr: CT_NonVisualPictureProperties;
}

/** Non-Visual Properties for a Picture */
export interface CT_GvmlPicture {
  nvPicPr: CT_GvmlPictureNonVisual;
  blipFill: CT_BlipFillProperties;
  spPr: CT_ShapeProperties;
  style?: CT_ShapeStyle;
  extLst?: CT_OfficeArtExtensionList;
}

/** Non-Visual Graphic Frame Drawing Properties */
export interface CT_GvmlGraphicFrameNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGraphicFramePr: CT_NonVisualGraphicFrameProperties;
}

/** Non-Visual Properties for a Graphic Frame */
export interface CT_GvmlGraphicalObjectFrame {
  nvGraphicFramePr: CT_GvmlGraphicFrameNonVisual;
  graphic: any;
  xfrm: CT_Transform2D;
  extLst?: CT_OfficeArtExtensionList;
}

/** Non-Visual Group Shape Drawing Properties */
export interface CT_GvmlGroupShapeNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvGrpSpPr: CT_NonVisualGroupDrawingShapeProps;
}

/** Non-Visual Properties for a Group Shape */
export interface CT_GvmlGroupShape {
  nvGrpSpPr: CT_GvmlGroupShapeNonVisual;
  grpSpPr: CT_GroupShapeProperties;
  txSp: CT_GvmlTextShape;
  sp: CT_GvmlShape;
  cxnSp: CT_GvmlConnector;
  pic: CT_GvmlPicture;
  graphicFrame: CT_GvmlGraphicalObjectFrame;
  grpSp: CT_GvmlGroupShape;
  extLst?: CT_OfficeArtExtensionList;
}
