export interface PageBox {
  width: number;
  height: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface LayoutBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LaidOutPage<TBlock = unknown> {
  pageIndex: number;
  pageBox: PageBox;
  blocks: Array<{
    block: TBlock;
    box: LayoutBox;
  }>;
}
