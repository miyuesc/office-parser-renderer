export interface DragControllerOptions {
  /** 拖拽回调，返回鼠标的位移量 (dx, dy) */
  onDrag: (dx: number, dy: number) => void;
  /** 开始拖拽时的回调 */
  onDragStart?: () => void;
  /** 结束拖拽时的回调 */
  onDragEnd?: () => void;
  /** 目标元素，用于设置光标样式 */
  element: HTMLElement;
  /** 拖拽时的光标样式，默认为 'grabbing' */
  grabbingCursor?: string;
}

/**
 * 拖拽控制器
 * 负责处理通用的鼠标拖拽交互逻辑，如拖拽画布移动视图
 */
export class DragController {
  private isDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private options: DragControllerOptions;

  constructor(options: DragControllerOptions) {
    this.options = options;
  }

  /**
   * 处理鼠标按下事件
   * 应在 mousedown 事件处理函数中调用
   */
  public handleMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.options.element.style.cursor = this.options.grabbingCursor || 'grabbing';
    this.options.onDragStart?.();
  }

  /**
   * 处理鼠标移动事件
   * 应在 mousemove 事件处理函数中调用
   * @returns boolean 是否发生了拖拽
   */
  public handleMouseMove(e: MouseEvent): boolean {
    if (!this.isDragging) return false;

    const dx = e.clientX - this.lastMouseX;
    const dy = e.clientY - this.lastMouseY;

    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    if (dx !== 0 || dy !== 0) {
      this.options.onDrag(dx, dy);
      return true;
    }

    return false;
  }

  /**
   * 处理鼠标松开事件
   * 应在 mouseup 事件处理函数中调用
   */
  public handleMouseUp(e: MouseEvent) {
    if (this.isDragging) {
      this.isDragging = false;
      this.options.element.style.cursor = 'default';
      this.options.onDragEnd?.();
    }
  }

  /**
   * 强制结束拖拽状态
   */
  public cancel() {
    if (this.isDragging) {
      this.isDragging = false;
      this.options.element.style.cursor = 'default';
      this.options.onDragEnd?.();
    }
  }

  /**
   * 检查当前是否处于拖拽状态
   */
  public getIsDragging(): boolean {
    return this.isDragging;
  }
}
