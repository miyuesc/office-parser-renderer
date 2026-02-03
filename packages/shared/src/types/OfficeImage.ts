export interface OfficeImage {
  id: string; // 唯一标识
  blob: Blob; // 图片二进制数据
  extension: string; // png, jpeg, etc.

  // 渲染位置与变换
  position: {
    type: 'absolute' | 'oneCellAnchor' | 'twoCellAnchor';
    x?: number; // absolute
    y?: number; // absolute
    width: number;
    height: number;

    // For Excel TwoCellAnchor
    from?: { col: number; colOff: number; row: number; rowOff: number };
    to?: { col: number; colOff: number; row: number; rowOff: number };

    rotation?: number; // 旋转角度 0-360
    flipH?: boolean;
    flipV?: boolean;
  };
}
