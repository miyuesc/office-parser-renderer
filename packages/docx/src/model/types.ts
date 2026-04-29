import type { OfficeImage, ParagraphStyle, TextStyle, WarningCollector } from '@opr/shared';

export interface DocxDocument {
  sourcePartPath: string;
  body: DocxBlock[];
  headers: Map<string, DocxHeaderFooterPart>;
  footers: Map<string, DocxHeaderFooterPart>;
  styles: DocxStyles;
  numbering: DocxNumbering;
  settings: DocxSettings;
  sections: DocxSection[];
  navigation?: DocxNavigation;
  warnings: ReturnType<WarningCollector['toArray']>;
}

export type DocxBlock = DocxParagraph | DocxTable;

export interface DocxParagraph {
  type: 'paragraph';
  styleId?: string;
  style?: ParagraphStyle;
  numbering?: DocxParagraphNumbering;
  runs: DocxRun[];
  section?: DocxSection;
}

export interface DocxRun {
  text: string;
  style?: TextStyle;
  styleId?: string;
  breaks?: Array<'line' | 'page' | string>;
  fields?: DocxField[];
  images?: OfficeImage[];
  revision?: DocxRevision;
}

export interface DocxRevision {
  type: 'insert' | 'delete';
  id?: string;
  author?: string;
  date?: string;
}

export interface DocxField {
  instruction: string;
  type: 'page' | 'numPages' | 'unknown';
}

export interface DocxTable {
  type: 'table';
  width?: DocxWidth;
  gridWidths?: number[];
  borders?: DocxTableBorders;
  rows: DocxTableRow[];
}

export interface DocxTableRow {
  cells: DocxTableCell[];
}

export interface DocxTableCell {
  blocks: DocxBlock[];
  width?: DocxWidth;
  gridSpan?: number;
  verticalMerge?: 'restart' | 'continue';
  shading?: string;
  borders?: DocxTableCellBorders;
}

export interface DocxWidth {
  value?: number;
  type?: 'auto' | 'dxa' | 'pct' | 'nil' | string;
}

export interface DocxTableCellBorders {
  top?: DocxBorder;
  right?: DocxBorder;
  bottom?: DocxBorder;
  left?: DocxBorder;
}

export interface DocxTableBorders extends DocxTableCellBorders {
  insideH?: DocxBorder;
  insideV?: DocxBorder;
}

export interface DocxBorder {
  style?: string;
  color?: string;
  size?: number;
}

export interface DocxSection {
  headerRefs?: DocxHeaderFooterRef[];
  footerRefs?: DocxHeaderFooterRef[];
  titlePage?: boolean;
  pageSize?: {
    width: number;
    height: number;
    orientation?: 'portrait' | 'landscape' | string;
  };
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    header?: number;
    footer?: number;
    gutter?: number;
  };
}

export interface DocxHeaderFooterRef {
  type: 'default' | 'first' | 'even' | string;
  relationshipId: string;
  partPath?: string;
}

export interface DocxHeaderFooterPart {
  relationshipId: string;
  type: 'header' | 'footer';
  variant: 'default' | 'first' | 'even' | string;
  partPath: string;
  blocks: DocxBlock[];
}

export interface DocxParagraphNumbering {
  numId?: string;
  level?: string;
}

export interface DocxStyles {
  defaults?: {
    paragraph?: ParagraphStyle;
    run?: TextStyle;
  };
  byId: Map<string, DocxStyle>;
}

export interface DocxStyle {
  id: string;
  type: 'paragraph' | 'character' | 'table' | 'numbering' | string;
  name?: string;
  basedOn?: string;
  next?: string;
  isDefault?: boolean;
  paragraph?: ParagraphStyle;
  text?: TextStyle;
}

export interface DocxNumbering {
  abstractNums: Map<string, DocxAbstractNumbering>;
  nums: Map<string, DocxNumberingInstance>;
}

export interface DocxAbstractNumbering {
  id: string;
  levels: Map<string, DocxNumberingLevel>;
}

export interface DocxNumberingLevel {
  level: string;
  start?: number;
  format?: string;
  text?: string;
  paragraph?: ParagraphStyle;
  textStyle?: TextStyle;
}

export interface DocxNumberingInstance {
  id: string;
  abstractNumId?: string;
}

export interface DocxSettings {
  defaultTabStop?: number;
  compatibilityFlags: string[];
  unsupported: string[];
}

export interface DocxNavigation {
  headings: DocxHeadingNode[];
  toc: DocxTocEntry[];
  pages: DocxPageNavigationEntry[];
}

export interface DocxHeadingNode {
  id: string;
  text: string;
  level: number;
  styleId?: string;
  blockIndex: number;
  pageIndex?: number;
  children: DocxHeadingNode[];
}

export interface DocxTocEntry {
  id: string;
  text: string;
  level: number;
  pageIndex?: number;
}

export interface DocxPageNavigationEntry {
  pageIndex: number;
  headingIds: string[];
}
