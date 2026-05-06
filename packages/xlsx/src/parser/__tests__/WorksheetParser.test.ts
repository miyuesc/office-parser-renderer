import { describe, it, expect } from 'vitest';
import { RelationshipsResolver } from '@opr/shared';
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

  it('should inherit row and column styles onto cells without explicit styles', () => {
    const xml = `
        <worksheet>
            <cols>
                <col min="1" max="1" width="20" style="5"/>
            </cols>
            <sheetData>
                <row r="1" s="7" customFormat="1">
                    <c r="A1"><v>1</v></c>
                    <c r="B1" s="9"><v>2</v></c>
                </row>
                <row r="2">
                    <c r="A2"><v>3</v></c>
                    <c r="B2"><v>4</v></c>
                </row>
            </sheetData>
        </worksheet>
        `;
    const sheet = WorksheetParser.parse(xml, []);

    expect(sheet.cols.get(1)?.styleId).toBe(5);
    expect(sheet.rows.get(1)?.styleId).toBe(7);
    expect(sheet.rows.get(1)?.cells.get(1)?.styleId).toBe(7);
    expect(sheet.rows.get(1)?.cells.get(2)?.styleId).toBe(9);
    expect(sheet.rows.get(2)?.cells.get(1)?.styleId).toBe(5);
    expect(sheet.rows.get(2)?.cells.get(2)?.styleId).toBeUndefined();
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

  it('should apply theme tint to inline rich text colors', () => {
    const xml = `
      <worksheet>
          <sheetData>
              <row r="1">
                  <c r="A1" t="inlineStr">
                    <is>
                      <r>
                        <rPr><color theme="1" tint="0.5"/></rPr>
                        <t>Inline</t>
                      </r>
                    </is>
                  </c>
              </row>
          </sheetData>
      </worksheet>
    `;
    const sheet = WorksheetParser.parse(xml, [], undefined, {
      theme: {
        colors: {
          dk1: '#000000'
        },
        fontScheme: {
          major: {},
          minor: {}
        }
      }
    });
    const cell = sheet.rows.get(1)!.cells.get(1)!;

    expect(cell.value).toBe('Inline');
    expect(cell.richText?.[0].font?.colorRef).toEqual({ theme: 1, tint: 0.5 });
    expect(cell.richText?.[0].font?.color).toBe('#808080');
  });

  it('should parse worksheet hyperlinks and attach them to referenced cells', () => {
    const xml = `
      <worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
        <sheetData>
          <row r="1">
            <c r="A1" t="inlineStr"><is><t>OpenAI</t></is></c>
            <c r="B1" t="inlineStr"><is><t>Docs</t></is></c>
          </row>
        </sheetData>
        <hyperlinks>
          <hyperlink ref="A1" r:id="rIdLink" tooltip="External link"/>
          <hyperlink ref="B1" location="Sheet2!C3" display="Jump"/>
        </hyperlinks>
      </worksheet>
    `;
    const rels = RelationshipsResolver.fromXML(
      `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rIdLink" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://openai.com" TargetMode="External"/>
        </Relationships>
      `,
      'xl/worksheets/sheet1.xml'
    );

    const sheet = WorksheetParser.parse(xml, [], rels);

    expect(sheet.hyperlinks).toEqual([
      {
        ref: 'A1',
        relationshipId: 'rIdLink',
        target: 'https://openai.com',
        location: undefined,
        tooltip: 'External link',
        display: undefined
      },
      {
        ref: 'B1',
        relationshipId: undefined,
        target: undefined,
        location: 'Sheet2!C3',
        tooltip: undefined,
        display: 'Jump'
      }
    ]);
    expect(sheet.rows.get(1)?.cells.get(1)?.hyperlink?.target).toBe('https://openai.com');
    expect(sheet.rows.get(1)?.cells.get(2)?.hyperlink?.location).toBe('Sheet2!C3');
  });

  it('should preserve formula text and cached-result availability', () => {
    const xml = `
      <worksheet>
        <sheetData>
          <row r="1">
            <c r="A1">
              <f>SUM(B1:B2)</f>
            </c>
            <c r="B1">
              <f>1+2</f>
              <v>3</v>
            </c>
          </row>
        </sheetData>
      </worksheet>
    `;

    const sheet = WorksheetParser.parse(xml, []);

    expect(sheet.rows.get(1)?.cells.get(1)).toMatchObject({
      formula: 'SUM(B1:B2)',
      hasFormulaResult: false,
      value: ''
    });
    expect(sheet.rows.get(1)?.cells.get(2)).toMatchObject({
      formula: '1+2',
      hasFormulaResult: true,
      value: 3
    });
  });

  it('should parse conditional formatting rules and priorities', () => {
    const xml = `
      <worksheet>
        <conditionalFormatting sqref="A1:A3 C1">
          <cfRule type="containsText" dxfId="1" priority="2" text="warn">
            <formula>NOT(ISERROR(SEARCH("warn",A1)))</formula>
          </cfRule>
          <cfRule type="cellIs" dxfId="0" priority="1" operator="greaterThan" stopIfTrue="1">
            <formula>10</formula>
          </cfRule>
        </conditionalFormatting>
      </worksheet>
    `;

    const sheet = WorksheetParser.parse(xml, []);

    expect(sheet.conditionalFormattings).toEqual([
      {
        sqref: ['A1:A3', 'C1'],
        rules: [
          {
            type: 'cellIs',
            dxfId: 0,
            priority: 1,
            stopIfTrue: true,
            operator: 'greaterThan',
            text: undefined,
            formulas: ['10']
          },
          {
            type: 'containsText',
            dxfId: 1,
            priority: 2,
            stopIfTrue: false,
            operator: undefined,
            text: 'warn',
            formulas: ['NOT(ISERROR(SEARCH("warn",A1)))']
          }
        ]
      }
    ]);
  });

  it('should preserve expression conditional formatting formulas', () => {
    const xml = `
      <worksheet>
        <conditionalFormatting sqref="B1:B4">
          <cfRule type="expression" dxfId="2" priority="3" stopIfTrue="1">
            <formula>AND($A1="warn",MOD(ROW(),2)=0)</formula>
          </cfRule>
        </conditionalFormatting>
      </worksheet>
    `;

    const sheet = WorksheetParser.parse(xml, []);

    expect(sheet.conditionalFormattings).toEqual([
      {
        sqref: ['B1:B4'],
        rules: [
          {
            type: 'expression',
            dxfId: 2,
            priority: 3,
            stopIfTrue: true,
            operator: undefined,
            text: undefined,
            formulas: ['AND($A1="warn",MOD(ROW(),2)=0)']
          }
        ]
      }
    ]);
  });

  it('should parse top10, aboveAverage, and timePeriod rule attributes', () => {
    const xml = `
      <worksheet>
        <conditionalFormatting sqref="C1:C5">
          <cfRule type="top10" dxfId="3" priority="4" rank="25" percent="1" bottom="1"/>
          <cfRule type="aboveAverage" dxfId="4" priority="5" aboveAverage="0" equalAverage="1" stdDev="2"/>
          <cfRule type="timePeriod" dxfId="5" priority="6" timePeriod="last7Days"/>
        </conditionalFormatting>
      </worksheet>
    `;

    const sheet = WorksheetParser.parse(xml, []);

    expect(sheet.conditionalFormattings).toEqual([
      {
        sqref: ['C1:C5'],
        rules: [
          {
            type: 'top10',
            dxfId: 3,
            priority: 4,
            stopIfTrue: false,
            operator: undefined,
            text: undefined,
            rank: 25,
            percent: true,
            bottom: true,
            formulas: []
          },
          {
            type: 'aboveAverage',
            dxfId: 4,
            priority: 5,
            stopIfTrue: false,
            operator: undefined,
            text: undefined,
            aboveAverage: false,
            equalAverage: true,
            stdDev: 2,
            formulas: []
          },
          {
            type: 'timePeriod',
            dxfId: 5,
            priority: 6,
            stopIfTrue: false,
            operator: undefined,
            text: undefined,
            timePeriod: 'last7Days',
            formulas: []
          }
        ]
      }
    ]);
  });

  it('should parse colorScale conditional formatting metadata', () => {
    const xml = `
      <worksheet>
        <conditionalFormatting sqref="A1:A5">
          <cfRule type="colorScale" priority="3">
            <colorScale>
              <cfvo type="min"/>
              <cfvo type="percentile" val="50" gte="0"/>
              <cfvo type="max"/>
              <color rgb="FFF8696B"/>
              <color rgb="FFFFEB84"/>
              <color rgb="FF63BE7B"/>
            </colorScale>
          </cfRule>
        </conditionalFormatting>
      </worksheet>
    `;

    const sheet = WorksheetParser.parse(xml, []);

    expect(sheet.conditionalFormattings).toEqual([
      {
        sqref: ['A1:A5'],
        rules: [
          {
            type: 'colorScale',
            dxfId: undefined,
            priority: 3,
            stopIfTrue: false,
            operator: undefined,
            text: undefined,
            formulas: [],
            colorScale: {
              values: [
                { type: 'min', value: undefined, gte: undefined },
                { type: 'percentile', value: '50', gte: false },
                { type: 'max', value: undefined, gte: undefined }
              ],
              colors: [
                {
                  color: 'rgb(248, 105, 107)',
                  colorRef: { rgb: 'FFF8696B' }
                },
                {
                  color: 'rgb(255, 235, 132)',
                  colorRef: { rgb: 'FFFFEB84' }
                },
                {
                  color: 'rgb(99, 190, 123)',
                  colorRef: { rgb: 'FF63BE7B' }
                }
              ]
            }
          }
        ]
      }
    ]);
  });

  it('should parse dataBar conditional formatting metadata', () => {
    const xml = `
      <worksheet>
        <conditionalFormatting sqref="B2:B4">
          <cfRule type="dataBar" priority="4">
            <dataBar minLength="5" maxLength="95" showValue="0">
              <cfvo type="num" val="-10"/>
              <cfvo type="num" val="40"/>
              <color rgb="FF638EC6"/>
            </dataBar>
          </cfRule>
        </conditionalFormatting>
      </worksheet>
    `;

    const sheet = WorksheetParser.parse(xml, []);

    expect(sheet.conditionalFormattings).toEqual([
      {
        sqref: ['B2:B4'],
        rules: [
          {
            type: 'dataBar',
            dxfId: undefined,
            priority: 4,
            stopIfTrue: false,
            operator: undefined,
            text: undefined,
            formulas: [],
            dataBar: {
              values: [
                { type: 'num', value: '-10', gte: undefined },
                { type: 'num', value: '40', gte: undefined }
              ],
              color: 'rgb(99, 142, 198)',
              colorRef: { rgb: 'FF638EC6' },
              minLength: 5,
              maxLength: 95,
              showValue: false
            }
          }
        ]
      }
    ]);
  });

  it('should parse iconSet conditional formatting metadata', () => {
    const xml = `
      <worksheet>
        <conditionalFormatting sqref="C1:C3">
          <cfRule type="iconSet" priority="5">
            <iconSet iconSet="3TrafficLights1" reverse="1" showValue="0">
              <cfvo type="percent" val="0"/>
              <cfvo type="percent" val="33"/>
              <cfvo type="percent" val="67" gte="0"/>
            </iconSet>
          </cfRule>
        </conditionalFormatting>
      </worksheet>
    `;

    const sheet = WorksheetParser.parse(xml, []);

    expect(sheet.conditionalFormattings).toEqual([
      {
        sqref: ['C1:C3'],
        rules: [
          {
            type: 'iconSet',
            dxfId: undefined,
            priority: 5,
            stopIfTrue: false,
            operator: undefined,
            text: undefined,
            formulas: [],
            iconSet: {
              name: '3TrafficLights1',
              values: [
                { type: 'percent', value: '0', gte: undefined },
                { type: 'percent', value: '33', gte: undefined },
                { type: 'percent', value: '67', gte: false }
              ],
              reverse: true,
              showValue: false
            }
          }
        ]
      }
    ]);
  });
});
