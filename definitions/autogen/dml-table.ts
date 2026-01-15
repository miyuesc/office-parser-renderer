import { CT_OfficeArtExtensionList, ST_Coordinate, ST_Coordinate32 } from './dml-baseTypes';
import { CT_BlipFillProperties, CT_EffectContainer, CT_EffectList, CT_GradientFillProperties, CT_GroupFillProperties, CT_NoFillProperties, CT_PatternFillProperties, CT_SolidColorFillProperties } from './dml-shapeEffects';
import { CT_LineProperties } from './dml-shapeLineProperties';
import { CT_Cell3D } from './dml-tableStyle';
import { CT_TextBody, ST_TextAnchoringType, ST_TextHorzOverflowType, ST_TextVerticalType } from './dml-text';
import { CT_TableStyle } from './sml-styles';
import { ST_Guid } from './wml';

/**
 * dml-table.xsd
 */

/** Left Border Line Properties */
export interface CT_TableCellProperties {
    marL?: ST_Coordinate32;
    marR?: ST_Coordinate32;
    marT?: ST_Coordinate32;
    marB?: ST_Coordinate32;
    vert?: ST_TextVerticalType;
    anchor?: ST_TextAnchoringType;
    anchorCtr?: boolean;
    horzOverflow?: ST_TextHorzOverflowType;
    lnL?: CT_LineProperties;
    lnR?: CT_LineProperties;
    lnT?: CT_LineProperties;
    lnB?: CT_LineProperties;
    lnTlToBr?: CT_LineProperties;
    lnBlToTr?: CT_LineProperties;
    cell3D?: CT_Cell3D;
    noFill?: CT_NoFillProperties;
    solidFill?: CT_SolidColorFillProperties;
    gradFill?: CT_GradientFillProperties;
    blipFill?: CT_BlipFillProperties;
    pattFill?: CT_PatternFillProperties;
    grpFill?: CT_GroupFillProperties;
    extLst?: CT_OfficeArtExtensionList;
}

/** Width */
export interface CT_TableCol {
    w: ST_Coordinate;
    extLst?: CT_OfficeArtExtensionList;
}

/** Table Grid Column */
export interface CT_TableGrid {
    gridCol?: CT_TableCol[];
}

/** Text Body */
export interface CT_TableCell {
    rowSpan?: number;
    gridSpan?: number;
    hMerge?: boolean;
    vMerge?: boolean;
    txBody?: CT_TextBody;
    tcPr?: CT_TableCellProperties;
    extLst?: CT_OfficeArtExtensionList;
}

/** Table Cell */
export interface CT_TableRow {
    h: ST_Coordinate;
    tc?: CT_TableCell[];
    extLst?: CT_OfficeArtExtensionList;
}

/** Table Style */
export interface CT_TableProperties {
    rtl?: boolean;
    firstRow?: boolean;
    firstCol?: boolean;
    lastRow?: boolean;
    lastCol?: boolean;
    bandRow?: boolean;
    bandCol?: boolean;
    effectLst?: CT_EffectList;
    effectDag?: CT_EffectContainer;
    tableStyle: CT_TableStyle;
    tableStyleId: ST_Guid;
    extLst?: CT_OfficeArtExtensionList;
}

/** Table Properties */
export interface CT_Table {
    tblPr?: CT_TableProperties;
    tblGrid: CT_TableGrid;
    tr?: CT_TableRow[];
}

