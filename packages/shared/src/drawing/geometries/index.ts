import { rects } from './presets/rects';
import { basic } from './presets/basic';
import { arrows } from './presets/arrows';
import { math } from './presets/math';
import { callouts } from './presets/callouts';
import { connectors } from './presets/connectors';
import { flowchart } from './presets/flowchart';
import { actionButtons } from './presets/actionButtons';
import { shapes } from './presets/shapes';

// 导出类型定义
export * from './types';
export { isConnectorShape, CONNECTOR_SHAPES } from './types';

/** 所有形状生成器的映射表 */
export const generators: Record<string, (w: number, h: number, adj?: any) => string> = {
  ...rects,
  ...basic,
  ...arrows,
  ...math,
  ...callouts,
  ...connectors,
  ...flowchart,
  ...actionButtons,
  ...shapes
};
