import { describe, expect, it, vi } from 'vitest';
import JSZip from 'jszip';
import { readFileSync } from 'node:fs';
import { loadSampleCase } from '../../../../../samples/utils/SampleCaseLoader';
import { PageLayoutEngine } from '../../layout';
import { DocxNavigationBuilder } from '../../navigation';
import { DocxRenderer } from '../../renderer';
import { DocxParser } from '../DocxParser';
import { StylesParser } from '../StylesParser';

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

  it('should parse and apply default paragraph styles to unstyled paragraphs', () => {
    const styles = StylesParser.parse(`
      <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
          <w:name w:val="Normal"/>
          <w:pPr>
            <w:spacing w:before="300"/>
          </w:pPr>
          <w:rPr>
            <w:sz w:val="60"/>
          </w:rPr>
        </w:style>
      </w:styles>
    `);
    const doc: any = {
      sourcePartPath: 'word/document.xml',
      body: [{ type: 'paragraph', runs: [{ text: 'Unstyled paragraph should use Normal.' }] }],
      headers: new Map(),
      footers: new Map(),
      styles,
      numbering: { abstractNums: new Map(), nums: new Map() },
      settings: { compatibilityFlags: [], unsupported: [] },
      sections: [],
      warnings: []
    };

    const pages = new PageLayoutEngine().layout(doc);

    expect(styles.defaultParagraphStyleId).toBe('Normal');
    expect(pages[0].blocks[0].box.height).toBeGreaterThan(60);
  });

  it('should expose DOCX render options and toggle navigation and revision text', () => {
    const doc: any = {
      sourcePartPath: 'word/document.xml',
      body: [
        { type: 'paragraph', styleId: 'Heading1', runs: [{ text: 'Title' }] },
        { type: 'paragraph', styleId: 'Heading2', runs: [{ text: 'Child Title' }] },
        { type: 'paragraph', runs: [{ text: 'Inserted', revision: { type: 'insert' } }] },
        { type: 'paragraph', runs: [{ text: 'Deleted', revision: { type: 'delete' } }] }
      ],
      headers: new Map(),
      footers: new Map(),
      styles: {
        defaults: { paragraph: {}, run: {} },
        byId: new Map([
          ['Heading1', { id: 'Heading1', type: 'paragraph', name: 'heading 1', text: { bold: true, size: 16 } }],
          ['Heading2', { id: 'Heading2', type: 'paragraph', name: 'heading 2', text: { bold: true, size: 14 } }]
        ])
      },
      numbering: { abstractNums: new Map(), nums: new Map() },
      settings: { compatibilityFlags: [], unsupported: [] },
      sections: [],
      warnings: []
    };
    const container = document.createElement('div');
    const renderer = new DocxRenderer(container, {
      showNavigationPane: true,
      showDeletedRevisionText: true
    });

    renderer.render(doc);

    expect(container.querySelector('[data-testid="docx-navigation-pane"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="docx-navigation-tree"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-nav-heading-id]')).toHaveLength(2);
    expect(container.querySelector('[data-nav-heading-id="heading-2"]')?.textContent).toContain('Child Title');
    expect(container.querySelector('[data-nav-heading-id="heading-2"]')?.getAttribute('data-heading-level')).toBe('2');
    expect(container.querySelector('[data-nav-heading-id="heading-1"]')?.hasAttribute('data-heading-id')).toBe(false);
    expect(renderer.jumpToHeading('heading-2')).toBe(true);
    expect(container.textContent).toContain('Inserted');
    expect(container.textContent).toContain('Deleted');

    renderer.setShowNavigationPane(false);
    expect(container.querySelector('[data-testid="docx-navigation-pane"]')).toBeNull();

    renderer.setShowInsertedRevisionText(false);
    renderer.setShowDeletedRevisionText(false);
    expect(renderer.getRenderOptions()).toMatchObject({
      showInsertedRevisionText: false,
      showDeletedRevisionText: false
    });
    expect(container.textContent).not.toContain('Inserted');
    expect(container.textContent).not.toContain('Deleted');
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

  it('should preserve floating anchor metadata for images and warn about unsupported wrap rendering', async () => {
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
              <w:r>
                <w:drawing>
                  <wp:anchor simplePos="0" relativeHeight="251659264" behindDoc="0" locked="0" layoutInCell="1" allowOverlap="1" distL="114300" distR="228600">
                    <wp:simplePos x="0" y="0"/>
                    <wp:positionH relativeFrom="margin"><wp:posOffset>457200</wp:posOffset></wp:positionH>
                    <wp:positionV relativeFrom="paragraph"><wp:align>top</wp:align></wp:positionV>
                    <wp:extent cx="952500" cy="476250"/>
                    <wp:effectExtent l="0" t="0" r="12700" b="12700"/>
                    <wp:wrapSquare wrapText="bothSides"/>
                    <wp:docPr id="5" name="Floating Picture"/>
                    <a:graphic>
                      <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                        <pic:pic>
                          <pic:blipFill>
                            <a:blip r:embed="rIdImage"/>
                          </pic:blipFill>
                        </pic:pic>
                      </a:graphicData>
                    </a:graphic>
                  </wp:anchor>
                </w:drawing>
              </w:r>
            </w:p>
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
    const paragraph = doc.body[0] as any;
    const floating = paragraph.floatingDrawings[0];

    expect(floating.objectType).toBe('image');
    expect(floating.anchor).toMatchObject({
      drawingId: '5',
      name: 'Floating Picture',
      relativeHeight: 251659264,
      behindDoc: false,
      locked: false,
      layoutInCell: true,
      allowOverlap: true,
      useSimplePosition: false,
      horizontalPosition: { relativeFrom: 'margin', offset: 48 },
      verticalPosition: { relativeFrom: 'paragraph', align: 'top' },
      size: { width: 100, height: 50 },
      wrap: {
        type: 'square',
        textWrap: 'bothSides',
        distances: { left: 12, right: 24 }
      }
    });
    expect(floating.anchor.effectExtent.right).toBeCloseTo(1.333, 2);
    expect(floating.anchor.effectExtent.bottom).toBeCloseTo(1.333, 2);
    expect(floating.drawing).toMatchObject({
      path: 'word/media/image1.png',
      position: {
        width: 100,
        height: 50
      },
      source: {
        relationshipId: 'rIdImage',
        resolvedTarget: 'word/media/image1.png'
      }
    });
    expect(doc.warnings).toContainEqual(
      expect.objectContaining({
        code: 'renderer.unsupported-feature',
        partPath: 'word/document.xml',
        message: expect.stringContaining('wrap mode')
      })
    );
  });

  it('should parse anchored charts into floating drawing metadata using the shared chart model', async () => {
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
        <w:document
          xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
          xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
          xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
          xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart">
          <w:body>
            <w:p>
              <w:r>
                <w:drawing>
                  <wp:anchor simplePos="0" relativeHeight="0" behindDoc="0" locked="0" layoutInCell="1" allowOverlap="1">
                    <wp:simplePos x="0" y="0"/>
                    <wp:positionH relativeFrom="column"><wp:align>center</wp:align></wp:positionH>
                    <wp:positionV relativeFrom="paragraph"><wp:posOffset>914400</wp:posOffset></wp:positionV>
                    <wp:extent cx="1905000" cy="952500"/>
                    <wp:wrapNone/>
                    <wp:docPr id="9" name="Chart 9"/>
                    <a:graphic>
                      <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
                        <c:chart r:id="rIdChart"/>
                      </a:graphicData>
                    </a:graphic>
                  </wp:anchor>
                </w:drawing>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `
    );
    zip.folder('word')!.folder('_rels')!.file(
      'document.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rIdChart" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="charts/chart1.xml"/>
        </Relationships>
      `
    );
    zip.folder('word')!.folder('charts')!.file(
      'chart1.xml',
      `
        <c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart">
          <c:chart>
            <c:plotArea>
              <c:barChart>
                <c:ser>
                  <c:idx val="0"/>
                  <c:order val="0"/>
                  <c:tx><c:v>Series 1</c:v></c:tx>
                  <c:cat><c:strRef><c:strCache><c:pt idx="0"><c:v>A</c:v></c:pt></c:strCache></c:strRef></c:cat>
                  <c:val><c:numRef><c:numCache><c:pt idx="0"><c:v>1</c:v></c:pt></c:numCache></c:numRef></c:val>
                </c:ser>
              </c:barChart>
            </c:plotArea>
          </c:chart>
        </c:chartSpace>
      `
    );

    const doc = await DocxParser.parse(await zip.generateAsync({ type: 'arraybuffer' }));
    const floating = (doc.body[0] as any).floatingDrawings[0];
    const container = document.createElement('div');
    const fakeCtx = {
      scale: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 32 })),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn()
    } as any;
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => fakeCtx);

    new DocxRenderer(container).render(doc);

    expect(floating.objectType).toBe('chart');
    expect(floating.anchor).toMatchObject({
      drawingId: '9',
      name: 'Chart 9',
      horizontalPosition: { relativeFrom: 'column', align: 'center' },
      verticalPosition: { relativeFrom: 'paragraph', offset: 96 },
      size: { width: 200, height: 100 },
      wrap: { type: 'none' }
    });
    expect(floating.drawing).toMatchObject({
      id: '9',
      name: 'Chart 9',
      type: 'chart',
      chartData: {
        type: 'bar',
        categories: ['A'],
        is3D: false
      },
      source: {
        relationshipId: 'rIdChart',
        resolvedTarget: 'word/charts/chart1.xml'
      },
      position: {
        width: 200,
        height: 100
      }
    });
    expect(fakeCtx.fillRect).toHaveBeenCalledWith(297, 192, 200, 100);

    getContextSpy.mockRestore();
  });

  it('should parse OMML equations into shared math model and render a readable linearized fallback', async () => {
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
        <w:document
          xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
          xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">
          <w:body>
            <w:p>
              <w:r><w:t>Eq: </w:t></w:r>
              <m:oMath>
                <m:sSup>
                  <m:e><m:r><m:t>x</m:t></m:r></m:e>
                  <m:sup><m:r><m:t>2</m:t></m:r></m:sup>
                </m:sSup>
                <m:r><m:t> + </m:t></m:r>
                <m:f>
                  <m:num><m:r><m:t>a</m:t></m:r></m:num>
                  <m:den><m:r><m:t>b</m:t></m:r></m:den>
                </m:f>
                <m:r><m:t> = </m:t></m:r>
                <m:rad>
                  <m:deg/>
                  <m:e><m:r><m:t>y</m:t></m:r></m:e>
                </m:rad>
              </m:oMath>
            </w:p>
            <w:p>
              <m:oMathPara>
                <m:oMath>
                  <m:nary>
                    <m:naryPr><m:chr m:val="∑"/></m:naryPr>
                    <m:sub><m:r><m:t>i=1</m:t></m:r></m:sub>
                    <m:sup><m:r><m:t>n</m:t></m:r></m:sup>
                    <m:e><m:r><m:t>i</m:t></m:r></m:e>
                  </m:nary>
                </m:oMath>
              </m:oMathPara>
            </w:p>
          </w:body>
        </w:document>
      `
    );

    const doc = await DocxParser.parse(await zip.generateAsync({ type: 'arraybuffer' }));
    const inlineMath = (doc.body[0] as any).runs[1].math;
    const blockMath = (doc.body[1] as any).runs[0].math;
    const container = document.createElement('div');

    new DocxRenderer(container).render(doc);

    expect(inlineMath).toMatchObject({
      type: 'math',
      displayMode: 'inline',
      body: {
        type: 'sequence'
      }
    });
    expect(blockMath).toMatchObject({
      type: 'math',
      displayMode: 'block'
    });
    expect(container.textContent).toContain('Eq: x² + (a)/(b) = √(y)');
    expect(container.textContent).toContain('∑_(i=1)^n i');
    expect(container.querySelector('[data-testid="docx-math"][data-display-mode="inline"]')?.textContent).toBe('x² + (a)/(b) = √(y)');
    expect(container.querySelector('[data-testid="docx-math"][data-display-mode="block"]')?.textContent).toBe('∑_(i=1)^n i');
    expect(doc.warnings).toEqual([]);
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
    expect(pages[1].section?.pageSize?.orientation).toBe('landscape');
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

  it('should parse bookmarks and hyperlinks and expose them in rendered DOM semantics', async () => {
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
            <w:p>
              <w:bookmarkStart w:id="7" w:name="SectionOne"/>
              <w:r><w:t>Section start</w:t></w:r>
              <w:bookmarkEnd w:id="7"/>
            </w:p>
            <w:p>
              <w:hyperlink r:id="rIdLink" w:tooltip="Visit Example">
                <w:r><w:t>External Link</w:t></w:r>
              </w:hyperlink>
            </w:p>
            <w:p>
              <w:hyperlink w:anchor="SectionOne">
                <w:r><w:t>Jump Back</w:t></w:r>
              </w:hyperlink>
            </w:p>
          </w:body>
        </w:document>
      `
    );
    zip.folder('word')!.folder('_rels')!.file(
      'document.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rIdLink" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com" TargetMode="External"/>
        </Relationships>
      `
    );

    const doc = await DocxParser.parse(await zip.generateAsync({ type: 'arraybuffer' }));
    const container = document.createElement('div');

    new DocxRenderer(container).render(doc);

    const bookmarkRun = (doc.body[0] as any).runs[0];
    const externalRun = (doc.body[1] as any).runs[0];
    const internalRun = (doc.body[2] as any).runs[0];
    const links = Array.from(container.querySelectorAll('[data-testid="docx-hyperlink"]')) as HTMLAnchorElement[];
    const bookmark = container.querySelector('#docx-bookmark-SectionOne');

    expect(bookmarkRun.bookmarks).toMatchObject([
      {
        id: '7',
        name: 'SectionOne',
        target: '#docx-bookmark-SectionOne'
      }
    ]);
    expect(externalRun.hyperlink).toMatchObject({
      kind: 'hyperlink',
      target: 'https://example.com',
      targetMode: 'External',
      tooltip: 'Visit Example'
    });
    expect(internalRun.hyperlink).toMatchObject({
      kind: 'hyperlink',
      target: '#docx-bookmark-SectionOne',
      targetMode: 'Internal',
      anchor: 'SectionOne'
    });
    expect(bookmark).toBeTruthy();
    expect(links).toHaveLength(2);
    expect(links[0].textContent).toBe('External Link');
    expect(links[0].getAttribute('href')).toBe('https://example.com');
    expect(links[0].target).toBe('_blank');
    expect(links[1].textContent).toBe('Jump Back');
    expect(links[1].getAttribute('href')).toBe('#docx-bookmark-SectionOne');
    expect(links[1].dataset.bookmarkTarget).toBe('SectionOne');
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
              <w:snapToGrid w:val="0"/>
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
      snapToGrid: false,
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
        code: 'renderer.clipped-content',
        impact: 'clipped',
        message: expect.stringContaining('overflow clipped')
      })
    );
  });

  it('should wrap CJK text and align centered run fragments as whole lines', () => {
    const doc: any = {
      sourcePartPath: 'word/document.xml',
      body: [
        {
          type: 'paragraph',
          style: {
            alignment: 'center',
            text: { size: 24, fontFamily: 'SimSun' }
          },
          runs: [{ text: '编号' }, { text: '2' }]
        },
        {
          type: 'paragraph',
          style: {
            text: { size: 22, fontFamily: 'SimSun' }
          },
          runs: [{ text: '本办法适用于公司各部门收费所的收费系统监控系统通信系统供配电系统'.repeat(3) }]
        }
      ],
      headers: new Map(),
      footers: new Map(),
      styles: { byId: new Map(), defaults: { run: { size: 11 } } },
      numbering: { abstractNums: new Map(), nums: new Map() },
      settings: { compatibilityFlags: [], unsupported: [] },
      sections: [
        {
          pageSize: { width: 6000, height: 12000 },
          margins: { top: 720, right: 720, bottom: 720, left: 720 }
        }
      ],
      warnings: []
    };
    const pages = new PageLayoutEngine().layout(doc);
    const container = document.createElement('div');
    const fakeCtx = {
      scale: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn((text: string) => ({ width: Array.from(text).length * 10 })),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn()
    } as any;
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => fakeCtx);

    new DocxRenderer(container).render(doc);

    const centeredCalls = (fakeCtx.fillText as ReturnType<typeof vi.fn>).mock.calls.filter(
      call => call[0] === '编号' || call[0] === '2'
    );
    expect(centeredCalls).toHaveLength(2);
    expect(centeredCalls[1][1]).toBeGreaterThan(centeredCalls[0][1] + 15);
    expect(pages[0].blocks[1].box.height).toBeGreaterThan(120);
    expect(pages[0].blocks[1].overflow).toBeUndefined();

    getContextSpy.mockRestore();
  });

  it('should support renderer zoom and table rows sized by cell content', () => {
    const doc: any = {
      sourcePartPath: 'word/document.xml',
      body: [
        {
          type: 'table',
          gridWidths: [1440, 4320],
          rows: [
            {
              cells: [
                { blocks: [{ type: 'paragraph', runs: [{ text: '检查时间' }] }] },
                { blocks: [{ type: 'paragraph', runs: [{ text: '2026年04月28日' }] }] }
              ]
            },
            {
              cells: [
                { blocks: [{ type: 'paragraph', runs: [{ text: '检查内容' }] }] },
                {
                  blocks: [
                    {
                      type: 'paragraph',
                      runs: [{ text: '现场作业车辆及机械是否安装警示灯或闪光箭头。特种设备现场安装拆除是否有相应作业资质。'.repeat(5) }]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'paragraph',
          runs: [{ text: '检查人员签字:\t受检单位（代表）签字:' }]
        }
      ],
      headers: new Map(),
      footers: new Map(),
      styles: { byId: new Map(), defaults: { run: { size: 11 } } },
      numbering: { abstractNums: new Map(), nums: new Map() },
      settings: { compatibilityFlags: [], unsupported: [] },
      sections: [
        {
          pageSize: { width: 11906, height: 16838 },
          margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      ],
      warnings: []
    };
    const fakeCtx = {
      scale: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn((text: string) => ({ width: Array.from(text).length * 8 })),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn()
    } as any;
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => fakeCtx);
    const container = document.createElement('div');
    const renderer = new DocxRenderer(container, { width: 794, zoom: 1 });
    const pages = new PageLayoutEngine().layout(doc);

    renderer.render(doc);
    const pageBeforeZoom = container.querySelector('[data-testid="docx-page"]') as HTMLElement;
    const columnWidths = (renderer as any).resolveTableColumnWidths(doc.body[0], pages[0].blocks[0].box.width);
    const rowHeights = (renderer as any).resolveTableRowHeights(fakeCtx, doc.body[0], doc, columnWidths, { pageIndex: 0, totalPages: 1 });
    const signatureLines = (renderer as any).layoutParagraphLines(
      fakeCtx,
      doc.body[1],
      {},
      { size: 11 },
      [{ text: doc.body[1].runs[0].text, style: { size: 11 } }],
      '',
      0,
      360,
      0,
      96
    );
    const tabItem = signatureLines[0].items.find((item: any) => item.text === '' && item.width > 0);

    expect(renderer.getZoom()).toBe(1);
    expect(pageBeforeZoom.style.width).toBe('794px');
    expect(pages[0].blocks[0].box.height).toBeGreaterThan(120);
    expect(rowHeights[0]).toBeLessThan(60);
    expect(rowHeights[1]).toBeGreaterThan(rowHeights[0] + 40);
    expect(tabItem?.width).toBeGreaterThan(30);

    const zoomEvents: number[] = [];
    container.addEventListener('docx-zoom-change', event => {
      zoomEvents.push((event as CustomEvent<{ zoom: number }>).detail.zoom);
    });
    renderer.zoomTo(1.5);
    const pageAfterZoom = container.querySelector('[data-testid="docx-page"]') as HTMLElement;
    expect(renderer.getZoom()).toBe(1.5);
    expect(zoomEvents).toEqual([1.5]);
    expect(pageAfterZoom.style.width).toBe('1191px');

    getContextSpy.mockRestore();
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

  it('should render page background, text watermarks, and exact paragraph line height', async () => {
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
          <w:background w:color="FFF2CC"/>
          <w:body>
            <w:p>
              <w:pPr>
                <w:spacing w:line="600" w:lineRule="exact"/>
                <w:ind w:left="720" w:firstLine="360"/>
              </w:pPr>
              <w:r><w:t>Line height and indent</w:t></w:r>
            </w:p>
            <w:sectPr>
              <w:headerReference w:type="default" r:id="rIdHeader"/>
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
        </Relationships>
      `
    );
    zip.folder('word')!.file(
      'header1.xml',
      `
        <w:hdr
          xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
          xmlns:v="urn:schemas-microsoft-com:vml"
          xmlns:o="urn:schemas-microsoft-com:office:office">
          <w:p>
            <w:r>
              <w:pict>
                <v:shape fillcolor="#d9d9d9" style="rotation:315;opacity:.25">
                  <v:textpath string="DRAFT" style="font-family:SimSun;font-size:48pt"/>
                </v:shape>
              </w:pict>
            </w:r>
          </w:p>
        </w:hdr>
      `
    );

    const doc = await DocxParser.parse(await zip.generateAsync({ type: 'arraybuffer' }));
    const pages = new PageLayoutEngine().layout(doc);
    const fills: Array<{ style: string; args: unknown[] }> = [];
    const fakeCtx = {
      scale: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(function (this: any, ...args: unknown[]) {
        fills.push({ style: this.fillStyle, args });
      }),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn((text: string) => ({ width: Array.from(text).length * 10 })),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn()
    } as any;
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => fakeCtx);
    const container = document.createElement('div');

    new DocxRenderer(container).render(doc);

    expect(doc.background).toEqual({ color: '#FFF2CC' });
    expect(doc.headers.get('rIdHeader')?.watermarks?.[0]).toMatchObject({
      type: 'text',
      text: 'DRAFT',
      color: '#d9d9d9',
      opacity: 0.25,
      rotation: 315,
      fontFamily: 'SimSun',
      fontSize: 48
    });
    expect(fills).toContainEqual(
      expect.objectContaining({ style: '#FFF2CC', args: [0, 0, pages[0].pageBox.width, pages[0].pageBox.height] })
    );
    expect(fakeCtx.fillText).toHaveBeenCalledWith('DRAFT', 0, 0);
    expect(fakeCtx.rotate).toHaveBeenCalledWith((315 * Math.PI) / 180);
    expect(pages[0].blocks[0].box.height).toBeGreaterThanOrEqual(40);

    getContextSpy.mockRestore();
  });

  it('should honor disabled run bold, theme fonts, cached page breaks, and mixed CJK wrapping', async () => {
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
            <w:rPrDefault>
              <w:rPr>
                <w:rFonts w:asciiTheme="minorHAnsi" w:eastAsiaTheme="minorEastAsia" w:hAnsiTheme="minorHAnsi"/>
                <w:sz w:val="24"/>
              </w:rPr>
            </w:rPrDefault>
          </w:docDefaults>
          <w:style w:type="paragraph" w:styleId="Heading1">
            <w:name w:val="heading 1"/>
            <w:rPr><w:b/><w:sz w:val="32"/></w:rPr>
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
              <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
              <w:r>
                <w:rPr><w:b w:val="0"/></w:rPr>
                <w:t>Heading should not be bold</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:r><w:t>Three.js和CesiumJS实现数字孪生</w:t></w:r>
            </w:p>
            <w:p>
              <w:r><w:lastRenderedPageBreak/><w:t>Second rendered page</w:t></w:r>
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
    const renderer = new DocxRenderer(document.createElement('div'));
    const heading = doc.body[0] as any;
    const headingStyle = (renderer as any).resolveParagraphStyle(doc, heading);
    const headingRuns = (renderer as any).createRenderableRuns(heading, doc, { pageIndex: 0, totalPages: 2 }, headingStyle.text);

    expect(doc.styles.defaults?.run).toMatchObject({
      fontFamily: '等线',
      fontFallback: expect.arrayContaining(['Calibri'])
    });
    expect(heading.runs[0].style.bold).toBe(false);
    expect(headingRuns[0].style.bold).toBe(false);
    expect((doc.body[2] as any).runs[0].breaks).toContain('renderedPage');
    expect(new PageLayoutEngine().layout(doc)).toHaveLength(2);
    expect((renderer as any).splitTextForWrap('Three.js和CesiumJS实现')).toEqual(['Three.js', '和', 'CesiumJS', '实现']);
  });

  it('should keep the playground gis.docx pagination close to the Office-rendered document', async () => {
    const source = readFileSync('../../playground/public/gis.docx');
    const doc = await DocxParser.parse(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength));
    const pages = new PageLayoutEngine().layout(doc);

    expect(doc.body[0].type).toBe('paragraph');
    expect((doc.body[0] as any).runs[0].style).toMatchObject({ bold: false });
    expect(doc.styles.defaults?.run).toMatchObject({
      fontFamily: '等线',
      fontFallback: expect.arrayContaining(['Calibri'])
    });
    expect(doc.sections[0].docGrid).toMatchObject({ type: 'lines', linePitch: 312 });
    expect((new PageLayoutEngine() as any).getSectionLinePitch(doc.sections[0])).toBe(36);
    expect(doc.body.flatMap((block: any) => (block.type === 'paragraph' ? block.runs : [])).filter(run => run.breaks?.includes('renderedPage')))
      .toHaveLength(8);
    expect(pages).toHaveLength(11);
    expect(pages.some(page => page.blocks.some(block => block.overflow?.clipped))).toBe(false);
  });

  it('should keep the playground safety-check DOCX table on one rendered page', async () => {
    const source = readFileSync('../../playground/public/测试docx2.docx');
    const doc = await DocxParser.parse(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength));
    const pages = new PageLayoutEngine().layout(doc);
    const table = doc.body.find((block: any) => block.type === 'table') as any;
    const checkContentParagraph = table.rows[3].cells[1].blocks[0];
    const checkContentText = checkContentParagraph.runs.map((run: any) => run.text).join('');

    expect(pages).toHaveLength(1);
    expect(table.rows).toHaveLength(5);
    expect(table.indent).toMatchObject({ value: 0, type: 'dxa' });
    expect(table.layout).toBe('autofit');
    expect(table.cellMargins).toMatchObject({ top: 0, left: 108, bottom: 0, right: 108 });
    expect(table.rows[3].height).toMatchObject({ value: 504, rule: 'atLeast' });
    expect(table.rows[0].cells[0].verticalAlignment).toBe('top');
    expect(checkContentText).toContain('1:现场作业车辆及机械是否安装警示灯或闪光箭头。\n2:特种设备现场安装、拆除是否有相应作业资质。');
    expect(checkContentParagraph.runs.flatMap((run: any) => run.breaks || [])).toHaveLength(0);
    expect(pages.some(page => page.blocks.some(block => block.overflow?.clipped))).toBe(false);
  });

  it('should position DOCX tables from table indentation and alignment metadata', () => {
    const table = {
      type: 'table' as const,
      indent: { type: 'dxa' as const, value: 720 },
      gridWidths: [1440],
      rows: [
        {
          cells: [
            {
              blocks: [{ type: 'paragraph' as const, runs: [{ text: 'Indented table' }] }]
            }
          ]
        }
      ]
    };
    const doc = {
      sourcePartPath: 'word/document.xml',
      body: [table],
      headers: new Map(),
      footers: new Map(),
      styles: { byId: new Map() },
      numbering: { abstractNums: new Map(), nums: new Map() },
      settings: {},
      sections: [{ pageSize: { width: 9000, height: 9000 }, margins: { left: 900, right: 900, top: 900, bottom: 900 } }],
      warnings: []
    };
    const page = new PageLayoutEngine().layout(doc)[0];

    expect(page.blocks[0].box.x).toBe(108);
    expect(page.blocks[0].box.width).toBe(96);
  });
});
