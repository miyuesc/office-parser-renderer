import { describe, it, expect } from 'vitest';
import { XlsxParser } from '../index';
import JSZip from 'jszip';

describe('XlsxParser', () => {
  it('should parse a simulated xlsx file', async () => {
    const zip = new JSZip();

    // 1. Shared Strings
    const sharedStringsXml = `<sst><si><t>Shared 1</t></si><si><t>Shared 2</t></si></sst>`;
    zip.folder('xl')!.file('sharedStrings.xml', sharedStringsXml);

    // 2. Styles
    const stylesXml = `
            <styleSheet>
                <fonts count="1"><font><name val="Arial"/></font></fonts>
            </styleSheet>
        `;
    zip.folder('xl')!.file('styles.xml', stylesXml);

    // 3. Sheet 1
    const sheet1Xml = `
            <worksheet>
                <sheetData>
                    <row r="1"><c r="A1" t="s"><v>0</v></c></row>
                </sheetData>
            </worksheet>
        `;
    zip.folder('xl')!.folder('worksheets')!.file('sheet1.xml', sheet1Xml);

    // 生成 Buffer
    const buffer = await zip.generateAsync({ type: 'arraybuffer' });

    // 解析
    const doc = await XlsxParser.parse(buffer);

    // 验证 Shared Strings
    expect(doc.sharedStrings).toEqual(['Shared 1', 'Shared 2']);

    // 验证 Styles
    expect(doc.styles).toBeDefined();
    expect(doc.styles!.fonts.length).toBe(1);
    expect(doc.styles!.fonts[0].name).toBe('Arial');

    // 验证 Sheet
    // 匹配 xl/worksheets/sheet1.xml -> sheetId: "1"
    const sheet = doc.worksheets.get('1');
    expect(sheet).toBeDefined();
    if (sheet) {
      const row1 = sheet.rows.get(1);
      expect(row1).toBeDefined();
      const cellA1 = row1!.cells.get(1);
      expect(cellA1!.value).toBe('Shared 1');
    }
  });

  it('should handle missing sharedStrings', async () => {
    const zip = new JSZip();
    zip.folder('xl')!.folder('worksheets')!.file('sheet1.xml', '<worksheet><sheetData/></worksheet>');
    const buffer = await zip.generateAsync({ type: 'arraybuffer' });

    const doc = await XlsxParser.parse(buffer);
    expect(doc.sharedStrings).toEqual([]);
    expect(doc.worksheets.size).toBe(1);
  });
});
