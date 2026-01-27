import { describe, it, expect } from 'vitest';

describe('Sanity Check', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('should handle basic math', () => {
    expect(1 + 1).toBe(2);
  });
});
