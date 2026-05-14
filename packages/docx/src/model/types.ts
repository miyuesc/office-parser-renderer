import type { BookmarkResource, DrawingElement, HyperlinkResource, OfficeImage, OfficeMath, ParagraphStyle, TextStyle, WarningCollector } from '@opr/shared';

export interface DocxDocument {
  sourcePartPath: string;
  body: DocxBlock[];
  headers: Map<string, DocxHeaderFooterPart>;
  footers: Map<string, DocxHeaderFooterPart>;
  styles: DocxStyles;
  numbering: DocxNumbering;
  settings: DocxSettings;
  sections: DocxSection[];
  background?: DocxPageBackground;
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
  floatingDrawings?: DocxFloatingDrawing[];
  section?: DocxSection;
}

export interface DocxRun {
  text: string;
  style?: TextStyle;
  styleId?: string;
  breaks?: Array<'line' | 'page' | string>;
  fields?: DocxField[];
  images?: OfficeImage[];
  math?: OfficeMath;
  hyperlink?: DocxHyperlink;
  bookmarks?: BookmarkResource[];
  revision?: DocxRevision;
}

export interface DocxHyperlink extends HyperlinkResource {
  anchor?: string;
}

export interface DocxFloatingDrawing {
  objectType: 'image' | 'chart' | 'shape' | 'connector' | 'group' | 'unknown';
  drawing?: DrawingElement;
  anchor: DocxFloatingAnchor;
}

export interface DocxFloatingAnchor {
  drawingId?: string;
  name?: string;
  relativeHeight?: number;
  behindDoc?: boolean;
  locked?: boolean;
  layoutInCell?: boolean;
  allowOverlap?: boolean;
  useSimplePosition?: boolean;
  simplePosition?: {
    x: number;
    y: number;
  };
  horizontalPosition?: DocxFloatingPosition;
  verticalPosition?: DocxFloatingPosition;
  size?: {
    width: number;
    height: number;
  };
  effectExtent?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  wrap?: DocxFloatingWrap;
}

export interface DocxFloatingPosition {
  relativeFrom?: string;
  align?: string;
  offset?: number;
}

export interface DocxFloatingWrap {
  type: 'none' | 'square' | 'tight' | 'through' | 'topAndBottom' | string;
  textWrap?: string;
  distances?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
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
  indent?: DocxWidth;
  alignment?: 'left' | 'center' | 'right' | 'both' | string;
  layout?: 'autofit' | 'fixed' | string;
  gridWidths?: number[];
  cellMargins?: DocxTableCellMargins;
  borders?: DocxTableBorders;
  rows: DocxTableRow[];
}

export interface DocxTableRow {
  cells: DocxTableCell[];
  height?: DocxTableRowHeight;
}

export interface DocxTableCell {
  blocks: DocxBlock[];
  width?: DocxWidth;
  gridSpan?: number;
  verticalMerge?: 'restart' | 'continue';
  cellMargins?: DocxTableCellMargins;
  verticalAlignment?: 'top' | 'center' | 'bottom' | 'both' | string;
  shading?: string;
  borders?: DocxTableCellBorders;
}

export interface DocxTableCellMargins {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface DocxTableRowHeight {
  value?: number;
  rule?: 'auto' | 'atLeast' | 'exact' | string;
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
  docGrid?: {
    type?: string;
    linePitch?: number;
    charSpace?: number;
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
  watermarks?: DocxWatermark[];
}

export interface DocxPageBackground {
  color?: string;
}

export interface DocxWatermark {
  type: 'text';
  text: string;
  color?: string;
  opacity?: number;
  rotation?: number;
  fontFamily?: string;
  fontSize?: number;
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
  defaultParagraphStyleId?: string;
  defaultCharacterStyleId?: string;
  defaultTableStyleId?: string;
  defaultNumberingStyleId?: string;
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
