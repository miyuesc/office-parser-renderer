import type { ITransform } from '../drawing/types';

export interface PackagePart {
  path: string;
  data: Uint8Array;
  contentType?: string;
}

export interface RelationshipTarget {
  id: string;
  type?: string;
  target: string;
  targetMode: 'Internal' | 'External' | string;
  sourcePartPath: string;
  resolvedTarget?: string;
}

export interface MediaAsset {
  id: string;
  path: string;
  extension?: string;
  contentType?: string;
  data: Uint8Array;
}

export interface HyperlinkTarget {
  id: string;
  target: string;
  targetMode: 'Internal' | 'External' | string;
  resolvedTarget?: string;
}

export type ParseWarningSeverity = 'info' | 'warning' | 'error';

export interface ParseWarning {
  code: string;
  message: string;
  severity: ParseWarningSeverity;
  partPath?: string;
  relationshipId?: string;
}

export type TransformValue = ITransform;
