import {
  FileHandler,
  getElementsByLocalName,
  getFirstElementByLocalName,
  getOptionalAttr,
  Logger,
  PackageReader
} from '@opr/shared';
import { PptxDocument, PptxElement, PptxSlide, PptxSlideLayout, PptxSlideMaster, PptxThemeRef } from '../model';

const logger = new Logger('PptxParser');

const PPTX_MAIN_CONTENT_TYPES = [
  'application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml',
  'application/vnd.ms-powerpoint.presentation.macroEnabled.main+xml'
];

export class PptxParser {
  static async parse(buffer: ArrayBuffer): Promise<PptxDocument> {
    try {
      const pkg = await PackageReader.load(buffer);
      const mainPart =
        pkg.findOfficeDocumentPart() || pkg.findMainPartByContentType(PPTX_MAIN_CONTENT_TYPES) || pkg.getPart('ppt/presentation.xml');

      if (!mainPart) {
        return { sourcePartPath: '', slides: [], slideMasters: [], slideLayouts: [] };
      }

      const presentationXml = pkg.readText(mainPart.path);
      if (!presentationXml) {
        return { sourcePartPath: mainPart.path, slides: [], slideMasters: [], slideLayouts: [] };
      }

      const doc = FileHandler.parseXML(presentationXml);
      const rels = pkg.getRelationships(mainPart.path);
      const slideRelationships = rels
        .list()
        .filter(relationship => relationship.type?.endsWith('/slide'));
      const slides = getElementsByLocalName(doc, 'sldId')
        .map((slideNode, index): PptxSlide | undefined => {
          const relationshipId = this.getRelationshipId(slideNode);
          const relationship = relationshipId ? rels.get(relationshipId) || slideRelationships[index] : slideRelationships[index];
          const path = relationship?.resolvedTarget;
          if (!path) {
            return undefined;
          }

          return {
            id: getOptionalAttr(slideNode, 'id') || String(index + 1),
            relationshipId,
            path,
            name: `Slide ${index + 1}`,
            layoutPath: this.resolveFirstRelatedPart(pkg, path, '/slideLayout'),
            elements: this.parseSlide(pkg.readText(path) || '')
          };
        })
        .filter((slide): slide is PptxSlide => Boolean(slide));
      const slideMasters = this.parseSlideMasters(pkg, mainPart.path);
      const slideLayouts = slideMasters.flatMap(master =>
        master.layoutPaths.map(
          (layoutPath): PptxSlideLayout => ({
            path: layoutPath,
            masterPath: master.path,
            name: this.parseSlideLayoutName(pkg.readText(layoutPath) || '')
          })
        )
      );
      const theme = slideMasters.map(master => master.themePath).find(Boolean);

      return {
        sourcePartPath: mainPart.path,
        slides,
        slideMasters,
        slideLayouts,
        theme: theme ? this.parseTheme(pkg, theme) : undefined
      };
    } catch (error) {
      logger.error('Failed to parse PPTX', error);
      throw error;
    }
  }

  private static parseSlide(xmlString: string): PptxSlide['elements'] {
    if (!xmlString) {
      return [];
    }

    const doc = FileHandler.parseXML(xmlString);
    const elements: PptxElement[] = [];

    for (const shape of getElementsByLocalName(doc, 'sp')) {
      const text = getElementsByLocalName(shape, 't')
        .map(node => node.textContent || '')
        .join('');
      if (!text) {
        continue;
      }

      const cNvPr = getFirstElementByLocalName(shape, 'cNvPr');
      elements.push({
        type: 'text',
        id: cNvPr ? getOptionalAttr(cNvPr, 'id') : undefined,
        name: cNvPr ? getOptionalAttr(cNvPr, 'name') : undefined,
        text
      });
    }

    return elements;
  }

  private static getRelationshipId(node: Element): string | undefined {
    const direct =
      node.getAttribute('r:id') ||
      node.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
    if (direct) {
      return direct;
    }

    for (const attribute of Array.from(node.attributes)) {
      if ((attribute.name === 'r:id' || attribute.name.endsWith(':id')) && attribute.value.startsWith('rId')) {
        return attribute.value;
      }
    }

    return undefined;
  }

  private static parseSlideMasters(pkg: PackageReader, presentationPath: string): PptxSlideMaster[] {
    return pkg
      .findRelationshipsByType(
        presentationPath,
        'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster'
      )
      .map(relationship => {
        const masterPath = relationship.resolvedTarget || '';
        const layoutPaths = pkg
          .findRelationshipsByType(
            masterPath,
            'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout'
          )
          .map(layoutRelationship => layoutRelationship.resolvedTarget)
          .filter((path): path is string => Boolean(path));
        const themePath = this.resolveFirstRelatedPart(pkg, masterPath, '/theme');

        return {
          path: masterPath,
          layoutPaths,
          themePath
        };
      })
      .filter(master => Boolean(master.path));
  }

  private static resolveFirstRelatedPart(pkg: PackageReader, sourcePartPath: string, relationshipTypeSuffix: string): string | undefined {
    return pkg
      .getRelationships(sourcePartPath)
      .list()
      .find(relationship => relationship.type?.endsWith(relationshipTypeSuffix))?.resolvedTarget;
  }

  private static parseSlideLayoutName(xmlString: string): string | undefined {
    if (!xmlString) {
      return undefined;
    }

    const doc = FileHandler.parseXML(xmlString);
    const cSld = getFirstElementByLocalName(doc, 'cSld');
    return cSld ? getOptionalAttr(cSld, 'name') : undefined;
  }

  private static parseTheme(pkg: PackageReader, themePath: string): PptxThemeRef {
    const xml = pkg.readText(themePath);
    if (!xml) {
      return { path: themePath };
    }

    const doc = FileHandler.parseXML(xml);
    const theme = getFirstElementByLocalName(doc, 'theme');
    return {
      path: themePath,
      name: theme ? getOptionalAttr(theme, 'name') : undefined
    };
  }
}
