import { describe, it, expect } from 'vitest';
import { Constants } from '../index';

describe('Constants', () => {
  it('should export XML_NAMESPACES', () => {
    expect(Constants.XML_NAMESPACES).toBeDefined();
    expect(Constants.XML_NAMESPACES.WORDPROCESSING_ML).toContain('wordprocessingml');
  });

  it('should export CONTENT_TYPES', () => {
    expect(Constants.CONTENT_TYPES).toBeDefined();
    expect(Constants.CONTENT_TYPES.WORD_DOCUMENT).toContain('wordprocessingml.document');
  });

  it('should export RELATIONSHIP_TYPES', () => {
    expect(Constants.RELATIONSHIP_TYPES).toBeDefined();
    expect(Constants.RELATIONSHIP_TYPES.OFFICE_DOCUMENT).toContain('relationships/officeDocument');
  });

  it('should export DEFAULTS', () => {
    expect(Constants.DEFAULTS).toBeDefined();
    expect(Constants.DEFAULTS.DPI).toBe(96);
  });

  it('should export new constants modules', () => {
    expect(Constants.PAPER_SIZES).toBeDefined();
    expect(Constants.PAPER_SIZES.A4.width).toBe(11906);

    expect(Constants.UNITS).toBeDefined();
    expect(Constants.UNITS.EMUS_PER_INCH).toBe(914400);

    expect(Constants.PRESET_COLORS).toBeDefined();
    expect(Constants.PRESET_COLORS.red).toBe('#FF0000');

    expect(Constants.BORDER_WIDTHS).toBeDefined();
    expect(Constants.BORDER_WIDTHS.THIN).toBe(2);

    expect(Constants.COMMON_NUM_FMTS).toBeDefined();
    expect(Constants.COMMON_NUM_FMTS.GENERAL).toBe('General');

    expect(Constants.DEFAULT_LIST_INDENTS).toBeDefined();
    expect(Constants.DEFAULT_LIST_INDENTS.LEVEL_1).toBe(720);
  });
});
