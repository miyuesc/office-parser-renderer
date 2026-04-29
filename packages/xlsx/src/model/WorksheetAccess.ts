import { Cell, Worksheet } from '../parser/types';

export interface CellAddress {
  row: number;
  col: number;
}

export interface CellRange {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

export interface MergeCellInfo extends CellRange {
  ref: string;
  masterRow: number;
  masterCol: number;
  rowSpan: number;
  colSpan: number;
  isMaster: boolean;
}

export interface WorksheetCellAccess {
  cell?: Cell;
  requestedRow: number;
  requestedCol: number;
  row: number;
  col: number;
  isMerged: boolean;
  mergeInfo?: MergeCellInfo;
}

export class WorksheetAccessor {
  private readonly mergeIndex: Map<string, MergeCellInfo>;

  constructor(private readonly worksheet: Worksheet) {
    this.mergeIndex = buildMergeCellIndex(worksheet);
  }

  getCell(row: number, col: number): WorksheetCellAccess | undefined {
    return resolveCell(this.worksheet, row, col, this.mergeIndex);
  }

  getCellByRef(ref: string): WorksheetCellAccess | undefined {
    const address = parseCellRef(ref);
    return address ? this.getCell(address.row, address.col) : undefined;
  }
}

export function columnNameToIndex(columnName: string): number {
  let index = 0;
  const normalized = columnName.trim().toUpperCase();

  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    if (code < 65 || code > 90) {
      return 0;
    }

    index = index * 26 + (code - 64);
  }

  return index;
}

export function indexToColumnName(index: number): string {
  if (!Number.isInteger(index) || index < 1) {
    return '';
  }

  let value = index;
  let name = '';

  while (value > 0) {
    value -= 1;
    name = String.fromCharCode(65 + (value % 26)) + name;
    value = Math.floor(value / 26);
  }

  return name;
}

export function parseCellRef(ref: string): CellAddress | undefined {
  const match = ref.trim().toUpperCase().match(/^([A-Z]+)([1-9][0-9]*)$/);
  if (!match) {
    return undefined;
  }

  const col = columnNameToIndex(match[1]);
  const row = parseInt(match[2], 10);

  return col > 0 && row > 0 ? { row, col } : undefined;
}

export function parseCellRange(ref: string): CellRange | undefined {
  const [startRef, endRef = startRef] = ref.split(':');
  const start = parseCellRef(startRef);
  const end = parseCellRef(endRef);

  if (!start || !end) {
    return undefined;
  }

  return {
    startRow: Math.min(start.row, end.row),
    endRow: Math.max(start.row, end.row),
    startCol: Math.min(start.col, end.col),
    endCol: Math.max(start.col, end.col)
  };
}

export function buildMergeCellIndex(worksheet: Worksheet): Map<string, MergeCellInfo> {
  const index = new Map<string, MergeCellInfo>();

  for (const ref of worksheet.merges || []) {
    const range = parseCellRange(ref);
    if (!range) {
      continue;
    }

    const rowSpan = range.endRow - range.startRow + 1;
    const colSpan = range.endCol - range.startCol + 1;

    for (let row = range.startRow; row <= range.endRow; row++) {
      for (let col = range.startCol; col <= range.endCol; col++) {
        index.set(`${row},${col}`, {
          ref,
          ...range,
          masterRow: range.startRow,
          masterCol: range.startCol,
          rowSpan,
          colSpan,
          isMaster: row === range.startRow && col === range.startCol
        });
      }
    }
  }

  return index;
}

export function getCell(worksheet: Worksheet, row: number, col: number): WorksheetCellAccess | undefined {
  return resolveCell(worksheet, row, col, buildMergeCellIndex(worksheet));
}

export function getCellByRef(worksheet: Worksheet, ref: string): WorksheetCellAccess | undefined {
  const address = parseCellRef(ref);
  return address ? getCell(worksheet, address.row, address.col) : undefined;
}

function resolveCell(
  worksheet: Worksheet,
  row: number,
  col: number,
  mergeIndex: Map<string, MergeCellInfo>
): WorksheetCellAccess | undefined {
  if (!Number.isInteger(row) || !Number.isInteger(col) || row < 1 || col < 1) {
    return undefined;
  }

  const mergeInfo = mergeIndex.get(`${row},${col}`);
  const targetRow = mergeInfo?.masterRow || row;
  const targetCol = mergeInfo?.masterCol || col;
  const cell = worksheet.rows.get(targetRow)?.cells.get(targetCol);

  if (!cell && !mergeInfo) {
    return undefined;
  }

  return {
    cell,
    requestedRow: row,
    requestedCol: col,
    row: targetRow,
    col: targetCol,
    isMerged: Boolean(mergeInfo),
    mergeInfo
  };
}
