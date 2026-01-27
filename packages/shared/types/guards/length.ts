import { Length, LengthUnit } from '../definitions/length';

/**
 * Checks if a string is a valid LengthUnit.
 */
export function isLengthUnit(unit: string): unit is LengthUnit {
  return ['pt', 'px', 'cm', 'in', '%', 'pc', 'mm', 'em', 'rem'].includes(unit);
}

/**
 * Checks if a value is a valid Length (number or string).
 * Note: This is a basic check. For stricter validation (e.g., ensuring a string has a valid unit),
 * more specific parsing logic would be needed.
 */
export function isLength(value: unknown): value is Length {
  return typeof value === 'number' || typeof value === 'string';
}
