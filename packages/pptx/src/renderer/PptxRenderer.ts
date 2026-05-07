import { CommonRendererOptions, defaultCommonRendererOptions } from '@opr/shared';
import { PptxDocument, PptxSlide } from '../model';
import './PptxRenderer.css';

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
      wrapper.className = 'opr-pptx-shell';
      wrapper.appendChild(pptx.slides.length > 0 ? this.renderSlide(pptx.slides[this.currentSlideIndex]) : this.renderEmpty());
      return wrapper;
    }

    const shell = document.createElement('div');
    shell.dataset.testid = 'pptx-shell';
    shell.className = 'opr-pptx-shell opr-pptx-shell--with-preview';

    const list = document.createElement('aside');
    list.dataset.testid = 'pptx-slide-preview-list';
    list.className = 'opr-pptx-slide-preview-list';

    pptx.slides.forEach((slide, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.slideIndex = String(index);
      button.textContent = `${index + 1}. ${slide.name || slide.path}`;
      button.className = 'opr-pptx-slide-preview-button';
      if (index === this.currentSlideIndex) {
        button.classList.add('opr-pptx-slide-preview-button--active');
      }
      button.onclick = () => this.jumpToSlide(index);
      list.appendChild(button);
    });

    const main = document.createElement('main');
    main.className = 'opr-pptx-main';
    main.appendChild(pptx.slides.length > 0 ? this.renderSlide(pptx.slides[this.currentSlideIndex]) : this.renderEmpty());

    shell.appendChild(list);
    shell.appendChild(main);
    return shell;
  }

  private renderSlide(slide: PptxSlide): HTMLElement {
    const slideEl = document.createElement('section');
    slideEl.dataset.testid = 'pptx-slide';
    slideEl.className = 'opr-pptx-slide';

    const title = document.createElement('div');
    title.textContent = slide.name || slide.path;
    title.className = 'opr-pptx-slide-title';
    slideEl.appendChild(title);

    if (this.options.showSlideNumber && this.document) {
      const pageNumber = document.createElement('div');
      pageNumber.dataset.testid = 'pptx-slide-number';
      pageNumber.textContent = `${this.currentSlideIndex + 1} / ${this.document.slides.length}`;
      pageNumber.className = 'opr-pptx-slide-number';
      slideEl.appendChild(pageNumber);
    }

    for (const element of slide.elements) {
      const p = document.createElement('p');
      p.textContent = element.text;
      p.className = 'opr-pptx-text';
      slideEl.appendChild(p);
    }

    return slideEl;
  }

  private renderEmpty(): HTMLElement {
    const empty = document.createElement('div');
    empty.dataset.testid = 'pptx-empty';
    empty.textContent = '未解析到幻灯片';
    empty.className = 'opr-pptx-empty';
    return empty;
  }
}
