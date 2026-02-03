import { describe, it, expect } from 'vitest';
import { SharedStringsParser } from '../SharedStringsParser';

describe('SharedStringsParser', () => {
  it('should parse simple strings', () => {
    const xml = `
      <sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
        <si><t>Hello</t></si>
        <si><t>World</t></si>
      </sst>
    `;
    const strings = SharedStringsParser.parse(xml);
    expect(strings).toEqual(['Hello', 'World']);
  });

  it('should parse rich text strings as RichTextRun[]', () => {
    const xml = `
      <sst>
        <si>
          <r>
            <rPr><b/><sz val="11"/><color rgb="FFFF0000"/><rFont val="Arial"/></rPr>
            <t>RedBold</t>
          </r>
          <r><t>Normal</t></r>
        </si>
      </sst>
    `;
    const strings = SharedStringsParser.parse(xml);
    expect(strings.length).toBe(1);

    const richText = strings[0] as any[];
    expect(Array.isArray(richText)).toBe(true);
    expect(richText.length).toBe(2);

    expect(richText[0].text).toBe('RedBold');
    expect(richText[0].font).toBeDefined();
    expect(richText[0].font.bold).toBe(true);
    expect(richText[0].font.name).toBe('Arial');
    expect(richText[0].font.color).toBeDefined();

    expect(richText[1].text).toBe('Normal');
    expect(richText[1].font).toBeUndefined();
  });

  it('should handle xml space preserve', () => {
    const xml = `
      <sst>
        <si><t xml:space="preserve">  Space  </t></si>
      </sst>
    `;
    const strings = SharedStringsParser.parse(xml);
    expect(strings).toEqual(['  Space  ']);
  });
});
