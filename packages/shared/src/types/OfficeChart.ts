import type { IChartData } from '../chart/model/IChartData';
import type { DrawingPosition, DrawingResourceRef } from './DrawingCommon';

export interface OfficeChart {
  id: string;
  name?: string;
  type: 'chart';
  chartData: IChartData;
  source?: DrawingResourceRef;
  position: DrawingPosition;
}
