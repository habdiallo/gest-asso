import { HttpResponse, delay, http } from 'msw';
import { ErrorCode, SocialEventType, SocialFundStatus } from '@api';
import type {
  CreateSocialFundRequest,
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
 *
 * Le filtre `eventType` (T-83, paramètre `SocialFundEventTypeFilter` du
 * contrat) est appliqué avant la pagination, comme sur le serveur réel.
 *
 * `POST /api/v1/social-funds` (T-84, `createSocialFund`) ajoute la nouvelle
 * cagnotte au jeu de démonstration : statut ouvert, aucun montant collecté,
 * `remainingToTargetAmount`/`progressRate` présents uniquement lorsqu'un
 * objectif est fourni (même règle que le serveur réel).
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
  http.post('/api/v1/social-funds', async ({ request }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const body = (await request.json()) as CreateSocialFundRequest;
    const summary: SocialFundSummary = {
      id: crypto.randomUUID(),
      title: body.title,
      eventType: body.eventType,
      beneficiary: body.beneficiary,
      startDate: body.startDate,
      endDate: body.endDate,
      status: SocialFundStatus.Open,
      targetAmount: body.targetAmount,
      collectedAmount: 0,
      remainingToTargetAmount: body.targetAmount,
      progressRate: body.targetAmount !== undefined ? 0 : undefined,
      contributorCount: 0,
      contributionCount: 0,
      currency: 'GNF',
    };

    demoSocialFunds.unshift(summary);

    const socialFund: SocialFund = { ...summary, description: body.description };
    return HttpResponse.json<SocialFund>(socialFund, { status: 201 });
  }),
];
