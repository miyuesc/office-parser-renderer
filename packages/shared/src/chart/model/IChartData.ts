export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  SCATTER = 'scatter',
  AREA = 'area',
  DOUGHNUT = 'doughnut',
  RADAR = 'radar',
  BUBBLE = 'bubble',
  STOCK = 'stock',
  SURFACE = 'surface'
}

export enum AxisPosition {
  BOTTOM = 'b',
  LEFT = 'l',
  RIGHT = 'r',
  TOP = 't'
}

export interface IChartTitle {
  text: string;
  // TODO: add style properties
}

export interface IChartLegend {
  position: AxisPosition | 'tr' | 'tl' | 'br' | 'bl'; // Top-Right, etc.
  visible: boolean;
}

export interface IChartAxis {
  id: number;
  position: AxisPosition;
  type: 'cat' | 'val' | 'date' | 'ser'; // Category, Value, Date, Series
  title?: string;
  majorGridlines?: boolean;
  minorGridlines?: boolean;
  min?: number;
  max?: number;
}

export interface IChartSeries {
  index: number;
  index: number;
  order: number;
  name: string;
  fillColor?: string; // Hex color code or CSS string
  borderColor?: string;
  borderWidth?: number;
  data: number[]; // Initial simple support for numerical values
  categories?: string[]; // Corresponding categories if not shared
}

export interface IChartData {
  type: ChartType;
  title?: IChartTitle;
  grouping?: 'percentStacked' | 'stacked' | 'standard'; // standard, stacked, percentStacked
  legend?: IChartLegend;
  axes: IChartAxis[];
  categories: string[]; // Shared x-axis categories
  series: IChartSeries[];
  is3D: boolean;
}
