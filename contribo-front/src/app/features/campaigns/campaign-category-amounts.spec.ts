import { toCategoryAmountsArray } from './campaign-category-amounts';

describe('toCategoryAmountsArray', () => {
  it('converts a Set to a JSON-compatible array', () => {
    const values = new Set([
      { incomeCategoryId: 'category-1', amount: 100 },
      { incomeCategoryId: 'category-2', amount: 200 },
    ]);

    const result = toCategoryAmountsArray(values);

    expect(result).toEqual([
      { incomeCategoryId: 'category-1', amount: 100 },
      { incomeCategoryId: 'category-2', amount: 200 },
    ]);
    expect(JSON.stringify(result)).toBe(
      '[{"incomeCategoryId":"category-1","amount":100},{"incomeCategoryId":"category-2","amount":200}]',
    );
  });
});
