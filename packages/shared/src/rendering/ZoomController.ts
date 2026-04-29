/**
 * 缩放控制器选项接口
 */
export interface ZoomControllerOptions {
  /** 初始缩放比例，默认为 1.0 */
  initialScale?: number;
  /** 最小缩放比例，默认为 0.2 */
  minScale?: number;
  /** 最大缩放比例，默认为 4.0 */
  maxScale?: number;
  /** 缩放步长，默认为 0.1 */
  step?: number;
  /** 缩放变更回调 */
  onZoomChange?: (scale: number) => void;
}

/**
 * 缩放控制器
 * 负责渲染缩放 UI 控件（滑块、加减按钮）并处理交互逻辑
 */
export class ZoomController {
  private container: HTMLElement;
  private minusBtn!: HTMLElement;
  private plusBtn!: HTMLElement;
  private slider!: HTMLInputElement;
  private valueDisplay!: HTMLElement;

  private scale: number;
  private minScale: number;
  private maxScale: number;
  private step: number;
  private onZoomChange?: (scale: number) => void;

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: ZoomControllerOptions = {}) {
    this.scale = options.initialScale ?? 1.0;
    this.minScale = options.minScale ?? 0.2;
    this.maxScale = options.maxScale ?? 4.0;
    this.step = options.step ?? 0.1;
    this.onZoomChange = options.onZoomChange;

    this.container = document.createElement('div');
    this.initUI();
  }

  /**
   * 初始化 UI 组件
   */
  private initUI() {
    this.container.className = 'opr-zoom-container';
    this.injectStyles();

    // 减号按钮
    this.minusBtn = document.createElement('div');
    this.minusBtn.className = 'opr-zoom-btn';
    this.minusBtn.textContent = '-';
    this.minusBtn.onclick = () => this.zoomOut();
    this.container.appendChild(this.minusBtn);

    // 滑块
    this.slider = document.createElement('input');
    this.slider.type = 'range';
    this.slider.className = 'opr-zoom-slider';
    this.slider.min = (this.minScale * 100).toString();
    this.slider.max = (this.maxScale * 100).toString();
    this.slider.value = (this.scale * 100).toString();
    this.slider.step = (this.step * 100).toString();
    this.slider.addEventListener('input', () => {
      const val = parseInt(this.slider.value, 10);
      this.setScale(val / 100);
    });
    this.container.appendChild(this.slider);

    // 加号按钮
    this.plusBtn = document.createElement('div');
    this.plusBtn.className = 'opr-zoom-btn';
    this.plusBtn.textContent = '+';
    this.plusBtn.onclick = () => this.zoomIn();
    this.container.appendChild(this.plusBtn);

    // 数值显示
    this.valueDisplay = document.createElement('div');
    this.valueDisplay.className = 'opr-zoom-value';
    this.updateValueDisplay();
    this.container.appendChild(this.valueDisplay);
  }

  /**
   * 注入样式
   */
  private injectStyles() {
    if (document.getElementById('opr-zoom-styles')) return;
    const style = document.createElement('style');
    style.id = 'opr-zoom-styles';
    style.innerHTML = `
      .opr-zoom-container {
        display: flex;
        align-items: center;
        background: #f9f9f9;
        padding: 0 10px;
        height: 100%;
        user-select: none;
      }
      .opr-zoom-btn {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #666;
        font-weight: bold;
        font-size: 16px;
        user-select: none;
        border-radius: 2px;
        transition: background 0.2s;
      }
      .opr-zoom-btn:hover {
        background: #e0e0e0;
      }
      .opr-zoom-slider {
        width: 80px;
        margin: 0 8px;
        cursor: pointer;
      }
      .opr-zoom-value {
        font-family: 'Segoe UI', sans-serif;
        font-size: 12px;
        color: #666;
        min-width: 35px;
        text-align: right;
        margin-left: 5px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 获取容器元素
   */
  public getElement(): HTMLElement {
    return this.container;
  }

  /**
   * 设置缩放比例
   * @param scale 新的比例
   * @param triggerCallback 是否触发回调
   */
  public setScale(scale: number, triggerCallback = true) {
    let newScale = Math.max(this.minScale, Math.min(this.maxScale, scale));
    // 解决浮点数精度问题
    newScale = Math.round(newScale * 100) / 100;

    if (this.scale !== newScale) {
      this.scale = newScale;
      this.slider.value = (this.scale * 100).toString();
      this.updateValueDisplay();

      if (triggerCallback && this.onZoomChange) {
        this.onZoomChange(this.scale);
      }
    }
  }

  /**
   * 获取当前缩放比例
   */
  public getScale(): number {
    return this.scale;
  }

  /**
   * 放大
   */
  public zoomIn() {
    this.setScale(this.scale + this.step);
  }

  /**
   * 缩小
   */
  public zoomOut() {
    this.setScale(this.scale - this.step);
  }

  private updateValueDisplay() {
    this.valueDisplay.textContent = `${Math.round(this.scale * 100)}%`;
  }
}
