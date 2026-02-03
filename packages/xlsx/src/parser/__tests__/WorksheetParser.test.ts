import { describe, it, expect } from 'vitest';
import { WorksheetParser } from '../WorksheetParser';

describe('WorksheetParser', () => {
  const sharedStrings = ['Hello', 'World'];

  it('should parse simple sheet data', () => {
    const xml = `
        <worksheet>
            <dimension ref="A1:B2"/>
            <sheetData>
                <row r="1">
                    <c r="A1" t="s"><v>0</v></c>
                    <c r="B1" t="n"><v>123</v></c>
                </row>
                <row r="2">
                    <c r="A2" t="inlineStr"><is><t>Inline</t></is></c>
                    <c r="B2" t="b"><v>1</v></c>
                </row>
            </sheetData>
        </worksheet>
        `;

    const sheet = WorksheetParser.parse(xml, sharedStrings);

    expect(sheet.rows.size).toBe(2);

    // Row 1
    const row1 = sheet.rows.get(1)!;
    expect(row1.cells.get(1)!.value).toBe('Hello'); // Shared String index 0
    expect(row1.cells.get(2)!.value).toBe(123); // Number

    // Row 2
    const row2 = sheet.rows.get(2)!;
    expect(row2.cells.get(1)!.value).toBe('Inline'); // Inline string
    expect(row2.cells.get(2)!.value).toBe(true); // Boolean
  });

  it('should parse dimension and cols', () => {
    const xml = `
        <worksheet>
            <dimension ref="A1:C10"/>
            <cols>
                <col min="1" max="1" width="20" customWidth="1"/>
                <col min="2" max="3" width="15"/>
            </cols>
        </worksheet>
        `;
    const sheet = WorksheetParser.parse(xml, []);

    expect(sheet.dimension).toEqual({
      startStr: 'A',
      endStr: 'C',
      startRow: 1,
      endRow: 10,
      startCol: 1,
      endCol: 3
    });

    expect(sheet.cols.size).toBe(3); // 1, 2, 3
    expect(sheet.cols.get(1)?.width).toBe(20);
    expect(sheet.cols.get(2)?.width).toBe(15);
    expect(sheet.cols.get(3)?.width).toBe(15);
  });

  it('should parse merge cells', () => {
    const xml = `
        <worksheet>
            <sheetData>
                <row r="1"><c r="A1"><v>1</v></c></row>
            </sheetData>
            <mergeCells>
                <mergeCell ref="A1:C1"/>
                <mergeCell ref="A2:B3"/>
            </mergeCells>
        </worksheet>
    `;
    const sheet = WorksheetParser.parse(xml, []);
    expect(sheet.merges).toBeDefined();
    expect(sheet.merges!.length).toBe(2);
    expect(sheet.merges![0]).toBe('A1:C1');
    expect(sheet.merges![1]).toBe('A2:B3');
  });

  it('should parse freeze panes', () => {
    const xml = `
        <worksheet>
            <sheetViews>
                <sheetView>
                    <pane xSplit="1" ySplit="2" state="frozen" topLeftCell="B3"/>
                </sheetView>
            </sheetViews>
        </worksheet>
    `;
    const sheet = WorksheetParser.parse(xml, []);
    expect(sheet.frozen).toBeDefined();
    expect(sheet.frozen?.xSplit).toBe(1);
    expect(sheet.frozen?.ySplit).toBe(2);
    expect(sheet.frozen?.state).toBe('frozen');
    expect(sheet.frozen?.topLeftCell).toBe('B3');
  });

  it('should parse rich text cell', () => {
    const richContent = [{ text: 'Red', font: { color: 'red' } }, { text: 'Black' }];
    // Need to cast to match type signature if TS complains about mixed array
    const sharedStrings: (string | any[])[] = ['Simple', richContent];

    const xml = `
      <worksheet>
          <sheetData>
              <row r="1">
                  <c r="A1" t="s"><v>1</v></c>
              </row>
          </sheetData>
      </worksheet>
    `;
    const sheet = WorksheetParser.parse(xml, sharedStrings);
    const cell = sheet.rows.get(1)!.cells.get(1)!;

    expect(cell.value).toBe('RedBlack'); // Fallback text
    expect(cell.richText).toBeDefined();
    expect(cell.richText).toEqual(richContent);
  });
});
