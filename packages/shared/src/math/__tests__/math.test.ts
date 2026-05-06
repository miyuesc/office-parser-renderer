import { describe, expect, it } from 'vitest';
import { OfficeMath } from '../model';
import { serializeOfficeMath } from '../serialize';

describe('serializeOfficeMath', () => {
  it('should serialize core OMML-compatible math structures into readable text', () => {
    const math: OfficeMath = {
      type: 'math',
      displayMode: 'inline',
      body: {
        type: 'sequence',
        children: [
          {
            type: 'superscript',
            base: { type: 'text', text: 'x' },
            superscript: { type: 'text', text: '2' }
          },
          { type: 'text', text: ' + ' },
          {
            type: 'fraction',
            numerator: { type: 'text', text: 'a' },
            denominator: { type: 'text', text: 'b' }
          },
          { type: 'text', text: ' = ' },
          {
            type: 'radical',
            radicand: { type: 'text', text: 'y' }
          },
          { type: 'text', text: ' + ' },
          {
            type: 'nary',
            operator: '∑',
            lower: { type: 'text', text: 'i=1' },
            upper: { type: 'text', text: 'n' },
            body: { type: 'text', text: 'i' }
          }
        ]
      }
    };

    expect(serializeOfficeMath(math)).toBe('x² + (a)/(b) = √(y) + ∑_(i=1)^n i');
  });
});
