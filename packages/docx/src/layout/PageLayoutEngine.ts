import { LayoutBox, PageBox } from '@opr/shared';
import { DocxBlock, DocxDocument, DocxParagraph, DocxSection, DocxTable } from '../model';

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

      const height = this.estimateBlockHeight(block, contentWidth);

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

  private estimateBlockHeight(block: DocxBlock, width: number): number {
    if (block.type === 'table') {
      return this.estimateTableHeight(block, width);
    }

    return this.estimateParagraphHeight(block, width);
  }

  private estimateParagraphHeight(paragraph: DocxParagraph, width: number): number {
    const text = paragraph.runs.map(run => run.text).join('');
    const approximateCharsPerLine = Math.max(12, Math.floor(width / 7));
    const lines = Math.max(1, Math.ceil(text.length / approximateCharsPerLine));
    const imageHeight = paragraph.runs.reduce((height, run) => {
      const runImageHeight = (run.images || []).reduce((sum, image) => sum + image.position.height + 8, 0);
      return height + runImageHeight;
    }, 0);
    return lines * 22 + imageHeight + 8;
  }

  private estimateTableHeight(table: DocxTable, width: number): number {
    return table.rows.reduce((height, row) => {
      const cellHeights = row.cells.map(cell =>
        cell.blocks.reduce((cellHeight, block) => cellHeight + this.estimateBlockHeight(block, width), 12)
      );
      return height + Math.max(28, ...cellHeights);
    }, 0);
  }

  private toPx(twips: number): number {
    return Math.round(twips * this.pixelsPerTwip);
  }
}
