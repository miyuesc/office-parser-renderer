/**
 * XLSX 文档内部模型 (Internal Model)
 * 用于在渲染层和解析层之间传递数据，屏蔽 XML 结构的复杂性
 */

export interface XlsxDocument {
  worksheets: Map<string, Worksheet>; // sheetId -> Worksheet
  sharedStrings: (string | RichTextRun[])[];
  styles?: Styles;
}

export interface Worksheet {
  name: string;
  rows: Map<number, Row>; // rowIndex (1-based) -> Row
  cols: Map<number, Column>; // colIndex -> Column info
  merges?: string[]; // Array of ref strings, e.g., "A1:C3"
  dimension?: {
    // A1:C10
    startStr: string;
    endStr: string;
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  };
  frozen?: {
    xSplit: number;
    ySplit: number;
    topLeftCell?: string;
    state?: string; // 'frozen' | 'split'
  };
}

export interface Column {
  min: number;
  max: number;
  width: number;
  customWidth: boolean;
}

export interface Row {
  index: number; // 1-based
  cells: Map<number, Cell>; // colIndex (1-based) -> Cell
  height?: number;
  customHeight?: boolean;
}

export type CellType = 'string' | 'number' | 'boolean' | 'date' | 'error' | 'sharedString' | 'inlineString';

export interface RichTextRun {
  text: string;
  font?: Font;
}

export interface Cell {
  row: number; // 1-based
  col: number; // 1-based
  value: string | number | boolean;
  richText?: RichTextRun[]; // Add this
  type: CellType;
  formula?: string;
  styleId?: number;
}

export interface Styles {
  fonts: Font[];
  fills: Fill[];
  borders: Border[]; // Index -> Border
  cellXfs: CellXf[]; // Index -> Style
  numFmts: Map<number, string>; // numFmtId -> formatCode
}

export interface Border {
  left?: BorderPr;
  right?: BorderPr;
  top?: BorderPr;
  bottom?: BorderPr;
  diagonal?: BorderPr;
}

export interface BorderPr {
  style?: string; // 'thin', 'medium', 'thick', 'double', etc.
  color?: string; // CSS color string
}

export interface Font {
  name?: string;
  size?: number;
  color?: string; // CSS color string
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
}

export interface Fill {
  type: 'pattern' | 'gradient';
  patternType?: string;
  fgColor?: string;
  bgColor?: string;
}

export interface CellXf {
  numFmtId?: number;
  fontId: number;
  fillId: number;
  borderId: number; // Add this
  applyFont?: boolean;
  applyFill?: boolean;
  applyBorder?: boolean; // Add this
  applyNumberFormat?: boolean;
  alignment?: Alignment;
}

export interface Alignment {
  horizontal?: 'left' | 'center' | 'right';
  vertical?: 'top' | 'center' | 'bottom';
  wrapText?: boolean;
}
