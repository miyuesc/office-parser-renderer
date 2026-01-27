import { CT_SphereCoords } from './dml-baseTypes';

/**
 * dml-shape3DLighting.xsd
 */

/** Light Rig Direction */
export enum ST_LightRigDirection {
  /** Top Left */
  tl = 'tl',
  /** Top */
  t = 't',
  /** Top Right */
  tr = 'tr',
  /** Left */
  l = 'l',
  /** Right */
  r = 'r',
  /** Bottom Left */
  bl = 'bl',
  /** Bottom */
  b = 'b',
  /** Bottom Right */
  br = 'br'
}

/** Light Rig Type */
export enum ST_LightRigType {
  /** Legacy Flat 1 */
  legacyFlat1 = 'legacyFlat1',
  /** Legacy Flat 2 */
  legacyFlat2 = 'legacyFlat2',
  /** Legacy Flat 3 */
  legacyFlat3 = 'legacyFlat3',
  /** Legacy Flat 4 */
  legacyFlat4 = 'legacyFlat4',
  /** Legacy Normal 1 */
  legacyNormal1 = 'legacyNormal1',
  /** Legacy Normal 2 */
  legacyNormal2 = 'legacyNormal2',
  /** Legacy Normal 3 */
  legacyNormal3 = 'legacyNormal3',
  /** Legacy Normal 4 */
  legacyNormal4 = 'legacyNormal4',
  /** Legacy Harsh 1 */
  legacyHarsh1 = 'legacyHarsh1',
  /** Legacy Harsh 2 */
  legacyHarsh2 = 'legacyHarsh2',
  /** Legacy Harsh 3 */
  legacyHarsh3 = 'legacyHarsh3',
  /** Legacy Harsh 4 */
  legacyHarsh4 = 'legacyHarsh4',
  /** Three Point */
  threePt = 'threePt',
  /** Light Rig Enum ( Balanced ) */
  balanced = 'balanced',
  /** Soft */
  soft = 'soft',
  /** Harsh */
  harsh = 'harsh',
  /** Flood */
  flood = 'flood',
  /** Contrasting */
  contrasting = 'contrasting',
  /** Morning */
  morning = 'morning',
  /** Sunrise */
  sunrise = 'sunrise',
  /** Sunset */
  sunset = 'sunset',
  /** Chilly */
  chilly = 'chilly',
  /** Freezing */
  freezing = 'freezing',
  /** Flat */
  flat = 'flat',
  /** Two Point */
  twoPt = 'twoPt',
  /** Glow */
  glow = 'glow',
  /** Bright Room */
  brightRoom = 'brightRoom'
}

/** Rotation */
export interface CT_LightRig {
  rig: ST_LightRigType;
  dir: ST_LightRigDirection;
  rot?: CT_SphereCoords;
}
