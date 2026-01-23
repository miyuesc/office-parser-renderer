/**
 * DOCX 文档级别类型定义
 */

import type { DocxElement } from './paragraph';
import type { DocxSection } from './section';
import type { DocxStyles, NumberingDefinition } from './styles';

/**
 * DOCX 文档接口
 * 表示完整解析后的 DOCX 文档结构
 */
export interface DocxDocument {
  /** 文档主体内容 */
  body: DocxElement[];
  /** 分节列表（每个分节包含页面配置） */
  sections: DocxSection[];
  /** 样式定义 */
  styles: DocxStyles;
  /** 列表编号定义 */
  numbering: NumberingDefinition;
  /** 关系映射 (rId -> target) */
  relationships: Record<string, string>;
  /** 图片资源 (路径 -> Blob URL) */
  images: Record<string, string>;
  /** 字体表 */
  fonts?: DocxFontTable;
  /** 文档设置 */
  settings?: DocxSettings;
  /** 主题信息 */
  theme?: DocxTheme;
  /** 文档背景色 */
  background?: string;
}

/**
 * 文档设置接口
 */
export interface DocxSettings {
  /** 默认制表符间距 (twips) */
  defaultTabStop?: number;
  /** 兼容性设置 */
  compat?: Record<string, boolean>;
}

/**
 * 字体表接口
 */
export interface DocxFontTable {
  /** 字体映射（字体名称 -> 字体信息） */
  fonts: Record<string, DocxFontInfo>;
}

/**
 * 字体信息接口
 */
export interface DocxFontInfo {
  /** 字体名称 */
  name: string;
  /** 字体族 */
  family?: string;
  /** 字符集 */
  charset?: string;
  /** 嵌入字体文件路径 */
  embedPath?: string;
}

/**
 * 主题接口
 */
export interface DocxTheme {
  /** 主题名称 */
  name?: string;
  /** 颜色方案 */
  colorScheme: Record<string, string>;
  /** 主要字体 */
  majorFont?: ThemeFontScheme;
  /** 次要字体 */
  minorFont?: ThemeFontScheme;
}

/**
 * 主题字体方案接口
 */
export interface ThemeFontScheme {
  latin?: string;
  ea?: string;
  cs?: string;
  font?: Array<{ script: string; typeface: string }>;
}
