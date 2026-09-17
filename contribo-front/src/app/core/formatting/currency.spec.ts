import {
  formatGnfAmountDetailed,
  formatGnfAmountInputDigits,
  sanitizeGnfAmountDigits,
} from './currency';

describe('formatGnfAmountDetailed', () => {
  it('formats a multi-thousand amount with thousands separators and the GNF suffix', () => {
    expect(formatGnfAmountDetailed(1_250_000)).toBe('1 250 000 GNF');
  });

  it('formats a single-thousand amount', () => {
    expect(formatGnfAmountDetailed(50_000)).toBe('50 000 GNF');
  });

  it('formats an amount below the thousand threshold without a separator', () => {
    expect(formatGnfAmountDetailed(500)).toBe('500 GNF');
  });

  it('formats zero', () => {
    expect(formatGnfAmountDetailed(0)).toBe('0 GNF');
  });

  it('formats a negative amount', () => {
    expect(formatGnfAmountDetailed(-1_250_000)).toBe('-1 250 000 GNF');
  });

  it('throws when the amount is not an integer', () => {
    expect(() => formatGnfAmountDetailed(1_250_000.5)).toThrow(
      'Un montant GNF doit être un entier : 1250000.5',
    );
  });
});

describe('sanitizeGnfAmountDigits', () => {
  it('removes every non-digit character from a raw input value', () => {
    expect(sanitizeGnfAmountDigits('1 250 000')).toBe('1250000');
  });

  it('removes a decimal separator and its fractional digits, keeping only integer digits', () => {
    expect(sanitizeGnfAmountDigits('12,5a0.3')).toBe('12503');
  });

  it('returns an empty string when there is no digit to keep', () => {
    expect(sanitizeGnfAmountDigits('GNF')).toBe('');
  });
});

describe('formatGnfAmountInputDigits', () => {
  it('formats digits with thousands separators, without the GNF suffix', () => {
    expect(formatGnfAmountInputDigits('1250000')).toBe('1 250 000');
  });

  it('formats digits below the thousand threshold without a separator', () => {
    expect(formatGnfAmountInputDigits('500')).toBe('500');
  });

  it('returns an empty string for an empty digit string', () => {
    expect(formatGnfAmountInputDigits('')).toBe('');
  });
});
