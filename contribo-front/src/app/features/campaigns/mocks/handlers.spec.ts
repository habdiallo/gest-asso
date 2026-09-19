import { setupServer } from 'msw/node';
import { ErrorCode, UserRole } from '@api';
import type { Campaign, ErrorResponse } from '@api';
import { demoAccounts } from '../../../../mocks/demo-accounts';
import { campaignsHandlers } from './handlers';

const server = setupServer(...campaignsHandlers);
const upcomingCampaignId = '10700000-0000-4000-8000-000000000201';
const categoryId = '10700000-0000-4000-8000-000000000101';

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
