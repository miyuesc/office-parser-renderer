import { CT_GroupTransform2D, CT_OfficeArtExtensionList, CT_Transform2D, ST_BlackWhiteMode } from './dml-baseTypes';
import { CT_Scene3D } from './dml-shape3DScene';
import { CT_Shape3D } from './dml-shape3DStyles';
import { CT_BlipFillProperties, CT_EffectContainer, CT_EffectList, CT_GradientFillProperties, CT_GroupFillProperties, CT_NoFillProperties, CT_PatternFillProperties, CT_SolidColorFillProperties } from './dml-shapeEffects';
import { CT_CustomGeometry2D, CT_PresetGeometry2D } from './dml-shapeGeometry';
import { CT_LineProperties } from './dml-shapeLineProperties';

/**
 * dml-shapeProperties.xsd
 */

/** 2D Transform for Individual Objects */
export interface CT_ShapeProperties {
    bwMode?: ST_BlackWhiteMode;
    xfrm?: CT_Transform2D;
    custGeom?: CT_CustomGeometry2D;
    prstGeom?: CT_PresetGeometry2D;
    noFill?: CT_NoFillProperties;
    solidFill?: CT_SolidColorFillProperties;
    gradFill?: CT_GradientFillProperties;
    blipFill?: CT_BlipFillProperties;
    pattFill?: CT_PatternFillProperties;
    grpFill?: CT_GroupFillProperties;
    ln?: CT_LineProperties;
    effectLst?: CT_EffectList;
    effectDag?: CT_EffectContainer;
    scene3d?: CT_Scene3D;
    sp3d?: CT_Shape3D;
    extLst?: CT_OfficeArtExtensionList;
}

/** 2D Transform for Grouped Objects */
export interface CT_GroupShapeProperties {
    bwMode?: ST_BlackWhiteMode;
    xfrm?: CT_GroupTransform2D;
    noFill?: CT_NoFillProperties;
    solidFill?: CT_SolidColorFillProperties;
    gradFill?: CT_GradientFillProperties;
    blipFill?: CT_BlipFillProperties;
    pattFill?: CT_PatternFillProperties;
    grpFill?: CT_GroupFillProperties;
    effectLst?: CT_EffectList;
    effectDag?: CT_EffectContainer;
    scene3d?: CT_Scene3D;
    extLst?: CT_OfficeArtExtensionList;
}

