import { describe, expect, it } from 'vitest';
import {
  buildMergeCellIndex,
  columnNameToIndex,
  getCell,
  getCellByRef,
  indexToColumnName,
  parseCellRange,
  parseCellRef,
  WorksheetAccessor
} from '../WorksheetAccess';
import { Worksheet } from '../../parser/types';

describe('WorksheetAccess', () => {
  const worksheet: Worksheet = {
    name: 'Access',
    rows: new Map([
      [
        1,
        {
          index: 1,
          cells: new Map([[1, { row: 1, col: 1, type: 'string', value: 'Merged master' }]])
        }
      ],
      [
        4,
        {
          index: 4,
          cells: new Map([[3, { row: 4, col: 3, type: 'number', value: 42 }]])
        }
      ]
    ]),
    cols: new Map(),
    merges: ['A1:C2']
  };

  it('should convert column names and cell references', () => {
    expect(columnNameToIndex('A')).toBe(1);
    expect(columnNameToIndex('AA')).toBe(27);
    expect(indexToColumnName(28)).toBe('AB');
    expect(parseCellRef('c4')).toEqual({ row: 4, col: 3 });
    expect(parseCellRange('C2:A1')).toEqual({
      startRow: 1,
      endRow: 2,
      startCol: 1,
      endCol: 3
    });
  });

  it('should index every covered cell in a merged range', () => {
    const index = buildMergeCellIndex(worksheet);

    expect(index.get('1,1')).toMatchObject({
      ref: 'A1:C2',
      isMaster: true,
      masterRow: 1,
      masterCol: 1,
      rowSpan: 2,
      colSpan: 3
    });
    expect(index.get('2,3')).toMatchObject({
      ref: 'A1:C2',
      isMaster: false,
      masterRow: 1,
      masterCol: 1
    });
  });

  it('should resolve covered merged cells to the master cell', () => {
    const covered = getCell(worksheet, 2, 3);

    expect(covered?.cell?.value).toBe('Merged master');
    expect(covered?.requestedRow).toBe(2);
    expect(covered?.requestedCol).toBe(3);
    expect(covered?.row).toBe(1);
    expect(covered?.col).toBe(1);
    expect(covered?.isMerged).toBe(true);
    expect(covered?.mergeInfo?.isMaster).toBe(false);
  });

  it('should resolve regular cells by row/col and A1 reference', () => {
    expect(getCell(worksheet, 4, 3)?.cell?.value).toBe(42);
    expect(getCellByRef(worksheet, 'C4')?.cell?.value).toBe(42);
    expect(getCellByRef(worksheet, 'bad-ref')).toBeUndefined();
  });

  it('should provide a reusable accessor with cached merge lookup', () => {
    const accessor = new WorksheetAccessor(worksheet);

    expect(accessor.getCell(2, 2)?.cell?.value).toBe('Merged master');
    expect(accessor.getCellByRef('C4')?.cell?.value).toBe(42);
  });
});
