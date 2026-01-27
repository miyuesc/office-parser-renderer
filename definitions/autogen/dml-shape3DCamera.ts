import { CT_SphereCoords, ST_PositivePercentage } from './dml-baseTypes';
import { ST_Angle } from './vml-officeDrawing';

/**
 * dml-shape3DCamera.xsd
 */

/** Preset Camera Type */
export enum ST_PresetCameraType {
  /** Legacy Oblique Top Left */
  legacyObliqueTopLeft = 'legacyObliqueTopLeft',
  /** Legacy Oblique Top */
  legacyObliqueTop = 'legacyObliqueTop',
  /** Legacy Oblique Top Right */
  legacyObliqueTopRight = 'legacyObliqueTopRight',
  /** Legacy Oblique Left */
  legacyObliqueLeft = 'legacyObliqueLeft',
  /** Legacy Oblique Front */
  legacyObliqueFront = 'legacyObliqueFront',
  /** Legacy Oblique Right */
  legacyObliqueRight = 'legacyObliqueRight',
  /** Legacy Oblique Bottom Left */
  legacyObliqueBottomLeft = 'legacyObliqueBottomLeft',
  /** Legacy Oblique Bottom */
  legacyObliqueBottom = 'legacyObliqueBottom',
  /** Legacy Oblique Bottom Right */
  legacyObliqueBottomRight = 'legacyObliqueBottomRight',
  /** Legacy Perspective Top Left */
  legacyPerspectiveTopLeft = 'legacyPerspectiveTopLeft',
  /** Legacy Perspective Top */
  legacyPerspectiveTop = 'legacyPerspectiveTop',
  /** Legacy Perspective Top Right */
  legacyPerspectiveTopRight = 'legacyPerspectiveTopRight',
  /** Legacy Perspective Left */
  legacyPerspectiveLeft = 'legacyPerspectiveLeft',
  /** Legacy Perspective Front */
  legacyPerspectiveFront = 'legacyPerspectiveFront',
  /** Legacy Perspective Right */
  legacyPerspectiveRight = 'legacyPerspectiveRight',
  /** Legacy Perspective Bottom Left */
  legacyPerspectiveBottomLeft = 'legacyPerspectiveBottomLeft',
  /** Legacy Perspective Bottom */
  legacyPerspectiveBottom = 'legacyPerspectiveBottom',
  /** Legacy Perspective Bottom Right */
  legacyPerspectiveBottomRight = 'legacyPerspectiveBottomRight',
  /** Orthographic Front */
  orthographicFront = 'orthographicFront',
  /** Isometric Top Up */
  isometricTopUp = 'isometricTopUp',
  /** Isometric Top Down */
  isometricTopDown = 'isometricTopDown',
  /** Isometric Bottom Up */
  isometricBottomUp = 'isometricBottomUp',
  /** Isometric Bottom Down */
  isometricBottomDown = 'isometricBottomDown',
  /** Isometric Left Up */
  isometricLeftUp = 'isometricLeftUp',
  /** Isometric Left Down */
  isometricLeftDown = 'isometricLeftDown',
  /** Isometric Right Up */
  isometricRightUp = 'isometricRightUp',
  /** Isometric Right Down */
  isometricRightDown = 'isometricRightDown',
  /** Isometric Off Axis 1 Left */
  isometricOffAxis1Left = 'isometricOffAxis1Left',
  /** Isometric Off Axis 1 Right */
  isometricOffAxis1Right = 'isometricOffAxis1Right',
  /** Isometric Off Axis 1 Top */
  isometricOffAxis1Top = 'isometricOffAxis1Top',
  /** Isometric Off Axis 2 Left */
  isometricOffAxis2Left = 'isometricOffAxis2Left',
  /** Isometric Off Axis 2 Right */
  isometricOffAxis2Right = 'isometricOffAxis2Right',
  /** Isometric Off Axis 2 Top */
  isometricOffAxis2Top = 'isometricOffAxis2Top',
  /** Isometric Off Axis 3 Left */
  isometricOffAxis3Left = 'isometricOffAxis3Left',
  /** Isometric Off Axis 3 Right */
  isometricOffAxis3Right = 'isometricOffAxis3Right',
  /** Isometric Off Axis 3 Bottom */
  isometricOffAxis3Bottom = 'isometricOffAxis3Bottom',
  /** Isometric Off Axis 4 Left */
  isometricOffAxis4Left = 'isometricOffAxis4Left',
  /** Isometric Off Axis 4 Right */
  isometricOffAxis4Right = 'isometricOffAxis4Right',
  /** Isometric Off Axis 4 Bottom */
  isometricOffAxis4Bottom = 'isometricOffAxis4Bottom',
  /** Oblique Top Left */
  obliqueTopLeft = 'obliqueTopLeft',
  /** Oblique Top */
  obliqueTop = 'obliqueTop',
  /** Oblique Top Right */
  obliqueTopRight = 'obliqueTopRight',
  /** Oblique Left */
  obliqueLeft = 'obliqueLeft',
  /** Oblique Right */
  obliqueRight = 'obliqueRight',
  /** Oblique Bottom Left */
  obliqueBottomLeft = 'obliqueBottomLeft',
  /** Oblique Bottom */
  obliqueBottom = 'obliqueBottom',
  /** Oblique Bottom Right */
  obliqueBottomRight = 'obliqueBottomRight',
  /** Perspective Front */
  perspectiveFront = 'perspectiveFront',
  /** Perspective Left */
  perspectiveLeft = 'perspectiveLeft',
  /** Perspective Right */
  perspectiveRight = 'perspectiveRight',
  /** Orthographic Above */
  perspectiveAbove = 'perspectiveAbove',
  /** Perspective Below */
  perspectiveBelow = 'perspectiveBelow',
  /** Perspective Above Left Facing */
  perspectiveAboveLeftFacing = 'perspectiveAboveLeftFacing',
  /** Perspective Above Right Facing */
  perspectiveAboveRightFacing = 'perspectiveAboveRightFacing',
  /** Perspective Contrasting Left Facing */
  perspectiveContrastingLeftFacing = 'perspectiveContrastingLeftFacing',
  /** Perspective Contrasting Right Facing */
  perspectiveContrastingRightFacing = 'perspectiveContrastingRightFacing',
  /** Perspective Heroic Left Facing */
  perspectiveHeroicLeftFacing = 'perspectiveHeroicLeftFacing',
  /** Perspective Heroic Right Facing */
  perspectiveHeroicRightFacing = 'perspectiveHeroicRightFacing',
  /** Perspective Heroic Extreme Left Facing */
  perspectiveHeroicExtremeLeftFacing = 'perspectiveHeroicExtremeLeftFacing',
  /** Perspective Heroic Extreme Right Facing */
  perspectiveHeroicExtremeRightFacing = 'perspectiveHeroicExtremeRightFacing',
  /** Perspective Relaxed */
  perspectiveRelaxed = 'perspectiveRelaxed',
  /** Perspective Relaxed Moderately */
  perspectiveRelaxedModerately = 'perspectiveRelaxedModerately'
}

/** Field of View Angle */
export type ST_FOVAngle = ST_Angle;

/** Rotation */
export interface CT_Camera {
  prst: ST_PresetCameraType;
  fov?: ST_FOVAngle;
  zoom?: ST_PositivePercentage;
  rot?: CT_SphereCoords;
}
