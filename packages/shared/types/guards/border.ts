import { BorderStyle } from '../definitions/border';
import { ST_Border } from '@ai-space/definitions/autogen/wml';

export function isBorderStyle(val: unknown): val is BorderStyle {
  // Try to match against ST_Border values provided by definitions
  // Note: ST_Border is an enum mapping string to string, so Object.values works.
  return typeof val === 'string' && Object.values(ST_Border).includes(val as ST_Border);
}
