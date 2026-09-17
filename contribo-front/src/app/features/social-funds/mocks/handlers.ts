import { HttpResponse, delay, http } from 'msw';
import { ErrorCode, PaymentMethod, SocialEventType, SocialFundStatus } from '@api';
import type {
  Contribution,
  ContributionPage,
  ErrorResponse,
  SocialFund,
  SocialFundPage,
  SocialFundSummary,
} from '@api';
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

const demoSocialFundDescriptions: Record<string, string> = {
  '10700000-0000-4000-8000-000000000500': "Collecte de soutien à l'occasion du mariage.",
  '10700000-0000-4000-8000-000000000501': 'Collecte de soutien à la famille éprouvée.',
};

/**
 * Contributions de démonstration pour `GET /social-funds/{socialFundId}/contributions`
 * (T-91). Chaque cagnotte de démonstration possède quelques contributions,
 * de la plus récente à la plus ancienne, comme le fait le serveur réel.
 */
const demoContributionsBySocialFundId: Record<string, Contribution[]> = {
  '10700000-0000-4000-8000-000000000500': [
    {
      id: '10700000-0000-4000-8000-000000000600',
      member: { id: '10700000-0000-4000-8000-000000000200', displayName: 'Aïcha Bah' },
      socialFund: {
        id: '10700000-0000-4000-8000-000000000500',
        title: 'Mariage de Fanta et Sékou',
        eventType: SocialEventType.Wedding,
        status: SocialFundStatus.Open,
      },
      amount: 250000,
      contributionDate: '2026-09-14',
      method: PaymentMethod.MobileMoney,
      recordedBy: { userId: '10700000-0000-4000-8000-000000000900', displayName: 'Mamadou Sy' },
      recordedAt: '2026-09-14T09:05:00Z',
      currency: 'GNF',
    },
    {
      id: '10700000-0000-4000-8000-000000000601',
      member: { id: '10700000-0000-4000-8000-000000000201', displayName: 'Ibrahima Sow' },
      socialFund: {
        id: '10700000-0000-4000-8000-000000000500',
        title: 'Mariage de Fanta et Sékou',
        eventType: SocialEventType.Wedding,
        status: SocialFundStatus.Open,
      },
      amount: 150000,
      contributionDate: '2026-09-10',
      method: PaymentMethod.Cash,
      recordedBy: { userId: '10700000-0000-4000-8000-000000000900', displayName: 'Mamadou Sy' },
      recordedAt: '2026-09-10T14:20:00Z',
      currency: 'GNF',
    },
  ],
  '10700000-0000-4000-8000-000000000501': [
    {
      id: '10700000-0000-4000-8000-000000000602',
      member: { id: '10700000-0000-4000-8000-000000000202', displayName: 'Fatoumata Diallo' },
      socialFund: {
        id: '10700000-0000-4000-8000-000000000501',
        title: 'Soutien à la famille Diallo',
        eventType: SocialEventType.Death,
        status: SocialFundStatus.Closed,
      },
      amount: 100000,
      contributionDate: '2026-08-15',
      method: PaymentMethod.BankTransfer,
      recordedBy: { userId: '10700000-0000-4000-8000-000000000901', displayName: 'Aminata Camara' },
      recordedAt: '2026-08-15T08:00:00Z',
      currency: 'GNF',
    },
  ],
};

function authenticationRequired(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.AuthenticationRequired, message: 'Authentification requise.' },
    { status: 401 },
  );
}

function socialFundNotFound(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.ResourceNotFound, message: 'Cagnotte introuvable.' },
    { status: 404 },
  );
}

function buildDemoSocialFund(summary: SocialFundSummary): SocialFund {
  return {
    ...summary,
    description: demoSocialFundDescriptions[summary.id],
  };
}

/**
 * Handlers MSW de démonstration pour `GET /api/v1/social-funds` (T-82). Le
 * jeu de données couvre une cagnotte ouverte avec objectif (barre de
 * progression) et une cagnotte clôturée sans objectif (RG : un objectif
 * absent ne doit jamais être affiché comme atteint à zéro).
 *
 * Le filtre `eventType` (T-83, paramètre `SocialFundEventTypeFilter` du
 * contrat) est appliqué avant la pagination, comme sur le serveur réel.
 */
export const socialFundsHandlers = [
  http.get('/api/v1/social-funds', async ({ request }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const url = new URL(request.url);
    const pageNumber = Number(url.searchParams.get('page') ?? '0');
    const pageSize = Number(url.searchParams.get('size') ?? '20');
    const eventType = url.searchParams.get('eventType') as SocialEventType | null;
    const filteredSocialFunds = eventType
      ? demoSocialFunds.filter((socialFund) => socialFund.eventType === eventType)
      : demoSocialFunds;
    const totalElements = filteredSocialFunds.length;
    const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / pageSize);
    const items = filteredSocialFunds.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);

    const page: SocialFundPage = {
      items,
      page: {
        number: pageNumber,
        size: pageSize,
        totalElements,
        totalPages,
      },
    };
    return HttpResponse.json<SocialFundPage>(page);
  }),

  /**
   * Suivi d'une cagnotte (T-91, `openapi:getSocialFund`) : réutilise le jeu
   * de démonstration de la liste (T-82), avec la description complète que
   * `SocialFundSummary` n'expose pas.
   */
  http.get('/api/v1/social-funds/:socialFundId', async ({ request, params }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const socialFundId = params['socialFundId'] as string;
    const socialFund = demoSocialFunds.find((item) => item.id === socialFundId);
    if (!socialFund) {
      return socialFundNotFound();
    }

    return HttpResponse.json<SocialFund>(buildDemoSocialFund(socialFund));
  }),

  /**
   * Contributions d'une cagnotte (T-91, `openapi:listSocialFundContributions`),
   * de la plus récente à la plus ancienne, comme le fait le serveur réel.
   */
  http.get(
    '/api/v1/social-funds/:socialFundId/contributions',
    async ({ request, params }): Promise<Response> => {
      await delay(300);
      const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
      if (!account) {
        return authenticationRequired();
      }

      const socialFundId = params['socialFundId'] as string;
      if (!demoSocialFunds.some((item) => item.id === socialFundId)) {
        return socialFundNotFound();
      }

      const url = new URL(request.url);
      const pageNumber = Number(url.searchParams.get('page') ?? '0');
      const pageSize = Number(url.searchParams.get('size') ?? '20');
      const contributions = demoContributionsBySocialFundId[socialFundId] ?? [];
      const totalElements = contributions.length;
      const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / pageSize);
      const items = contributions.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);

      const page: ContributionPage = {
        items,
        page: {
          number: pageNumber,
          size: pageSize,
          totalElements,
          totalPages,
        },
      };
      return HttpResponse.json<ContributionPage>(page);
    },
  ),
];
