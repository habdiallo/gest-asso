import type {
  ContributionPage,
  CreateSocialFundRequest,
  ErrorResponse,
  SocialFund,
  SocialFundPage,
} from '@api';
import { demoAccounts } from '../../../../mocks/demo-accounts';
import { socialFundsHandlers } from './handlers';

async function runRequest(request: Request): Promise<Response> {
  for (const handler of socialFundsHandlers) {
    const result = await handler.run({
      request,
      requestId: crypto.randomUUID(),
      resolutionContext: { baseUrl: 'http://localhost' },
    });
    if (result?.response) {
      return result.response;
    }
  }
  throw new Error('No matching social fund handler');
}

function buildCreateRequest(accessToken: string): Request {
  const body: CreateSocialFundRequest = {
    title: 'Soutien à la famille Bah',
    eventType: 'DEATH' as CreateSocialFundRequest['eventType'],
    beneficiary: 'Famille Bah',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  };
  return new Request('http://localhost/api/v1/social-funds', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/v1/social-funds (mocks MSW, T-84)', () => {
  it.each(['admin.demo', 'tresorier.demo'])(
    'creates the social fund for the Administrator/Treasurer account %s',
    async (identifier) => {
      const account = demoAccounts.find((demoAccount) => demoAccount.identifier === identifier);
      if (!account) {
        throw new Error(`Missing demo account ${identifier}`);
      }

      const response = await runRequest(buildCreateRequest(account.accessToken));

      expect(response.status).toBe(201);
      const socialFund = (await response.json()) as SocialFund;
      expect(socialFund.title).toBe('Soutien à la famille Bah');
    },
  );

  it.each(['operateur.demo', 'operateur.consultation.demo', 'membre.demo'])(
    'refuses the creation for the non-authorized account %s',
    async (identifier) => {
      const account = demoAccounts.find((demoAccount) => demoAccount.identifier === identifier);
      if (!account) {
        throw new Error(`Missing demo account ${identifier}`);
      }

      const response = await runRequest(buildCreateRequest(account.accessToken));

      expect(response.status).toBe(403);
      const body = (await response.json()) as ErrorResponse;
      expect(body.code).toBe('ACCESS_DENIED');
    },
  );
});

describe('GET /api/v1/social-funds/{socialFundId}/contributions (mocks MSW, T-91)', () => {
  it('keeps the demo contribution history consistent with each social fund aggregates', async () => {
    const headers = { Authorization: `Bearer ${demoAccounts[0].accessToken}` };

    const listResponse = await runRequest(
      new Request('http://localhost/api/v1/social-funds?size=20', { headers }),
    );
    const socialFundPage = (await listResponse.json()) as SocialFundPage;
    expect(socialFundPage.items.length).toBeGreaterThan(0);

    for (const summary of socialFundPage.items) {
      const detailResponse = await runRequest(
        new Request(`http://localhost/api/v1/social-funds/${summary.id}`, { headers }),
      );
      const socialFund = (await detailResponse.json()) as SocialFund;

      const contributionsResponse = await runRequest(
        new Request(
          `http://localhost/api/v1/social-funds/${summary.id}/contributions?size=${socialFund.contributionCount}`,
          { headers },
        ),
      );
      const contributionPage = (await contributionsResponse.json()) as ContributionPage;

      expect(contributionPage.page.totalElements).toBe(socialFund.contributionCount);
      expect(contributionPage.items).toHaveLength(socialFund.contributionCount ?? 0);

      const distinctContributors = new Set(contributionPage.items.map((item) => item.member.id));
      expect(distinctContributors.size).toBe(socialFund.contributorCount);

      const totalCollected = contributionPage.items.reduce((sum, item) => sum + item.amount, 0);
      expect(totalCollected).toBe(socialFund.collectedAmount);
    }
  });
});

describe('GET /api/v1/social-funds (filters)', () => {
  it('returns social funds from the most recent start date before pagination', async () => {
    const response = await runRequest(
      new Request('http://localhost/api/v1/social-funds?size=2', {
        headers: { Authorization: `Bearer ${demoAccounts[0].accessToken}` },
      }),
    );

    expect(response.status).toBe(200);
    const page = (await response.json()) as SocialFundPage;
    const startDates = page.items.map((socialFund) => socialFund.startDate);
    expect(startDates).toEqual([...startDates].sort((left, right) => right.localeCompare(left)));
    expect(page.page.size).toBe(2);
    expect(page.page.totalElements).toBeGreaterThanOrEqual(3);
  });

  it('filters by the visible search query before pagination', async () => {
    const response = await runRequest(
      new Request('http://localhost/api/v1/social-funds?q=Bah&size=20', {
        headers: { Authorization: `Bearer ${demoAccounts[0].accessToken}` },
      }),
    );

    expect(response.status).toBe(200);
    const page = (await response.json()) as SocialFundPage;
    expect(page.items.length).toBeGreaterThan(0);
    expect(
      page.items.every((item) =>
        `${item.title} ${item.beneficiary}`.toLocaleLowerCase('fr-FR').includes('bah'),
      ),
    ).toBe(true);
  });

  it('filters by status before pagination', async () => {
    const response = await runRequest(
      new Request('http://localhost/api/v1/social-funds?status=CLOSED&size=20', {
        headers: { Authorization: `Bearer ${demoAccounts[0].accessToken}` },
      }),
    );

    expect(response.status).toBe(200);
    const page = (await response.json()) as SocialFundPage;
    expect(page.items.every((item) => item.status === 'CLOSED')).toBe(true);
  });
});
