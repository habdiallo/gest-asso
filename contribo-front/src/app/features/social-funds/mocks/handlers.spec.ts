import type { ContributionPage, SocialFund, SocialFundPage } from '@api';
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
