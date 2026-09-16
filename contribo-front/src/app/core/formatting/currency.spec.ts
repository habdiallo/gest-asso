import { formatGnfAmountDetailed } from './currency';

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
