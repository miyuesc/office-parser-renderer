/**
 * DOCX 段落相关类型定义
 *
 * 此文件包含段落、运行、文本等段落内元素的类型定义
 * 由于文件较大，完整类型将在后续完善
 */

// 导出段落、表格、绘图、分节符的联合类型
export type DocxElement = Paragraph | Table | Drawing | SectionBreak;

// 基础接口（完整定义待补充）
export interface Paragraph {
  type: 'paragraph';
  props: any; // ParagraphProperties - 待补充完整定义
  children: any[]; // ParagraphChild[] - 待补充完整定义
}

export interface Table {
  type: 'table';
  // 待补充完整定义
}

export interface Drawing {
  type: 'drawing';
  // 待补充完整定义
}

export interface SectionBreak {
  type: 'sectionBreak';
  sectPr: any; // DocxSection - 待补充完整定义
}

// 注：此文件需要从原 types.ts 补充完整的段落相关类型定义
// 包括：Run, Text, Hyperlink, Field, BookMark, Math 等
