import { describe, it, expect } from 'vitest';
import { UnitConverter } from '../../src/styles/UnitConverter';
import {
  EMU_PER_INCH,
  EMU_PER_CM,
  EMU_PER_POINT,
  EMU_PER_TWIP,
  DEFAULT_DPI,
} from '../../src/styles/constants';

describe('UnitConverter', () => {
  describe('EMU Conversions', () => {
    it('should convert EMU to Pixels', () => {
      // 1 inch = 914400 EMUs = 96 pixels (at 96 DPI)
      expect(UnitConverter.emuToPixels(EMU_PER_INCH)).toBeCloseTo(96);
      expect(UnitConverter.emuToPixels(0)).toBe(0);
      expect(UnitConverter.emuToPixels(NaN)).toBe(0);
    });

    it('should convert Pixels to EMU', () => {
      expect(UnitConverter.pixelsToEmu(96)).toBe(EMU_PER_INCH);
      expect(UnitConverter.pixelsToEmu(0)).toBe(0);
      expect(UnitConverter.pixelsToEmu(NaN)).toBe(0);
    });

    it('should convert EMU to Points', () => {
      // 1 point = 12700 EMUs
      expect(UnitConverter.emuToPoints(EMU_PER_POINT)).toBe(1);
      expect(UnitConverter.emuToPoints(EMU_PER_INCH)).toBe(72);
    });

    it('should convert Points to EMU', () => {
      expect(UnitConverter.pointsToEmu(1)).toBe(EMU_PER_POINT);
      expect(UnitConverter.pointsToEmu(72)).toBe(EMU_PER_INCH);
    });

    it('should convert EMU to Twips', () => {
      // 1 twip = 635 EMUs
      expect(UnitConverter.emuToTwips(EMU_PER_TWIP)).toBe(1);
      expect(UnitConverter.emuToTwips(EMU_PER_INCH)).toBe(1440); // 1 inch = 1440 twips
    });

    it('should convert Twips to EMU', () => {
      expect(UnitConverter.twipsToEmu(1)).toBe(EMU_PER_TWIP);
      expect(UnitConverter.twipsToEmu(1440)).toBe(EMU_PER_INCH);
    });

    it('should convert EMU to CM', () => {
      expect(UnitConverter.emuToCm(EMU_PER_CM)).toBe(1);
    });

    it('should convert CM to EMU', () => {
      expect(UnitConverter.cmToEmu(1)).toBe(EMU_PER_CM);
    });
  });

  describe('Twips Conversions', () => {
    it('should convert Twips to Pixels', () => {
      // 1440 twips = 1 inch = 96 pixels
      expect(UnitConverter.twipsToPixels(1440)).toBeCloseTo(96);
    });

    it('should convert Pixels to Twips', () => {
      expect(UnitConverter.pixelsToTwips(96)).toBeCloseTo(1440);
    });

    it('should convert Twips to Points', () => {
      // 20 twips = 1 point
      expect(UnitConverter.twipsToPoints(20)).toBe(1);
    });

    it('should convert Points to Twips', () => {
      expect(UnitConverter.pointsToTwips(1)).toBe(20);
    });
  });

  describe('Point Variations', () => {
    it('should convert HalfPoints to Points', () => {
      expect(UnitConverter.halfPointsToPoints(24)).toBe(12);
    });

    it('should convert Points to HalfPoints', () => {
      expect(UnitConverter.pointsToHalfPoints(12)).toBe(24);
    });

    it('should convert EighthPoints to Points', () => {
      expect(UnitConverter.eighthPointsToPoints(80)).toBe(10);
    });

    it('should convert Points to EighthPoints', () => {
      expect(UnitConverter.pointsToEighthPoints(10)).toBe(80);
    });
  });

  describe('Angle Conversions', () => {
    it('should convert OOXML Angle to Degrees', () => {
      // 60000 units = 1 degree
      expect(UnitConverter.ooxmlAngleToDegrees(60000)).toBe(1);
      expect(UnitConverter.ooxmlAngleToDegrees(5400000)).toBe(90);
    });

    it('should convert Degrees to OOXML Angle', () => {
      expect(UnitConverter.degreesToOoxmlAngle(1)).toBe(60000);
      expect(UnitConverter.degreesToOoxmlAngle(90)).toBe(5400000);
    });

    it('should convert OOXML Angle to Radians', () => {
      const angle90 = 5400000;
      expect(UnitConverter.ooxmlAngleToRadians(angle90)).toBeCloseTo(Math.PI / 2);
    });

    it('should convert Radians to OOXML Angle', () => {
      expect(UnitConverter.radiansToOoxmlAngle(Math.PI / 2)).toBeCloseTo(5400000, -2); // Allow slight rounding diff
    });
  });
});
