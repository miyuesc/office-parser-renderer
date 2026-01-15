import { CT_OfficeArtExtensionList, CT_Point3D, CT_Vector3D } from './dml-baseTypes';

/**
 * dml-shape3DScenePlane.xsd
 */

/** Anchor Point */
export interface CT_Backdrop {
    anchor: CT_Point3D;
    norm: CT_Vector3D;
    up: CT_Vector3D;
    extLst?: CT_OfficeArtExtensionList;
}

