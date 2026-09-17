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

describe('PATCH /api/v1/income-categories/{id} (mocks MSW, T-51)', () => {
  it('refuse la modification à un compte authentifié non Administrateur (403)', async () => {
    const response = await fetch(
      '/api/v1/income-categories/10700000-0000-4000-8000-000000000101',
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessTokenFor(UserRole.Treasurer)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ label: 'Catégorie refusée' }),
      },
    );

    expect(response.status).toBe(403);
    const body = (await response.json()) as ErrorResponse;
    expect(body.code).toBe(ErrorCode.AccessDenied);
  });

  it('renvoie 404 pour une catégorie inconnue', async () => {
    const response = await fetch('/api/v1/income-categories/00000000-0000-4000-8000-000000000000', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessTokenFor(UserRole.Administrator)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ label: 'Peu importe' }),
    });

    expect(response.status).toBe(404);
    const body = (await response.json()) as ErrorResponse;
    expect(body.code).toBe(ErrorCode.ResourceNotFound);
  });

  it('autorise la modification du libellé à un compte Administrateur (200)', async () => {
    const newLabel = `Catégorie modifiée ${crypto.randomUUID()}`;
    const response = await fetch(
      '/api/v1/income-categories/10700000-0000-4000-8000-000000000102',
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessTokenFor(UserRole.Administrator)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ label: newLabel }),
      },
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as { label: string };
    expect(body.label).toBe(newLabel);
  });
});
