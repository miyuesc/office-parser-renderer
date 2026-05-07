import { FileHandler, getFirstElementByLocalName, PackageReader, RelationshipTarget, WarningCollector } from '@opr/shared';
import { DocxHeaderFooterPart, DocxHeaderFooterRef, DocxWatermark } from '../model';
import { DocumentParser } from './DocumentParser';

export class HeaderFooterParser {
  static parseReferencedParts(
    pkg: PackageReader,
    sourcePartPath: string,
    headerRefs: DocxHeaderFooterRef[],
    footerRefs: DocxHeaderFooterRef[],
    warnings?: WarningCollector
  ): {
    headers: Map<string, DocxHeaderFooterPart>;
    footers: Map<string, DocxHeaderFooterPart>;
  } {
    const rels = pkg.getRelationships(sourcePartPath);
    const headers = new Map<string, DocxHeaderFooterPart>();
    const footers = new Map<string, DocxHeaderFooterPart>();

    for (const ref of headerRefs) {
      const relationship = rels.get(ref.relationshipId);
      const part = relationship ? this.parsePart(pkg, relationship, 'header', ref.type, warnings) : undefined;
      if (part) {
        ref.partPath = part.partPath;
        headers.set(ref.relationshipId, part);
      }
    }

    for (const ref of footerRefs) {
      const relationship = rels.get(ref.relationshipId);
      const part = relationship ? this.parsePart(pkg, relationship, 'footer', ref.type, warnings) : undefined;
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
    variant: string,
    warnings?: WarningCollector
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
      blocks: DocumentParser.parseBlocksFromElement(root, { pkg, sourcePartPath: relationship.resolvedTarget, warnings }),
      watermarks: this.parseWatermarks(root)
    };
  }

  private static parseWatermarks(root: Element): DocxWatermark[] | undefined {
    const watermarks = Array.from(root.querySelectorAll('*'))
      .filter(node => node.localName === 'textpath')
      .map(textPath => this.parseTextWatermark(textPath as Element))
      .filter((item): item is DocxWatermark => !!item);

    return watermarks.length > 0 ? watermarks : undefined;
  }

  private static parseTextWatermark(textPath: Element): DocxWatermark | undefined {
    const text = textPath.getAttribute('string') || textPath.getAttribute('o:string') || '';
    if (!text) {
      return undefined;
    }

    const shape = this.closestAncestorByLocalName(textPath, 'shape');
    const shapeStyle = this.parseStyleAttribute(shape?.getAttribute('style') || '');
    const textPathStyle = this.parseStyleAttribute(textPath.getAttribute('style') || '');
    const color = shape?.getAttribute('fillcolor') || shape?.getAttribute('strokecolor') || undefined;
    const opacity = this.parseOpacity(shapeStyle.opacity || shape?.getAttribute('opacity') || shape?.getAttribute('fill-opacity'));

    return {
      type: 'text',
      text,
      color: color ? this.toCssColor(color) : undefined,
      opacity,
      rotation: this.parseNumber(shapeStyle.rotation || shapeStyle['mso-rotation']) ?? 315,
      fontFamily: textPathStyle['font-family']?.replace(/^['"]|['"]$/g, '') || 'Arial',
      fontSize: this.parseNumber(textPathStyle['font-size']) || 54
    };
  }

  private static closestAncestorByLocalName(node: Element, localName: string): Element | undefined {
    let current = node.parentElement;
    while (current) {
      if (current.localName === localName) {
        return current;
      }
      current = current.parentElement;
    }
    return undefined;
  }

  private static parseStyleAttribute(style: string): Record<string, string> {
    return style.split(';').reduce(
      (parsed, declaration) => {
        const [rawName, ...rawValue] = declaration.split(':');
        const name = rawName?.trim();
        const value = rawValue.join(':').trim();
        if (name && value) {
          parsed[name] = value;
        }
        return parsed;
      },
      {} as Record<string, string>
    );
  }

  private static parseOpacity(value?: string | null): number | undefined {
    if (!value) {
      return undefined;
    }

    const normalized = value.trim().endsWith('%') ? Number(value.trim().slice(0, -1)) / 100 : Number(value);
    return Number.isFinite(normalized) ? Math.min(1, Math.max(0, normalized)) : undefined;
  }

  private static parseNumber(value?: string): number | undefined {
    if (!value) {
      return undefined;
    }

    const match = value.match(/-?\d+(?:\.\d+)?/);
    if (!match) {
      return undefined;
    }

    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private static toCssColor(value: string) {
    return value.startsWith('#') || value.startsWith('rgb') ? value : `#${value}`;
  }
}
