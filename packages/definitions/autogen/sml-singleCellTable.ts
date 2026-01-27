import { CT_ExtensionList, ST_Xstring } from './common-types';
import { ST_CellRef } from './sml-baseTypes';
import { ST_XmlDataType } from './sml-table';
/**
 * sml-singleCellTable.xsd
 */
/** Table Properties */
export interface CT_SingleXmlCells {
  singleXmlCell: CT_SingleXmlCell[];
}
/** Cell Properties */
export interface CT_SingleXmlCell {
  id: number;
  r: ST_CellRef;
  connectionId: number;
  xmlCellPr: CT_XmlCellPr;
  extLst?: CT_ExtensionList;
}
/** Column XML Properties */
export interface CT_XmlCellPr {
  id: number;
  uniqueName?: ST_Xstring;
  xmlPr: CT_XmlPr;
  extLst?: CT_ExtensionList;
}
/** Future Feature Data Storage Area */
export interface CT_XmlPr {
  mapId: number;
  xpath: ST_Xstring;
  xmlDataType: ST_XmlDataType;
  extLst?: CT_ExtensionList;
}
