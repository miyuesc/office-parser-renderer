import { ST_XAlign, ST_YAlign } from '@ai-space/definitions/autogen/wml';

/**
 * Horizontal alignment options.
 * Maps to logical alignments in Office documents and CSS `text-align`.
 */
export type HorizontalAlignment = ST_XAlign;

/**
 * Vertical alignment options.
 * Maps to logical vertical alignments in Office documents and CSS `vertical-align`.
 */
export type VerticalAlignment = ST_YAlign | 'auto'; // 'auto' is not in ST_YAlign but useful for renderer
