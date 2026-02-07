import { IChartData } from '../model/IChartData';

export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IChartRenderer {
  /**
   * 渲染图表
   * @param ctx Canvas 上下文
   * @param rect 绘制区域
   */
  render(ctx: CanvasRenderingContext2D, rect: IRect): void;
}

export abstract class BaseChartRenderer implements IChartRenderer {
  protected data: IChartData;

  constructor(data: IChartData) {
    this.data = data;
  }

  abstract render(ctx: CanvasRenderingContext2D, rect: IRect): void;
}
