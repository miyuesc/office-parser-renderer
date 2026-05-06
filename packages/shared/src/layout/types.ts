export interface PageBox {
  width: number;
  height: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface LayoutBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type LayoutUnit = 'px' | 'emu' | 'pt' | 'twip';

export type LayoutCoordinateSpaceKind = 'page' | 'slide' | 'worksheet' | 'viewport' | 'local';

export interface LayoutPoint {
  x: number;
  y: number;
}

export interface LayoutSize {
  width: number;
  height: number;
}

export interface LayoutRect extends LayoutPoint, LayoutSize {}

export interface LayoutCoordinateSpace {
  kind: LayoutCoordinateSpaceKind;
  unit: LayoutUnit;
  width?: number;
  height?: number;
  origin?: LayoutPoint;
  name?: string;
}

export type LayoutAnchorKind = 'absolute' | 'relative' | 'cell' | 'inline';

export type LayoutAnchorReference =
  | 'page'
  | 'margin'
  | 'content'
  | 'column'
  | 'paragraph'
  | 'line'
  | 'character'
  | 'slide'
  | 'shape'
  | 'cell'
  | 'worksheet'
  | 'viewport'
  | string;

export interface LayoutAxisAnchor {
  relativeFrom: LayoutAnchorReference;
  align?: 'start' | 'center' | 'end' | 'inside' | 'outside' | string;
  offset?: number;
}

export interface LayoutCellAnchor {
  row: number;
  column: number;
  rowOffset?: number;
  columnOffset?: number;
}

export type LayoutWrapMode = 'none' | 'square' | 'tight' | 'through' | 'topAndBottom' | 'inline' | string;

export interface LayoutWrap {
  mode: LayoutWrapMode;
  distances?: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;
}

export interface LayoutLayer {
  zIndex: number;
  order?: number;
  behindDocument?: boolean;
  allowOverlap?: boolean;
}

export interface LayoutAnchorSource {
  format?: 'docx' | 'pptx' | 'xlsx' | string;
  partPath?: string;
  relationshipId?: string;
  elementId?: string;
}

export interface LayoutAnchor {
  kind: LayoutAnchorKind;
  coordinateSpace: LayoutCoordinateSpace;
  rect: LayoutRect;
  horizontal?: LayoutAxisAnchor;
  vertical?: LayoutAxisAnchor;
  fromCell?: LayoutCellAnchor;
  toCell?: LayoutCellAnchor;
  layer?: LayoutLayer;
  wrap?: LayoutWrap;
  source?: LayoutAnchorSource;
}

export interface LaidOutPage<TBlock = unknown> {
  pageIndex: number;
  pageBox: PageBox;
  blocks: Array<{
    block: TBlock;
    box: LayoutBox;
  }>;
}
