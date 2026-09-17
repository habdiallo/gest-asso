import { HttpResponse, delay, http } from 'msw';
import { ErrorCode, SocialEventType, SocialFundStatus } from '@api';
import type { ErrorResponse, SocialFundPage, SocialFundSummary } from '@api';
import { findDemoAccountByAuthorization } from '../../../../mocks/demo-accounts';

const demoSocialFunds: SocialFundSummary[] = [
  {
    id: '10700000-0000-4000-8000-000000000500',
    title: 'Mariage de Fanta et Sékou',
    eventType: SocialEventType.Wedding,
    beneficiary: 'Famille Camara',
    startDate: '2026-09-05',
    endDate: '2026-09-28',
    status: SocialFundStatus.Open,
    targetAmount: 7000000,
    collectedAmount: 4750000,
    remainingToTargetAmount: 2250000,
    progressRate: 67.9,
    contributorCount: 43,
    contributionCount: 51,
    currency: 'GNF',
  },
  {
    id: '10700000-0000-4000-8000-000000000501',
    title: 'Soutien à la famille Diallo',
    eventType: SocialEventType.Death,
    beneficiary: 'Famille Diallo',
    startDate: '2026-08-10',
    endDate: '2026-09-10',
    status: SocialFundStatus.Closed,
    collectedAmount: 1850000,
    contributorCount: 22,
    contributionCount: 26,
    currency: 'GNF',
  },
];

function authenticationRequired(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.AuthenticationRequired, message: 'Authentification requise.' },
    { status: 401 },
  );
}

/**
 * Handlers MSW de démonstration pour `GET /api/v1/social-funds` (T-82). Le
 * jeu de données couvre une cagnotte ouverte avec objectif (barre de
 * progression) et une cagnotte clôturée sans objectif (RG : un objectif
 * absent ne doit jamais être affiché comme atteint à zéro).
 */
export const socialFundsHandlers = [
  http.get('/api/v1/social-funds', async ({ request }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const page: SocialFundPage = {
      items: demoSocialFunds,
      page: {
        number: 0,
        size: 20,
        totalElements: demoSocialFunds.length,
        totalPages: 1,
      },
    };
    return HttpResponse.json<SocialFundPage>(page);
  }),
];
