import { setupServer } from 'msw/node';
import { ErrorCode, UserRole } from '@api';
import type { ErrorResponse } from '@api';
import { demoAccounts } from '../../../../mocks/demo-accounts';
import { incomeCategoriesHandlers } from './handlers';

const server = setupServer(...incomeCategoriesHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers(...incomeCategoriesHandlers));
afterAll(() => server.close());

function accessTokenFor(role: UserRole): string {
  const account = demoAccounts.find((candidate) => candidate.user.role === role);
  if (!account) {
    throw new Error(`Aucun compte de démonstration pour le rôle ${role}.`);
  }
  return account.accessToken;
}

describe('POST /api/v1/income-categories (mocks MSW, T-50)', () => {
  it('refuse la création à un compte authentifié non Administrateur (403)', async () => {
    const response = await fetch('/api/v1/income-categories', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessTokenFor(UserRole.Treasurer)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ label: 'Catégorie refusée' }),
    });

    expect(response.status).toBe(403);
    const body = (await response.json()) as ErrorResponse;
    expect(body.code).toBe(ErrorCode.AccessDenied);
  });

  it('autorise la création à un compte Administrateur (201)', async () => {
    const response = await fetch('/api/v1/income-categories', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessTokenFor(UserRole.Administrator)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ label: `Catégorie test ${crypto.randomUUID()}` }),
    });

    expect(response.status).toBe(201);
  });
});
