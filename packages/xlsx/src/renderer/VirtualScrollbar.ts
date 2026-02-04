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

  constructor() {}

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

    // Check Vertical Scrollbar
    if (x > width - this.SCROLLBAR_SIZE && content.totalHeight > height) {
      this.isDraggingV = true;
      this.dragStart = { x, y };
      this.dragStartScroll = { ...currentScroll };
      return true;
    }

    // Check Horizontal Scrollbar
    if (y > height - this.SCROLLBAR_SIZE && content.totalWidth > width) {
      this.isDraggingH = true;
      this.dragStart = { x, y };
      this.dragStartScroll = { ...currentScroll };
      return true;
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

    // Wait, dragStartScroll is captured at start.
    // If we return absolute scroll, we need to respect the "current" scroll?
    // Actually standard drag logic: delta from scan start applied to start scroll.

    let changed = false;
    const resultScroll = { scrollX: this.dragStartScroll.scrollX, scrollY: this.dragStartScroll.scrollY };

    if (this.isDraggingV) {
      const deltaY = y - this.dragStart.y;
      const trackHeight = height - this.SCROLLBAR_SIZE;
      const thumbHeight = Math.max(this.SCROLLBAR_MIN_THUMB, (height / totalHeight) * trackHeight);
      const scrollableHeight = trackHeight - thumbHeight;
      const scrollableContent = totalHeight - height;

      if (scrollableHeight > 0) {
        const ratio = scrollableContent / scrollableHeight;
        resultScroll.scrollY = Math.max(0, Math.min(scrollableContent, this.dragStartScroll.scrollY + deltaY * ratio));
        changed = true;
      }
    } else {
      // If not dragging V, keep current Y?
      // No, dragStartScroll has the snapshot.
      // But if outside code changed scrollY while dragging X?
      // Usually scrollbar drags are exclusive.
    }

    if (this.isDraggingH) {
      const deltaX = x - this.dragStart.x;
      const trackWidth = width - this.SCROLLBAR_SIZE;
      const thumbWidth = Math.max(this.SCROLLBAR_MIN_THUMB, (width / totalWidth) * trackWidth);
      const scrollableWidth = trackWidth - thumbWidth;
      const scrollableContent = totalWidth - width;

      if (scrollableWidth > 0) {
        const ratio = scrollableContent / scrollableWidth;
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
    const { width, height } = viewport;
    const { totalWidth, totalHeight } = content;
    const { scrollX, scrollY } = scroll;

    const trackColor = 'rgba(0, 0, 0, 0.05)';
    const thumbColor = 'rgba(0, 0, 0, 0.3)';
    const thumbHoverColor = 'rgba(0, 0, 0, 0.5)';

    // Vertical Scrollbar
    if (totalHeight > height) {
      const trackHeight = height - this.SCROLLBAR_SIZE;
      const thumbHeight = Math.max(this.SCROLLBAR_MIN_THUMB, (height / totalHeight) * trackHeight);
      const scrollRatio = scrollY / (totalHeight - height);
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
    if (totalWidth > width) {
      const trackWidth = width - this.SCROLLBAR_SIZE;
      const thumbWidth = Math.max(this.SCROLLBAR_MIN_THUMB, (width / totalWidth) * trackWidth);
      const scrollRatio = scrollX / (totalWidth - width);
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
    if (totalHeight > height && totalWidth > width) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(width - this.SCROLLBAR_SIZE, height - this.SCROLLBAR_SIZE, this.SCROLLBAR_SIZE, this.SCROLLBAR_SIZE);
    }
  }
}
