import type { CurrentUser } from '@api';
import { canRecordPayments } from './payment-authorization';

function buildUser(overrides: Partial<CurrentUser>): CurrentUser {
  return {
    userId: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    association: {
      id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
      name: 'Association Test',
      currency: 'GNF',
    },
    member: {
      id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12',
      firstName: 'Awa',
      lastName: 'Camara',
      displayName: 'Awa Camara',
      incomeCategory: { id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13', label: 'Standard' },
      status: 'ACTIVE',
    },
    role: 'ADMINISTRATOR',
    operatorCanRecordPayments: false,
    accountActive: true,
    ...overrides,
  };
}

describe('canRecordPayments', () => {
  it('returns false when there is no authenticated user', () => {
    expect(canRecordPayments(null)).toBe(false);
  });

  it('returns true for an Administrator regardless of operatorCanRecordPayments', () => {
    expect(canRecordPayments(buildUser({ role: 'ADMINISTRATOR' }))).toBe(true);
  });

  it('returns true for a Treasurer', () => {
    expect(canRecordPayments(buildUser({ role: 'TREASURER' }))).toBe(true);
  });

  it('returns false for a Member', () => {
    expect(canRecordPayments(buildUser({ role: 'MEMBER' }))).toBe(false);
  });

  it("returns the Operator's operatorCanRecordPayments value when authorized", () => {
    expect(
      canRecordPayments(buildUser({ role: 'OPERATOR', operatorCanRecordPayments: true })),
    ).toBe(true);
  });

  it("returns the Operator's operatorCanRecordPayments value when not authorized", () => {
    expect(
      canRecordPayments(buildUser({ role: 'OPERATOR', operatorCanRecordPayments: false })),
    ).toBe(false);
  });
});
