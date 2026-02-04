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
}

export class VirtualScrollbar {
  private readonly SCROLLBAR_SIZE = 10;
  private readonly SCROLLBAR_PADDING = 2;
  private readonly SCROLLBAR_MIN_THUMB = 20;

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
  handleMouseMove(e: MouseEvent, rect: DOMRect, viewport: Viewport, content: ContentSize): ScrollState | null {
    if (!this.isDraggingV && !this.isDraggingH) return null;

    e.preventDefault();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { width, height } = viewport;
    const { totalWidth, totalHeight } = content;

    let changed = false;
    const resultScroll = { ...this.dragStartScroll };

    const hasV = totalHeight > height;
    const hasH = totalWidth > width;

    // Recalculate track sizes
    const trackWidth = width - (hasV ? this.SCROLLBAR_SIZE : 0);
    const trackHeight = height - (hasH ? this.SCROLLBAR_SIZE : 0);

    if (this.isDraggingV && hasV) {
      const deltaY = y - this.dragStart.y;
      const thumbHeight = Math.max(this.SCROLLBAR_MIN_THUMB, (height / totalHeight) * trackHeight);
      const scrollableTrack = trackHeight - thumbHeight;
      const scrollableContent = totalHeight - height;

      if (scrollableTrack > 0) {
        const ratio = scrollableContent / scrollableTrack;
        resultScroll.scrollY = Math.max(0, Math.min(scrollableContent, this.dragStartScroll.scrollY + deltaY * ratio));
        changed = true;
      }
    }

    if (this.isDraggingH && hasH) {
      const deltaX = x - this.dragStart.x;
      const thumbWidth = Math.max(this.SCROLLBAR_MIN_THUMB, (width / totalWidth) * trackWidth);
      const scrollableTrack = trackWidth - thumbWidth;
      const scrollableContent = totalWidth - width;

      if (scrollableTrack > 0) {
        const ratio = scrollableContent / scrollableTrack;
        resultScroll.scrollX = Math.max(0, Math.min(scrollableContent, this.dragStartScroll.scrollX + deltaX * ratio));
        changed = true;
      }
    }

    return changed ? resultScroll : null;
  }

  handleMouseUp() {
    this.isDraggingV = false;
    this.isDraggingH = false;
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

    // Use a slighly darker track for better visibility on white sheets
    const trackColor = 'rgba(0, 0, 0, 0.03)';
    const thumbColor = 'rgba(0, 0, 0, 0.3)';
    const thumbHoverColor = 'rgba(0, 0, 0, 0.5)';

    const trackHeight = height - (hasH ? this.SCROLLBAR_SIZE : 0);
    const trackWidth = width - (hasV ? this.SCROLLBAR_SIZE : 0);

    // Vertical Scrollbar
    if (hasV) {
      const thumbHeight = Math.max(this.SCROLLBAR_MIN_THUMB, (height / totalHeight) * trackHeight);
      // scrollRatio is based on safely movable area
      // maxScrollY = totalHeight - height
      const maxScrollY = totalHeight - height;
      const scrollRatio = maxScrollY > 0 ? scrollY / maxScrollY : 0;

      const thumbY = scrollRatio * (trackHeight - thumbHeight);

      // Track
      ctx.fillStyle = trackColor;
      ctx.fillRect(width - this.SCROLLBAR_SIZE, 0, this.SCROLLBAR_SIZE, trackHeight);

      // Thumb
      ctx.fillStyle = this.isDraggingV ? thumbHoverColor : thumbColor;
      ctx.fillRect(
        width - this.SCROLLBAR_SIZE + this.SCROLLBAR_PADDING,
        thumbY + this.SCROLLBAR_PADDING,
        this.SCROLLBAR_SIZE - this.SCROLLBAR_PADDING * 2,
        thumbHeight - this.SCROLLBAR_PADDING * 2
      );
    }

    // Horizontal Scrollbar
    if (hasH) {
      const thumbWidth = Math.max(this.SCROLLBAR_MIN_THUMB, (width / totalWidth) * trackWidth);
      const maxScrollX = totalWidth - width;
      const scrollRatio = maxScrollX > 0 ? scrollX / maxScrollX : 0;

      const thumbX = scrollRatio * (trackWidth - thumbWidth);

      // Track
      ctx.fillStyle = trackColor;
      ctx.fillRect(0, height - this.SCROLLBAR_SIZE, trackWidth, this.SCROLLBAR_SIZE);

      // Thumb
      ctx.fillStyle = this.isDraggingH ? thumbHoverColor : thumbColor;
      ctx.fillRect(
        thumbX + this.SCROLLBAR_PADDING,
        height - this.SCROLLBAR_SIZE + this.SCROLLBAR_PADDING,
        thumbWidth - this.SCROLLBAR_PADDING * 2,
        this.SCROLLBAR_SIZE - this.SCROLLBAR_PADDING * 2
      );
    }

    // Corner
    if (hasV && hasH) {
      ctx.fillStyle = '#fdfdfd';
      ctx.fillRect(width - this.SCROLLBAR_SIZE, height - this.SCROLLBAR_SIZE, this.SCROLLBAR_SIZE, this.SCROLLBAR_SIZE);
    }

    ctx.restore();
  }
}
