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
  section?: DocxSection;
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

      if (this.startsWithRenderedPageBreak(block) && pages[pages.length - 1].blocks.length > 0) {
        pages.push(this.createPage(pages.length, pageBox, currentSection));
        cursorY = pageBox.margins.top;
      }

      const height = this.estimateBlockHeight(document, block, contentWidth, currentSection);

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
    return { pageIndex, pageBox, section, isCoverPage: pageIndex === 0 && !!section?.titlePage, blocks: [] };
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

  private estimateBlockHeight(document: DocxDocument, block: DocxBlock, width: number, section?: DocxSection): number {
    if (block.type === 'table') {
      return this.estimateTableHeight(document, block, width, section);
    }

    return this.estimateParagraphHeight(document, block, width, section);
  }

  private estimateParagraphHeight(document: DocxDocument, paragraph: DocxParagraph, width: number, section?: DocxSection): number {
    const paragraphStyle = this.resolveParagraphStyle(document, paragraph);
    const paragraphTextStyle = paragraphStyle.text || this.resolveParagraphTextStyle(document, paragraph);
    const lineHeight = this.getLineHeight(paragraphTextStyle, paragraphStyle, this.getSectionLinePitch(section));
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
      const runStyle = this.applyMathStyle({ ...paragraphTextStyle, ...this.resolveRunStyle(document, run), ...run.style }, run);
      const text = run.math ? serializeOfficeMath(run.math) : run.text;
      const tabStopWidth = this.toPx(document.settings.defaultTabStop || 720);
      for (const token of this.splitTextForWrap(text)) {
        if (token === '\n') {
          commitLine();
          continue;
        }

        const tokenWidth = token === '\t' ? this.estimateTabWidth(currentLineWidth, tabStopWidth) : this.estimateTextWidth(token, runStyle);
        if (
          token !== '\t' &&
          this.isCjkTextToken(token) &&
          token.length > 1 &&
          (tokenWidth > currentMaxWidth || currentLineWidth + tokenWidth > currentMaxWidth)
        ) {
          for (const character of Array.from(token)) {
            const characterWidth = this.estimateTextWidth(character, runStyle);
            if (currentLineWidth > 0 && currentLineWidth + characterWidth > currentMaxWidth) {
              commitLine();
            }
            currentLineWidth += characterWidth;
          }
          continue;
        }

        if (currentLineWidth > 0 && currentLineWidth + tokenWidth > currentMaxWidth) {
          commitLine();
        }

        if (tokenWidth > currentMaxWidth && token.length > 1) {
          for (const character of Array.from(token)) {
            const characterWidth = character === '\t' ? this.estimateTabWidth(currentLineWidth, tabStopWidth) : this.estimateTextWidth(character, runStyle);
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
        if (br === 'renderedPage') {
          continue;
        }
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

  private estimateTableHeight(document: DocxDocument, table: DocxTable, width: number, section?: DocxSection): number {
    const columnWidths = this.resolveTableColumnWidths(table, width);

    return table.rows.reduce((height, row) => {
      let colIndex = 0;
      const cellHeights = row.cells.map(cell => {
        const colSpan = cell.gridSpan || 1;
        if (cell.verticalMerge === 'continue') {
          colIndex += colSpan;
          return 0;
        }

        const cellWidth = columnWidths.slice(colIndex, colIndex + colSpan).reduce((sum, columnWidth) => sum + columnWidth, 0);
        colIndex += colSpan;
        const contentWidth = Math.max(1, cellWidth - 12);
        return cell.blocks.reduce((cellHeight, block) => cellHeight + this.estimateBlockHeight(document, block, contentWidth, section) + 2, 10);
      });
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
    const styleId = paragraph.styleId || document.styles.defaultParagraphStyleId;
    const styleChain = styleId ? this.resolveStyleChain(document, styleId) : [];
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
    const tokens: string[] = [];
    let word = '';
    let cjkRun = '';

    const flushWord = () => {
      if (word) {
        tokens.push(word);
        word = '';
      }
    };
    const flushCjkRun = () => {
      if (cjkRun) {
        tokens.push(cjkRun);
        cjkRun = '';
      }
    };

    for (const char of Array.from(text)) {
      if (char === '\n' || char === '\t' || /^[^\S\n\t]$/.test(char)) {
        flushWord();
        flushCjkRun();
        tokens.push(char);
        continue;
      }

      if (this.isCjkWrapCharacter(char)) {
        flushWord();
        cjkRun += char;
        continue;
      }

      flushCjkRun();
      word += char;
    }

    flushWord();
    flushCjkRun();
    return tokens;
  }

  private startsWithRenderedPageBreak(block: DocxBlock): boolean {
    if (block.type !== 'paragraph') {
      return false;
    }

    for (const run of block.runs) {
      if ((run.breaks || []).some(br => br === 'renderedPage')) {
        return true;
      }
      if ((run.text && run.text.length > 0) || run.math || (run.images && run.images.length > 0)) {
        return false;
      }
    }

    return false;
  }

  private isCjkWrapCharacter(char: string): boolean {
    return /[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/.test(char);
  }

  private isCjkTextToken(text: string): boolean {
    return Array.from(text).every(char => this.isCjkWrapCharacter(char));
  }

  private estimateTextWidth(text: string, style: TextStyle): number {
    const fontPx = (style.size || 11) * 1.333;
    return Array.from(text).reduce((width, character) => {
      if (/\s/.test(character)) {
        return width + (character === '\u3000' ? fontPx : fontPx * 0.5);
      }
      if (/[\u2e80-\u9fff\uff00-\uffef]/.test(character)) {
        return width + fontPx;
      }
      return width + fontPx * 0.58;
    }, 0);
  }

  private estimateTabWidth(currentLineWidth: number, tabStopWidth: number) {
    const tabStop = Math.max(1, tabStopWidth);
    const offset = Math.max(0, currentLineWidth) % tabStop;
    return offset === 0 ? tabStop : tabStop - offset;
  }

  private resolvePreferredWidth(width: DocxTable['width'] | undefined, availableWidth: number) {
    if (!width?.value) {
      return undefined;
    }

    if (width.type === 'pct') {
      return (availableWidth * width.value) / 5000;
    }

    return this.toPx(width.value);
  }

  private resolveTableColumnWidths(table: DocxTable, availableWidth: number) {
    const maxColumns = Math.max(1, ...table.rows.map(row => row.cells.reduce((sum, cell) => sum + (cell.gridSpan || 1), 0)));
    const tableWidth = Math.min(availableWidth, this.resolvePreferredWidth(table.width, availableWidth) || availableWidth);

    let columnWidths =
      table.gridWidths && table.gridWidths.length > 0
        ? table.gridWidths.slice(0, maxColumns).map(width => this.toPx(width))
        : [];

    if (columnWidths.length === 0) {
      columnWidths = new Array(maxColumns).fill(0);

      for (const row of table.rows) {
        let currentColumn = 0;
        for (const cell of row.cells) {
          const span = cell.gridSpan || 1;
          const preferredWidth = this.resolvePreferredWidth(cell.width, tableWidth);
          if (preferredWidth) {
            const perColumnWidth = preferredWidth / span;
            for (let index = 0; index < span; index++) {
              columnWidths[currentColumn + index] = Math.max(columnWidths[currentColumn + index] || 0, perColumnWidth);
            }
          }
          currentColumn += span;
        }
      }
    }

    if (columnWidths.length < maxColumns) {
      columnWidths.push(...new Array(maxColumns - columnWidths.length).fill(0));
    }

    const currentWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    if (currentWidth <= 0) {
      return new Array(maxColumns).fill(tableWidth / maxColumns);
    }

    const scale = tableWidth / currentWidth;
    return columnWidths.map(width => width * scale);
  }

  private getLineHeight(style: TextStyle, paragraphStyle?: ParagraphStyle, sectionLinePitch?: number) {
    const fontHeight = (style.size || 11) * 1.333;
    const defaultLineHeight = Math.max(fontHeight * 1.45, fontHeight + 6);
    const spacing = paragraphStyle?.spacing;
    if (!spacing?.line) {
      if (sectionLinePitch) {
        return Math.ceil(Math.max(fontHeight + 2, sectionLinePitch));
      }
      return Math.ceil(defaultLineHeight);
    }

    if (spacing.lineRule === 'exact') {
      return Math.max(1, this.toPx(spacing.line));
    }

    if (spacing.lineRule === 'atLeast') {
      return Math.ceil(Math.max(defaultLineHeight, this.toPx(spacing.line)));
    }

    return Math.ceil(defaultLineHeight * (spacing.line / 240));
  }

  private getSectionLinePitch(section?: DocxSection) {
    const linePitch = section?.docGrid?.linePitch;
    if (!linePitch || section.docGrid?.type === 'snapToChars') {
      return undefined;
    }

    const pitch = this.toPx(linePitch);
    return section.docGrid?.type === 'lines' || section.docGrid?.type === 'linesAndChars' ? Math.ceil(pitch * 1.7) : pitch;
  }

  private applyMathStyle(style: TextStyle, run: DocxRun): TextStyle {
    if (!run.math) {
      return style;
    }

    return {
      ...style,
      fontFamily: 'Cambria Math',
      fontFallback: ['STIXGeneral', 'Times New Roman', ...(style.fontFallback || [])],
      size: Math.max(style.size || 11, run.math.displayMode === 'block' ? 16 : 12)
    };
  }

  private toPx(twips: number): number {
    return Math.round(twips * this.pixelsPerTwip);
  }
}
