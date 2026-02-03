/**
 * XLSX 文档内部模型 (Internal Model)
 * 用于在渲染层和解析层之间传递数据，屏蔽 XML 结构的复杂性
 */

export interface XlsxDocument {
  worksheets: Map<string, Worksheet>; // sheetId -> Worksheet
  sharedStrings: string[];
  styles?: Styles;
}

export interface Worksheet {
  name: string;
  rows: Map<number, Row>; // rowIndex (1-based) -> Row
  cols: Map<number, Column>; // colIndex -> Column info
  dimension?: {
    // A1:C10
    startStr: string;
    endStr: string;
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
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

export interface Cell {
  row: number; // 1-based
  col: number; // 1-based
  value: string | number | boolean;
  type: CellType;
  formula?: string;
  styleId?: number;
}

export type CellType = 'string' | 'number' | 'boolean' | 'date' | 'error' | 'sharedString' | 'inlineString';

export interface Styles {
  fonts: Font[];
  fills: Fill[];
  cellXfs: CellXf[]; // Index -> Style
}

export interface Font {
  name?: string;
  size?: number;
  color?: string; // CSS color string
  bold?: boolean;
  italic?: boolean;
}

export interface Fill {
  type: 'pattern' | 'gradient';
  patternType?: string;
  fgColor?: string;
  bgColor?: string;
}

export interface CellXf {
  fontId: number;
  fillId: number;
  applyFont?: boolean;
  applyFill?: boolean;
  alignment?: Alignment;
}

export interface Alignment {
  horizontal?: 'left' | 'center' | 'right';
  vertical?: 'top' | 'center' | 'bottom';
  wrapText?: boolean;
}
