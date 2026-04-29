import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { loadSampleCase } from '../../../../../samples/utils/SampleCaseLoader';
import { PageLayoutEngine } from '../../layout';
import { DocxNavigationBuilder } from '../../navigation';
import { DocxRenderer } from '../../renderer';
import { DocxParser } from '../DocxParser';

describe('DocxParser', () => {
  it('should parse the basic heading sample into a structured model', async () => {
    const sample = loadSampleCase('samples/docx/headings-and-toc/basic-heading-tree');
    const doc = await DocxParser.parse(sample.sourceBuffer);

    expect(sample.metadata.id).toBe('docx-headings-basic-heading-tree');
    expect(doc.sourcePartPath).toBe('word/document.xml');
    expect(doc.body).toHaveLength(3);
    expect(doc.body[0]).toMatchObject({
      type: 'paragraph',
      styleId: 'Heading1',
      runs: [{ text: 'Heading One' }]
    });
    expect(doc.body[1]).toMatchObject({
      type: 'paragraph',
      numbering: { numId: '1', level: '0' }
    });
    expect(doc.body[2]).toMatchObject({
      type: 'table',
      rows: [{ cells: [{ blocks: [{ type: 'paragraph', runs: [{ text: 'Table cell' }] }] }] }]
    });

    expect(doc.styles.byId.get('Heading1')).toMatchObject({
      type: 'paragraph',
      name: 'heading 1',
      basedOn: 'Normal',
      text: {
        bold: true,
        color: '#112233',
        size: 16
      }
    });
    expect(doc.styles.byId.get('Emphasis')?.text?.italic).toBe(true);
    expect(doc.numbering.abstractNums.get('0')?.levels.get('0')).toMatchObject({
      start: 1,
      format: 'decimal',
      text: '%1.'
    });
    expect(doc.numbering.nums.get('1')?.abstractNumId).toBe('0');
    expect(doc.settings.defaultTabStop).toBe(720);
    expect(doc.settings.compatibilityFlags).toEqual(['compatSetting']);
    expect(doc.navigation?.headings).toHaveLength(1);
    expect(doc.navigation?.headings[0]).toMatchObject({
      id: 'heading-1',
      text: 'Heading One',
      level: 1,
      styleId: 'Heading1',
      blockIndex: 0
    });
    expect(doc.navigation?.toc).toEqual([
      {
        id: 'heading-1',
        text: 'Heading One',
        level: 1
      }
    ]);
    expect(doc.sections[0]).toMatchObject({
      pageSize: { width: 11906, height: 16838, orientation: 'portrait' },
      margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
    });
    expect(doc.warnings).toContainEqual(
      expect.objectContaining({
        code: 'renderer.unsupported-feature',
        partPath: 'word/settings.xml'
      })
    );
  });

  it('should layout and render the basic sample as paged preview output', async () => {
    const sample = loadSampleCase('samples/docx/headings-and-toc/basic-heading-tree');
    const doc = await DocxParser.parse(sample.sourceBuffer);
    const pages = new PageLayoutEngine().layout(doc);
    const container = document.createElement('div');
    const renderer = new DocxRenderer(container);

    renderer.render(doc);

    expect(pages).toHaveLength(1);
    expect(pages[0].pageBox.width).toBeGreaterThan(0);
    expect(pages[0].pageBox.height).toBeGreaterThan(0);
    expect(pages[0].blocks).toHaveLength(3);
    expect(container.querySelectorAll('[data-testid="docx-page"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="docx-page-canvas"]')).toHaveLength(1);
    expect(container.querySelector('[data-heading-id="heading-1"]')?.textContent).toBe('Heading One');
    expect(renderer.getStats()).toMatchObject({
      totalPages: 1,
      headingCount: 1,
      tocCount: 1,
      tableCount: 1
    });
    expect(renderer.getStats().totalCharacters).toBeGreaterThan(0);
    expect(renderer.getNavigation().toc).toEqual([
      {
        id: 'heading-1',
        text: 'Heading One',
        level: 1,
        pageIndex: 0
      }
    ]);
    expect(renderer.getNavigation().pages).toEqual([{ pageIndex: 0, headingIds: ['heading-1'] }]);
    expect(renderer.jumpToHeading('heading-1')).toBe(true);
    expect(renderer.jumpToPage(0)).toBe(true);
    expect(container.textContent).toContain('Heading One');
    expect(container.textContent).toContain('Table cell');
  });

  it('should build a nested heading tree from heading styles', () => {
    const doc: any = {
      body: [
        { type: 'paragraph', styleId: 'Heading1', runs: [{ text: 'Chapter' }] },
        { type: 'paragraph', styleId: 'Heading2', runs: [{ text: 'Section' }] },
        { type: 'paragraph', styleId: 'Normal', runs: [{ text: 'Body' }] },
        { type: 'paragraph', styleId: 'Heading1', runs: [{ text: 'Next Chapter' }] }
      ],
      styles: { byId: new Map() },
      numbering: { abstractNums: new Map(), nums: new Map() },
      settings: { compatibilityFlags: [], unsupported: [] },
      sections: [],
      warnings: []
    };

    const navigation = DocxNavigationBuilder.build(doc);

    expect(navigation.headings).toHaveLength(2);
    expect(navigation.headings[0]).toMatchObject({
      id: 'heading-1',
      text: 'Chapter',
      level: 1,
      children: [
        {
          id: 'heading-2',
          text: 'Section',
          level: 2
        }
      ]
    });
    expect(navigation.toc.map(item => item.text)).toEqual(['Chapter', 'Section', 'Next Chapter']);
  });

  it('should parse section header/footer references and render page number fields', async () => {
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        </Types>
      `
    );
    zip.folder('_rels')!.file(
      '.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rIdOffice" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
        </Relationships>
      `
    );
    zip.folder('word')!.file(
      'document.xml',
      `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <w:body>
            <w:p><w:r><w:t>Body text</w:t></w:r></w:p>
            <w:sectPr>
              <w:headerReference w:type="default" r:id="rIdHeader"/>
              <w:footerReference w:type="default" r:id="rIdFooter"/>
              <w:pgSz w:w="11906" w:h="16838"/>
              <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
            </w:sectPr>
          </w:body>
        </w:document>
      `
    );
    zip.folder('word')!.folder('_rels')!.file(
      'document.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rIdHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
          <Relationship Id="rIdFooter" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
        </Relationships>
      `
    );
    zip.folder('word')!.file(
      'header1.xml',
      `
        <w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:p><w:r><w:t>Document Header</w:t></w:r></w:p>
        </w:hdr>
      `
    );
    zip.folder('word')!.file(
      'footer1.xml',
      `
        <w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:p>
            <w:r><w:t>Page </w:t></w:r>
            <w:r><w:instrText>PAGE</w:instrText></w:r>
            <w:r><w:t> of </w:t></w:r>
            <w:r><w:instrText>NUMPAGES</w:instrText></w:r>
          </w:p>
        </w:ftr>
      `
    );

    const doc = await DocxParser.parse(await zip.generateAsync({ type: 'arraybuffer' }));
    const container = document.createElement('div');
    const renderer = new DocxRenderer(container);

    renderer.render(doc);

    expect(doc.sections[0].headerRefs).toEqual([
      {
        type: 'default',
        relationshipId: 'rIdHeader',
        partPath: 'word/header1.xml'
      }
    ]);
    expect(doc.sections[0].footerRefs).toEqual([
      {
        type: 'default',
        relationshipId: 'rIdFooter',
        partPath: 'word/footer1.xml'
      }
    ]);
    expect(doc.headers.get('rIdHeader')?.blocks[0]).toMatchObject({
      type: 'paragraph',
      runs: [{ text: 'Document Header' }]
    });
    expect(doc.footers.get('rIdFooter')?.blocks[0]).toMatchObject({
      type: 'paragraph',
      runs: [
        { text: 'Page ' },
        { text: '', fields: [{ instruction: 'PAGE', type: 'page' }] },
        { text: ' of ' },
        { text: '', fields: [{ instruction: 'NUMPAGES', type: 'numPages' }] }
      ]
    });
    expect(container.querySelector('[data-testid="docx-header"]')?.textContent).toContain('Document Header');
    expect(container.querySelector('[data-testid="docx-footer"]')?.textContent).toContain('Page 1 of 1');
  });

  it('should parse inline images and render them on the canvas page surface', async () => {
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Default Extension="png" ContentType="image/png"/>
          <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        </Types>
      `
    );
    zip.folder('_rels')!.file(
      '.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rIdOffice" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
        </Relationships>
      `
    );
    zip.folder('word')!.file(
      'document.xml',
      `
        <w:document
          xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
          xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
          xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
          xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
          <w:body>
            <w:p>
              <w:r><w:t>Before image</w:t></w:r>
              <w:r>
                <w:drawing>
                  <wp:inline>
                    <wp:extent cx="952500" cy="476250"/>
                    <wp:docPr id="1" name="Picture 1"/>
                    <a:graphic>
                      <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                        <pic:pic>
                          <pic:blipFill>
                            <a:blip r:embed="rIdImage"/>
                          </pic:blipFill>
                        </pic:pic>
                      </a:graphicData>
                    </a:graphic>
                  </wp:inline>
                </w:drawing>
              </w:r>
            </w:p>
            <w:sectPr>
              <w:pgSz w:w="11906" w:h="16838"/>
              <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
            </w:sectPr>
          </w:body>
        </w:document>
      `
    );
    zip.folder('word')!.folder('_rels')!.file(
      'document.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rIdImage" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
        </Relationships>
      `
    );
    zip.folder('word')!.folder('media')!.file('image1.png', new Uint8Array([1, 2, 3, 4]));

    const doc = await DocxParser.parse(await zip.generateAsync({ type: 'arraybuffer' }));
    const image = (doc.body[0] as any).runs[1].images[0];
    const container = document.createElement('div');
    const renderer = new DocxRenderer(container);

    renderer.render(doc);

    expect(image).toMatchObject({
      path: 'word/media/image1.png',
      contentType: 'image/png',
      extension: 'png',
      position: {
        width: 100,
        height: 50
      },
      source: {
        relationshipId: 'rIdImage',
        resolvedTarget: 'word/media/image1.png'
      }
    });
    expect(image.blob).toBeInstanceOf(Blob);
    expect(container.querySelectorAll('[data-testid="docx-page-canvas"]')).toHaveLength(1);
  });

  it('should parse table merges, cell styles, symbols, text background, and numbering levels', async () => {
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        </Types>
      `
    );
    zip.folder('_rels')!.file(
      '.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rIdOffice" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
        </Relationships>
      `
    );
    zip.folder('word')!.file(
      'numbering.xml',
      `
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:start w:val="1"/>
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
            <w:lvl w:ilvl="1">
              <w:start w:val="1"/>
              <w:numFmt w:val="bullet"/>
              <w:lvlText w:val="•"/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
        </w:numbering>
      `
    );
    zip.folder('word')!.file(
      'document.xml',
      `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr><w:numPr><w:ilvl w:val="1"/><w:numId w:val="1"/></w:numPr></w:pPr>
              <w:r><w:t>Nested item</w:t></w:r>
            </w:p>
            <w:p>
              <w:r>
                <w:rPr><w:shd w:fill="FFF2CC"/></w:rPr>
                <w:t>Highlighted</w:t>
              </w:r>
              <w:r><w:sym w:font="Wingdings" w:char="F0FC"/></w:r>
            </w:p>
            <w:tbl>
              <w:tblPr>
                <w:tblW w:w="7200" w:type="dxa"/>
                <w:tblBorders>
                  <w:top w:val="single" w:sz="8" w:color="4472C4"/>
                  <w:left w:val="single" w:sz="8" w:color="4472C4"/>
                  <w:bottom w:val="single" w:sz="8" w:color="4472C4"/>
                  <w:right w:val="single" w:sz="8" w:color="4472C4"/>
                  <w:insideH w:val="single" w:sz="4" w:color="808080"/>
                  <w:insideV w:val="single" w:sz="4" w:color="808080"/>
                </w:tblBorders>
              </w:tblPr>
              <w:tblGrid>
                <w:gridCol w:w="2400"/>
                <w:gridCol w:w="4800"/>
              </w:tblGrid>
              <w:tr>
                <w:tc>
                  <w:tcPr>
                    <w:tcW w:w="7200" w:type="dxa"/>
                    <w:gridSpan w:val="2"/>
                    <w:shd w:fill="D9EAF7"/>
                    <w:tcBorders>
                      <w:top w:val="single" w:sz="8" w:color="4472C4"/>
                      <w:left w:val="dotted" w:sz="4" w:color="FF0000"/>
                    </w:tcBorders>
                  </w:tcPr>
                  <w:p><w:r><w:t>Wide cell</w:t></w:r></w:p>
                </w:tc>
              </w:tr>
              <w:tr>
                <w:tc>
                  <w:tcPr><w:tcW w:w="2400" w:type="dxa"/><w:vMerge w:val="restart"/></w:tcPr>
                  <w:p><w:r><w:t>Merged down</w:t></w:r></w:p>
                </w:tc>
                <w:tc><w:tcPr><w:tcW w:w="4800" w:type="dxa"/></w:tcPr><w:p><w:r><w:t>Right</w:t></w:r></w:p></w:tc>
              </w:tr>
              <w:tr>
                <w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/><w:vMerge/></w:tcPr><w:p/></w:tc>
                <w:tc><w:tcPr><w:tcW w:w="4800" w:type="dxa"/></w:tcPr><w:p><w:r><w:t>Bottom right</w:t></w:r></w:p></w:tc>
              </w:tr>
            </w:tbl>
            <w:sectPr>
              <w:pgSz w:w="11906" w:h="16838"/>
              <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
            </w:sectPr>
          </w:body>
        </w:document>
      `
    );

    const doc = await DocxParser.parse(await zip.generateAsync({ type: 'arraybuffer' }));
    const listParagraph = doc.body[0] as any;
    const symbolParagraph = doc.body[1] as any;
    const table = doc.body[2] as any;
    const container = document.createElement('div');
    const renderer = new DocxRenderer(container);

    renderer.render(doc);

    expect(listParagraph.numbering).toEqual({ level: '1', numId: '1' });
    expect(doc.numbering.abstractNums.get('0')?.levels.get('1')).toMatchObject({
      format: 'bullet',
      text: '•'
    });
    expect(symbolParagraph.runs[0].style.highlight).toBe('#FFF2CC');
    expect(symbolParagraph.runs[1].text).toBe('✓');
    expect(table.rows[0].cells[0]).toMatchObject({
      width: { value: 7200, type: 'dxa' },
      gridSpan: 2,
      shading: '#D9EAF7',
      borders: {
        top: { style: 'single', color: '#4472C4', size: 1 },
        left: { style: 'dotted', color: '#FF0000', size: 0.5 }
      }
    });
    expect(table.width).toEqual({ value: 7200, type: 'dxa' });
    expect(table.gridWidths).toEqual([2400, 4800]);
    expect(table.borders).toMatchObject({
      top: { style: 'single', color: '#4472C4', size: 1 },
      insideH: { style: 'single', color: '#808080', size: 0.5 },
      insideV: { style: 'single', color: '#808080', size: 0.5 }
    });
    expect(table.rows[1].cells[0].verticalMerge).toBe('restart');
    expect(table.rows[2].cells[0].verticalMerge).toBe('continue');
    expect(container.textContent).toContain('• Nested item');
    expect((renderer as any).resolveTableColumnWidths(table, 600)).toEqual([160, 320]);
    expect(container.querySelectorAll('[data-testid="docx-page-canvas"]')).toHaveLength(1);
  });

  it('should apply section page orientation to independent pages', async () => {
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        </Types>
      `
    );
    zip.folder('_rels')!.file(
      '.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rIdOffice" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
        </Relationships>
      `
    );
    zip.folder('word')!.file(
      'document.xml',
      `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p><w:r><w:t>Portrait page</w:t></w:r></w:p>
            <w:p>
              <w:pPr>
                <w:sectPr>
                  <w:pgSz w:w="11906" w:h="16838" w:orient="landscape"/>
                  <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
                </w:sectPr>
              </w:pPr>
              <w:r><w:t>Landscape page</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>
      `
    );

    const doc = await DocxParser.parse(await zip.generateAsync({ type: 'arraybuffer' }));
    const pages = new PageLayoutEngine().layout(doc);

    expect(pages).toHaveLength(2);
    expect(pages[1].pageBox.width).toBeGreaterThan(pages[1].pageBox.height);
  });

  it('should preserve a shared page scale so landscape pages render wider than portrait pages', async () => {
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        </Types>
      `
    );
    zip.folder('_rels')!.file(
      '.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rIdOffice" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
        </Relationships>
      `
    );
    zip.folder('word')!.file(
      'document.xml',
      `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p><w:r><w:t>Portrait</w:t></w:r></w:p>
            <w:p>
              <w:pPr>
                <w:sectPr>
                  <w:pgSz w:w="11906" w:h="16838" w:orient="landscape"/>
                  <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
                </w:sectPr>
              </w:pPr>
              <w:r><w:t>Landscape</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>
      `
    );

    const doc = await DocxParser.parse(await zip.generateAsync({ type: 'arraybuffer' }));
    const container = document.createElement('div');
    const renderer = new DocxRenderer(container, { width: 800 });

    renderer.render(doc);

    const pages = Array.from(container.querySelectorAll('[data-testid="docx-page"]')) as HTMLElement[];
    expect(pages).toHaveLength(2);
    expect(parseInt(pages[1].style.width, 10)).toBeGreaterThan(parseInt(pages[0].style.width, 10));
  });

  it('should increment ordered list markers instead of repeating the start value', async () => {
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        </Types>
      `
    );
    zip.folder('_rels')!.file(
      '.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rIdOffice" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
        </Relationships>
      `
    );
    zip.folder('word')!.file(
      'numbering.xml',
      `
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:start w:val="1"/>
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="7"><w:abstractNumId w:val="0"/></w:num>
        </w:numbering>
      `
    );
    zip.folder('word')!.file(
      'document.xml',
      `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="7"/></w:numPr></w:pPr><w:r><w:t>First</w:t></w:r></w:p>
            <w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="7"/></w:numPr></w:pPr><w:r><w:t>Second</w:t></w:r></w:p>
            <w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="7"/></w:numPr></w:pPr><w:r><w:t>Third</w:t></w:r></w:p>
          </w:body>
        </w:document>
      `
    );

    const doc = await DocxParser.parse(await zip.generateAsync({ type: 'arraybuffer' }));
    const container = document.createElement('div');

    new DocxRenderer(container).render(doc);

    const text = container.textContent || '';
    expect(text).toContain('1. First');
    expect(text).toContain('2. Second');
    expect(text).toContain('3. Third');
  });

  it('should parse revisions and cascade text and paragraph styles', async () => {
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        </Types>
      `
    );
    zip.folder('_rels')!.file(
      '.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rIdOffice" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
        </Relationships>
      `
    );
    zip.folder('word')!.file(
      'styles.xml',
      `
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:docDefaults>
            <w:rPrDefault><w:rPr><w:rFonts w:ascii="Aptos"/><w:sz w:val="22"/></w:rPr></w:rPrDefault>
            <w:pPrDefault><w:pPr><w:spacing w:after="120"/></w:pPr></w:pPrDefault>
          </w:docDefaults>
          <w:style w:type="paragraph" w:styleId="BasePara">
            <w:name w:val="Base Paragraph"/>
            <w:pPr>
              <w:jc w:val="center"/>
              <w:ind w:left="720" w:firstLine="360"/>
              <w:spacing w:before="120" w:after="240"/>
            </w:pPr>
            <w:rPr><w:color w:val="336699"/></w:rPr>
          </w:style>
          <w:style w:type="paragraph" w:styleId="DerivedPara">
            <w:basedOn w:val="BasePara"/>
            <w:rPr><w:b/><w:sz w:val="28"/></w:rPr>
          </w:style>
          <w:style w:type="character" w:styleId="StrongChar">
            <w:rPr><w:i/><w:color w:val="AA0000"/></w:rPr>
          </w:style>
        </w:styles>
      `
    );
    zip.folder('word')!.file(
      'document.xml',
      `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr><w:pStyle w:val="DerivedPara"/></w:pPr>
              <w:r><w:rPr><w:rStyle w:val="StrongChar"/></w:rPr><w:t>Styled</w:t></w:r>
              <w:ins w:id="1" w:author="Alice" w:date="2026-04-01T00:00:00Z">
                <w:r><w:t> inserted</w:t></w:r>
              </w:ins>
              <w:del w:id="2" w:author="Bob" w:date="2026-04-02T00:00:00Z">
                <w:r><w:delText> deleted</w:delText></w:r>
              </w:del>
            </w:p>
            <w:sectPr>
              <w:pgSz w:w="11906" w:h="16838"/>
              <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
            </w:sectPr>
          </w:body>
        </w:document>
      `
    );

    const doc = await DocxParser.parse(await zip.generateAsync({ type: 'arraybuffer' }));
    const paragraph = doc.body[0] as any;
    const container = document.createElement('div');
    const renderer = new DocxRenderer(container);

    renderer.render(doc);

    expect(doc.styles.defaults?.run).toMatchObject({ fontFamily: 'Aptos', size: 11 });
    expect(doc.styles.byId.get('BasePara')?.paragraph).toMatchObject({
      alignment: 'center',
      indent: { left: 720, firstLine: 360 },
      spacing: { before: 120, after: 240 }
    });
    expect(doc.styles.byId.get('DerivedPara')?.basedOn).toBe('BasePara');
    expect(doc.styles.byId.get('DerivedPara')?.text).toMatchObject({ bold: true, size: 14 });
    expect(doc.styles.byId.get('StrongChar')?.text).toMatchObject({ italic: true, color: '#AA0000' });
    expect(paragraph.runs.map((run: any) => run.text)).toEqual(['Styled', ' inserted', ' deleted']);
    expect(paragraph.runs[1].revision).toMatchObject({ type: 'insert', author: 'Alice' });
    expect(paragraph.runs[2].revision).toMatchObject({ type: 'delete', author: 'Bob' });
    expect((renderer as any).resolveCanvasFontFamily({ fontFamily: '宋体' })).toContain('Songti SC');
    expect(container.textContent).toContain('Styled inserted');
    expect(container.textContent).not.toContain('deleted');
    expect(container.querySelectorAll('[data-testid="docx-page-canvas"]')).toHaveLength(1);
  });

  it('should clip oversized blocks to the page content area and report overflow', () => {
    const doc: any = {
      sourcePartPath: 'word/document.xml',
      body: [
        {
          type: 'paragraph',
          runs: [{ text: 'Overflow '.repeat(5000) }]
        }
      ],
      headers: new Map(),
      footers: new Map(),
      styles: { byId: new Map() },
      numbering: { abstractNums: new Map(), nums: new Map() },
      settings: { compatibilityFlags: [], unsupported: [] },
      sections: [
        {
          pageSize: { width: 6000, height: 6000 },
          margins: { top: 720, right: 720, bottom: 720, left: 720 }
        }
      ],
      warnings: []
    };
    const pages = new PageLayoutEngine().layout(doc);
    const container = document.createElement('div');
    const renderer = new DocxRenderer(container);

    renderer.render(doc);

    const contentBottom = pages[0].pageBox.height - pages[0].pageBox.margins.bottom;
    const block = pages[0].blocks[0];
    expect(block.overflow).toMatchObject({ clipped: true });
    expect(block.box.y + block.box.height).toBeLessThanOrEqual(contentBottom);
    expect(renderer.warnings.toArray()).toContainEqual(
      expect.objectContaining({
        code: 'renderer.unsupported-feature',
        message: expect.stringContaining('overflow clipped')
      })
    );
  });

  it('should detect titlePg cover pages and use first-page header only for cover pages', async () => {
    const buildDoc = async (titlePage: boolean) => {
      const zip = new JSZip();

      zip.file(
        '[Content_Types].xml',
        `
          <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
            <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
            <Default Extension="xml" ContentType="application/xml"/>
            <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
          </Types>
        `
      );
      zip.folder('_rels')!.file(
        '.rels',
        `
          <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
            <Relationship Id="rIdOffice" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
          </Relationships>
        `
      );
      zip.folder('word')!.file(
        'document.xml',
        `
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
            <w:body>
              <w:p><w:r><w:t>Cover body</w:t></w:r></w:p>
              <w:sectPr>
                ${titlePage ? '<w:titlePg/>' : ''}
                <w:headerReference w:type="first" r:id="rIdFirstHeader"/>
                <w:headerReference w:type="default" r:id="rIdDefaultHeader"/>
                <w:pgSz w:w="11906" w:h="16838"/>
                <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
              </w:sectPr>
            </w:body>
          </w:document>
        `
      );
      zip.folder('word')!.folder('_rels')!.file(
        'document.xml.rels',
        `
          <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
            <Relationship Id="rIdFirstHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
            <Relationship Id="rIdDefaultHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header2.xml"/>
          </Relationships>
        `
      );
      zip.folder('word')!.file(
        'header1.xml',
        '<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>First Header</w:t></w:r></w:p></w:hdr>'
      );
      zip.folder('word')!.file(
        'header2.xml',
        '<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>Default Header</w:t></w:r></w:p></w:hdr>'
      );

      return DocxParser.parse(await zip.generateAsync({ type: 'arraybuffer' }));
    };

    const coverDoc = await buildDoc(true);
    const coverContainer = document.createElement('div');
    new DocxRenderer(coverContainer).render(coverDoc);

    expect(coverDoc.sections[0].titlePage).toBe(true);
    expect(new PageLayoutEngine().layout(coverDoc)[0].isCoverPage).toBe(true);
    expect(coverContainer.querySelector('[data-cover-page="true"]')).toBeTruthy();
    expect(coverContainer.querySelector('[data-testid="docx-header"]')?.textContent).toContain('First Header');

    const normalDoc = await buildDoc(false);
    const normalContainer = document.createElement('div');
    new DocxRenderer(normalContainer).render(normalDoc);

    expect(normalDoc.sections[0].titlePage).toBe(false);
    expect(new PageLayoutEngine().layout(normalDoc)[0].isCoverPage).toBe(false);
    expect(normalContainer.querySelector('[data-cover-page="true"]')).toBeNull();
    expect(normalContainer.querySelector('[data-testid="docx-header"]')?.textContent).toContain('Default Header');
  });
});
