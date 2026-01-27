/**
 * DOCX 段落相关类型定义
 *
 * 此文件包含段落、运行、文本等段落内元素的类型定义
 */

import type { RunProperties } from './styles';

import type { SectionBreak } from './section';

// 导出段落、表格、绘图、分节符的联合类型
export type DocxElement = Paragraph | Table | Drawing | SectionBreak;

export type ParagraphChild = Run | Tab | LineBreak | Hyperlink | Field | Bookmark | Drawing;

/**
 * 段落接口
 */
export interface Paragraph {
  type: 'paragraph';
  props: ParagraphProperties;
  children: ParagraphChild[];
}

/**
 * 段落属性
 */
export interface ParagraphProperties {
  styleId?: string;
  justification?: 'left' | 'center' | 'right' | 'both' | 'distribute';
  indentation?: Indentation;
  spacing?: ParagraphSpacing;
  shading?: any; // To be typed
  borders?: any; // To be typed
  numbering?: any; // To be typed
  tabs?: TabStop[];
  [key: string]: unknown;
}

export interface Indentation {
  left?: number;
  right?: number;
  firstLine?: number;
  hanging?: number;
  start?: number; // same as left
  end?: number; // same as right
}

export interface ParagraphSpacing {
  before?: number;
  after?: number;
  line?: number;
  lineRule?: 'auto' | 'exact' | 'atLeast';
}

export interface TabStop {
  position: number;
  val: 'clear' | 'left' | 'center' | 'right' | 'decimal' | 'bar' | 'num';
  leader?: 'none' | 'dot' | 'hyphen' | 'underscore' | 'heavy' | 'middleDot';
}

export interface Run {
  type: 'run';
  props: RunProperties;
  text: string;
}

export interface Tab {
  type: 'tab';
}

export interface LineBreak {
  type: 'break';
  breakType?: 'textWrapping' | 'column' | 'page';
  clear?: 'none' | 'left' | 'right' | 'all';
}

export interface Hyperlink {
  type: 'hyperlink';
  id?: string;
  url?: string;
  history?: boolean;
  anchor?: string;
  children: ParagraphChild[];
}

export interface Field {
  type: 'field';
  instruction: string;
  dirty?: boolean;
  result?: ParagraphChild[];
}

export interface Bookmark {
  type: 'bookmarkStart' | 'bookmarkEnd';
  id: string;
  name?: string;
}

export interface Table {
  type: 'table';
  // 待补充完整定义
  [key: string]: any;
}

export interface Drawing {
  type: 'drawing';
  // 待补充完整定义
  [key: string]: any;
}
