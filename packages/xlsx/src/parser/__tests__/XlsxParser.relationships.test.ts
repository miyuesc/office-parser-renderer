import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { XlsxParser } from '../XlsxParser';

describe('XlsxParser relationships integration', () => {
  it('should resolve workbook and drawing relationships through shared package reader', async () => {
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="xml" ContentType="application/xml"/>
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="png" ContentType="image/png"/>
        </Types>
      `
    );

    zip.folder('xl')!.file(
      'workbook.xml',
      `
        <workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <sheets>
            <sheet name="Sheet A" sheetId="1" r:id="rId1"/>
          </sheets>
        </workbook>
      `
    );
    zip.folder('xl')!.folder('_rels')!.file(
      'workbook.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Target="worksheets/sheet1.xml"/>
        </Relationships>
      `
    );

    zip.folder('xl')!.folder('worksheets')!.file(
      'sheet1.xml',
      `
        <worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <drawing r:id="rId1"/>
          <sheetData>
            <row r="1"><c r="A1"><v>1</v></c></row>
          </sheetData>
        </worksheet>
      `
    );
    zip.folder('xl')!.folder('worksheets')!.folder('_rels')!.file(
      'sheet1.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Target="../drawings/drawing1.xml"/>
        </Relationships>
      `
    );

    zip.folder('xl')!.folder('drawings')!.file(
      'drawing1.xml',
      `
        <wsDr xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <twoCellAnchor>
            <from><col>0</col><colOff>0</colOff><row>0</row><rowOff>0</rowOff></from>
            <to><col>1</col><colOff>0</colOff><row>1</row><rowOff>0</rowOff></to>
            <pic>
              <blipFill><blip r:embed="rId1"/></blipFill>
              <spPr>
                <xfrm>
                  <off x="0" y="0"/>
                  <ext cx="9525" cy="9525"/>
                </xfrm>
              </spPr>
            </pic>
          </twoCellAnchor>
        </wsDr>
      `
    );
    zip.folder('xl')!.folder('drawings')!.folder('_rels')!.file(
      'drawing1.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Target="../media/image1.png"/>
        </Relationships>
      `
    );
    zip.folder('xl')!.folder('media')!.file('image1.png', new Uint8Array([1, 2, 3]));

    const buffer = await zip.generateAsync({ type: 'arraybuffer' });
    const doc = await XlsxParser.parse(buffer);

    const sheet = doc.worksheets.get('1');
    expect(sheet).toBeDefined();
    expect(sheet?.name).toBe('Sheet A');
    expect(sheet?.drawings).toHaveLength(1);
  });

  it('should resolve drawing scheme colors through the shared theme model', async () => {
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="xml" ContentType="application/xml"/>
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
        </Types>
      `
    );

    zip.folder('xl')!.file(
      'workbook.xml',
      `
        <workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <sheets>
            <sheet name="Sheet Theme" sheetId="1" r:id="rId1"/>
          </sheets>
        </workbook>
      `
    );
    zip.folder('xl')!.folder('_rels')!.file(
      'workbook.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Target="worksheets/sheet1.xml"/>
        </Relationships>
      `
    );
    zip.folder('xl')!.folder('theme')!.file(
      'theme1.xml',
      `
        <a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Theme Colors">
          <a:themeElements>
            <a:clrScheme name="Office">
              <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
              <a:dk1><a:srgbClr val="000000"/></a:dk1>
              <a:lt2><a:srgbClr val="EEECE1"/></a:lt2>
              <a:dk2><a:srgbClr val="1F497D"/></a:dk2>
              <a:accent1><a:srgbClr val="112233"/></a:accent1>
            </a:clrScheme>
          </a:themeElements>
        </a:theme>
      `
    );

    zip.folder('xl')!.folder('worksheets')!.file(
      'sheet1.xml',
      `
        <worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <drawing r:id="rId1"/>
          <sheetData>
            <row r="1"><c r="A1"><v>1</v></c></row>
          </sheetData>
        </worksheet>
      `
    );
    zip.folder('xl')!.folder('worksheets')!.folder('_rels')!.file(
      'sheet1.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Target="../drawings/drawing1.xml"/>
        </Relationships>
      `
    );

    zip.folder('xl')!.folder('drawings')!.file(
      'drawing1.xml',
      `
        <wsDr xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <twoCellAnchor>
            <from><col>0</col><colOff>0</colOff><row>0</row><rowOff>0</rowOff></from>
            <to><col>1</col><colOff>0</colOff><row>1</row><rowOff>0</rowOff></to>
            <sp>
              <nvSpPr><cNvPr id="1" name="Theme Shape"/></nvSpPr>
              <spPr>
                <xfrm><off x="0" y="0"/><ext cx="9525" cy="9525"/></xfrm>
                <prstGeom prst="rect"/>
                <solidFill><schemeClr val="accent1"/></solidFill>
              </spPr>
            </sp>
          </twoCellAnchor>
        </wsDr>
      `
    );
    zip.folder('xl')!.folder('drawings')!.folder('_rels')!.file(
      'drawing1.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        </Relationships>
      `
    );

    const buffer = await zip.generateAsync({ type: 'arraybuffer' });
    const doc = await XlsxParser.parse(buffer);

    const sheet = doc.worksheets.get('1');
    expect(sheet?.name).toBe('Sheet Theme');
    expect(sheet?.drawings).toHaveLength(1);

    const shape = sheet?.drawings?.[0] as any;

    expect(shape.style.fill.color).toBe('#112233');
  });
});
