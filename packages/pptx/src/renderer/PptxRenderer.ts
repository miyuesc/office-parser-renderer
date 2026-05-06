import { CommonRendererOptions, defaultCommonRendererOptions } from '@opr/shared';
import { PptxDocument, PptxSlide } from '../model';

export interface PptxRendererOptions extends CommonRendererOptions {
  /** 初始幻灯片索引，0-based */
  initialSlide?: number;
  /** 当前显示幻灯片索引，0-based */
  currentSlide?: number;
  /** 是否显示左侧幻灯片预览列表，默认为 false */
  showSlidePreviewList?: boolean;
  /** 是否显示当前幻灯片页码，默认为 false */
  showSlideNumber?: boolean;
}

export class PptxRenderer {
  private currentSlideIndex = 0;
  private document: PptxDocument | null = null;
  private options: Required<Omit<PptxRendererOptions, 'initialSlide' | 'currentSlide'>> & Pick<PptxRendererOptions, 'initialSlide' | 'currentSlide'>;

  constructor(private readonly container: HTMLElement, options: PptxRendererOptions = {}) {
    this.options = this.normalizeOptions(options);
    this.currentSlideIndex = this.options.currentSlide ?? this.options.initialSlide ?? 0;
  }

  render(document: PptxDocument): void {
    this.document = document;
    this.container.innerHTML = '';
    this.currentSlideIndex = Math.max(0, Math.min(this.currentSlideIndex, document.slides.length - 1));

    const shell = this.renderShell(document);
    this.container.appendChild(shell);
  }

  jumpToSlide(index: number): void {
    if (!this.document || this.document.slides.length === 0) {
      return;
    }

    this.currentSlideIndex = Math.max(0, Math.min(index, this.document.slides.length - 1));
    this.options.currentSlide = this.currentSlideIndex;
    this.render(this.document);
  }

  setCurrentSlide(index: number): void {
    this.jumpToSlide(index);
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

  getRenderOptions(): PptxRendererOptions {
    return { ...this.options, currentSlide: this.currentSlideIndex };
  }

  setRenderOptions(options: Partial<PptxRendererOptions>): void {
    this.options = this.normalizeOptions({ ...this.options, ...options });
    if (options.currentSlide !== undefined || options.initialSlide !== undefined) {
      this.currentSlideIndex = options.currentSlide ?? options.initialSlide ?? this.currentSlideIndex;
    }
    if (this.document) {
      this.render(this.document);
    }
  }

  setShowCharts(show: boolean) {
    this.setRenderOptions({ showCharts: show });
  }

  toggleShowCharts(show?: boolean) {
    const next = show ?? !this.options.showCharts;
    this.setShowCharts(next);
    return next;
  }

  setShowInsertedElements(show: boolean) {
    this.setRenderOptions({ showInsertedElements: show });
  }

  toggleShowInsertedElements(show?: boolean) {
    const next = show ?? !this.options.showInsertedElements;
    this.setShowInsertedElements(next);
    return next;
  }

  setShowImages(show: boolean) {
    this.setRenderOptions({ showImages: show });
  }

  toggleShowImages(show?: boolean) {
    const next = show ?? !this.options.showImages;
    this.setShowImages(next);
    return next;
  }

  setShowAudio(show: boolean) {
    this.setRenderOptions({ showAudio: show });
  }

  toggleShowAudio(show?: boolean) {
    const next = show ?? !this.options.showAudio;
    this.setShowAudio(next);
    return next;
  }

  setShowVideo(show: boolean) {
    this.setRenderOptions({ showVideo: show });
  }

  toggleShowVideo(show?: boolean) {
    const next = show ?? !this.options.showVideo;
    this.setShowVideo(next);
    return next;
  }

  setShowComments(show: boolean) {
    this.setRenderOptions({ showComments: show });
  }

  toggleShowComments(show?: boolean) {
    const next = show ?? !this.options.showComments;
    this.setShowComments(next);
    return next;
  }

  setShowSlidePreviewList(show: boolean) {
    this.setRenderOptions({ showSlidePreviewList: show });
  }

  toggleSlidePreviewList(show?: boolean) {
    const next = show ?? !this.options.showSlidePreviewList;
    this.setShowSlidePreviewList(next);
    return next;
  }

  setShowSlideNumber(show: boolean) {
    this.setRenderOptions({ showSlideNumber: show });
  }

  toggleSlideNumber(show?: boolean) {
    const next = show ?? !this.options.showSlideNumber;
    this.setShowSlideNumber(next);
    return next;
  }

  private normalizeOptions(options: PptxRendererOptions) {
    return {
      ...defaultCommonRendererOptions,
      initialSlide: options.initialSlide,
      currentSlide: options.currentSlide,
      showSlidePreviewList: options.showSlidePreviewList ?? false,
      showSlideNumber: options.showSlideNumber ?? false,
      showCharts: options.showCharts ?? defaultCommonRendererOptions.showCharts,
      showInsertedElements: options.showInsertedElements ?? defaultCommonRendererOptions.showInsertedElements,
      showImages: options.showImages ?? defaultCommonRendererOptions.showImages,
      showAudio: options.showAudio ?? defaultCommonRendererOptions.showAudio,
      showVideo: options.showVideo ?? defaultCommonRendererOptions.showVideo,
      showComments: options.showComments ?? defaultCommonRendererOptions.showComments
    };
  }

  private renderShell(pptx: PptxDocument): HTMLElement {
    if (!this.options.showSlidePreviewList) {
      const wrapper = document.createElement('div');
      wrapper.dataset.testid = 'pptx-shell';
      wrapper.appendChild(pptx.slides.length > 0 ? this.renderSlide(pptx.slides[this.currentSlideIndex]) : this.renderEmpty());
      return wrapper;
    }

    const shell = document.createElement('div');
    shell.dataset.testid = 'pptx-shell';
    shell.style.display = 'flex';
    shell.style.gap = '16px';
    shell.style.alignItems = 'flex-start';

    const list = document.createElement('aside');
    list.dataset.testid = 'pptx-slide-preview-list';
    list.style.width = '180px';
    list.style.flex = '0 0 180px';
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '8px';

    pptx.slides.forEach((slide, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.slideIndex = String(index);
      button.textContent = `${index + 1}. ${slide.name || slide.path}`;
      button.style.textAlign = 'left';
      button.style.padding = '8px';
      button.style.border = index === this.currentSlideIndex ? '2px solid #2563eb' : '1px solid #d8dce3';
      button.style.background = '#ffffff';
      button.style.cursor = 'pointer';
      button.onclick = () => this.jumpToSlide(index);
      list.appendChild(button);
    });

    const main = document.createElement('main');
    main.style.flex = '1';
    main.style.minWidth = '0';
    main.appendChild(pptx.slides.length > 0 ? this.renderSlide(pptx.slides[this.currentSlideIndex]) : this.renderEmpty());

    shell.appendChild(list);
    shell.appendChild(main);
    return shell;
  }

  private renderSlide(slide: PptxSlide): HTMLElement {
    const slideEl = document.createElement('section');
    slideEl.dataset.testid = 'pptx-slide';
    slideEl.style.position = 'relative';
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

    if (this.options.showSlideNumber && this.document) {
      const pageNumber = document.createElement('div');
      pageNumber.dataset.testid = 'pptx-slide-number';
      pageNumber.textContent = `${this.currentSlideIndex + 1} / ${this.document.slides.length}`;
      pageNumber.style.position = 'absolute';
      pageNumber.style.right = '24px';
      pageNumber.style.bottom = '18px';
      pageNumber.style.fontSize = '13px';
      pageNumber.style.color = '#667085';
      slideEl.appendChild(pageNumber);
    }

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
