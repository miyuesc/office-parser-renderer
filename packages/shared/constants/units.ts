/**
 * Unit Conversion Factors
 */
export const UNITS = {
  // English Metric Unit (EMU)
  EMUS_PER_INCH: 914400,
  EMUS_PER_CM: 360000,
  EMUS_PER_MM: 36000,
  EMUS_PER_PT: 12700,
  EMUS_PER_PC: 152400, // Pica (1 pc = 12 pt)
  EMUS_PER_TWIP: 635,

  // Twip (Twentieth of an Inch Point)
  TWIPS_PER_INCH: 1440,
  TWIPS_PER_CM: 566.929,
  TWIPS_PER_MM: 56.6929,
  TWIPS_PER_PT: 20,
  TWIPS_PER_PC: 240,

  // Point (pt)
  POINTS_PER_INCH: 72,
  POINTS_PER_CM: 28.3465,
  POINTS_PER_MM: 2.83465,

  // Pixel (px) - Assuming 96 DPI
  PIXELS_PER_INCH: 96,
  PIXELS_PER_PT: 1.33333, // 96 / 72

  // Metrics
  CM_PER_INCH: 2.54
} as const;
