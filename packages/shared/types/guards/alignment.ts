import { HorizontalAlignment, VerticalAlignment } from '../definitions/alignment';
import { ST_XAlign, ST_YAlign } from '@ai-space/definitions/autogen/wml';

export function isHorizontalAlignment(val: unknown): val is HorizontalAlignment {
  return typeof val === 'string' && Object.values(ST_XAlign).includes(val as ST_XAlign);
}

export function isVerticalAlignment(val: unknown): val is VerticalAlignment {
  if (val === 'auto') return true;
  return typeof val === 'string' && Object.values(ST_YAlign).includes(val as ST_YAlign);
}
