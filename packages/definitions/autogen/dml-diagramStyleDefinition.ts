import { CT_OfficeArtExtensionList } from './dml-baseTypes';
import { CT_Scene3D } from './dml-shape3DScene';
import { CT_Shape3D } from './dml-shape3DStyles';
import { CT_ShapeStyle } from './dml-shapeStyle';

/**
 * dml-diagramStyleDefinition.xsd
 */

/** Natural Language */
export interface CT_SDName {
  lang?: string;
  val: string;
}

/** Natural Language */
export interface CT_SDDescription {
  lang?: string;
  val: string;
}

/** Category Type */
export interface CT_SDCategory {
  type: string;
  pri: number;
}

/** Category */
export interface CT_SDCategories {
  cat?: CT_SDCategory[];
}

export interface CT_TextProps {}

/** 3-D Scene */
export interface CT_StyleLabel {
  name: string;
  scene3d?: CT_Scene3D;
  sp3d?: CT_Shape3D;
  txPr?: CT_TextProps;
  style?: CT_ShapeStyle;
  extLst?: CT_OfficeArtExtensionList;
}

/** Title */
export interface CT_StyleDefinition {
  uniqueId?: string;
  minVer?: string;
  title?: CT_SDName[];
  desc?: CT_SDDescription[];
  catLst?: CT_SDCategories;
  scene3d?: CT_Scene3D;
  styleLbl: CT_StyleLabel[];
  extLst?: CT_OfficeArtExtensionList;
}

/** Title */
export interface CT_StyleDefinitionHeader {
  uniqueId: string;
  minVer?: string;
  resId?: number;
  title: CT_SDName[];
  desc: CT_SDDescription[];
  catLst?: CT_SDCategories;
  extLst?: CT_OfficeArtExtensionList;
}

/** Style Definition Header */
export interface CT_StyleDefinitionHeaderLst {
  styleDefHdr?: CT_StyleDefinitionHeader[];
}
