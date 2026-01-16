import { CT_NonVisualDrawingProps, CT_NonVisualPictureProperties } from './dml-documentProperties';
import { CT_BlipFillProperties } from './dml-shapeEffects';
import { CT_ShapeProperties } from './dml-shapeProperties';

/**
 * dml-picture.xsd
 */

/** Non-Visual Drawing Properties */
export interface CT_PictureNonVisual {
  cNvPr: CT_NonVisualDrawingProps;
  cNvPicPr: CT_NonVisualPictureProperties;
}

/** Non-Visual Picture Properties */
export interface CT_Picture {
  nvPicPr: CT_PictureNonVisual;
  blipFill: CT_BlipFillProperties;
  spPr: CT_ShapeProperties;
}
