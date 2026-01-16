import { ST_Percentage } from './dml-baseTypes';
import { CT_Blip } from './dml-shapeEffects';
import { ST_TextFontSize } from './dml-textCharacter';

/**
 * dml-textBullet.xsd
 */

/** Start Bullet At Number */
export type ST_TextBulletStartAtNum = number;

/** Text Auto-number Schemes */
export enum ST_TextAutonumberScheme {
  /** Autonumber Enum ( alphaLcParenBoth ) */
  alphaLcParenBoth = 'alphaLcParenBoth',
  /** Autonumbering Enum ( alphaUcParenBoth ) */
  alphaUcParenBoth = 'alphaUcParenBoth',
  /** Autonumbering Enum ( alphaLcParenR ) */
  alphaLcParenR = 'alphaLcParenR',
  /** Autonumbering Enum ( alphaUcParenR ) */
  alphaUcParenR = 'alphaUcParenR',
  /** Autonumbering Enum ( alphaLcPeriod ) */
  alphaLcPeriod = 'alphaLcPeriod',
  /** Autonumbering Enum ( alphaUcPeriod ) */
  alphaUcPeriod = 'alphaUcPeriod',
  /** Autonumbering Enum ( arabicParenBoth ) */
  arabicParenBoth = 'arabicParenBoth',
  /** Autonumbering Enum ( arabicParenR ) */
  arabicParenR = 'arabicParenR',
  /** Autonumbering Enum ( arabicPeriod ) */
  arabicPeriod = 'arabicPeriod',
  /** Autonumbering Enum ( arabicPlain ) */
  arabicPlain = 'arabicPlain',
  /** Autonumbering Enum ( romanLcParenBoth ) */
  romanLcParenBoth = 'romanLcParenBoth',
  /** Autonumbering Enum ( romanUcParenBoth ) */
  romanUcParenBoth = 'romanUcParenBoth',
  /** Autonumbering Enum ( romanLcParenR ) */
  romanLcParenR = 'romanLcParenR',
  /** Autonumbering Enum ( romanUcParenR ) */
  romanUcParenR = 'romanUcParenR',
  /** Autonumbering Enum ( romanLcPeriod ) */
  romanLcPeriod = 'romanLcPeriod',
  /** Autonumbering Enum ( romanUcPeriod ) */
  romanUcPeriod = 'romanUcPeriod',
  /** Autonumbering Enum ( circleNumDbPlain ) */
  circleNumDbPlain = 'circleNumDbPlain',
  /** Autonumbering Enum ( circleNumWdBlackPlain ) */
  circleNumWdBlackPlain = 'circleNumWdBlackPlain',
  /** Autonumbering Enum ( circleNumWdWhitePlain ) */
  circleNumWdWhitePlain = 'circleNumWdWhitePlain',
  /** Autonumbering Enum ( arabicDbPeriod ) */
  arabicDbPeriod = 'arabicDbPeriod',
  /** Autonumbering Enum ( arabicDbPlain ) */
  arabicDbPlain = 'arabicDbPlain',
  /** Autonumbering Enum ( ea1ChsPeriod ) */
  ea1ChsPeriod = 'ea1ChsPeriod',
  /** Autonumbering Enum ( ea1ChsPlain ) */
  ea1ChsPlain = 'ea1ChsPlain',
  /** Autonumbering Enum ( ea1ChtPeriod ) */
  ea1ChtPeriod = 'ea1ChtPeriod',
  /** Autonumbering Enum ( ea1ChtPlain ) */
  ea1ChtPlain = 'ea1ChtPlain',
  /** Autonumbering Enum ( ea1JpnChsDbPeriod ) */
  ea1JpnChsDbPeriod = 'ea1JpnChsDbPeriod',
  /** Autonumbering Enum ( ea1JpnKorPlain ) */
  ea1JpnKorPlain = 'ea1JpnKorPlain',
  /** Autonumbering Enum ( ea1JpnKorPeriod ) */
  ea1JpnKorPeriod = 'ea1JpnKorPeriod',
  /** Autonumbering Enum ( arabic1Minus ) */
  arabic1Minus = 'arabic1Minus',
  /** Autonumbering Enum ( arabic2Minus ) */
  arabic2Minus = 'arabic2Minus',
  /** Autonumbering Enum ( hebrew2Minus ) */
  hebrew2Minus = 'hebrew2Minus',
  /** Autonumbering Enum ( thaiAlphaPeriod ) */
  thaiAlphaPeriod = 'thaiAlphaPeriod',
  /** Autonumbering Enum ( thaiAlphaParenR ) */
  thaiAlphaParenR = 'thaiAlphaParenR',
  /** Autonumbering Enum ( thaiAlphaParenBoth ) */
  thaiAlphaParenBoth = 'thaiAlphaParenBoth',
  /** Autonumbering Enum ( thaiNumPeriod ) */
  thaiNumPeriod = 'thaiNumPeriod',
  /** Autonumbering Enum ( thaiNumParenR ) */
  thaiNumParenR = 'thaiNumParenR',
  /** Autonumbering Enum ( thaiNumParenBoth ) */
  thaiNumParenBoth = 'thaiNumParenBoth',
  /** Autonumbering Enum ( hindiAlphaPeriod ) */
  hindiAlphaPeriod = 'hindiAlphaPeriod',
  /** Autonumbering Enum ( hindiNumPeriod ) */
  hindiNumPeriod = 'hindiNumPeriod',
  /** Autonumbering Enum ( hindiNumParenR ) */
  hindiNumParenR = 'hindiNumParenR',
  /** Autonumbering Enum ( hindiAlpha1Period ) */
  hindiAlpha1Period = 'hindiAlpha1Period'
}

/** Bullet Size Percentage */
export type ST_TextBulletSizePercent = ST_Percentage;

export interface CT_TextBulletColorFollowText {}

export interface CT_TextBulletSizeFollowText {}

/** Value */
export interface CT_TextBulletSizePercent {
  val?: ST_TextBulletSizePercent;
}

/** Value */
export interface CT_TextBulletSizePoint {
  val?: ST_TextFontSize;
}

export interface CT_TextBulletTypefaceFollowText {}

/** Bullet Autonumbering Type */
export interface CT_TextAutonumberBullet {
  type: ST_TextAutonumberScheme;
  startAt?: ST_TextBulletStartAtNum;
}

/** Bullet Character */
export interface CT_TextCharBullet {
  char: string;
}

/** Blip */
export interface CT_TextBlipBullet {
  blip: CT_Blip;
}

export interface CT_TextNoBullet {}
