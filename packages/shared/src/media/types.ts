export type MediaResourceKind = 'image' | 'video' | 'audio' | 'hyperlink' | 'bookmark' | 'external' | 'part';

export interface MediaResource {
  id: string;
  kind: MediaResourceKind;
  relationshipId?: string;
  target: string;
  targetMode: 'Internal' | 'External' | string;
  resolvedTarget?: string;
  path?: string;
  extension?: string;
  contentType?: string;
  data?: Uint8Array;
}

export interface HyperlinkResource extends MediaResource {
  kind: 'hyperlink';
  tooltip?: string;
}

export interface BookmarkResource extends MediaResource {
  kind: 'bookmark';
  name: string;
}
