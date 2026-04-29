/**
 * XLSX 文档内部模型 (Internal Model)
 * 用于在渲染层和解析层之间传递数据，屏蔽 XML 结构的复杂性
 */

export interface XlsxDocument {
  worksheets: Map<string, Worksheet>; // stable sheet id when available, otherwise fallback sheet number
  sharedStrings: (string | RichTextRun[])[];
  styles?: Styles;
}

import {
  OfficeImage,
  OfficeShape,
  OfficeChart,
  ColorRef,
  FontDescriptor,
  ThemeModel,
  TextStyle,
  FillStyle,
  StrokeStyle
} from '@opr/shared';

export interface Worksheet {
  id?: string;
  sheetId?: string;
  name: string;
  path?: string;
  relationshipId?: string;
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
  drawings?: (OfficeImage | OfficeShape | OfficeChart)[];
  drawingRId?: string;
  hyperlinks?: WorksheetHyperlink[];
}

export interface WorksheetHyperlink {
  ref: string;
  target?: string;
  location?: string;
  tooltip?: string;
  display?: string;
  relationshipId?: string;
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
  hyperlink?: WorksheetHyperlink;
}

export interface Styles {
  fonts: Font[];
  fills: Fill[];
  borders: Border[]; // Index -> Border
  cellXfs: CellXf[]; // Index -> Style
  numFmts: Map<number, string>; // numFmtId -> formatCode
  theme?: ThemeModel;
}

export interface Border {
  left?: BorderPr;
  right?: BorderPr;
  top?: BorderPr;
  bottom?: BorderPr;
  diagonal?: BorderPr;
}

export interface BorderPr extends StrokeStyle {
  style?: string; // 'thin', 'medium', 'thick', 'double', etc.
  color?: string; // CSS color string
  colorRef?: ColorRef;
}

export interface Font extends TextStyle {
  name?: string;
  size?: number;
  color?: string; // CSS color string
  colorRef?: ColorRef;
  descriptor?: FontDescriptor;
  scheme?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
}

export interface Fill extends FillStyle {
  type: 'pattern' | 'gradient';
  patternType?: string;
  fgColor?: string;
  bgColor?: string;
  fgColorRef?: ColorRef;
  bgColorRef?: ColorRef;
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
