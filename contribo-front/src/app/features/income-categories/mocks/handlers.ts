import { HttpResponse, delay, http } from 'msw';
import { ErrorCode } from '@api';
import type { ErrorResponse, IncomeCategory } from '@api';
import { findDemoAccountByAuthorization } from '../../../../mocks/demo-accounts';

const demoIncomeCategories: IncomeCategory[] = [
  {
    id: '10700000-0000-4000-8000-000000000101',
    label: 'Standard',
    memberCount: 58,
    updatedAt: '2026-08-01T09:00:00Z',
  },
  {
    id: '10700000-0000-4000-8000-000000000102',
    label: 'Catégorie A',
    memberCount: 24,
    updatedAt: '2026-09-02T10:15:00Z',
  },
  {
    id: '10700000-0000-4000-8000-000000000103',
    label: 'Catégorie B',
    memberCount: 9,
    updatedAt: '2026-09-10T16:45:00Z',
  },
];

function authenticationRequired(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.AuthenticationRequired, message: 'Authentification requise.' },
    { status: 401 },
  );
}

/**
 * Handlers MSW de démonstration pour `GET /api/v1/income-categories` (T-48).
 * Le contrat n'exige qu'une session valide (pas de restriction 403) : c'est
 * l'écran (réservé à l'Administrateur, US-REV-001) qui restreint l'accès côté
 * frontend, pas cette route consommée aussi par d'autres formulaires.
 */
export const incomeCategoriesHandlers = [
  http.get('/api/v1/income-categories', async ({ request }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    return HttpResponse.json<IncomeCategory[]>(demoIncomeCategories);
  }),
];
