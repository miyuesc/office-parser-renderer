import { CT_OfficeArtExtensionList } from './dml-baseTypes';
import { CT_ShapeProperties } from './dml-shapeProperties';
import { CT_ShapeStyle } from './dml-shapeStyle';
import { CT_TextBodyProperties, CT_TextListStyle } from './dml-text';

/**
 * dml-styleDefaults.xsd
 */

/** Visual Properties */
export interface CT_DefaultShapeDefinition {
  spPr: CT_ShapeProperties;
  bodyPr: CT_TextBodyProperties;
  lstStyle: CT_TextListStyle;
  style?: CT_ShapeStyle;
  extLst?: CT_OfficeArtExtensionList;
}

/** Shape Default */
export interface CT_ObjectStyleDefaults {
  spDef?: CT_DefaultShapeDefinition;
  lnDef?: CT_DefaultShapeDefinition;
  txDef?: CT_DefaultShapeDefinition;
  extLst?: CT_OfficeArtExtensionList;
}
