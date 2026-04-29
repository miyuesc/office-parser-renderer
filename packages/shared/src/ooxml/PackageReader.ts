import { FileHandler } from '../core/FileHandler';
import { ContentTypesRegistry } from './ContentTypesRegistry';
import { getRelationshipsPartPath, normalizePartPath } from './path';
import { RelationshipsResolver } from './RelationshipsResolver';
import { MediaAsset, PackagePart, RelationshipTarget } from './types';

const OFFICE_DOCUMENT_RELATIONSHIP_TYPES = new Set([
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
  'http://purl.oclc.org/ooxml/officeDocument/relationships/officeDocument'
]);

export class PackageReader {
  private constructor(
    private readonly files: Map<string, Uint8Array>,
    private readonly contentTypes: ContentTypesRegistry
  ) {}

  static async load(buffer: ArrayBuffer): Promise<PackageReader> {
    const files = await FileHandler.unzip(buffer);
    const contentTypesXml = files.get('[Content_Types].xml');
    const contentTypes = contentTypesXml
      ? ContentTypesRegistry.fromXML(FileHandler.readText(contentTypesXml))
      : new ContentTypesRegistry();

    return new PackageReader(files, contentTypes);
  }

  listPartPaths(): string[] {
    return [...this.files.keys()];
  }

  hasPart(partPath: string): boolean {
    return this.files.has(normalizePartPath(partPath));
  }

  getPart(partPath: string): PackagePart | undefined {
    const normalizedPath = normalizePartPath(partPath);
    const data = this.files.get(normalizedPath);

    if (!data) {
      return undefined;
    }

    return {
      path: normalizedPath,
      data,
      contentType: this.contentTypes.getContentType(normalizedPath)
    };
  }

  readText(partPath: string): string | undefined {
    const part = this.getPart(partPath);
    return part ? FileHandler.readText(part.data) : undefined;
  }

  readXml(partPath: string): Document | undefined {
    const text = this.readText(partPath);
    return text ? FileHandler.parseXML(text) : undefined;
  }

  getRelationships(sourcePartPath = ''): RelationshipsResolver {
    const normalizedSource = normalizePartPath(sourcePartPath);
    const relsPath = getRelationshipsPartPath(normalizedSource);
    const relsXml = this.readText(relsPath);

    return relsXml
      ? RelationshipsResolver.fromXML(relsXml, normalizedSource)
      : RelationshipsResolver.empty(normalizedSource);
  }

  getRootRelationships(): RelationshipsResolver {
    return this.getRelationships('');
  }

  findRelationshipsByType(sourcePartPath: string, relationshipType: string): RelationshipTarget[] {
    return this.getRelationships(sourcePartPath).findByType(relationshipType);
  }

  findRootRelationshipsByType(relationshipType: string): RelationshipTarget[] {
    return this.findRelationshipsByType('', relationshipType);
  }

  findOfficeDocumentPart(): PackagePart | undefined {
    const relationship = this.getRootRelationships()
      .list()
      .find(item => item.type && OFFICE_DOCUMENT_RELATIONSHIP_TYPES.has(item.type));

    return relationship?.resolvedTarget ? this.getPart(relationship.resolvedTarget) : undefined;
  }

  findMainPartByContentType(contentTypes: string | string[]): PackagePart | undefined {
    const acceptedTypes = Array.isArray(contentTypes) ? contentTypes : [contentTypes];

    for (const contentType of acceptedTypes) {
      const match = this.findPartsByContentType(contentType)[0];
      if (match) {
        return match;
      }
    }

    return undefined;
  }

  getRelatedPart(sourcePartPath: string, relationshipId: string): PackagePart | undefined {
    const relationship = this.getRelationships(sourcePartPath).get(relationshipId);
    if (!relationship?.resolvedTarget || relationship.targetMode === 'External') {
      return undefined;
    }

    return this.getPart(relationship.resolvedTarget);
  }

  findPartsByContentType(contentType: string): PackagePart[] {
    const matches: PackagePart[] = [];

    for (const path of this.files.keys()) {
      const part = this.getPart(path);

      if (part?.contentType === contentType) {
        matches.push(part);
      }
    }

    return matches;
  }

  getMediaAsset(partPath: string, id = normalizePartPath(partPath)): MediaAsset | undefined {
    const part = this.getPart(partPath);

    if (!part) {
      return undefined;
    }

    return {
      id,
      path: part.path,
      extension: part.path.split('.').pop()?.toLowerCase(),
      contentType: part.contentType,
      data: part.data
    };
  }

  toFileMap(): ReadonlyMap<string, Uint8Array> {
    return this.files;
  }
}
