/**
 * Interface for Chart Rendering Engine.
 * MVP: Placeholder for future implementation.
 */
export interface IChartEngine {
  renderChart(chartData: any, container: HTMLElement): void;
}

export abstract class BaseChartEngine implements IChartEngine {
  abstract renderChart(chartData: any, container: HTMLElement): void;
}
