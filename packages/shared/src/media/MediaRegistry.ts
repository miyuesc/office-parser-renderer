import { PackageReader } from '../ooxml/PackageReader';
import { RelationshipTarget } from '../ooxml/types';
import { BookmarkResource, HyperlinkResource, MediaResource, MediaResourceKind } from './types';

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp', 'emf', 'wmf']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'avi', 'wmv', 'm4v']);
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'm4a', 'wma']);

export class MediaRegistry {
  private readonly resources = new Map<string, MediaResource>();
  private readonly hyperlinks = new Map<string, HyperlinkResource>();
  private readonly bookmarks = new Map<string, BookmarkResource>();

  constructor(private readonly pkg: PackageReader) {}

  resolveRelationship(sourcePartPath: string, relationshipId: string): MediaResource | undefined {
    const relationship = this.pkg.getRelationships(sourcePartPath).get(relationshipId);
    if (!relationship) {
      return undefined;
    }

    const resource = this.fromRelationship(relationship);
    this.resources.set(this.resourceKey(sourcePartPath, relationshipId), resource);

    if (resource.kind === 'hyperlink') {
      this.hyperlinks.set(relationshipId, resource as HyperlinkResource);
    }

    return resource;
  }

  registerBookmark(id: string, name: string, target: string): BookmarkResource {
    const bookmark: BookmarkResource = {
      id,
      kind: 'bookmark',
      name,
      target,
      targetMode: 'Internal',
      resolvedTarget: target
    };

    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  getResource(sourcePartPath: string, relationshipId: string): MediaResource | undefined {
    return this.resources.get(this.resourceKey(sourcePartPath, relationshipId));
  }

  listResources(): MediaResource[] {
    return [...this.resources.values()];
  }

  listHyperlinks(): HyperlinkResource[] {
    return [...this.hyperlinks.values()];
  }

  listBookmarks(): BookmarkResource[] {
    return [...this.bookmarks.values()];
  }

  private fromRelationship(relationship: RelationshipTarget): MediaResource {
    if (relationship.targetMode === 'External') {
      return {
        id: relationship.id,
        kind: this.inferExternalKind(relationship),
        relationshipId: relationship.id,
        target: relationship.target,
        targetMode: relationship.targetMode
      };
    }

    const part = relationship.resolvedTarget ? this.pkg.getPart(relationship.resolvedTarget) : undefined;
    const extension = relationship.resolvedTarget?.split('.').pop()?.toLowerCase();

    return {
      id: relationship.id,
      kind: this.inferKind(relationship, extension),
      relationshipId: relationship.id,
      target: relationship.target,
      targetMode: relationship.targetMode,
      resolvedTarget: relationship.resolvedTarget,
      path: part?.path,
      extension,
      contentType: part?.contentType,
      data: part?.data
    };
  }

  private inferExternalKind(relationship: RelationshipTarget): MediaResourceKind {
    if (relationship.type?.includes('/hyperlink')) {
      return 'hyperlink';
    }

    return 'external';
  }

  private inferKind(relationship: RelationshipTarget, extension?: string): MediaResourceKind {
    if (relationship.type?.includes('/hyperlink')) {
      return 'hyperlink';
    }
    if (extension && IMAGE_EXTENSIONS.has(extension)) {
      return 'image';
    }
    if (extension && VIDEO_EXTENSIONS.has(extension)) {
      return 'video';
    }
    if (extension && AUDIO_EXTENSIONS.has(extension)) {
      return 'audio';
    }

    return 'part';
  }

  private resourceKey(sourcePartPath: string, relationshipId: string): string {
    return `${sourcePartPath}#${relationshipId}`;
  }
}
