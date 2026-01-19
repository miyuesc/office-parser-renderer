import { CT_OfficeArtExtensionList, ST_DrawingElementId } from './dml-baseTypes';
import { CT_Connection } from './sml-externalConnections';
import { CT_Hyperlink } from './wml';

/**
 * dml-documentProperties.xsd
 */

export interface CT_ConnectorLocking {
  extLst?: CT_OfficeArtExtensionList;
}

/** Disallow Shape Text Editing */
export interface CT_ShapeLocking {
  noTextEdit?: boolean;
  extLst?: CT_OfficeArtExtensionList;
}

/** Disallow Crop Changes */
export interface CT_PictureLocking {
  noCrop?: boolean;
  extLst?: CT_OfficeArtExtensionList;
}

/** Disallow Shape Grouping */
export interface CT_GroupLocking {
  noGrp?: boolean;
  noUngrp?: boolean;
  noSelect?: boolean;
  noRot?: boolean;
  noChangeAspect?: boolean;
  noMove?: boolean;
  noResize?: boolean;
  extLst?: CT_OfficeArtExtensionList;
}

/** Disallow Shape Grouping */
export interface CT_GraphicalObjectFrameLocking {
  noGrp?: boolean;
  noDrilldown?: boolean;
  noSelect?: boolean;
  noChangeAspect?: boolean;
  noMove?: boolean;
  noResize?: boolean;
  extLst?: CT_OfficeArtExtensionList;
}

/** Drawing Element On Click Hyperlink */
export interface CT_NonVisualDrawingProps {
  id: ST_DrawingElementId;
  name: string;
  descr?: string;
  hidden?: boolean;
  hlinkClick?: CT_Hyperlink;
  hlinkHover?: CT_Hyperlink;
  extLst?: CT_OfficeArtExtensionList;
}

/** Shape Locks */
export interface CT_NonVisualDrawingShapeProps {
  txBox?: boolean;
  spLocks?: CT_ShapeLocking;
  extLst?: CT_OfficeArtExtensionList;
}

/** Connection Shape Locks */
export interface CT_NonVisualConnectorProperties {
  cxnSpLocks?: CT_ConnectorLocking;
  stCxn?: CT_Connection;
  endCxn?: CT_Connection;
  extLst?: CT_OfficeArtExtensionList;
}

/** Picture Locks */
export interface CT_NonVisualPictureProperties {
  preferRelativeResize?: boolean;
  picLocks?: CT_PictureLocking;
  extLst?: CT_OfficeArtExtensionList;
}

/** Group Shape Locks */
export interface CT_NonVisualGroupDrawingShapeProps {
  grpSpLocks?: CT_GroupLocking;
  extLst?: CT_OfficeArtExtensionList;
}

/** Graphic Frame Locks */
export interface CT_NonVisualGraphicFrameProperties {
  graphicFrameLocks?: CT_GraphicalObjectFrameLocking;
  extLst?: CT_OfficeArtExtensionList;
}
