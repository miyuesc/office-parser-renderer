export interface ScrollState {
  scrollX: number;
  scrollY: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface ContentSize {
  totalWidth: number;
  totalHeight: number;
  contentWidth?: number; // 兼容性保留
  contentHeight?: number;
}

/**
 * 虚拟滚动条
 * 负责处理画布上的自定义滚动条渲染和交互逻辑
 */
export class VirtualScrollbar {
  private readonly SCROLLBAR_SIZE = 14;
  private readonly SCROLLBAR_PADDING = 2;
  private readonly SCROLLBAR_MIN_THUMB = 20;
  private hoverState: 'none' | 'vertical' | 'horizontal' = 'none';

  // 交互状态
  private isDraggingV = false;
  private isDraggingH = false;
  private dragStart = { x: 0, y: 0 };
  private dragStartScroll = { scrollX: 0, scrollY: 0 };

  // 动画状态
  private opacity = 0;
  private targetOpacity = 0;
  private animationRunning = false;
  private lastTime = 0;
  private readonly FADE_SPEED = 0.005; // 透明度每毫秒变化量

  private onRequestRender: (() => void) | null = null;

  /**
   * @param onRequestRender 请求重绘的回调函数
   */
  constructor(onRequestRender?: () => void) {
    this.onRequestRender = onRequestRender || null;
  }

  /**
   * 设置透明度
   * @param val 0-1 之间的值
   */
  setOpacity(val: number) {
    this.opacity = val;
    this.targetOpacity = val;
    this.animationRunning = false;
    if (this.onRequestRender) this.onRequestRender();
  }

  /**
   * 淡入滚动条
   */
  fadeIn() {
    this.targetOpacity = 1;
    if (!this.animationRunning) {
      this.lastTime = performance.now();
      this.animationRunning = true;
      requestAnimationFrame(this.animate.bind(this));
    }
  }

  /**
   * 淡出滚动条
   */
  fadeOut() {
    this.targetOpacity = 0;
    if (!this.animationRunning) {
      this.lastTime = performance.now();
      this.animationRunning = true;
      requestAnimationFrame(this.animate.bind(this));
    }
  }

  private animate(time: number) {
    if (!this.animationRunning) return;

    const dt = time - this.lastTime;
    this.lastTime = time;

    // 根据时间差更新透明度
    if (this.opacity < this.targetOpacity) {
      this.opacity = Math.min(this.targetOpacity, this.opacity + this.FADE_SPEED * dt);
    } else if (this.opacity > this.targetOpacity) {
      this.opacity = Math.max(this.targetOpacity, this.opacity - this.FADE_SPEED * dt);
    }

    if (this.onRequestRender) this.onRequestRender();

    // 检查动画是否完成
    if (Math.abs(this.opacity - this.targetOpacity) < 0.001) {
      this.opacity = this.targetOpacity;
      this.animationRunning = false;
    } else {
      requestAnimationFrame(this.animate.bind(this));
    }
  }

  /**
   * 处理鼠标按下事件
   * @returns 如果开始拖拽返回 true，否则返回 false
   */
  handleMouseDown(
    e: MouseEvent,
    rect: DOMRect,
    viewport: Viewport,
    content: ContentSize,
    currentScroll: ScrollState
  ): boolean {
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { width, height } = viewport;

    // 确定是否显示滚动条
    const hasV = content.totalHeight > height;
    const hasH = content.totalWidth > width;

    // 如果完全不可见，则不进行交互
    if (this.opacity < 0.1) return false;

    // 有效交互区域
    const trackWidth = width - (hasV ? this.SCROLLBAR_SIZE : 0);
    const trackHeight = height - (hasH ? this.SCROLLBAR_SIZE : 0);

    // 垂直滚动条区域检测
    if (hasV) {
      if (x >= width - this.SCROLLBAR_SIZE && x <= width && y >= 0 && y <= trackHeight) {
        this.isDraggingV = true;
        this.dragStart = { x, y };
        this.dragStartScroll = { ...currentScroll };
        return true;
      }
    }

    // 水平滚动条区域检测
    if (hasH) {
      if (y >= height - this.SCROLLBAR_SIZE && y <= height && x >= 0 && x <= trackWidth) {
        this.isDraggingH = true;
        this.dragStart = { x, y };
        this.dragStartScroll = { ...currentScroll };
        return true;
      }
    }

    return false;
  }

  /**
   * 处理鼠标移动事件（拖拽）
   * @returns 新的滚动位置和 handled 标记
   */
  handleMouseMove(
    e: MouseEvent,
    rect: DOMRect,
    viewport: Viewport,
    content: ContentSize,
    currentScroll: ScrollState
  ): { scrollX: number; scrollY: number; handled: boolean } {
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (this.isDraggingV) {
      const deltaY = mouseY - this.dragStart.y;
      const barHeight = viewport.height - (content.totalWidth > viewport.width ? this.SCROLLBAR_SIZE : 0);
      const thumbHeight = Math.max(this.SCROLLBAR_MIN_THUMB, (viewport.height / content.totalHeight) * barHeight);
      const scrollableBarHeight = barHeight - thumbHeight;
      const scrollableContentHeight = content.totalHeight - viewport.height;

      let newScrollY = this.dragStartScroll.scrollY + (deltaY / scrollableBarHeight) * scrollableContentHeight;
      newScrollY = Math.max(0, Math.min(newScrollY, scrollableContentHeight));

      return { scrollX: currentScroll.scrollX, scrollY: newScrollY, handled: true };
    }

    if (this.isDraggingH) {
      const deltaX = mouseX - this.dragStart.x;
      // 水平滚动条长度要减去垂直滚动条占用的宽度（如果存在）
      const barWidth = viewport.width - (content.totalHeight > viewport.height ? this.SCROLLBAR_SIZE : 0);
      const thumbWidth = Math.max(this.SCROLLBAR_MIN_THUMB, (viewport.width / content.totalWidth) * barWidth);
      const scrollableBarWidth = barWidth - thumbWidth;
      const scrollableContentWidth = content.totalWidth - viewport.width;

      let newScrollX = this.dragStartScroll.scrollX + (deltaX / scrollableBarWidth) * scrollableContentWidth;
      newScrollX = Math.max(0, Math.min(newScrollX, scrollableContentWidth));

      return { scrollX: newScrollX, scrollY: currentScroll.scrollY, handled: true };
    }

    return { scrollX: currentScroll.scrollX, scrollY: currentScroll.scrollY, handled: false };
  }

  /**
   * 处理鼠标松开事件
   */
  handleMouseUp(e: MouseEvent) {
    this.isDraggingV = false;
    this.isDraggingH = false;
  }

  /**
   * 处理鼠标悬停检测
   */
  handleHover(mouseX: number, mouseY: number, viewport: Viewport) {
    const oldHover = this.hoverState;
    // 检查是否在垂直滚动条区域
    if (
      mouseX >= viewport.width - this.SCROLLBAR_SIZE &&
      mouseX <= viewport.width &&
      mouseY < viewport.height - this.SCROLLBAR_SIZE
    ) {
      this.hoverState = 'vertical';
    }
    // 检查是否在水平滚动条区域
    else if (
      mouseY >= viewport.height - this.SCROLLBAR_SIZE &&
      mouseY <= viewport.height &&
      mouseX < viewport.width - this.SCROLLBAR_SIZE
    ) {
      this.hoverState = 'horizontal';
    } else {
      this.hoverState = 'none';
    }

    if (oldHover !== this.hoverState && this.onRequestRender) {
      this.onRequestRender();
    }
  }

  /**
   * 绘制滚动条
   */
  draw(ctx: CanvasRenderingContext2D, viewport: Viewport, content: ContentSize, scroll: ScrollState) {
    if (this.opacity <= 0.01) return;

    const { width, height } = viewport;
    const { totalWidth, totalHeight } = content;
    const hasV = totalHeight > height;
    const hasH = totalWidth > width;

    if (!hasV && !hasH) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    // 绘制垂直滚动条
    if (hasV) {
      const barHeight = height - (hasH ? this.SCROLLBAR_SIZE : 0);
      const thumbHeight = Math.max(this.SCROLLBAR_MIN_THUMB, (height / totalHeight) * barHeight);
      const scrollRatio = scroll.scrollY / (totalHeight - height);
      const thumbY = scrollRatio * (barHeight - thumbHeight);

      // 轨道
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(width - this.SCROLLBAR_SIZE, 0, this.SCROLLBAR_SIZE, barHeight);

      // 滑块
      ctx.fillStyle = this.isDraggingV || this.hoverState === 'vertical' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)';

      this.roundRect(
        ctx,
        width - this.SCROLLBAR_SIZE + this.SCROLLBAR_PADDING,
        thumbY + this.SCROLLBAR_PADDING,
        this.SCROLLBAR_SIZE - this.SCROLLBAR_PADDING * 2,
        thumbHeight - this.SCROLLBAR_PADDING * 2,
        4
      );
      ctx.fill();
    }

    // 绘制水平滚动条
    if (hasH) {
      const barWidth = width - (hasV ? this.SCROLLBAR_SIZE : 0);
      const thumbWidth = Math.max(this.SCROLLBAR_MIN_THUMB, (width / totalWidth) * barWidth);
      const scrollRatio = scroll.scrollX / (totalWidth - width);
      const thumbX = scrollRatio * (barWidth - thumbWidth);

      // 轨道
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, height - this.SCROLLBAR_SIZE, barWidth, this.SCROLLBAR_SIZE);

      // 滑块
      ctx.fillStyle =
        this.isDraggingH || this.hoverState === 'horizontal' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)';

      this.roundRect(
        ctx,
        thumbX + this.SCROLLBAR_PADDING,
        height - this.SCROLLBAR_SIZE + this.SCROLLBAR_PADDING,
        thumbWidth - this.SCROLLBAR_PADDING * 2,
        this.SCROLLBAR_SIZE - this.SCROLLBAR_PADDING * 2,
        4
      );
      ctx.fill();
    }

    // 绘制右下角交界处的小方块
    if (hasV && hasH) {
      ctx.fillStyle = '#fdfdfd';
      ctx.fillRect(width - this.SCROLLBAR_SIZE, height - this.SCROLLBAR_SIZE, this.SCROLLBAR_SIZE, this.SCROLLBAR_SIZE);
    }

    ctx.restore();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }
}
