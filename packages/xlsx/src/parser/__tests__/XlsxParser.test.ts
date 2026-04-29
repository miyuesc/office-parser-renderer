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

  it('should parse theme1.xml and use it in styles resolution', async () => {
    const zip = new JSZip();
    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
        </Types>
      `
    );
    zip.folder('xl')!.file(
      'styles.xml',
      `
        <styleSheet>
          <fonts count="1">
            <font>
              <color theme="4"/>
              <scheme val="minor"/>
            </font>
          </fonts>
        </styleSheet>
      `
    );
    zip.folder('xl')!.folder('theme')!.file(
      'theme1.xml',
      `
        <a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Theme 1">
          <a:themeElements>
            <a:clrScheme name="Office">
              <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
              <a:dk1><a:srgbClr val="000000"/></a:dk1>
              <a:lt2><a:srgbClr val="EEECE1"/></a:lt2>
              <a:dk2><a:srgbClr val="1F497D"/></a:dk2>
              <a:accent1><a:srgbClr val="102030"/></a:accent1>
            </a:clrScheme>
            <a:fontScheme name="Office">
              <a:majorFont><a:latin typeface="Aptos Display"/></a:majorFont>
              <a:minorFont><a:latin typeface="Aptos"/></a:minorFont>
            </a:fontScheme>
          </a:themeElements>
        </a:theme>
      `
    );
    zip.folder('xl')!.folder('worksheets')!.file('sheet1.xml', '<worksheet><sheetData/></worksheet>');

    const buffer = await zip.generateAsync({ type: 'arraybuffer' });
    const doc = await XlsxParser.parse(buffer);

    expect(doc.styles?.theme?.name).toBe('Theme 1');
    expect(doc.styles?.fonts[0].color).toBe('#102030');
    expect(doc.styles?.fonts[0].descriptor?.family).toBe('Aptos');
  });

  it('should expose stable worksheet identity from workbook metadata', async () => {
    const zip = new JSZip();
    zip.folder('xl')!.file(
      'workbook.xml',
      `
        <workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <sheets>
            <sheet name="Quarter 1 / Draft" sheetId="7" r:id="rId1"/>
          </sheets>
        </workbook>
      `
    );
    zip.folder('xl')!.folder('_rels')!.file(
      'workbook.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Target="worksheets/sheet3.xml"/>
        </Relationships>
      `
    );
    zip.folder('xl')!.folder('worksheets')!.file('sheet3.xml', '<worksheet><sheetData/></worksheet>');

    const buffer = await zip.generateAsync({ type: 'arraybuffer' });
    const doc = await XlsxParser.parse(buffer);
    const sheet = doc.worksheets.get('7');

    expect(doc.worksheets.has('Quarter 1 / Draft')).toBe(false);
    expect(sheet).toMatchObject({
      id: '7',
      sheetId: '7',
      name: 'Quarter 1 / Draft',
      path: 'xl/worksheets/sheet3.xml',
      relationshipId: 'rId1'
    });
  });
});
