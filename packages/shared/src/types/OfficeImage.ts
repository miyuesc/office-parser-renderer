import type { DrawingPosition, DrawingResourceRef } from './DrawingCommon';

export interface OfficeImage {
  id: string; // 唯一标识
  blob: Blob; // 图片二进制数据
  extension: string; // png, jpeg, etc.
  path?: string;
  contentType?: string;
  source?: DrawingResourceRef;

  // 渲染位置与变换
  position: DrawingPosition;
  style?: {
    stroke?: {
      color?: string;
      width?: number;
      type?: 'solid' | 'dash' | 'dot' | 'none';
    };
    effects?: {
      shadow?: {
        color: string;
        blur: number;
        offsetX: number;
        offsetY: number;
        alpha?: number;
      };
      glow?: {
        color: string;
        radius: number;
        alpha?: number;
      };
    };
  };
}
