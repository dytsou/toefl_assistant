import { describe, expect, it } from 'vitest';
import { mergeKeyFrequency } from './keyFrequency';

describe('mergeKeyFrequency', () => {
  it('merges counts for the same key', () => {
    expect(
      mergeKeyFrequency([
        { a: 2, Space: 1 },
        { a: 3, Backspace: 4 },
      ]),
    ).toEqual({ a: 5, Space: 1, Backspace: 4 });
  });

  it('returns empty object for no input', () => {
    expect(mergeKeyFrequency([])).toEqual({});
  });
});
