import { CT_BlipFillProperties, CT_EffectContainer, CT_EffectList, CT_GradientFillProperties, CT_GroupFillProperties, CT_NoFillProperties, CT_PatternFillProperties, CT_SolidColorFillProperties } from './dml-shapeEffects';
import { CT_LineProperties } from './dml-shapeLineProperties';

/**
 * dml-graphicalObjectFormat.xsd
 */

export interface CT_BackgroundFormatting {
    noFill?: CT_NoFillProperties;
    solidFill?: CT_SolidColorFillProperties;
    gradFill?: CT_GradientFillProperties;
    blipFill?: CT_BlipFillProperties;
    pattFill?: CT_PatternFillProperties;
    grpFill?: CT_GroupFillProperties;
    effectLst?: CT_EffectList;
    effectDag?: CT_EffectContainer;
}

/** Outline */
export interface CT_WholeE2oFormatting {
    ln?: CT_LineProperties;
    effectLst?: CT_EffectList;
    effectDag?: CT_EffectContainer;
}

