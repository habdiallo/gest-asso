import { HttpResponse, delay, http } from 'msw';
import { CampaignStatus, CurrencyCode, DueStatus, ErrorCode, PaymentMethod, UserRole } from '@api';
import type {
  Campaign,
  CampaignCategoryAmountInput,
  CampaignOpeningReadiness,
  CampaignPage,
  CampaignSummary,
  CreateCampaignRequest,
  CreatePaymentRequest,
  Due,
  DuePage,
  ErrorResponse,
  Payment,
  PaymentCreationResponse,
  PaymentPage,
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
    financialSummary: {
      expectedAmount: 18_500_000,
      collectedAmount: 12_400_000,
      remainingAmount: 6_100_000,
      collectionRate: 67,
      dueCounts: { total: 86, paid: 38, partiallyPaid: 12, unpaid: 36 },
      currency: CurrencyCode.Gnf,
    },
  },
  {
    id: '10700000-0000-4000-8000-000000000201',
    name: 'Rentrée associative',
    startDate: '2026-09-26',
    endDate: '2026-10-31',
    status: CampaignStatus.Upcoming,
    memberCount: 62,
    financialSummary: {
      expectedAmount: 9_800_000,
      collectedAmount: 4_200_000,
      remainingAmount: 5_600_000,
      collectionRate: 43,
      dueCounts: { total: 62, paid: 27, partiallyPaid: 6, unpaid: 29 },
      currency: CurrencyCode.Gnf,
    },
  },
  {
    id: '10700000-0000-4000-8000-000000000202',
    name: 'Soutien juin 2026',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    status: CampaignStatus.Closed,
    memberCount: 84,
    financialSummary: {
      expectedAmount: 15_200_000,
      collectedAmount: 14_800_000,
      remainingAmount: 400_000,
      collectionRate: 97,
      dueCounts: { total: 84, paid: 80, partiallyPaid: 2, unpaid: 2 },
      currency: CurrencyCode.Gnf,
    },
  },
  /**
   * Deuxième campagne ouverte (T-117) : permet, comme pour `demoSocialFunds`
   * (`features/social-funds/mocks/handlers.ts`), de vérifier que le sélecteur
   * de périmètre du tableau de bord distingue bien une sélection précise d'un
   * agrégat sur plusieurs campagnes ouvertes (`allOpenCampaignsSummary`).
   */
  {
    id: '10700000-0000-4000-8000-000000000203',
    name: 'Cotisation trimestrielle T3',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    status: CampaignStatus.Open,
    memberCount: 86,
    financialSummary: {
      expectedAmount: 9_900_000,
      collectedAmount: 4_950_000,
      remainingAmount: 4_950_000,
      collectionRate: 50,
      dueCounts: { total: 86, paid: 43, partiallyPaid: 8, unpaid: 35 },
      currency: CurrencyCode.Gnf,
    },
  },
];

/**
 * Détail des campagnes de démonstration (T-60, `openapi:getCampaign`) :
 * description, barème (`categoryAmounts`) et bilan financier
 * (`financialSummary`), affiché par l'onglet bilan de l'écran détail (T-77).
 */
const demoCampaignDetails: Record<string, Campaign> = {
  '10700000-0000-4000-8000-000000000200': {
    ...demoCampaigns[0],
    description: 'Campagne générale de soutien aux activités de l’association.',
    categoryAmounts: [
      {
        incomeCategory: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
        amount: 200_000,
        memberCount: 60,
        expectedAmount: 12_000_000,
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
    // Alignées sur `financialOverview.selectedCampaign`/`recentCampaigns` de
    // `features/dashboard/mocks/handlers.ts` (même campagne, mêmes montants).
    financialSummary: {
      expectedAmount: 18_500_000,
      collectedAmount: 12_400_000,
      remainingAmount: 6_100_000,
      collectionRate: 67,
      dueCounts: { total: 86, paid: 38, partiallyPaid: 12, unpaid: 36 },
      currency: CurrencyCode.Gnf,
    },
  },
  '10700000-0000-4000-8000-000000000201': {
    ...demoCampaigns[1],
    // Le statut technique UPCOMING reste nécessaire aux règles d'édition du
    // barème. La liste Campagnes conserve désormais le libellé « À venir ».
    status: CampaignStatus.Upcoming,
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
  // Alignée sur `financialOverview.selectedCampaign`/`recentCampaigns` de
  // `features/dashboard/mocks/handlers.ts` (même campagne, mêmes montants).
  '10700000-0000-4000-8000-000000000203': {
    ...demoCampaigns[3],
    description: 'Cotisation trimestrielle courante, applicable à tous les membres actifs.',
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
        amount: 150_000,
        memberCount: 26,
        expectedAmount: 3_900_000,
        currency: CurrencyCode.Gnf,
      },
    ],
    financialSummary: {
      expectedAmount: 9_900_000,
      collectedAmount: 4_950_000,
      remainingAmount: 4_950_000,
      collectionRate: 50,
      dueCounts: { total: 86, paid: 43, partiallyPaid: 8, unpaid: 35 },
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
    {
      id: '10700000-0000-4000-8000-000000000411',
      member: { id: '10700000-0000-4000-8000-000000000501', displayName: 'Fatoumata Bah' },
      campaign: demoCampaigns[0],
      incomeCategorySnapshot: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
      dueAmount: 100_000,
      paidAmount: 0,
      remainingAmount: 100_000,
      status: 'DUE',
      paymentCount: 0,
      currency: CurrencyCode.Gnf,
    },
    {
      id: '10700000-0000-4000-8000-000000000412',
      member: { id: '10700000-0000-4000-8000-000000000502', displayName: 'Mamadou Bah' },
      campaign: demoCampaigns[0],
      incomeCategorySnapshot: { id: '10700000-0000-4000-8000-000000000102', label: 'Bienfaiteur' },
      dueAmount: 250_000,
      paidAmount: 250_000,
      remainingAmount: 0,
      status: 'PAID',
      paymentCount: 1,
      currency: CurrencyCode.Gnf,
    },
    {
      id: '10700000-0000-4000-8000-000000000413',
      member: { id: '10700000-0000-4000-8000-000000000503', displayName: 'Aissatou Sow' },
      campaign: demoCampaigns[0],
      incomeCategorySnapshot: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
      dueAmount: 100_000,
      paidAmount: 0,
      remainingAmount: 100_000,
      status: 'OVERDUE',
      paymentCount: 0,
      currency: CurrencyCode.Gnf,
    },
  ],
  '10700000-0000-4000-8000-000000000201': [
    {
      id: '10700000-0000-4000-8000-000000000420',
      member: { id: '10700000-0000-4000-8000-000000000500', displayName: 'Amadou Diallo' },
      campaign: demoCampaigns[1],
      incomeCategorySnapshot: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
      dueAmount: 75_000,
      paidAmount: 0,
      remainingAmount: 75_000,
      status: 'DUE',
      paymentCount: 0,
      currency: CurrencyCode.Gnf,
    },
  ],
  '10700000-0000-4000-8000-000000000202': [
    {
      id: '10700000-0000-0000-0000-000000000430',
      member: { id: '10700000-0000-4000-8000-000000000500', displayName: 'Amadou Diallo' },
      campaign: demoCampaigns[2],
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

const demoPaymentsByCampaignId: Record<string, Payment[]> = {
  '10700000-0000-4000-8000-000000000200': [
    {
      id: '10700000-0000-4000-8000-000000000700',
      dueId: '10700000-0000-4000-8000-000000000410',
      member: { id: '10700000-0000-4000-8000-000000000500', displayName: 'Amadou Diallo' },
      campaign: demoCampaigns[0],
      amount: 50_000,
      paymentDate: '2026-09-12',
      method: PaymentMethod.MobileMoney,
      recordedBy: { userId: '10700000-0000-4000-8000-000000000900', displayName: 'Mamadou Sy' },
      recordedAt: '2026-09-12T14:32:00Z',
      currency: CurrencyCode.Gnf,
    },
    {
      id: '10700000-0000-4000-8000-000000000701',
      dueId: '10700000-0000-4000-8000-000000000413',
      member: { id: '10700000-0000-4000-8000-000000000503', displayName: 'Aissatou Sow' },
      campaign: demoCampaigns[0],
      amount: 100_000,
      paymentDate: '2026-09-10',
      method: PaymentMethod.Cash,
      recordedBy: { userId: '10700000-0000-4000-8000-000000000900', displayName: 'Mamadou Sy' },
      recordedAt: '2026-09-10T09:10:00Z',
      currency: CurrencyCode.Gnf,
    },
  ],
  '10700000-0000-4000-8000-000000000202': [
    {
      id: '10700000-0000-4000-8000-000000000702',
      dueId: '10700000-0000-0000-0000-000000000430',
      member: { id: '10700000-0000-4000-8000-000000000500', displayName: 'Amadou Diallo' },
      campaign: demoCampaigns[2],
      amount: 50_000,
      paymentDate: '2026-06-12',
      method: PaymentMethod.BankTransfer,
      recordedBy: { userId: '10700000-0000-4000-8000-000000000900', displayName: 'Mamadou Sy' },
      recordedAt: '2026-06-12T14:32:00Z',
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

const demoToday = '2026-09-26';

function calculateOpeningReadiness(campaign: Campaign): CampaignOpeningReadiness {
  const baremeComplete =
    campaign.categoryAmounts.length > 0 &&
    campaign.categoryAmounts.every((categoryAmount) => categoryAmount.amount > 0);
  const datesValid = campaign.startDate <= campaign.endDate;
  const startDateReached = demoToday >= campaign.startDate;
  const duesReady = campaign.memberCount > 0 && campaign.categoryAmounts.length > 0;
  const blockingReasons: string[] = [];

  if (!baremeComplete) blockingReasons.push('BAREME_INCOMPLETE');
  if (!datesValid) blockingReasons.push('DATES_INVALID');
  if (!startDateReached) blockingReasons.push('START_DATE_NOT_REACHED');
  if (!duesReady) blockingReasons.push('DUES_NOT_READY');

  return {
    baremeComplete,
    datesValid,
    startDateReached,
    duesReady,
    ready: blockingReasons.length === 0,
    blockingReasons,
  };
}

function campaignForRead(campaign: Campaign): Campaign {
  if (campaign.status !== CampaignStatus.Upcoming) {
    return campaign;
  }
  return { ...campaign, openingReadiness: calculateOpeningReadiness(campaign) };
}

function campaignOpeningConflict(code: ErrorCode, message: string): Response {
  return HttpResponse.json<ErrorResponse>({ code, message }, { status: 409 });
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

function paymentAccessDenied(): Response {
  return HttpResponse.json<ErrorResponse>(
    {
      code: ErrorCode.AccessDenied,
      message: 'Accès réservé à l’Administrateur, au Trésorier et à l’Opérateur autorisé.',
    },
    { status: 403 },
  );
}

function dueNotFound(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.ResourceNotFound, message: 'Cotisation introuvable.' },
    { status: 404 },
  );
}

function dueAlreadyPaid(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.DueAlreadyPaid, message: 'Cette cotisation est déjà entièrement réglée.' },
    { status: 409 },
  );
}

function paymentExceedsRemainingAmount(): Response {
  return HttpResponse.json<ErrorResponse>(
    {
      code: ErrorCode.PaymentExceedsRemainingAmount,
      message: 'Le montant dépasse le reste à payer.',
    },
    { status: 409 },
  );
}

function campaignNotOpen(): Response {
  return HttpResponse.json<ErrorResponse>(
    {
      code: ErrorCode.CampaignNotOpen,
      message: 'Un règlement ne peut être enregistré que sur une campagne ouverte.',
    },
    { status: 409 },
  );
}

function isCreatePaymentRequest(value: unknown): value is CreatePaymentRequest {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const body = value as Record<string, unknown>;
  return (
    typeof body['amount'] === 'number' &&
    body['amount'] >= 1 &&
    typeof body['paymentDate'] === 'string' &&
    typeof body['method'] === 'string'
  );
}

function findDueById(dueId: string): { campaignId: string; due: Due } | undefined {
  for (const [campaignId, dues] of Object.entries(demoCampaignDues)) {
    const due = dues.find((item) => item.id === dueId);
    if (due) {
      return { campaignId, due };
    }
  }
  return undefined;
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

function campaignAlreadyClosed(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.CampaignAlreadyClosed, message: 'Cette campagne est déjà clôturée.' },
    { status: 409 },
  );
}

// Le JSON transporte un tableau ; uniqueItems est représenté par un Set dans le DTO généré.
type UpdateCampaignCategoryAmountsJson = Omit<
  UpdateCampaignCategoryAmountsRequest,
  'categoryAmounts'
> & { categoryAmounts: CampaignCategoryAmountInput[] };

function isValidCategoryAmountEntry(entry: unknown): entry is CampaignCategoryAmountInput {
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
): value is UpdateCampaignCategoryAmountsJson {
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
  /**
   * Historique des règlements d'une campagne (T-129), filtré par
   * `campaignId` afin que l'onglet Règlements soit exploitable en mode mock.
   * Le handler laisse l'historique filtré par membre au handler de la feature
   * Membres.
   */
  http.get('/api/v1/payments', async ({ request }): Promise<Response | undefined> => {
    const url = new URL(request.url);
    const campaignId = url.searchParams.get('campaignId');
    if (!campaignId) {
      return undefined;
    }

    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const payments = demoPaymentsByCampaignId[campaignId] ?? [];
    const size = Number(url.searchParams.get('size') ?? '20');
    const pageNumber = Number(url.searchParams.get('page') ?? '0');
    const totalElements = payments.length;
    const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / size);
    const items = payments.slice(pageNumber * size, (pageNumber + 1) * size);
    const page: PaymentPage = {
      items,
      page: { number: pageNumber, size, totalElements, totalPages },
    };
    return HttpResponse.json<PaymentPage>(page);
  }),

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
    const sorted = [...filtered].sort(
      (left, right) =>
        right.startDate.localeCompare(left.startDate) || right.endDate.localeCompare(left.endDate),
    );
    const start = page * size;
    const items = sorted.slice(start, start + size);

    return HttpResponse.json<CampaignPage>({
      items,
      page: {
        number: page,
        size,
        totalElements: sorted.length,
        totalPages: Math.max(1, Math.ceil(sorted.length / size)),
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
      // Une campagne créée reste configurable en brouillon jusqu'à son
      // ouverture explicite après la date de début selon le cycle de vie métier.
      status: CampaignStatus.Upcoming,
      memberCount: 0,
    };
    demoCampaigns.unshift(summary);

    const campaign: Campaign = {
      ...summary,
      description: body.description,
      categoryAmounts: [],
    };
    const campaignWithReadiness = campaignForRead(campaign);
    demoCampaignDetails[summary.id] = campaignWithReadiness;

    return HttpResponse.json<Campaign>(campaignWithReadiness, { status: 201 });
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

    return HttpResponse.json<Campaign>(campaignForRead(campaign));
  }),

  /**
   * Handler MSW de démonstration pour `POST /api/v1/campaigns/{campaignId}/open`.
   * Le backend métier n'est pas présent dans ce dépôt frontend. Ce mock reproduit
   * donc le contrat attendu : recalcul de la checklist, contrôle du statut et de
   * la date, puis mise à jour atomique des snapshots utilisés par les onglets.
   * L'implémentation serveur devra conserver ces contrôles dans une transaction
   * et utiliser l'horloge et le fuseau de l'association.
   */
  http.post(
    '/api/v1/campaigns/:campaignId/open',
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

      const campaignId = typeof params['campaignId'] === 'string' ? params['campaignId'] : '';
      const campaign = demoCampaignDetails[campaignId];
      if (!campaign) {
        return campaignNotFound();
      }
      if (campaign.status === CampaignStatus.Open) {
        return campaignOpeningConflict(
          ErrorCode.CampaignAlreadyOpen,
          'Cette campagne est déjà ouverte.',
        );
      }
      if (campaign.status === CampaignStatus.Closed) {
        return campaignOpeningConflict(ErrorCode.CampaignClosed, 'Cette campagne est clôturée.');
      }

      const readiness = calculateOpeningReadiness(campaign);
      if (!readiness.startDateReached) {
        return campaignOpeningConflict(
          ErrorCode.CampaignStartDateNotReached,
          "La date de début de cette campagne n'est pas encore atteinte.",
        );
      }
      if (!readiness.ready) {
        return campaignOpeningConflict(
          ErrorCode.CampaignNotReady,
          "La checklist de préparation de cette campagne n'est pas complète.",
        );
      }

      const openedSummary: CampaignSummary = { ...campaign, status: CampaignStatus.Open };
      const openedCampaign: Campaign = {
        ...campaign,
        status: CampaignStatus.Open,
        openedAt: new Date().toISOString(),
        openedBy: {
          userId: account.user.userId,
          displayName: account.user.member.displayName,
        },
        openingReadiness: undefined,
      };
      demoCampaignDetails[campaignId] = openedCampaign;
      const campaignIndex = demoCampaigns.findIndex((item) => item.id === campaignId);
      if (campaignIndex !== -1) {
        demoCampaigns[campaignIndex] = openedSummary;
      }

      const campaignDues = demoCampaignDues[campaignId];
      if (campaignDues) {
        demoCampaignDues[campaignId] = campaignDues.map((due) => ({
          ...due,
          campaign: openedSummary,
        }));
      }
      const campaignPayments = demoPaymentsByCampaignId[campaignId];
      if (campaignPayments) {
        demoPaymentsByCampaignId[campaignId] = campaignPayments.map((payment) => ({
          ...payment,
          campaign: openedSummary,
        }));
      }

      return HttpResponse.json<Campaign>(openedCampaign);
    },
  ),

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

      return HttpResponse.json<Campaign>(campaignForRead(updatedCampaign));
    },
  ),

  /**
   * Handler MSW de démonstration pour `POST /api/v1/campaigns/{campaignId}/closure`
   * (T-80, `closeCampaign`) : réservé à l'Administrateur et au Trésorier, refuse
   * une campagne déjà clôturée, puis conserve le statut `CLOSED` pour les
   * lectures suivantes du jeu de démonstration.
   */
  http.post(
    '/api/v1/campaigns/:campaignId/closure',
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

      const campaignId = typeof params['campaignId'] === 'string' ? params['campaignId'] : '';
      const campaign = demoCampaignDetails[campaignId];
      if (!campaign) {
        return campaignNotFound();
      }
      if (campaign.status === CampaignStatus.Closed) {
        return campaignAlreadyClosed();
      }

      const closedSummary: CampaignSummary = { ...campaign, status: CampaignStatus.Closed };
      const closedCampaign: Campaign = { ...campaign, status: CampaignStatus.Closed };
      demoCampaignDetails[campaignId] = closedCampaign;
      const index = demoCampaigns.findIndex((item) => item.id === campaignId);
      if (index !== -1) {
        demoCampaigns[index] = closedSummary;
      }

      return HttpResponse.json<Campaign>(closedCampaign);
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
    const statusFilter = url.searchParams.get('status');
    const dues = (demoCampaignDues[campaignId] ?? []).filter(
      (due) => !statusFilter || due.status === statusFilter,
    );
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

  /**
   * Handler MSW de démonstration pour `POST /api/v1/dues/{dueId}/payments`
   * (T-71, `createPayment`) : réservé à l'Administrateur, au Trésorier et à
   * l'Opérateur dont `operatorCanRecordPayments` est actif (RG-ROLE-007 à
   * RG-ROLE-009), refuse une campagne qui n'est pas Ouverte (RG-PAY-010), un
   * montant dépassant le reste à payer ou une cotisation déjà réglée, puis
   * renvoie le règlement et la cotisation recalculée en mettant à jour le jeu
   * de démonstration utilisé par les lectures suivantes.
   */
  http.post('/api/v1/dues/:dueId/payments', async ({ request, params }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }
    const canRecordPayments =
      account.user.role === UserRole.Administrator ||
      account.user.role === UserRole.Treasurer ||
      (account.user.role === UserRole.Operator && account.user.operatorCanRecordPayments);
    if (!canRecordPayments) {
      return paymentAccessDenied();
    }

    const dueId = typeof params['dueId'] === 'string' ? params['dueId'] : '';
    const found = findDueById(dueId);
    if (!found) {
      return dueNotFound();
    }
    const { due } = found;
    if (due.campaign.status !== CampaignStatus.Open) {
      return campaignNotOpen();
    }
    if (due.status === DueStatus.Paid) {
      return dueAlreadyPaid();
    }

    const body = await request.json();
    if (!isCreatePaymentRequest(body)) {
      return HttpResponse.json<ErrorResponse>(
        { code: ErrorCode.ValidationError, message: 'Règlement invalide.' },
        { status: 400 },
      );
    }
    if (body.amount > due.remainingAmount) {
      return paymentExceedsRemainingAmount();
    }

    const paidAmount = due.paidAmount + body.amount;
    const remainingAmount = due.dueAmount - paidAmount;
    const updatedDue: Due = {
      ...due,
      paidAmount,
      remainingAmount,
      status: remainingAmount === 0 ? DueStatus.Paid : DueStatus.PartiallyPaid,
      paymentCount: due.paymentCount + 1,
    };
    const dues = demoCampaignDues[found.campaignId] ?? [];
    demoCampaignDues[found.campaignId] = dues.map((item) =>
      item.id === due.id ? updatedDue : item,
    );

    const payment: Payment = {
      id: crypto.randomUUID(),
      dueId: due.id,
      member: due.member,
      campaign: due.campaign,
      amount: body.amount,
      paymentDate: body.paymentDate,
      method: body.method,
      recordedBy: { userId: account.user.userId, displayName: account.user.member.displayName },
      recordedAt: new Date().toISOString(),
      currency: due.currency,
    };

    return HttpResponse.json<PaymentCreationResponse>(
      { payment, due: updatedDue },
      { status: 201 },
    );
  }),
];
