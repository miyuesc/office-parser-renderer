export interface DrawingAnchor {
  col: number;
  colOff: number;
  row: number;
  rowOff: number;
}

export type DrawingAnchorKind = 'absoluteAnchor' | 'oneCellAnchor' | 'twoCellAnchor';
export type DrawingPositionType = 'absolute' | 'oneCellAnchor' | 'twoCellAnchor';

export interface DrawingClientData {
  locksWithSheet?: boolean;
  printsWithSheet?: boolean;
}

export interface DrawingResourceRef {
  relationshipId: string;
  target: string;
  targetMode: 'Internal' | 'External' | string;
  resolvedTarget?: string;
  contentType?: string;
}

export interface DrawingPosition {
  type: DrawingPositionType;
  anchorKind?: DrawingAnchorKind;
  editAs?: string;
  x?: number;
  y?: number;
  width: number;
  height: number;
  from?: DrawingAnchor;
  to?: DrawingAnchor;
  clientData?: DrawingClientData;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
}
