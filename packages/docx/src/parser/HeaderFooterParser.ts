import { FileHandler, getFirstElementByLocalName, PackageReader, RelationshipTarget } from '@opr/shared';
import { DocxHeaderFooterPart, DocxHeaderFooterRef } from '../model';
import { DocumentParser } from './DocumentParser';

export class HeaderFooterParser {
  static parseReferencedParts(
    pkg: PackageReader,
    sourcePartPath: string,
    headerRefs: DocxHeaderFooterRef[],
    footerRefs: DocxHeaderFooterRef[]
  ): {
    headers: Map<string, DocxHeaderFooterPart>;
    footers: Map<string, DocxHeaderFooterPart>;
  } {
    const rels = pkg.getRelationships(sourcePartPath);
    const headers = new Map<string, DocxHeaderFooterPart>();
    const footers = new Map<string, DocxHeaderFooterPart>();

    for (const ref of headerRefs) {
      const relationship = rels.get(ref.relationshipId);
      const part = relationship ? this.parsePart(pkg, relationship, 'header', ref.type) : undefined;
      if (part) {
        ref.partPath = part.partPath;
        headers.set(ref.relationshipId, part);
      }
    }

    for (const ref of footerRefs) {
      const relationship = rels.get(ref.relationshipId);
      const part = relationship ? this.parsePart(pkg, relationship, 'footer', ref.type) : undefined;
      if (part) {
        ref.partPath = part.partPath;
        footers.set(ref.relationshipId, part);
      }
    }

    return { headers, footers };
  }

  private static parsePart(
    pkg: PackageReader,
    relationship: RelationshipTarget,
    type: 'header' | 'footer',
    variant: string
  ): DocxHeaderFooterPart | undefined {
    if (!relationship.resolvedTarget || relationship.targetMode === 'External') {
      return undefined;
    }

    const xml = pkg.readText(relationship.resolvedTarget);
    if (!xml) {
      return undefined;
    }

    const doc = FileHandler.parseXML(xml);
    const root = getFirstElementByLocalName(doc, type === 'header' ? 'hdr' : 'ftr');
    if (!root) {
      return undefined;
    }

    return {
      relationshipId: relationship.id,
      type,
      variant,
      partPath: relationship.resolvedTarget,
      blocks: DocumentParser.parseBlocksFromElement(root, { pkg, sourcePartPath: relationship.resolvedTarget })
    };
  }
}
