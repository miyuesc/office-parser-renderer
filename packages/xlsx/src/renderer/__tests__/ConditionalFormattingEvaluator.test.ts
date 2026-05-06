import { describe, expect, it } from 'vitest';
import { ColorUtils } from '@opr/shared';
import { ConditionalFormattingEvaluator } from '../ConditionalFormattingEvaluator';
import { Styles, Worksheet } from '../../parser/types';

describe('ConditionalFormattingEvaluator', () => {
  const styles: Styles = {
    fonts: [],
    fills: [],
    borders: [],
    cellXfs: [],
    numFmts: new Map(),
    differentialStyles: [
      {
        fill: {
          type: 'pattern',
          patternType: 'solid',
          fgColor: '#ff0000'
        }
      },
      {
        font: {
          bold: true,
          color: '#00ff00'
        }
      }
    ]
  };
  const dateStyles: Styles = {
    ...styles,
    cellXfs: [
      {
        fontId: 0,
        fillId: 0,
        borderId: 0,
        numFmtId: 164,
        applyNumberFormat: true
      }
    ],
    numFmts: new Map([[164, 'yyyy-mm-dd']])
  };
  const toExcelSerial = (year: number, month: number, day: number) =>
    Date.UTC(year, month - 1, day) / (24 * 60 * 60 * 1000) + 25569;

  it('should evaluate cellIs and stopIfTrue in priority order', () => {
    const worksheet: Worksheet = {
      name: 'CF',
      rows: new Map([
        [
          1,
          {
            index: 1,
            cells: new Map([[1, { row: 1, col: 1, type: 'number', value: 12 }]])
          }
        ]
      ]),
      cols: new Map(),
      conditionalFormattings: [
        {
          sqref: ['A1'],
          rules: [
            {
              type: 'cellIs',
              dxfId: 0,
              priority: 1,
              operator: 'greaterThan',
              stopIfTrue: true,
              formulas: ['10']
            },
            {
              type: 'cellIs',
              dxfId: 1,
              priority: 2,
              operator: 'greaterThan',
              formulas: ['5']
            }
          ]
        }
      ]
    };

    const evaluator = new ConditionalFormattingEvaluator(worksheet, styles);

    expect(evaluator.getStyle(1, 1)).toMatchObject({
      fill: {
        fgColor: '#ff0000'
      }
    });
    expect(evaluator.getStyle(1, 1)?.font).toBeUndefined();
  });

  it('should evaluate text and duplicate-value rules', () => {
    const worksheet: Worksheet = {
      name: 'CF',
      rows: new Map([
        [
          1,
          {
            index: 1,
            cells: new Map([
              [1, { row: 1, col: 1, type: 'string', value: 'Warning' }],
              [2, { row: 1, col: 2, type: 'string', value: 'Warning' }]
            ])
          }
        ]
      ]),
      cols: new Map(),
      conditionalFormattings: [
        {
          sqref: ['A1:B1'],
          rules: [
            {
              type: 'containsText',
              dxfId: 1,
              priority: 1,
              text: 'warn',
              formulas: []
            },
            {
              type: 'duplicateValues',
              dxfId: 0,
              priority: 2,
              formulas: []
            }
          ]
        }
      ]
    };

    const evaluator = new ConditionalFormattingEvaluator(worksheet, styles);
    const style = evaluator.getStyle(1, 1);

    expect(style).toMatchObject({
      fill: {
        fgColor: '#ff0000'
      },
      font: {
        bold: true,
        color: '#00ff00'
      }
    });
  });

  it('should evaluate expression rules with relative references and functions', () => {
    const worksheet: Worksheet = {
      name: 'CF',
      rows: new Map([
        [
          1,
          {
            index: 1,
            cells: new Map([
              [1, { row: 1, col: 1, type: 'string', value: 'warn' }],
              [2, { row: 1, col: 2, type: 'number', value: 1 }]
            ])
          }
        ],
        [
          2,
          {
            index: 2,
            cells: new Map([
              [1, { row: 2, col: 1, type: 'string', value: 'warn' }],
              [2, { row: 2, col: 2, type: 'number', value: 1 }]
            ])
          }
        ],
        [
          3,
          {
            index: 3,
            cells: new Map([
              [1, { row: 3, col: 1, type: 'string', value: 'ok' }],
              [2, { row: 3, col: 2, type: 'number', value: 1 }]
            ])
          }
        ]
      ]),
      cols: new Map(),
      conditionalFormattings: [
        {
          sqref: ['B1:B3'],
          rules: [
            {
              type: 'expression',
              dxfId: 0,
              priority: 1,
              formulas: ['AND($A1="warn",MOD(ROW(),2)=0)']
            }
          ]
        }
      ]
    };

    const evaluator = new ConditionalFormattingEvaluator(worksheet, styles);

    expect(evaluator.getStyle(1, 2)).toBeUndefined();
    expect(evaluator.getStyle(2, 2)?.fill?.fgColor).toBe('#ff0000');
    expect(evaluator.getStyle(3, 2)).toBeUndefined();
  });

  it('should evaluate cellIs formulas relative to the covered range anchor', () => {
    const worksheet: Worksheet = {
      name: 'CF',
      rows: new Map([
        [
          1,
          {
            index: 1,
            cells: new Map([
              [1, { row: 1, col: 1, type: 'number', value: 5 }],
              [2, { row: 1, col: 2, type: 'number', value: 5 }]
            ])
          }
        ],
        [
          2,
          {
            index: 2,
            cells: new Map([
              [1, { row: 2, col: 1, type: 'number', value: 3 }],
              [2, { row: 2, col: 2, type: 'number', value: 4 }]
            ])
          }
        ]
      ]),
      cols: new Map(),
      conditionalFormattings: [
        {
          sqref: ['B1:B2'],
          rules: [
            {
              type: 'cellIs',
              dxfId: 1,
              priority: 1,
              operator: 'equal',
              formulas: ['A1']
            }
          ]
        }
      ]
    };

    const evaluator = new ConditionalFormattingEvaluator(worksheet, styles);

    expect(evaluator.getStyle(1, 2)?.font?.bold).toBe(true);
    expect(evaluator.getStyle(2, 2)).toBeUndefined();
  });

  it('should evaluate top10 percent and bottom rules against numeric blocks', () => {
    const worksheet: Worksheet = {
      name: 'CF',
      rows: new Map(
        [10, 20, 30, 40, 50].map((value, index) => [
          index + 1,
          {
            index: index + 1,
            cells: new Map([[1, { row: index + 1, col: 1, type: 'number', value }]])
          }
        ])
      ),
      cols: new Map(),
      conditionalFormattings: [
        {
          sqref: ['A1:A5'],
          rules: [
            {
              type: 'top10',
              dxfId: 0,
              priority: 1,
              rank: 40,
              percent: true,
              bottom: true,
              formulas: []
            }
          ]
        }
      ]
    };

    const evaluator = new ConditionalFormattingEvaluator(worksheet, styles);

    expect(evaluator.getStyle(1, 1)?.fill?.fgColor).toBe('#ff0000');
    expect(evaluator.getStyle(2, 1)?.fill?.fgColor).toBe('#ff0000');
    expect(evaluator.getStyle(3, 1)).toBeUndefined();
    expect(evaluator.getStyle(5, 1)).toBeUndefined();
  });

  it('should evaluate aboveAverage rules with standard deviation thresholds', () => {
    const worksheet: Worksheet = {
      name: 'CF',
      rows: new Map(
        [1, 2, 3, 10].map((value, index) => [
          index + 1,
          {
            index: index + 1,
            cells: new Map([[1, { row: index + 1, col: 1, type: 'number', value }]])
          }
        ])
      ),
      cols: new Map(),
      conditionalFormattings: [
        {
          sqref: ['A1:A4'],
          rules: [
            {
              type: 'aboveAverage',
              dxfId: 1,
              priority: 1,
              stdDev: 1,
              formulas: []
            }
          ]
        }
      ]
    };

    const evaluator = new ConditionalFormattingEvaluator(worksheet, styles);

    expect(evaluator.getStyle(1, 1)).toBeUndefined();
    expect(evaluator.getStyle(4, 1)?.font?.bold).toBe(true);
    expect(evaluator.getStyle(4, 1)?.font?.color).toBe('#00ff00');
  });

  it('should evaluate timePeriod rules for relative day windows', () => {
    const worksheet: Worksheet = {
      name: 'CF',
      rows: new Map([
        [1, { index: 1, cells: new Map([[1, { row: 1, col: 1, type: 'number', value: toExcelSerial(2024, 5, 15), styleId: 0 }]]) }],
        [2, { index: 2, cells: new Map([[1, { row: 2, col: 1, type: 'number', value: toExcelSerial(2024, 5, 14), styleId: 0 }]]) }],
        [3, { index: 3, cells: new Map([[1, { row: 3, col: 1, type: 'number', value: toExcelSerial(2024, 5, 16), styleId: 0 }]]) }],
        [4, { index: 4, cells: new Map([[1, { row: 4, col: 1, type: 'number', value: toExcelSerial(2024, 5, 9), styleId: 0 }]]) }],
        [5, { index: 5, cells: new Map([[1, { row: 5, col: 1, type: 'number', value: toExcelSerial(2024, 5, 8), styleId: 0 }]]) }],
        [6, { index: 6, cells: new Map([[1, { row: 6, col: 1, type: 'number', value: 42 }]]) }]
      ]),
      cols: new Map(),
      conditionalFormattings: [
        {
          sqref: ['A1'],
          rules: [{ type: 'timePeriod', dxfId: 0, priority: 1, timePeriod: 'today', formulas: [] }]
        },
        {
          sqref: ['A2'],
          rules: [{ type: 'timePeriod', dxfId: 1, priority: 1, timePeriod: 'yesterday', formulas: [] }]
        },
        {
          sqref: ['A3'],
          rules: [{ type: 'timePeriod', dxfId: 0, priority: 1, timePeriod: 'tomorrow', formulas: [] }]
        },
        {
          sqref: ['A4:A6'],
          rules: [{ type: 'timePeriod', dxfId: 1, priority: 1, timePeriod: 'last7Days', formulas: [] }]
        }
      ]
    };

    const evaluator = new ConditionalFormattingEvaluator(worksheet, dateStyles, {
      now: new Date('2024-05-15T12:00:00Z')
    });

    expect(evaluator.getStyle(1, 1)?.fill?.fgColor).toBe('#ff0000');
    expect(evaluator.getStyle(2, 1)?.font?.bold).toBe(true);
    expect(evaluator.getStyle(3, 1)?.fill?.fgColor).toBe('#ff0000');
    expect(evaluator.getStyle(4, 1)?.font?.color).toBe('#00ff00');
    expect(evaluator.getStyle(5, 1)).toBeUndefined();
    expect(evaluator.getStyle(6, 1)).toBeUndefined();
  });

  it('should evaluate timePeriod week and month windows', () => {
    const worksheet: Worksheet = {
      name: 'CF',
      rows: new Map([
        [1, { index: 1, cells: new Map([[1, { row: 1, col: 1, type: 'number', value: toExcelSerial(2024, 5, 12), styleId: 0 }]]) }],
        [2, { index: 2, cells: new Map([[1, { row: 2, col: 1, type: 'number', value: toExcelSerial(2024, 5, 11), styleId: 0 }]]) }],
        [3, { index: 3, cells: new Map([[1, { row: 3, col: 1, type: 'number', value: toExcelSerial(2024, 5, 19), styleId: 0 }]]) }],
        [4, { index: 4, cells: new Map([[1, { row: 4, col: 1, type: 'number', value: toExcelSerial(2024, 5, 31), styleId: 0 }]]) }],
        [5, { index: 5, cells: new Map([[1, { row: 5, col: 1, type: 'number', value: toExcelSerial(2024, 4, 30), styleId: 0 }]]) }],
        [6, { index: 6, cells: new Map([[1, { row: 6, col: 1, type: 'number', value: toExcelSerial(2024, 6, 1), styleId: 0 }]]) }]
      ]),
      cols: new Map(),
      conditionalFormattings: [
        {
          sqref: ['A1'],
          rules: [{ type: 'timePeriod', dxfId: 0, priority: 1, timePeriod: 'thisWeek', formulas: [] }]
        },
        {
          sqref: ['A2'],
          rules: [{ type: 'timePeriod', dxfId: 1, priority: 1, timePeriod: 'lastWeek', formulas: [] }]
        },
        {
          sqref: ['A3'],
          rules: [{ type: 'timePeriod', dxfId: 0, priority: 1, timePeriod: 'nextWeek', formulas: [] }]
        },
        {
          sqref: ['A4'],
          rules: [{ type: 'timePeriod', dxfId: 1, priority: 1, timePeriod: 'thisMonth', formulas: [] }]
        },
        {
          sqref: ['A5'],
          rules: [{ type: 'timePeriod', dxfId: 0, priority: 1, timePeriod: 'lastMonth', formulas: [] }]
        },
        {
          sqref: ['A6'],
          rules: [{ type: 'timePeriod', dxfId: 1, priority: 1, timePeriod: 'nextMonth', formulas: [] }]
        }
      ]
    };

    const evaluator = new ConditionalFormattingEvaluator(worksheet, dateStyles, {
      now: new Date('2024-05-15T12:00:00Z')
    });

    expect(evaluator.getStyle(1, 1)?.fill?.fgColor).toBe('#ff0000');
    expect(evaluator.getStyle(2, 1)?.font?.bold).toBe(true);
    expect(evaluator.getStyle(3, 1)?.fill?.fgColor).toBe('#ff0000');
    expect(evaluator.getStyle(4, 1)?.font?.color).toBe('#00ff00');
    expect(evaluator.getStyle(5, 1)?.fill?.fgColor).toBe('#ff0000');
    expect(evaluator.getStyle(6, 1)?.font?.bold).toBe(true);
  });

  it('should evaluate colorScale fills with percentile midpoints', () => {
    const worksheet: Worksheet = {
      name: 'CF',
      rows: new Map(
        [10, 20, 30, 40, 50].map((value, index) => [
          index + 1,
          {
            index: index + 1,
            cells: new Map([[1, { row: index + 1, col: 1, type: 'number', value }]])
          }
        ])
      ),
      cols: new Map(),
      conditionalFormattings: [
        {
          sqref: ['A1:A5'],
          rules: [
            {
              type: 'colorScale',
              priority: 1,
              formulas: [],
              colorScale: {
                values: [{ type: 'min' }, { type: 'percentile', value: '50' }, { type: 'max' }],
                colors: [{ color: '#ff0000' }, { color: '#ffff00' }, { color: '#00ff00' }]
              }
            }
          ]
        }
      ]
    };

    const evaluator = new ConditionalFormattingEvaluator(worksheet, styles);

    expect(evaluator.getStyle(1, 1)?.fill?.fgColor).toBe('#ff0000');
    expect(evaluator.getStyle(3, 1)?.fill?.fgColor).toBe('rgb(255, 255, 0)');
    expect(evaluator.getStyle(4, 1)?.fill?.fgColor).toBe(ColorUtils.interpolateColor('#ffff00', '#00ff00', 0.5));
  });

  it('should evaluate dataBar geometry for mixed-sign ranges', () => {
    const worksheet: Worksheet = {
      name: 'CF',
      rows: new Map(
        [-20, -10, 0, 20, 40].map((value, index) => [
          index + 1,
          {
            index: index + 1,
            cells: new Map([[1, { row: index + 1, col: 1, type: 'number', value }]])
          }
        ])
      ),
      cols: new Map(),
      conditionalFormattings: [
        {
          sqref: ['A1:A5'],
          rules: [
            {
              type: 'dataBar',
              priority: 1,
              formulas: [],
              dataBar: {
                values: [{ type: 'min' }, { type: 'max' }],
                color: '#638ec6',
                minLength: 10,
                maxLength: 90,
                showValue: false
              }
            }
          ]
        }
      ]
    };

    const evaluator = new ConditionalFormattingEvaluator(worksheet, styles);

    expect(evaluator.getStyle(1, 1)?.dataBar?.color).toBe('#638ec6');
    expect(evaluator.getStyle(1, 1)?.dataBar?.showValue).toBe(false);
    expect(evaluator.getStyle(1, 1)?.dataBar?.xRatio).toBeCloseTo(1 / 30, 6);
    expect(evaluator.getStyle(1, 1)?.dataBar?.widthRatio).toBeCloseTo(0.3, 6);
    expect(evaluator.getStyle(4, 1)?.dataBar?.xRatio).toBeCloseTo(1 / 3, 6);
    expect(evaluator.getStyle(4, 1)?.dataBar?.widthRatio).toBeCloseTo(1 / 3, 6);
    expect(evaluator.getStyle(3, 1)?.dataBar).toMatchObject({
      xRatio: 1 / 3,
      widthRatio: 0
    });
  });

  it('should evaluate iconSet buckets with reverse and showValue', () => {
    const worksheet: Worksheet = {
      name: 'CF',
      rows: new Map(
        [10, 40, 80].map((value, index) => [
          index + 1,
          {
            index: index + 1,
            cells: new Map([[1, { row: index + 1, col: 1, type: 'number', value }]])
          }
        ])
      ),
      cols: new Map(),
      conditionalFormattings: [
        {
          sqref: ['A1:A3'],
          rules: [
            {
              type: 'iconSet',
              priority: 1,
              formulas: [],
              iconSet: {
                name: '3TrafficLights1',
                reverse: true,
                showValue: false,
                values: [{ type: 'percent', value: '0' }, { type: 'percent', value: '33' }, { type: 'percent', value: '67' }]
              }
            }
          ]
        }
      ]
    };

    const evaluator = new ConditionalFormattingEvaluator(worksheet, styles);

    expect(evaluator.getStyle(1, 1)?.iconSet).toEqual({
      name: '3TrafficLights1',
      iconIndex: 2,
      iconCount: 3,
      showValue: false
    });
    expect(evaluator.getStyle(2, 1)?.iconSet?.iconIndex).toBe(1);
    expect(evaluator.getStyle(3, 1)?.iconSet?.iconIndex).toBe(0);
  });
});
