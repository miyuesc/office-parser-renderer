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
  contentWidth?: number; // Add these as optional legacy support or ensure caller passes expected keys
  contentHeight?: number;
}

export class VirtualScrollbar {
  private readonly SCROLLBAR_SIZE = 14; // Increased size
  private readonly SCROLLBAR_PADDING = 2;
  private readonly SCROLLBAR_MIN_THUMB = 20;
  private hoverState: 'none' | 'vertical' | 'horizontal' = 'none';

  // Interaction State
  private isDraggingV = false;
  private isDraggingH = false;
  private dragStart = { x: 0, y: 0 };
  private dragStartScroll = { scrollX: 0, scrollY: 0 };

  // Animation State
  private opacity = 0;
  private targetOpacity = 0;
  private animationRunning = false;
  private lastTime = 0;
  private readonly FADE_SPEED = 0.005; // Opacity per ms

  private onRequestRender: (() => void) | null = null;

  constructor(onRequestRender?: () => void) {
    this.onRequestRender = onRequestRender || null;
  }

  setOpacity(val: number) {
    this.opacity = val;
    this.targetOpacity = val;
    this.animationRunning = false;
    if (this.onRequestRender) this.onRequestRender();
  }

  fadeIn() {
    this.targetOpacity = 1;
    if (!this.animationRunning) {
      this.lastTime = performance.now();
      this.animationRunning = true;
      requestAnimationFrame(this.animate.bind(this));
    }
  }

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

    let changed = false;
    if (this.opacity < this.targetOpacity) {
      this.opacity = Math.min(this.targetOpacity, this.opacity + this.FADE_SPEED * dt);
      changed = true;
    } else if (this.opacity > this.targetOpacity) {
      this.opacity = Math.max(this.targetOpacity, this.opacity - this.FADE_SPEED * dt);
      changed = true;
    }

    if (this.onRequestRender) this.onRequestRender();

    if (Math.abs(this.opacity - this.targetOpacity) < 0.001) {
      this.opacity = this.targetOpacity;
      this.animationRunning = false;
    } else {
      requestAnimationFrame(this.animate.bind(this));
    }
  }

  /**
   * Handle Mouse Down
   * Returns true if dragging started (consume event)
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

    // Determine visibility
    const hasV = content.totalHeight > height;
    const hasH = content.totalWidth > width;

    // Check effective zones even if opacity is low (user might blindly grab?)
    // User requested "only show on hover", usually interacting implies hover.
    // If opacity is 0, arguably we shouldn't interact.
    if (this.opacity < 0.1) return false;

    // Effective dimensions
    const trackWidth = width - (hasV ? this.SCROLLBAR_SIZE : 0);
    const trackHeight = height - (hasH ? this.SCROLLBAR_SIZE : 0);

    // Vertical
    if (hasV) {
      if (x >= width - this.SCROLLBAR_SIZE && x <= width && y >= 0 && y <= trackHeight) {
        this.isDraggingV = true;
        this.dragStart = { x, y };
        this.dragStartScroll = { ...currentScroll };
        return true;
      }
    }

    // Horizontal
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
   * Handle Mouse Move
   * Returns new scroll state if changed, or null if no change/not dragging
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
      const barHeight = viewport.height - this.SCROLLBAR_SIZE; // Horizontal bar space
      const thumbHeight = Math.max(this.SCROLLBAR_MIN_THUMB, (viewport.height / content.totalHeight) * barHeight);
      const scrollableBarHeight = barHeight - thumbHeight;
      const scrollableContentHeight = content.totalHeight - viewport.height;

      let newScrollY = this.dragStartScroll.scrollY + (deltaY / scrollableBarHeight) * scrollableContentHeight;
      newScrollY = Math.max(0, Math.min(newScrollY, scrollableContentHeight));

      return { scrollX: currentScroll.scrollX, scrollY: newScrollY, handled: true };
    }

    if (this.isDraggingH) {
      const deltaX = mouseX - this.dragStart.x;
      const barWidth = viewport.width - this.SCROLLBAR_SIZE; // Vertical bar space
      const thumbWidth = Math.max(this.SCROLLBAR_MIN_THUMB, (viewport.width / content.totalWidth) * barWidth);
      const scrollableBarWidth = barWidth - thumbWidth;
      const scrollableContentWidth = content.totalWidth - viewport.width;

      let newScrollX = this.dragStartScroll.scrollX + (deltaX / scrollableBarWidth) * scrollableContentWidth;
      newScrollX = Math.max(0, Math.min(newScrollX, scrollableContentWidth));

      return { scrollX: newScrollX, scrollY: currentScroll.scrollY, handled: true };
    }

    return { scrollX: currentScroll.scrollX, scrollY: currentScroll.scrollY, handled: false };
  }

  handleMouseUp(e: MouseEvent) {
    this.isDraggingV = false;
    this.isDraggingH = false;
  }

  handleHover(mouseX: number, mouseY: number, viewport: Viewport) {
    const oldHover = this.hoverState;
    // Check Vertical Scrollbar
    // Right side
    if (
      mouseX >= viewport.width - this.SCROLLBAR_SIZE &&
      mouseX <= viewport.width &&
      mouseY < viewport.height - this.SCROLLBAR_SIZE
    ) {
      this.hoverState = 'vertical';
    } else if (
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

  draw(ctx: CanvasRenderingContext2D, viewport: Viewport, content: ContentSize, scroll: ScrollState) {
    if (this.opacity <= 0.01) return;

    const { width, height } = viewport;
    const { totalWidth, totalHeight } = content;
    const { scrollX, scrollY } = scroll;
    const hasV = totalHeight > height;
    const hasH = totalWidth > width;

    if (!hasV && !hasH) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Draw Vertical Scrollbar
    if (content.totalHeight > viewport.height) {
      const barHeight = viewport.height - this.SCROLLBAR_SIZE;
      const thumbHeight = Math.max(this.SCROLLBAR_MIN_THUMB, (viewport.height / content.totalHeight) * barHeight);
      const scrollRatio = scroll.scrollY / (content.totalHeight - viewport.height);
      const thumbY = scrollRatio * (barHeight - thumbHeight);

      // Track
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(viewport.width - this.SCROLLBAR_SIZE, 0, this.SCROLLBAR_SIZE, barHeight);

      // Thumb
      ctx.fillStyle = this.isDraggingV || this.hoverState === 'vertical' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)';

      // Radius rect
      this.roundRect(
        ctx,
        viewport.width - this.SCROLLBAR_SIZE + this.SCROLLBAR_PADDING,
        thumbY + this.SCROLLBAR_PADDING,
        this.SCROLLBAR_SIZE - this.SCROLLBAR_PADDING * 2,
        thumbHeight - this.SCROLLBAR_PADDING * 2,
        4
      );
      ctx.fill();
    }

    // Draw Horizontal Scrollbar
    if (content.totalWidth > viewport.width) {
      const barWidth = viewport.width - this.SCROLLBAR_SIZE;
      const thumbWidth = Math.max(this.SCROLLBAR_MIN_THUMB, (viewport.width / content.totalWidth) * barWidth);
      const scrollRatio = scroll.scrollX / (content.totalWidth - viewport.width);
      const thumbX = scrollRatio * (barWidth - thumbWidth);

      // Track
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, viewport.height - this.SCROLLBAR_SIZE, barWidth, this.SCROLLBAR_SIZE);

      // Thumb
      ctx.fillStyle =
        this.isDraggingH || this.hoverState === 'horizontal' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)';

      // Radius rect
      this.roundRect(
        ctx,
        thumbX + this.SCROLLBAR_PADDING,
        viewport.height - this.SCROLLBAR_SIZE + this.SCROLLBAR_PADDING,
        thumbWidth - this.SCROLLBAR_PADDING * 2,
        this.SCROLLBAR_SIZE - this.SCROLLBAR_PADDING * 2,
        4
      );
      ctx.fill();
    }

    // Corner
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
