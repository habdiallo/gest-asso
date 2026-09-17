import { HttpResponse, delay, http } from 'msw';
import { CampaignStatus, CurrencyCode, ErrorCode, UserRole } from '@api';
import type {
  Campaign,
  CampaignPage,
  CampaignSummary,
  CreateCampaignRequest,
  Due,
  DuePage,
  ErrorResponse,
  UpdateCampaignCategoryAmountsRequest,
} from '@api';
import { findDemoAccountByAuthorization } from '../../../../mocks/demo-accounts';

const demoCampaigns: CampaignSummary[] = [
  {
    id: '10700000-0000-4000-8000-000000000200',
    name: 'Solidarité septembre',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    status: CampaignStatus.Open,
    memberCount: 86,
  },
  {
    id: '10700000-0000-4000-8000-000000000201',
    name: 'Rentrée scolaire',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    status: CampaignStatus.Upcoming,
    memberCount: 91,
  },
  {
    id: '10700000-0000-4000-8000-000000000202',
    name: 'Soutien juin 2026',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    status: CampaignStatus.Closed,
    memberCount: 84,
  },
];

/**
 * Détail des campagnes de démonstration (T-60, `openapi:getCampaign`) :
 * description et barème (`categoryAmounts`). Le bilan financier
 * (`financialSummary`) est fourni pour rester fidèle au contrat, même si
 * l'onglet bilan de l'écran détail reste un emplacement réservé (T-77).
 */
const demoCampaignDetails: Record<string, Campaign> = {
  '10700000-0000-4000-8000-000000000200': {
    ...demoCampaigns[0],
    description: 'Campagne générale de soutien aux activités de l’association.',
    categoryAmounts: [
      {
        incomeCategory: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
        amount: 100_000,
        memberCount: 60,
        expectedAmount: 6_000_000,
        currency: CurrencyCode.Gnf,
      },
      {
        incomeCategory: { id: '10700000-0000-4000-8000-000000000102', label: 'Bienfaiteur' },
        amount: 250_000,
        memberCount: 26,
        expectedAmount: 6_500_000,
        currency: CurrencyCode.Gnf,
      },
    ],
    financialSummary: {
      expectedAmount: 12_500_000,
      collectedAmount: 8_375_000,
      remainingAmount: 4_125_000,
      collectionRate: 67.0,
      dueCounts: { total: 86, paid: 52, partiallyPaid: 12, unpaid: 22 },
      currency: CurrencyCode.Gnf,
    },
  },
  '10700000-0000-4000-8000-000000000201': {
    ...demoCampaigns[1],
    description: 'Contribution exceptionnelle pour la rentrée scolaire des enfants de membres.',
    categoryAmounts: [
      {
        incomeCategory: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
        amount: 75_000,
        memberCount: 91,
        expectedAmount: 6_825_000,
        currency: CurrencyCode.Gnf,
      },
    ],
    financialSummary: {
      expectedAmount: 6_825_000,
      collectedAmount: 0,
      remainingAmount: 6_825_000,
      collectionRate: 0,
      dueCounts: { total: 91, paid: 0, partiallyPaid: 0, unpaid: 91 },
      currency: CurrencyCode.Gnf,
    },
  },
  '10700000-0000-4000-8000-000000000202': {
    ...demoCampaigns[2],
    description: 'Soutien de mi-année clôturé.',
    categoryAmounts: [
      {
        incomeCategory: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
        amount: 100_000,
        memberCount: 60,
        expectedAmount: 6_000_000,
        currency: CurrencyCode.Gnf,
      },
      {
        incomeCategory: { id: '10700000-0000-4000-8000-000000000102', label: 'Bienfaiteur' },
        amount: 250_000,
        memberCount: 24,
        expectedAmount: 6_000_000,
        currency: CurrencyCode.Gnf,
      },
    ],
    financialSummary: {
      expectedAmount: 12_000_000,
      collectedAmount: 12_000_000,
      remainingAmount: 0,
      collectionRate: 100,
      dueCounts: { total: 84, paid: 84, partiallyPaid: 0, unpaid: 0 },
      currency: CurrencyCode.Gnf,
    },
  },
};

const demoCampaignDues: Record<string, Due[]> = {
  '10700000-0000-4000-8000-000000000200': [
    {
      id: '10700000-0000-4000-8000-000000000410',
      member: { id: '10700000-0000-4000-8000-000000000500', displayName: 'Amadou Diallo' },
      campaign: demoCampaigns[0],
      incomeCategorySnapshot: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
      dueAmount: 100_000,
      paidAmount: 50_000,
      remainingAmount: 50_000,
      status: 'PARTIALLY_PAID',
      paymentCount: 1,
      currency: CurrencyCode.Gnf,
    },
  ],
};

function authenticationRequired(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.AuthenticationRequired, message: 'Authentification requise.' },
    { status: 401 },
  );
}

function normalizeForSearch(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function campaignNotFound(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.ResourceNotFound, message: 'Campagne introuvable.' },
    { status: 404 },
  );
}

function accessDenied(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.AccessDenied, message: 'Accès réservé à l’Administrateur et au Trésorier.' },
    { status: 403 },
  );
}

function campaignNotEditable(): Response {
  return HttpResponse.json<ErrorResponse>(
    {
      code: ErrorCode.CampaignNotEditable,
      message: 'Le barème ne peut plus être modifié pour cette campagne.',
    },
    { status: 409 },
  );
}

function isValidCategoryAmountEntry(
  entry: unknown,
): entry is { incomeCategoryId: string; amount: number } {
  if (typeof entry !== 'object' || entry === null) {
    return false;
  }
  const record = entry as Record<string, unknown>;
  return (
    typeof record['incomeCategoryId'] === 'string' &&
    typeof record['amount'] === 'number' &&
    record['amount'] >= 0
  );
}

function isUpdateCampaignCategoryAmountsRequest(
  value: unknown,
): value is UpdateCampaignCategoryAmountsRequest {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const body = value as Record<string, unknown>;
  return (
    Array.isArray(body['categoryAmounts']) &&
    body['categoryAmounts'].length >= 1 &&
    body['categoryAmounts'].every(isValidCategoryAmountEntry)
  );
}

/**
 * Handler MSW de démonstration pour `GET /api/v1/campaigns` (T-57 : nom,
 * période, statut ; T-58 : filtre par statut via le paramètre contractuel
 * `status` ; T-59 : recherche par nom via le paramètre contractuel `q`,
 * comparaison insensible à la casse et aux accents).
 */
export const campaignsHandlers = [
  http.get('/api/v1/campaigns', async ({ request }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const url = new URL(request.url);
    const size = Number(url.searchParams.get('size') ?? '20');
    const page = Number(url.searchParams.get('page') ?? '0');
    const status = url.searchParams.get('status') as CampaignStatus | null;
    const query = url.searchParams.get('q')?.trim();
    const normalizedQuery = query ? normalizeForSearch(query) : null;
    const filtered = demoCampaigns.filter((campaign) => {
      const matchesStatus = !status || campaign.status === status;
      const matchesQuery =
        !normalizedQuery || normalizeForSearch(campaign.name).includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
    const start = page * size;
    const items = filtered.slice(start, start + size);

    return HttpResponse.json<CampaignPage>({
      items,
      page: {
        number: page,
        size,
        totalElements: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      },
    });
  }),

  /**
   * Handler MSW de démonstration pour `POST /api/v1/campaigns` (T-65,
   * `createCampaign`) : ajoute la nouvelle campagne au jeu de démonstration,
   * réservé à l'Administrateur et au Trésorier, comme sur le contrat.
   * `memberCount` reprend le nombre de membres actifs déjà utilisé pour
   * les campagnes de démonstration existantes (aucun annuaire de membres
   * n'est simulé ici).
   */
  http.post('/api/v1/campaigns', async ({ request }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }
    if (account.user.role !== UserRole.Administrator && account.user.role !== UserRole.Treasurer) {
      return accessDenied();
    }

    const body = (await request.json()) as CreateCampaignRequest;
    const summary: CampaignSummary = {
      id: crypto.randomUUID(),
      name: body.name,
      startDate: body.startDate,
      endDate: body.endDate,
      status: CampaignStatus.Upcoming,
      memberCount: 0,
    };
    demoCampaigns.unshift(summary);

    const campaign: Campaign = {
      ...summary,
      description: body.description,
      categoryAmounts: [],
    };
    demoCampaignDetails[summary.id] = campaign;

    return HttpResponse.json<Campaign>(campaign, { status: 201 });
  }),

  /**
   * Handler MSW de démonstration pour `GET /api/v1/campaigns/{campaignId}`
   * (T-60 : informations générales, barème et bilan financier de la campagne).
   */
  http.get('/api/v1/campaigns/:campaignId', async ({ request, params }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const campaignId = params['campaignId'] as string;
    const campaign = demoCampaignDetails[campaignId];
    if (!campaign) {
      return campaignNotFound();
    }

    return HttpResponse.json<Campaign>(campaign);
  }),

  /**
   * Handler MSW de démonstration pour `PUT /api/v1/campaigns/{campaignId}/category-amounts`
   * (T-68, `updateCampaignCategoryAmounts`) : réservé à l'Administrateur et
   * au Trésorier, et uniquement tant que la campagne est à venir (simulant la
   * contrainte contractuelle « avant la date de début et sans règlement
   * existant » ; ce mock ne suit pas de règlements, donc seul le statut est
   * vérifié). Recalcule `expectedAmount` par catégorie et le bilan financier
   * à partir des nouveaux montants, `memberCount` restant inchangé (aucune
   * campagne de démonstration n'a de règlement, `collectedAmount` reste à 0).
   */
  http.put(
    '/api/v1/campaigns/:campaignId/category-amounts',
    async ({ request, params }): Promise<Response> => {
      await delay(300);
      const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
      if (!account) {
        return authenticationRequired();
      }
      if (
        account.user.role !== UserRole.Administrator &&
        account.user.role !== UserRole.Treasurer
      ) {
        return accessDenied();
      }

      const campaignId = params['campaignId'] as string;
      const campaign = demoCampaignDetails[campaignId];
      if (!campaign) {
        return campaignNotFound();
      }
      if (campaign.status !== CampaignStatus.Upcoming) {
        return campaignNotEditable();
      }

      const body = await request.json();
      if (!isUpdateCampaignCategoryAmountsRequest(body)) {
        return HttpResponse.json<ErrorResponse>(
          { code: ErrorCode.ValidationError, message: 'Barème invalide.' },
          { status: 400 },
        );
      }

      const amountByCategoryId = new Map(
        body.categoryAmounts.map((entry) => [entry.incomeCategoryId, entry.amount]),
      );
      const updatedCategoryAmounts = campaign.categoryAmounts.map((categoryAmount) => {
        const amount =
          amountByCategoryId.get(categoryAmount.incomeCategory.id) ?? categoryAmount.amount;
        return {
          ...categoryAmount,
          amount,
          expectedAmount: amount * categoryAmount.memberCount,
        };
      });
      const expectedAmount = updatedCategoryAmounts.reduce(
        (total, categoryAmount) => total + categoryAmount.expectedAmount,
        0,
      );
      const collectedAmount = campaign.financialSummary?.collectedAmount ?? 0;
      const remainingAmount = Math.max(0, expectedAmount - collectedAmount);
      const collectionRate = expectedAmount === 0 ? 0 : (collectedAmount / expectedAmount) * 100;

      const updatedCampaign: Campaign = {
        ...campaign,
        categoryAmounts: updatedCategoryAmounts,
        financialSummary: campaign.financialSummary && {
          ...campaign.financialSummary,
          expectedAmount,
          remainingAmount,
          collectionRate,
        },
      };
      demoCampaignDetails[campaignId] = updatedCampaign;

      return HttpResponse.json<Campaign>(updatedCampaign);
    },
  ),

  http.get('/api/v1/campaigns/:campaignId/dues', async ({ request, params }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }
    const campaignId = typeof params['campaignId'] === 'string' ? params['campaignId'] : '';
    if (!demoCampaignDetails[campaignId]) {
      return campaignNotFound();
    }
    const url = new URL(request.url);
    const size = Number(url.searchParams.get('size') ?? '20');
    const page = Number(url.searchParams.get('page') ?? '0');
    const dues = demoCampaignDues[campaignId] ?? [];
    const items = dues.slice(page * size, page * size + size);
    return HttpResponse.json<DuePage>({
      items,
      page: {
        number: page,
        size,
        totalElements: dues.length,
        totalPages: Math.max(1, Math.ceil(dues.length / size)),
      },
    });
  }),
];
