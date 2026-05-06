import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { ContentTypesRegistry } from '../ContentTypesRegistry';
import { PackageReader } from '../PackageReader';
import { RelationshipsResolver } from '../RelationshipsResolver';
import { WarningCollector } from '../WarningCollector';
import { getElementsByLocalName, getOptionalAttr, parseBooleanAttr, parseNumberAttr, parseUnitValue } from '../XmlHelper';

describe('ContentTypesRegistry', () => {
  it('should resolve override and default content types', () => {
    const registry = ContentTypesRegistry.fromXML(`
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="xml" ContentType="application/xml"/>
        <Default Extension="png" ContentType="image/png"/>
        <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
      </Types>
    `);

    expect(registry.getContentType('xl/workbook.xml')).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml'
    );
    expect(registry.getContentType('/xl/media/image1.png')).toBe('image/png');
  });
});

describe('RelationshipsResolver', () => {
  it('should resolve internal and external targets', () => {
    const resolver = RelationshipsResolver.fromXML(
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="worksheet" Target="worksheets/sheet1.xml"/>
          <Relationship Id="rId2" Type="hyperlink" Target="https://example.com" TargetMode="External"/>
        </Relationships>
      `,
      'xl/workbook.xml'
    );

    expect(resolver.getTarget('rId1')).toBe('xl/worksheets/sheet1.xml');
    expect(resolver.getTarget('rId2')).toBeUndefined();
    expect(resolver.get('rId2')?.targetMode).toBe('External');
    expect(resolver.findByType('hyperlink')[0]?.target).toBe('https://example.com');
  });
});

describe('PackageReader', () => {
  it('should load parts, content types and relationships from a package', async () => {
    const zip = new JSZip();
    zip.file(
      '_rels/.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rIdOffice" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
        </Relationships>
      `
    );
    zip.file(
      '[Content_Types].xml',
      `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="xml" ContentType="application/xml"/>
          <Default Extension="png" ContentType="image/png"/>
          <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
        </Types>
      `
    );
    zip.folder('xl')!.file('workbook.xml', '<workbook />');
    zip.folder('xl')!.folder('_rels')!.file(
      'workbook.xml.rels',
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Target="worksheets/sheet1.xml"/>
          <Relationship Id="rIdExternalImage" Type="image" Target="https://example.com/image.png" TargetMode="External"/>
        </Relationships>
      `
    );
    zip.folder('xl')!.folder('worksheets')!.file('sheet1.xml', '<worksheet />');
    zip.folder('xl')!.folder('media')!.file('image1.png', new Uint8Array([1, 2, 3]));

    const buffer = await zip.generateAsync({ type: 'arraybuffer' });
    const pkg = await PackageReader.load(buffer);

    expect(pkg.readText('xl/workbook.xml')).toContain('<workbook');
    expect(pkg.getPart('xl/workbook.xml')?.contentType).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml'
    );
    expect(pkg.getRelationships('xl/workbook.xml').getTarget('rId1')).toBe('xl/worksheets/sheet1.xml');
    expect(pkg.findOfficeDocumentPart()?.path).toBe('xl/workbook.xml');
    expect(
      pkg.findMainPartByContentType(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml'
      )?.path
    ).toBe('xl/workbook.xml');
    expect(pkg.getRelatedPart('xl/workbook.xml', 'rId1')?.path).toBe('xl/worksheets/sheet1.xml');
    expect(pkg.getRelatedPart('xl/workbook.xml', 'rIdExternalImage')).toBeUndefined();
    expect(pkg.getMediaAsset('xl/media/image1.png')?.contentType).toBe('image/png');
  });
});

describe('XmlHelper', () => {
  it('should read XML nodes and primitive values without depending on namespace prefixes', () => {
    const doc = new DOMParser().parseFromString(
      '<root xmlns:r="urn:test"><r:item enabled="1" count="2" width="12.5pt"/></root>',
      'text/xml'
    );
    const item = getElementsByLocalName(doc, 'item')[0];

    expect(item).toBeDefined();
    expect(getOptionalAttr(item, 'enabled')).toBe('1');
    expect(parseBooleanAttr(getOptionalAttr(item, 'enabled'))).toBe(true);
    expect(parseNumberAttr(getOptionalAttr(item, 'count'))).toBe(2);
    expect(parseUnitValue(getOptionalAttr(item, 'width'))).toBe(12.5);
  });
});

describe('WarningCollector', () => {
  it('should collect package and renderer warnings with stable codes', () => {
    const warnings = new WarningCollector();

    warnings.missingPart('xl/missing.xml');
    warnings.unsupportedFeature('Gradient fill is not rendered yet', 'xl/styles.xml');

    expect(warnings.toArray()).toMatchObject([
      {
        code: 'package.missing-part',
        partPath: 'xl/missing.xml',
        category: 'package',
        severity: 'warning'
      },
      {
        code: 'renderer.unsupported-feature',
        partPath: 'xl/styles.xml',
        category: 'fidelity',
        impact: 'unsupported',
        severity: 'info'
      }
    ]);
    expect(warnings.bySeverity('warning')).toHaveLength(1);
  });

  it('should classify renderer fidelity warnings by impact', () => {
    const warnings = new WarningCollector();

    warnings.degradedFeature('Chart labels are approximated', 'xl/charts/chart1.xml', 'rIdChart');
    warnings.clippedContent('Floating object is clipped to page bounds', 'word/document.xml');
    warnings.fallbackFeature('OMML uses linear text fallback', 'word/document.xml');

    expect(warnings.byImpact('degraded')).toMatchObject([
      {
        code: 'renderer.degraded-feature',
        category: 'fidelity',
        impact: 'degraded',
        severity: 'warning',
        relationshipId: 'rIdChart'
      }
    ]);
    expect(warnings.byImpact('clipped')).toHaveLength(1);
    expect(warnings.byImpact('fallback')).toHaveLength(1);
  });
});
