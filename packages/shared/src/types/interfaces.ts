/**
 * Core interfaces for parsers and renderers.
 * All format-specific implementations (XLSX, DOCX, PPTX) should adhere to these interfaces
 * to ensure consistency and interoperability.
 */

/**
 * Base Parser Interface
 * @template T The type of the document model returned by the parser.
 */
export interface BaseParser<T> {
  /**
   * Parse a binary buffer into a document model.
   * @param buffer The binary content of the file (e.g., .xlsx, .docx).
   * @returns A promise that resolves to the parsed document model.
   */
  parse(buffer: ArrayBuffer): Promise<T>;
}

/**
 * Base Renderer Interface
 * @template T The type of the document model to render.
 */
export interface BaseRenderer<T> {
  /**
   * Render the document model into a container.
   * @param document The parsed document model.
   * @param container The HTML element to render into.
   */
  render(document: T, container: HTMLElement): void;

  /**
   * Clean up resources (event listeners, canvas contexts, etc.).
   */
  destroy(): void;
}
