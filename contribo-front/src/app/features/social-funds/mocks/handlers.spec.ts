import type { CreateSocialFundRequest, ErrorResponse, SocialFund } from '@api';
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
