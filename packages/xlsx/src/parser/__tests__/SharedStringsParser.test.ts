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

  it('should parse rich text strings (concatenation)', () => {
    const xml = `
      <sst>
        <si>
          <r><t>One</t></r>
          <r><t> </t></r>
          <r><t>Two</t></r>
        </si>
      </sst>
    `;
    const strings = SharedStringsParser.parse(xml);
    expect(strings).toEqual(['One Two']);
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
