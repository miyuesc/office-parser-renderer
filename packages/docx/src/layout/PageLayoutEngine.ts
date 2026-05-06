import { LayoutBox, PageBox, ParagraphStyle, TextStyle, serializeOfficeMath } from '@opr/shared';
import { DocxBlock, DocxDocument, DocxParagraph, DocxRun, DocxSection, DocxTable } from '../model';

export interface DocxLayoutOptions {
  pixelsPerTwip?: number;
  defaultPageWidth?: number;
  defaultPageHeight?: number;
  defaultMargin?: number;
}

export interface DocxLayoutBlock {
  block: DocxBlock;
  box: LayoutBox;
  overflow?: {
    clipped: boolean;
    estimatedHeight: number;
  };
}

export interface DocxLayoutPage {
  pageIndex: number;
  pageBox: PageBox;
  isCoverPage?: boolean;
  blocks: DocxLayoutBlock[];
}

export class PageLayoutEngine {
  private readonly pixelsPerTwip: number;

  constructor(private readonly options: DocxLayoutOptions = {}) {
    this.pixelsPerTwip = options.pixelsPerTwip ?? 1 / 15;
  }

  layout(document: DocxDocument): DocxLayoutPage[] {
    const hasInlineSectionBreak = document.body.some(block => block.type === 'paragraph' && !!block.section);
    const initialSection =
      hasInlineSectionBreak && document.body[0]?.type === 'paragraph' ? document.body[0].section : document.sections[0];
    let pageBox = this.createPageBox(initialSection);
    let currentSection = initialSection;
    const pages: DocxLayoutPage[] = [this.createPage(0, pageBox, currentSection)];
    let contentWidth = this.getContentWidth(pageBox);
    let contentBottom = this.getContentBottom(pageBox);
    let cursorY = pageBox.margins.top;

    for (const block of document.body) {
      if (block.type === 'paragraph' && block.section && pages[pages.length - 1].blocks.length > 0) {
        currentSection = block.section;
        pageBox = this.createPageBox(block.section);
        pages.push(this.createPage(pages.length, pageBox, currentSection));
        contentWidth = this.getContentWidth(pageBox);
        contentBottom = this.getContentBottom(pageBox);
        cursorY = pageBox.margins.top;
      } else if (block.type === 'paragraph' && block.section && pages[pages.length - 1].blocks.length === 0) {
        currentSection = block.section;
        pageBox = this.createPageBox(block.section);
        pages[pages.length - 1] = this.createPage(pages.length - 1, pageBox, currentSection);
        contentWidth = this.getContentWidth(pageBox);
        contentBottom = this.getContentBottom(pageBox);
        cursorY = pageBox.margins.top;
      }

      const height = this.estimateBlockHeight(document, block, contentWidth);

      if (cursorY + height > contentBottom && pages[pages.length - 1].blocks.length > 0) {
        pages.push(this.createPage(pages.length, pageBox, currentSection));
        cursorY = pageBox.margins.top;
      }

      const availableHeight = Math.max(1, contentBottom - cursorY);
      const clipped = height > availableHeight;

      pages[pages.length - 1].blocks.push({
        block,
        box: {
          x: pageBox.margins.left,
          y: cursorY,
          width: contentWidth,
          height: clipped ? availableHeight : height
        },
        overflow: clipped
          ? {
              clipped: true,
              estimatedHeight: height
            }
          : undefined
      });
      cursorY += clipped ? availableHeight : height;
    }

    return pages;
  }

  private createPage(pageIndex: number, pageBox: PageBox, section?: DocxSection): DocxLayoutPage {
    return { pageIndex, pageBox, isCoverPage: pageIndex === 0 && !!section?.titlePage, blocks: [] };
  }

  private createPageBox(section?: DocxSection): PageBox {
    const pageSize = section?.pageSize;
    const margins = section?.margins;
    let width = pageSize?.width ? this.toPx(pageSize.width) : this.options.defaultPageWidth ?? 794;
    let height = pageSize?.height ? this.toPx(pageSize.height) : this.options.defaultPageHeight ?? 1123;

    if (pageSize?.orientation === 'landscape' && height > width) {
      [width, height] = [height, width];
    }

    return {
      width,
      height,
      margins: {
        top: margins?.top ? this.toPx(margins.top) : this.options.defaultMargin ?? 96,
        right: margins?.right ? this.toPx(margins.right) : this.options.defaultMargin ?? 96,
        bottom: margins?.bottom ? this.toPx(margins.bottom) : this.options.defaultMargin ?? 96,
        left: margins?.left ? this.toPx(margins.left) : this.options.defaultMargin ?? 96
      }
    };
  }

  private getContentWidth(pageBox: PageBox): number {
    return pageBox.width - pageBox.margins.left - pageBox.margins.right;
  }

  private getContentBottom(pageBox: PageBox): number {
    return pageBox.height - pageBox.margins.bottom;
  }

  private estimateBlockHeight(document: DocxDocument, block: DocxBlock, width: number): number {
    if (block.type === 'table') {
      return this.estimateTableHeight(document, block, width);
    }

    return this.estimateParagraphHeight(document, block, width);
  }

  private estimateParagraphHeight(document: DocxDocument, paragraph: DocxParagraph, width: number): number {
    const paragraphStyle = this.resolveParagraphStyle(document, paragraph);
    const paragraphTextStyle = paragraphStyle.text || this.resolveParagraphTextStyle(document, paragraph);
    const lineHeight = this.getLineHeight(paragraphTextStyle, paragraphStyle);
    const spacingBefore = this.toPx(paragraphStyle.spacing?.before || 0);
    const spacingAfter = this.toPx(paragraphStyle.spacing?.after || 0);
    const leftIndent = this.toPx(paragraphStyle.indent?.left || 0);
    const rightIndent = this.toPx(paragraphStyle.indent?.right || 0);
    const firstLineOffset = this.toPx((paragraphStyle.indent?.firstLine || 0) - (paragraphStyle.indent?.hanging || 0));
    const firstLineWidth = Math.max(1, width - leftIndent - rightIndent - Math.max(0, firstLineOffset));
    const followingLineWidth = Math.max(1, width - leftIndent - rightIndent);
    let currentLineWidth = 0;
    let currentMaxWidth = firstLineWidth;
    let lineCount = 1;

    const commitLine = () => {
      lineCount += 1;
      currentLineWidth = 0;
      currentMaxWidth = followingLineWidth;
    };

    for (const run of paragraph.runs) {
      const runStyle = { ...paragraphTextStyle, ...this.resolveRunStyle(document, run), ...run.style };
      const text = run.math ? serializeOfficeMath(run.math) : run.text;
      for (const token of this.splitTextForWrap(text)) {
        if (token === '\n') {
          commitLine();
          continue;
        }

        const tokenWidth = this.estimateTextWidth(token, runStyle);
        if (currentLineWidth > 0 && currentLineWidth + tokenWidth > currentMaxWidth) {
          commitLine();
        }

        if (tokenWidth > currentMaxWidth && token.length > 1) {
          for (const character of Array.from(token)) {
            const characterWidth = this.estimateTextWidth(character, runStyle);
            if (currentLineWidth > 0 && currentLineWidth + characterWidth > currentMaxWidth) {
              commitLine();
            }
            currentLineWidth += characterWidth;
          }
        } else {
          currentLineWidth += tokenWidth;
        }
      }

      for (const br of run.breaks || []) {
        if (br === 'line' || br === 'page') {
          commitLine();
        }
      }
    }

    const imageHeight = paragraph.runs.reduce((height, run) => {
      const runImageHeight = (run.images || []).reduce((sum, image) => sum + image.position.height + 8, 0);
      return height + runImageHeight;
    }, 0);
    return spacingBefore + lineCount * lineHeight + spacingAfter + imageHeight + 6;
  }

  private estimateTableHeight(document: DocxDocument, table: DocxTable, width: number): number {
    return table.rows.reduce((height, row) => {
      const cellHeights = row.cells.map(cell =>
        cell.blocks.reduce((cellHeight, block) => cellHeight + this.estimateBlockHeight(document, block, width), 12)
      );
      return height + Math.max(28, ...cellHeights);
    }, 0);
  }

  private resolveParagraphTextStyle(document: DocxDocument, paragraph: DocxParagraph): TextStyle {
    const paragraphStyle = this.resolveParagraphStyle(document, paragraph);
    return paragraphStyle.text || {
      fontFamily: 'Arial',
      size: 11,
      color: '#111111'
    };
  }

  private resolveParagraphStyle(document: DocxDocument, paragraph: DocxParagraph): ParagraphStyle {
    const defaultParagraph = document.styles.defaults?.paragraph || {};
    const defaultText = document.styles.defaults?.run || {};
    const styleChain = paragraph.styleId ? this.resolveStyleChain(document, paragraph.styleId) : [];
    const resolved = styleChain.reduce(
      (style, docxStyle) => ({
        ...style,
        ...docxStyle.paragraph,
        text: {
          ...(style.text || {}),
          ...(docxStyle.text || {}),
          ...(docxStyle.paragraph?.text || {})
        }
      }),
      {
        ...defaultParagraph,
        text: {
          fontFamily: 'Arial',
          size: 11,
          color: '#111111',
          ...defaultText,
          ...(defaultParagraph.text || {})
        }
      } as ParagraphStyle
    );

    return {
      ...resolved,
      ...paragraph.style,
      text: {
        ...(resolved.text || {}),
        ...(paragraph.style?.text || {})
      }
    };
  }

  private resolveRunStyle(document: DocxDocument, run: DocxRun): TextStyle {
    if (!run.styleId) {
      return {};
    }

    return this.resolveStyleChain(document, run.styleId).reduce(
      (style, docxStyle) => ({
        ...style,
        ...(docxStyle.text || {})
      }),
      {} as TextStyle
    );
  }

  private resolveStyleChain(document: DocxDocument, styleId: string) {
    const chain = [];
    const seen = new Set<string>();
    let current = document.styles.byId.get(styleId);
    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      chain.unshift(current);
      current = current.basedOn ? document.styles.byId.get(current.basedOn) : undefined;
    }
    return chain;
  }

  private splitTextForWrap(text: string): string[] {
    return text.split(/(\n|\s+)/).filter(part => part.length > 0);
  }

  private estimateTextWidth(text: string, style: TextStyle): number {
    const fontPx = (style.size || 11) * 1.333;
    return Array.from(text).reduce((width, character) => {
      if (/\s/.test(character)) {
        return width + fontPx * 0.35;
      }
      if (/[\u2e80-\u9fff\uff00-\uffef]/.test(character)) {
        return width + fontPx;
      }
      return width + fontPx * 0.58;
    }, 0);
  }

  private getLineHeight(style: TextStyle, paragraphStyle?: ParagraphStyle) {
    const fontHeight = (style.size || 11) * 1.333;
    const requestedLineHeight = paragraphStyle?.spacing?.line ? this.toPx(paragraphStyle.spacing.line) : 0;
    return Math.ceil(Math.max(fontHeight * 1.45, requestedLineHeight, fontHeight + 6));
  }

  private toPx(twips: number): number {
    return Math.round(twips * this.pixelsPerTwip);
  }
}
