import { HttpResponse, delay, http } from 'msw';
import { ErrorCode, UserRole } from '@api';
import type { ErrorResponse, IncomeCategory, IncomeCategoryRequest } from '@api';
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

function accessDenied(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.AccessDenied, message: 'Accès réservé à l’Administrateur.' },
    { status: 403 },
  );
}

function validationError(): Response {
  return HttpResponse.json<ErrorResponse>(
    {
      code: ErrorCode.ValidationError,
      message: 'Le libellé est obligatoire.',
      fieldErrors: [
        { field: 'label', code: ErrorCode.ValidationError, message: 'Libellé requis.' },
      ],
    },
    { status: 400 },
  );
}

function duplicateCategoryLabel(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.DuplicateCategoryLabel, message: 'Une catégorie porte déjà ce libellé.' },
    { status: 409 },
  );
}

/**
 * Handlers MSW de démonstration pour `GET`/`POST /api/v1/income-categories`
 * (T-48, T-50). Le contrat n'exige qu'une session valide côté `GET` (pas de
 * restriction 403) : c'est l'écran (réservé à l'Administrateur, US-REV-001)
 * qui restreint l'accès côté frontend, pas cette route consommée aussi par
 * d'autres formulaires. `POST` est en revanche réservé à l'Administrateur
 * par le contrat (`createIncomeCategory`) : un autre rôle authentifié reçoit
 * un 403, conformément aux autres mutations mockées (`accessDenied()`). La
 * création simule aussi les deux règles métier RG-REV-001 (libellé
 * obligatoire) et l'unicité du libellé (`DUPLICATE_CATEGORY_LABEL`).
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

  http.post('/api/v1/income-categories', async ({ request }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }
    if (account.user.role !== UserRole.Administrator) {
      return accessDenied();
    }

    const body = (await request.json()) as IncomeCategoryRequest;
    const label = body.label?.trim();
    if (!label) {
      return validationError();
    }

    const alreadyExists = demoIncomeCategories.some(
      (category) => category.label.localeCompare(label, 'fr', { sensitivity: 'base' }) === 0,
    );
    if (alreadyExists) {
      return duplicateCategoryLabel();
    }

    const created: IncomeCategory = {
      id: crypto.randomUUID(),
      label,
      memberCount: 0,
      updatedAt: new Date().toISOString(),
    };
    demoIncomeCategories.push(created);

    return HttpResponse.json<IncomeCategory>(created, { status: 201 });
  }),
];
