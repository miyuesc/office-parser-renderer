import { PptxDocument, PptxSlide } from '../model';

export interface PptxRendererOptions {
  initialSlide?: number;
}

export class PptxRenderer {
  private currentSlideIndex = 0;
  private readonly initialSlide: number;
  private document: PptxDocument | null = null;

  constructor(private readonly container: HTMLElement, options: PptxRendererOptions = {}) {
    this.initialSlide = options.initialSlide || 0;
    this.currentSlideIndex = this.initialSlide;
  }

  render(document: PptxDocument): void {
    this.document = document;
    this.container.innerHTML = '';
    this.currentSlideIndex = Math.max(0, Math.min(this.currentSlideIndex, document.slides.length - 1));

    const shell = document.slides.length > 0 ? this.renderSlide(document.slides[this.currentSlideIndex]) : this.renderEmpty();
    this.container.appendChild(shell);
  }

  jumpToSlide(index: number): void {
    if (!this.document || this.document.slides.length === 0) {
      return;
    }

    this.currentSlideIndex = Math.max(0, Math.min(index, this.document.slides.length - 1));
    this.render(this.document);
  }

  nextSlide(): void {
    this.jumpToSlide(this.currentSlideIndex + 1);
  }

  previousSlide(): void {
    this.jumpToSlide(this.currentSlideIndex - 1);
  }

  getCurrentSlideIndex(): number {
    return this.currentSlideIndex;
  }

  private renderSlide(slide: PptxSlide): HTMLElement {
    const slideEl = document.createElement('section');
    slideEl.dataset.testid = 'pptx-slide';
    slideEl.style.width = '960px';
    slideEl.style.aspectRatio = '16 / 9';
    slideEl.style.boxSizing = 'border-box';
    slideEl.style.margin = '0 auto';
    slideEl.style.padding = '56px';
    slideEl.style.background = '#ffffff';
    slideEl.style.border = '1px solid #d8dce3';
    slideEl.style.boxShadow = '0 10px 30px rgba(15, 23, 42, 0.12)';
    slideEl.style.fontFamily = 'Arial, sans-serif';

    const title = document.createElement('div');
    title.textContent = slide.name || slide.path;
    title.style.marginBottom = '24px';
    title.style.fontSize = '14px';
    title.style.color = '#667085';
    slideEl.appendChild(title);

    for (const element of slide.elements) {
      const p = document.createElement('p');
      p.textContent = element.text;
      p.style.margin = '0 0 14px';
      p.style.fontSize = '28px';
      p.style.lineHeight = '1.25';
      p.style.color = '#111827';
      slideEl.appendChild(p);
    }

    return slideEl;
  }

  private renderEmpty(): HTMLElement {
    const empty = document.createElement('div');
    empty.dataset.testid = 'pptx-empty';
    empty.textContent = '未解析到幻灯片';
    empty.style.padding = '40px';
    empty.style.color = '#667085';
    return empty;
  }
}
