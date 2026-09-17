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

function categoryNotFound(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.ResourceNotFound, message: 'Catégorie introuvable.' },
    { status: 404 },
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
 *
 * `PATCH /income-categories/{id}` (T-51, `updateIncomeCategory`) est réservé à
 * l'Administrateur comme la création, simule les mêmes règles (libellé
 * obligatoire, unicité) et renvoie `RESOURCE_NOT_FOUND` pour un identifiant
 * inconnu. Seul le libellé change : `memberCount` reste inchangé, sans effet
 * rétroactif sur les cotisations déjà établies (US-REV-002).
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

  http.patch(
    '/api/v1/income-categories/:incomeCategoryId',
    async ({ request, params }): Promise<Response> => {
      await delay(300);
      const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
      if (!account) {
        return authenticationRequired();
      }
      if (account.user.role !== UserRole.Administrator) {
        return accessDenied();
      }

      const incomeCategoryId = params['incomeCategoryId'] as string;
      const existing = demoIncomeCategories.find((category) => category.id === incomeCategoryId);
      if (!existing) {
        return categoryNotFound();
      }

      const body = (await request.json()) as IncomeCategoryRequest;
      const label = body.label?.trim();
      if (!label) {
        return validationError();
      }

      const alreadyExists = demoIncomeCategories.some(
        (category) =>
          category.id !== incomeCategoryId &&
          category.label.localeCompare(label, 'fr', { sensitivity: 'base' }) === 0,
      );
      if (alreadyExists) {
        return duplicateCategoryLabel();
      }

      const updated: IncomeCategory = {
        ...existing,
        label,
        updatedAt: new Date().toISOString(),
      };
      const index = demoIncomeCategories.indexOf(existing);
      demoIncomeCategories[index] = updated;

      return HttpResponse.json<IncomeCategory>(updated);
    },
  ),
];
