/**
 * Type Guards for OOXML types.
 * Use these guards to safely narrow down union types or check for specific interface conformance.
 */

// Example placeholder:
// import { CT_Shape, CT_Picture } from '@opr/definitions';

// export function isShape(element: any): element is CT_Shape {
//   return element && typeof element === 'object' && 'spPr' in element;
// }

export function isDefined<T>(val: T | undefined | null): val is T {
  return val !== undefined && val !== null;
}
