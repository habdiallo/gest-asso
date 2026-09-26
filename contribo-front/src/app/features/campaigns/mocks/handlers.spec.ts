import { setupServer } from 'msw/node';
import { ErrorCode, UserRole } from '@api';
import type { Campaign, CampaignPage, ErrorResponse, PaymentPage } from '@api';
import { demoAccounts } from '../../../../mocks/demo-accounts';
import { campaignsHandlers } from './handlers';

const server = setupServer(...campaignsHandlers);
const upcomingCampaignId = '10700000-0000-4000-8000-000000000201';
const closedCampaignId = '10700000-0000-4000-8000-000000000202';
const categoryId = '10700000-0000-4000-8000-000000000101';
const upcomingDueId = '10700000-0000-4000-8000-000000000420';
const closedDueId = '10700000-0000-0000-0000-000000000430';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function headersFor(role: UserRole): Record<string, string> {
  const account = demoAccounts.find((candidate) => candidate.user.role === role);
  if (!account) {
    throw new Error(`Aucun compte de démonstration pour le rôle ${role}.`);
  }
  return {
    Authorization: `Bearer ${account.accessToken}`,
    'Content-Type': 'application/json',
  };
}

function updateAmounts(
  categoryAmounts: unknown,
  role: UserRole = UserRole.Treasurer,
  campaignId = upcomingCampaignId,
): Promise<Response> {
  return fetch(`/api/v1/campaigns/${campaignId}/category-amounts`, {
    method: 'PUT',
    headers: headersFor(role),
    body: JSON.stringify({ categoryAmounts }),
  });
}

describe('GET /api/v1/campaigns (mock)', () => {
  it('returns campaigns from the most recent start date before pagination', async () => {
    const response = await fetch('/api/v1/campaigns?size=2', {
      headers: headersFor(UserRole.Treasurer),
    });

    expect(response.status).toBe(200);
    const page = (await response.json()) as CampaignPage;
    expect(page.items.map((campaign) => campaign.name)).toEqual([
      'Rentrée associative',
      'Solidarité septembre',
    ]);
    expect(page.page.size).toBe(2);
    expect(page.page.totalElements).toBe(4);
  });

  it('keeps upcoming campaigns out of the open filter', async () => {
    const response = await fetch('/api/v1/campaigns?status=OPEN', {
      headers: headersFor(UserRole.Treasurer),
    });

    expect(response.status).toBe(200);
    const page = (await response.json()) as CampaignPage;
    expect(page.items.map((campaign) => campaign.name)).not.toContain('Rentrée associative');
  });

  it('exposes upcoming campaigns through the upcoming filter', async () => {
    const response = await fetch('/api/v1/campaigns?status=UPCOMING', {
      headers: headersFor(UserRole.Treasurer),
    });

    expect(response.status).toBe(200);
    const page = (await response.json()) as CampaignPage;
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({ name: 'Rentrée associative', status: 'UPCOMING' });
  });
});

describe('GET /api/v1/payments?campaignId=... (mock, T-129)', () => {
  it('returns the campaign payment history for the detail tab', async () => {
    const response = await fetch(
      '/api/v1/payments?campaignId=10700000-0000-4000-8000-000000000200&size=10',
      { headers: headersFor(UserRole.Treasurer) },
    );

    expect(response.status).toBe(200);
    const page = (await response.json()) as PaymentPage;
    expect(page.items).toHaveLength(2);
    expect(page.items[0]).toMatchObject({
      member: { displayName: 'Amadou Diallo' },
      paymentDate: '2026-09-12',
    });
    expect(page.page).toMatchObject({ number: 0, size: 10, totalElements: 2, totalPages: 1 });
  });
});

describe('GET /api/v1/campaigns/{id}/dues (mock, T-131)', () => {
  it.each([
    { campaignId: upcomingCampaignId, dueId: upcomingDueId, status: 'UPCOMING' },
    { campaignId: closedCampaignId, dueId: closedDueId, status: 'CLOSED' },
  ])('exposes a due for the $status lifecycle state', async ({ campaignId, dueId, status }) => {
    const response = await fetch(`/api/v1/campaigns/${campaignId}/dues?size=20`, {
      headers: headersFor(UserRole.Treasurer),
    });

    expect(response.status).toBe(200);
    const page = (await response.json()) as {
      items: Array<{ id: string; campaign: { status: string } }>;
    };
    expect(page.items).toContainEqual(expect.objectContaining({ id: dueId }));
    expect(page.items[0]?.campaign.status).toBe(status);
  });
});

describe('POST /api/v1/dues/{id}/payments (mock, T-131)', () => {
  it.each([upcomingDueId, closedDueId])(
    'rejects a payment attempt for a non-open campaign, due %s',
    async (dueId) => {
      const response = await fetch(`/api/v1/dues/${dueId}/payments`, {
        method: 'POST',
        headers: headersFor(UserRole.Treasurer),
        body: JSON.stringify({
          amount: 25_000,
          paymentDate: '2026-09-18',
          method: 'CASH',
        }),
      });

      expect(response.status).toBe(409);
      const body = (await response.json()) as ErrorResponse;
      expect(body.code).toBe(ErrorCode.CampaignNotOpen);
    },
  );
});

describe('PUT /api/v1/campaigns/{id}/category-amounts (mock, T-113)', () => {
  it('accepte un tableau JSON et conserve le barème et le bilan mis à jour', async () => {
    const beforeResponse = await fetch(`/api/v1/campaigns/${upcomingCampaignId}`, {
      headers: headersFor(UserRole.Treasurer),
    });
    const before = (await beforeResponse.json()) as Campaign;

    try {
      const response = await updateAmounts([{ incomeCategoryId: categoryId, amount: 100_000 }]);
      expect(response.status).toBe(200);
      const campaign = (await response.json()) as Campaign;
      expect(campaign.categoryAmounts[0].amount).toBe(100_000);
      expect(campaign.categoryAmounts[0].expectedAmount).toBe(9_100_000);
      expect(campaign.financialSummary).toMatchObject({
        expectedAmount: 9_100_000,
        collectedAmount: 0,
        remainingAmount: 9_100_000,
        collectionRate: 0,
      });

      const persistedResponse = await fetch(`/api/v1/campaigns/${upcomingCampaignId}`, {
        headers: headersFor(UserRole.Treasurer),
      });
      expect(await persistedResponse.json()).toEqual(campaign);
    } finally {
      await updateAmounts(
        before.categoryAmounts.map((entry) => ({
          incomeCategoryId: entry.incomeCategory.id,
          amount: entry.amount,
        })),
      );
    }
  });

  it.each([
    { incomeCategoryId: categoryId, amount: 100_000 },
    [],
    [{ incomeCategoryId: categoryId, amount: '100000' }],
    [{ incomeCategoryId: categoryId, amount: -1 }],
  ])('refuse un barème JSON invalide : %j', async (categoryAmounts) => {
    const response = await updateAmounts(categoryAmounts);
    expect(response.status).toBe(400);
    const body = (await response.json()) as ErrorResponse;
    expect(body.code).toBe(ErrorCode.ValidationError);
  });

  it('refuse la modification par un Membre', async () => {
    const response = await updateAmounts(
      [{ incomeCategoryId: categoryId, amount: 100_000 }],
      UserRole.Member,
    );
    expect(response.status).toBe(403);
    const body = (await response.json()) as ErrorResponse;
    expect(body.code).toBe(ErrorCode.AccessDenied);
  });

  it('refuse la modification d’une campagne ouverte', async () => {
    const response = await updateAmounts(
      [{ incomeCategoryId: categoryId, amount: 100_000 }],
      UserRole.Treasurer,
      '10700000-0000-4000-8000-000000000200',
    );
    expect(response.status).toBe(409);
    const body = (await response.json()) as ErrorResponse;
    expect(body.code).toBe(ErrorCode.CampaignNotEditable);
  });
});

describe('POST /api/v1/campaigns/{id}/open (mock, T-131)', () => {
  it('recalcule la checklist, ouvre la campagne et trace l’auteur', async () => {
    const beforeResponse = await fetch(`/api/v1/campaigns/${upcomingCampaignId}`, {
      headers: headersFor(UserRole.Treasurer),
    });
    const before = (await beforeResponse.json()) as Campaign;
    expect(before.openingReadiness).toMatchObject({
      baremeComplete: true,
      datesValid: true,
      startDateReached: true,
      duesReady: true,
      ready: true,
    });

    const response = await fetch(`/api/v1/campaigns/${upcomingCampaignId}/open`, {
      method: 'POST',
      headers: headersFor(UserRole.Treasurer),
    });

    expect(response.status).toBe(200);
    const campaign = (await response.json()) as Campaign;
    expect(campaign).toMatchObject({
      status: 'OPEN',
      openedBy: { displayName: 'Moussa Barry' },
    });
    expect(campaign.openedAt).toEqual(expect.any(String));

    const dueResponse = await fetch(`/api/v1/campaigns/${upcomingCampaignId}/dues`, {
      headers: headersFor(UserRole.Treasurer),
    });
    const dues = (await dueResponse.json()) as { items: Array<{ campaign: { status: string } }> };
    expect(dues.items[0]?.campaign.status).toBe('OPEN');

    const paymentResponse = await fetch(`/api/v1/dues/${upcomingDueId}/payments`, {
      method: 'POST',
      headers: headersFor(UserRole.Treasurer),
      body: JSON.stringify({
        amount: 25_000,
        paymentDate: '2026-09-26',
        method: 'CASH',
      }),
    });
    expect(paymentResponse.status).toBe(201);
  });

  it('refuse une campagne créée après la date de début si le barème est incomplet', async () => {
    const createResponse = await fetch('/api/v1/campaigns', {
      method: 'POST',
      headers: headersFor(UserRole.Treasurer),
      body: JSON.stringify({
        name: 'Campagne à préparer',
        startDate: '2026-09-26',
        endDate: '2026-10-31',
        description: 'Démonstration de la checklist.',
      }),
    });
    const created = (await createResponse.json()) as Campaign;

    const response = await fetch(`/api/v1/campaigns/${created.id}/open`, {
      method: 'POST',
      headers: headersFor(UserRole.Treasurer),
    });

    expect(response.status).toBe(409);
    expect(((await response.json()) as ErrorResponse).code).toBe(ErrorCode.CampaignNotReady);
  });

  it('refuse une campagne prête avant sa date de début', async () => {
    const createResponse = await fetch('/api/v1/campaigns', {
      method: 'POST',
      headers: headersFor(UserRole.Treasurer),
      body: JSON.stringify({
        name: 'Campagne future',
        startDate: '2026-09-27',
        endDate: '2026-10-31',
        description: 'Démonstration de la garde de date.',
      }),
    });
    const created = (await createResponse.json()) as Campaign;

    const response = await fetch(`/api/v1/campaigns/${created.id}/open`, {
      method: 'POST',
      headers: headersFor(UserRole.Treasurer),
    });

    expect(response.status).toBe(409);
    expect(((await response.json()) as ErrorResponse).code).toBe(
      ErrorCode.CampaignStartDateNotReached,
    );
  });

  it('retourne un conflit stable pour une campagne déjà ouverte ou clôturée', async () => {
    const alreadyOpenResponse = await fetch(`/api/v1/campaigns/${upcomingCampaignId}/open`, {
      method: 'POST',
      headers: headersFor(UserRole.Treasurer),
    });
    expect(alreadyOpenResponse.status).toBe(409);
    expect(((await alreadyOpenResponse.json()) as ErrorResponse).code).toBe(
      ErrorCode.CampaignAlreadyOpen,
    );

    const closedResponse = await fetch(`/api/v1/campaigns/${closedCampaignId}/open`, {
      method: 'POST',
      headers: headersFor(UserRole.Treasurer),
    });
    expect(closedResponse.status).toBe(409);
    expect(((await closedResponse.json()) as ErrorResponse).code).toBe(ErrorCode.CampaignClosed);
  });
});
