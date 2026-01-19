import { CT_TextCharacterProperties } from './dml-textCharacter';

/**
 * dml-textRun.xsd
 */

/** Text Character Properties */
export interface CT_RegularTextRun {
  rPr?: CT_TextCharacterProperties;
  t: string;
}
