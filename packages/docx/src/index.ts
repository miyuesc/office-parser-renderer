/**
 * @ai-space/docx
 *
 * DOCX 文件解析和渲染库
 */

// 类型导出
export * from './types';

// 解析器导出
export { DocxParser } from './parser/DocxParser';
export { DocumentParser } from './parser/DocumentParser';
export { StylesParser } from './parser/StylesParser';
export { ParagraphParser } from './parser/ParagraphParser';
export { RunParser } from './parser/RunParser';
export { TableParser } from './parser/TableParser';
export { SectionParser } from './parser/SectionParser';
export { HeaderFooterParser } from './parser/HeaderFooterParser';
export { DrawingParser } from './parser/DrawingParser';
export { NumberingParser } from './parser/NumberingParser';
export { RelationshipsParser } from './parser/RelationshipsParser';
export { MediaParser } from './parser/MediaParser';

// 渲染器导出
export { DocxRenderer } from './renderer/DocxRenderer';
export { PageCalculator } from './renderer/PageCalculator';
export { ParagraphRenderer } from './renderer/ParagraphRenderer';
export { RunRenderer } from './renderer/RunRenderer';
export { TableRenderer } from './renderer/TableRenderer';
export { HeaderFooterRenderer } from './renderer/HeaderFooterRenderer';
export { DrawingRenderer } from './renderer/DrawingRenderer';
export { ListCounter } from './renderer/ListCounter';

// 工具导出
export { UnitConverter } from '@ai-space/shared';
export { Logger, LogLevel, TaggedLogger } from './utils/Logger';
export { ErrorHandler, DocxError, DocxErrorCode } from './utils/ErrorHandler';
