/**
 * Common Paper Sizes
 *
 * Dimensions are primarily provided in Twips (Twentieth of an Inch Point).
 * 1 inch = 1440 twips
 * 1 mm = 56.6929 twips
 */
export const PAPER_SIZES = {
  A3: {
    width: 16838, // 297mm
    height: 23811, // 420mm
    name: 'A3'
  },
  A4: {
    width: 11906, // 210mm
    height: 16838, // 297mm
    name: 'A4'
  },
  A5: {
    width: 8390, // 148mm
    height: 11906, // 210mm
    name: 'A5'
  },
  LETTER: {
    width: 12240, // 8.5"
    height: 15840, // 11"
    name: 'Letter'
  },
  LEGAL: {
    width: 12240, // 8.5"
    height: 20160, // 14"
    name: 'Legal'
  },
  TABLOID: {
    width: 15840, // 11"
    height: 24480, // 17"
    name: 'Tabloid'
  },
  EXECUTIVE: {
    width: 10440, // 7.25"
    height: 15120, // 10.5"
    name: 'Executive'
  }
} as const;

export type PaperSizeName = keyof typeof PAPER_SIZES;
