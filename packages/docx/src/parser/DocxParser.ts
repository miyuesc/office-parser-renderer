import { Logger, PackagePart, PackageReader, WarningCollector } from '@opr/shared';
import { DocxDocument } from '../model';
import { DocxNavigationBuilder } from '../navigation';
import { DocumentParser } from './DocumentParser';
import { HeaderFooterParser } from './HeaderFooterParser';
import { NumberingParser } from './NumberingParser';
import { SettingsParser } from './SettingsParser';
import { StylesParser } from './StylesParser';

const logger = new Logger('DocxParser');

const DOCX_MAIN_CONTENT_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml',
  'application/vnd.ms-word.document.macroEnabled.main+xml'
];

export class DocxParser {
  static async parse(buffer: ArrayBuffer): Promise<DocxDocument> {
    const warnings = new WarningCollector();

    try {
      const pkg = await PackageReader.load(buffer);
      const mainPart = this.findMainDocumentPart(pkg, warnings);

      if (!mainPart) {
        warnings.missingPart('word/document.xml', 'DOCX main document part was not found');
        return this.emptyDocument(warnings);
      }

      const documentXml = pkg.readText(mainPart.path);
      if (!documentXml) {
        warnings.missingPart(mainPart.path, 'DOCX main document part is empty');
        return this.emptyDocument(warnings, mainPart.path);
      }

      const parsedDocument = DocumentParser.parse(documentXml, { pkg, sourcePartPath: mainPart.path });
      const styles = StylesParser.parse(pkg.readText('word/styles.xml'));
      const numbering = NumberingParser.parse(pkg.readText('word/numbering.xml'));
      const settings = SettingsParser.parse(pkg.readText('word/settings.xml'));
      const headerRefs = parsedDocument.sections.flatMap(section => section.headerRefs || []);
      const footerRefs = parsedDocument.sections.flatMap(section => section.footerRefs || []);
      const headerFooter = HeaderFooterParser.parseReferencedParts(pkg, mainPart.path, headerRefs, footerRefs);

      for (const unsupported of settings.unsupported) {
        warnings.unsupportedFeature(`DOCX setting is recorded but not rendered: ${unsupported}`, 'word/settings.xml');
      }

      const document: DocxDocument = {
        sourcePartPath: mainPart.path,
        body: parsedDocument.body,
        headers: headerFooter.headers,
        footers: headerFooter.footers,
        styles,
        numbering,
        settings,
        sections: parsedDocument.sections,
        warnings: warnings.toArray()
      };

      document.navigation = DocxNavigationBuilder.build(document);
      return document;
    } catch (error) {
      logger.error('Failed to parse DOCX', error);
      throw error;
    }
  }

  private static findMainDocumentPart(pkg: PackageReader, warnings: WarningCollector): PackagePart | undefined {
    const byRelationship = pkg.findOfficeDocumentPart();
    if (byRelationship) {
      return byRelationship;
    }

    const byContentType = pkg.findMainPartByContentType(DOCX_MAIN_CONTENT_TYPES);
    if (byContentType) {
      return byContentType;
    }

    const fallback = pkg.getPart('word/document.xml');
    if (!fallback) {
      warnings.missingPart('_rels/.rels', 'Root relationships did not identify an office document part');
    }

    return fallback;
  }

  private static emptyDocument(warnings: WarningCollector, sourcePartPath = ''): DocxDocument {
    return {
      sourcePartPath,
      body: [],
      headers: new Map(),
      footers: new Map(),
      styles: { byId: new Map() },
      numbering: { abstractNums: new Map(), nums: new Map() },
      settings: { compatibilityFlags: [], unsupported: [] },
      sections: [],
      navigation: { headings: [], toc: [], pages: [] },
      warnings: warnings.toArray()
    };
  }
}
