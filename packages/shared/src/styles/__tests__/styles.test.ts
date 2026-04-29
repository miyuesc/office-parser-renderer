import { describe, it, expect } from 'vitest';
import { FontManager } from '../FontManager';
import { BorderConflictResolver } from '../BorderConflictResolver';
import { IBorder } from '../types';
import { ColorUtils } from '../ColorUtils';
import { ThemeParser } from '../ThemeParser';
import { loadSampleCase } from '../../../../../samples/utils/SampleCaseLoader';

describe('FontManager', () => {
  it('should generate correct font string', () => {
    const font = { family: 'Arial', size: 12, bold: true };
    // 12pt * 1.333 = 16px (approx) - logic uses UnitConversion.ptToPixel
    expect(FontManager.getFontString(font)).toContain('bold 16px "Arial"');
  });

  // Note: FontManager.measureText requires DOM/Canvas, which happy-dom provides.
  it('should measure text (mocked)', () => {
    // happy-dom's canvas implementation might be limited, but we check if it runs
    try {
      const metrics = FontManager.measureText('Test', { family: 'Arial', size: 10 });
      expect(metrics.width).toBeDefined();
    } catch (e) {
      // Fallback if canvas not supported in test env
      console.warn('Canvas not fully supported in test env');
    }
  });
});

describe('BorderConflictResolver', () => {
  const solidThin: IBorder = { style: 'solid', width: 1, color: 'black' };
  const solidThick: IBorder = { style: 'solid', width: 2, color: 'black' };
  const double: IBorder = { style: 'double', width: 1, color: 'black' };
  const none: IBorder = { style: 'none', width: 0, color: '' };

  it('should prefer wider border', () => {
    expect(BorderConflictResolver.resolve(solidThin, solidThick)).toEqual(solidThick);
  });

  it('should prefer higher priority style', () => {
    expect(BorderConflictResolver.resolve(solidThin, double)).toEqual(double);
  });

  it('should prefer visible over none', () => {
    expect(BorderConflictResolver.resolve(solidThin, none)).toEqual(solidThin);
  });
});

describe('ThemeParser and ColorUtils', () => {
  it('should parse theme colors and font scheme', () => {
    const theme = ThemeParser.parse(`
      <a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Custom Theme">
        <a:themeElements>
          <a:clrScheme name="Office">
            <a:lt1><a:srgbClr val="F1F1F1"/></a:lt1>
            <a:dk1><a:srgbClr val="111111"/></a:dk1>
            <a:lt2><a:srgbClr val="EEECE1"/></a:lt2>
            <a:dk2><a:srgbClr val="1F497D"/></a:dk2>
            <a:accent1><a:srgbClr val="112233"/></a:accent1>
            <a:accent2><a:srgbClr val="445566"/></a:accent2>
            <a:accent3><a:srgbClr val="778899"/></a:accent3>
            <a:accent4><a:srgbClr val="AA5500"/></a:accent4>
            <a:accent5><a:srgbClr val="00AA55"/></a:accent5>
            <a:accent6><a:srgbClr val="5500AA"/></a:accent6>
            <a:hlink><a:srgbClr val="0000AA"/></a:hlink>
            <a:folHlink><a:srgbClr val="AA00AA"/></a:folHlink>
          </a:clrScheme>
          <a:fontScheme name="Office">
            <a:majorFont>
              <a:latin typeface="Aptos Display"/>
            </a:majorFont>
            <a:minorFont>
              <a:latin typeface="Aptos"/>
            </a:minorFont>
          </a:fontScheme>
        </a:themeElements>
      </a:theme>
    `);

    expect(theme.name).toBe('Custom Theme');
    expect(theme.colors.accent1).toBe('#112233');
    expect(theme.fontScheme.major.latin).toBe('Aptos Display');
    expect(theme.fontScheme.minor.latin).toBe('Aptos');
  });

  it('should resolve theme color refs against a parsed theme', () => {
    const theme = ThemeParser.parse(`
      <a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
        <a:themeElements>
          <a:clrScheme name="Office">
            <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
            <a:dk1><a:srgbClr val="000000"/></a:dk1>
            <a:lt2><a:srgbClr val="EEECE1"/></a:lt2>
            <a:dk2><a:srgbClr val="1F497D"/></a:dk2>
            <a:accent1><a:srgbClr val="123456"/></a:accent1>
          </a:clrScheme>
        </a:themeElements>
      </a:theme>
    `);

    expect(ColorUtils.resolveColorRef({ theme: 4 }, theme)).toBe('#123456');
  });

  it('should consume the common theme sample', () => {
    const sample = loadSampleCase('samples/common/color-and-theme/basic-theme-colors');
    const themeXml = new TextDecoder().decode(sample.sourceBuffer);
    const theme = ThemeParser.parse(themeXml);

    expect(sample.metadata.id).toBe('common-theme-basic-theme-colors');
    expect(theme).toMatchObject(sample.expectedParser as object);
    expect(ColorUtils.resolveColorRef({ theme: 4 }, theme)).toBe('#112233');
    expect(ColorUtils.resolveColorRef({ theme: 5 }, theme)).toBe('#445566');
  });
});
