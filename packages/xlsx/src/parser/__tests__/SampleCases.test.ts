import { describe, expect, it } from 'vitest';
import { loadSampleCase } from '../../../../../samples/utils/SampleCaseLoader';
import { WorksheetAccessor } from '../../model';
import { XlsxParser } from '../XlsxParser';

describe('XLSX sample cases', () => {
  it('should consume the basic covered-cells sample', async () => {
    const sample = loadSampleCase('samples/xlsx/merges-and-access/basic-covered-cells');
    const doc = await XlsxParser.parse(sample.sourceBuffer);
    const sheet = doc.worksheets.get('1');

    expect(sample.metadata.id).toBe('xlsx-merges-basic-covered-cells');
    expect(sheet?.name).toBe('Merges');
    expect(sheet?.path).toBe('xl/worksheets/sheet1.xml');
    expect(sheet?.merges).toEqual(['A1:B2']);

    const accessor = new WorksheetAccessor(sheet!);
    const master = accessor.getCellByRef('A1');
    const covered = accessor.getCellByRef('B2');

    expect(master?.cell?.value).toBe('Merged master');
    expect(covered?.cell?.value).toBe('Merged master');
    expect(covered?.row).toBe(1);
    expect(covered?.col).toBe(1);
    expect(covered?.mergeInfo?.ref).toBe('A1:B2');
  });

  it('should consume the row-and-column freeze sample', async () => {
    const sample = loadSampleCase('samples/xlsx/frozen-panes/row-and-column-freeze');
    const doc = await XlsxParser.parse(sample.sourceBuffer);
    const sheet = doc.worksheets.get('1');

    expect(sample.metadata.id).toBe('xlsx-frozen-row-and-column-freeze');
    expect(sheet?.name).toBe('Frozen');
    expect(sheet?.frozen).toEqual({
      xSplit: 1,
      ySplit: 1,
      topLeftCell: 'B2',
      state: 'frozen'
    });

    const accessor = new WorksheetAccessor(sheet!);
    expect(accessor.getCellByRef('B20')?.cell?.value).toBe('Target');
  });

  it('should consume the rich text and fills sample', async () => {
    const sample = loadSampleCase('samples/xlsx/rich-text-and-fills/basic-rich-text-fills');
    const doc = await XlsxParser.parse(sample.sourceBuffer);
    const sheet = doc.worksheets.get('1');
    const accessor = new WorksheetAccessor(sheet!);
    const richCell = accessor.getCellByRef('A1')?.cell;
    const filledCell = accessor.getCellByRef('B2')?.cell;

    expect(sample.metadata.id).toBe('xlsx-rich-text-basic-rich-text-fills');
    expect(sheet?.name).toBe('Styles');
    expect(richCell?.value).toBe('Red bold normal');
    expect(richCell?.richText).toHaveLength(2);
    expect(richCell?.richText?.[0].font).toMatchObject({
      name: 'Arial',
      bold: true
    });
    expect(filledCell?.styleId).toBe(1);
    expect(doc.styles?.theme?.colors.accent1).toBe('#112233');
    expect(doc.styles?.fills[1]).toMatchObject({
      type: 'pattern',
      patternType: 'solid',
      fgColor: '#112233',
      color: '#112233'
    });
    expect(doc.styles?.borders[1].left).toMatchObject({
      style: 'thin',
      color: '#445566'
    });
  });
});
