/**
 * Interface for rendering rich text.
 * Implementations can be Canvas-based or DOM-based.
 */
export interface IRichTextRenderer {
  render(text: string, style: any, x: number, y: number): void;
  measure(text: string, style: any): { width: number; height: number };
}

/**
 * Abstract base class for Rich Text Rendering
 */
export abstract class BaseRichTextRenderer implements IRichTextRenderer {
  abstract render(text: string, style: any, x: number, y: number): void;
  abstract measure(text: string, style: any): { width: number; height: number };
}
