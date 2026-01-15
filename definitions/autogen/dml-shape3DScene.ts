import { CT_OfficeArtExtensionList } from './dml-baseTypes';
import { CT_Camera } from './dml-shape3DCamera';
import { CT_LightRig } from './dml-shape3DLighting';
import { CT_Backdrop } from './dml-shape3DScenePlane';

/**
 * dml-shape3DScene.xsd
 */

/** Camera */
export interface CT_Scene3D {
    camera: CT_Camera;
    lightRig: CT_LightRig;
    backdrop?: CT_Backdrop;
    extLst?: CT_OfficeArtExtensionList;
}

