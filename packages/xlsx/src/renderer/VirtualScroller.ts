/**
 * 虚拟滚动控制器
 *
 * 用于处理长列表/大表格的按需渲染，只渲染可视区域内的内容
 */
export class VirtualScroller {
  private container: HTMLElement;
  private totalRows: number;
  private getRowHeight: (index: number) => number;
  private renderCallback: (start: number, end: number, offsetTop: number) => void;

  private lastScrollTop: number = -1;
  private isTicking: boolean = false;
  private bufferSize: number = 5; // 上下缓冲行数

  /**
   * @param container 滚动容器
   * @param totalRows 总行数
   * @param getRowHeight 获取指定行高度的函数
   * @param renderCallback 渲染回调 (start, end, offsetTop)
   */
  constructor(
    container: HTMLElement,
    totalRows: number,
    getRowHeight: (index: number) => number,
    renderCallback: (start: number, end: number, offsetTop: number) => void,
  ) {
    this.container = container;
    this.totalRows = totalRows;
    this.getRowHeight = getRowHeight;
    this.renderCallback = renderCallback;

    this.bindEvents();
  }

  private bindEvents() {
    this.container.addEventListener('scroll', this.onScroll);
  }

  public unbindEvents() {
    this.container.removeEventListener('scroll', this.onScroll);
  }

  private onScroll = () => {
    if (!this.isTicking) {
      window.requestAnimationFrame(() => {
        this.update();
        this.isTicking = false;
      });
      this.isTicking = true;
    }
  };

  /**
   * 强制更新视图
   */
  public update() {
    const scrollTop = this.container.scrollTop;
    const clientHeight = this.container.clientHeight;

    // 简单的二分查找或线性累加来找到 startIndex
    // 由于行高可能不固定，这里使用线性扫描（对于海量数据可能需要优化为预计算偏移量数组）
    // 鉴于 Excel 行通常不多（几千到几万），且有缓存，线性扫描暂时可接受，或者我们假定行高大多一致
    // 优化：使用偏移量缓存

    let currentHeight = 0;
    let startIndex = 0;

    // 寻找起始行
    // TODO: 如果性能成为瓶颈，此处可以使用二分查找（需要预计算 offsetMap）
    for (let i = 0; i < this.totalRows; i++) {
      const h = this.getRowHeight(i);
      if (currentHeight + h > scrollTop) {
        startIndex = i;
        break;
      }
      currentHeight += h;
    }

    // 计算 offsetTop (startIndex 之前的总高度)
    // 上面的循环已经计算了 output: currentHeight (but it includes the startIndex row if we break)
    // Wait, if currentHeight + h > scrollTop, then the TOP of row i is currentHeight.
    // So offsetTop = currentHeight.

    const offsetTop = currentHeight;

    // 寻找结束行
    let endIndex = startIndex;
    let visibleHeight = 0;
    for (let i = startIndex; i < this.totalRows; i++) {
      visibleHeight += this.getRowHeight(i);
      endIndex = i;
      if (visibleHeight > clientHeight) {
        break;
      }
    }

    // 应用缓冲区
    const renderStart = Math.max(0, startIndex - this.bufferSize);
    const renderEnd = Math.min(this.totalRows - 1, endIndex + this.bufferSize);

    // 计算 renderStart 对应的准确 offsetTop
    let finalOffsetTop = offsetTop;
    // 如果启用了缓冲，我们需要回退 offsetTop
    for (let i = startIndex - 1; i >= renderStart; i--) {
      finalOffsetTop -= this.getRowHeight(i);
    }

    // 调用回调
    this.renderCallback(renderStart, renderEnd + 1, finalOffsetTop);

    this.lastScrollTop = scrollTop;
  }

  /**
   * 初始化/重置
   */
  public init() {
    this.update();
  }
}
