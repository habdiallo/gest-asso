import { formatPercentage } from './percentage';

describe('formatPercentage', () => {
  it('keeps integer rates compact', () => {
    expect(formatPercentage(67)).toBe('67');
  });

  it('rounds long floating point rates to one decimal in French format', () => {
    expect(formatPercentage(28.571428571428573)).toBe('28,6');
    expect(formatPercentage(0.29296875)).toBe('0,3');
  });

  it('rejects non-finite values', () => {
    expect(() => formatPercentage(Number.NaN)).toThrow('Un taux doit être un nombre fini');
  });
});
