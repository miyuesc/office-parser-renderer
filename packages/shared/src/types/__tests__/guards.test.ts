import { describe, it, expect } from 'vitest';
import { isDefined } from '../guards';

describe('Type Guards', () => {
  it('isDefined should filter undefined and null', () => {
    expect(isDefined('test')).toBe(true);
    expect(isDefined(0)).toBe(true);
    expect(isDefined(false)).toBe(true);
    expect(isDefined(undefined)).toBe(false);
    expect(isDefined(null)).toBe(false);
  });
});
