import type { DocxBlock, DocxDocument, DocxHeadingNode, DocxNavigation, DocxParagraph } from '../model';
import type { DocxLayoutPage } from '../layout';

export class DocxNavigationBuilder {
  static build(document: DocxDocument, pages?: DocxLayoutPage[]): DocxNavigation {
    const blockToPage = this.createBlockPageMap(pages);
    const flatHeadings: DocxHeadingNode[] = [];
    const rootHeadings: DocxHeadingNode[] = [];
    const stack: DocxHeadingNode[] = [];

    document.body.forEach((block, blockIndex) => {
      if (block.type !== 'paragraph') {
        return;
      }

      const level = this.getHeadingLevel(block, document);
      if (!level) {
        return;
      }

      const heading: DocxHeadingNode = {
        id: `heading-${flatHeadings.length + 1}`,
        text: this.getParagraphText(block) || 'Untitled heading',
        level,
        styleId: block.styleId,
        blockIndex,
        pageIndex: blockToPage.get(block),
        children: []
      };

      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }

      const parent = stack[stack.length - 1];
      if (parent) {
        parent.children.push(heading);
      } else {
        rootHeadings.push(heading);
      }

      stack.push(heading);
      flatHeadings.push(heading);
    });

    return {
      headings: rootHeadings,
      toc: flatHeadings.map(heading => ({
        id: heading.id,
        text: heading.text,
        level: heading.level,
        pageIndex: heading.pageIndex
      })),
      pages: this.createPageEntries(pages, flatHeadings)
    };
  }

  private static createBlockPageMap(pages?: DocxLayoutPage[]): Map<DocxBlock, number> {
    const blockToPage = new Map<DocxBlock, number>();
    if (!pages) {
      return blockToPage;
    }

    for (const page of pages) {
      for (const item of page.blocks) {
        blockToPage.set(item.block, page.pageIndex);
      }
    }

    return blockToPage;
  }

  private static createPageEntries(pages: DocxLayoutPage[] | undefined, headings: DocxHeadingNode[]) {
    if (!pages) {
      return [];
    }

    return pages.map(page => ({
      pageIndex: page.pageIndex,
      headingIds: headings.filter(heading => heading.pageIndex === page.pageIndex).map(heading => heading.id)
    }));
  }

  private static getHeadingLevel(paragraph: DocxParagraph, document: DocxDocument): number | undefined {
    const directLevel = this.parseHeadingLevel(paragraph.styleId);
    if (directLevel) {
      return directLevel;
    }

    const style = paragraph.styleId ? document.styles.byId.get(paragraph.styleId) : undefined;
    return this.parseHeadingLevel(style?.name);
  }

  private static parseHeadingLevel(value?: string): number | undefined {
    if (!value) {
      return undefined;
    }

    const match = value.match(/^heading\s*([1-9])$/i) || value.match(/^Heading([1-9])$/);
    if (!match) {
      return undefined;
    }

    return parseInt(match[1], 10);
  }

  private static getParagraphText(paragraph: DocxParagraph): string {
    return paragraph.runs.map(run => run.text).join('').trim();
  }
}
