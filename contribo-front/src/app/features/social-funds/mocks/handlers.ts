import { HttpResponse, delay, http } from 'msw';
import { ErrorCode, PaymentMethod, SocialEventType, SocialFundStatus, UserRole } from '@api';
import type {
  Contribution,
  ContributionPage,
  ContributionCreationResponse,
  CreateContributionRequest,
  CreateExternalContributionRequest,
  CreateSocialFundRequest,
  ErrorResponse,
  SocialFund,
  SocialFundPage,
  SocialFundSummary,
} from '@api';
import { findDemoAccountByAuthorization } from '../../../../mocks/demo-accounts';

/**
 * Cagnottes de démonstration (T-117) : deux cagnottes ouvertes (`...500`, `...502`)
 * permettent de vérifier que le sélecteur de périmètre du tableau de bord
 * distingue bien une sélection précise d'un agrégat sur plusieurs cagnottes
 * (`allOpenSocialFundsSummary`, cf. `features/dashboard/mocks/handlers.ts`).
 */
export const demoSocialFunds: SocialFundSummary[] = [
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
  {
    id: '10700000-0000-4000-8000-000000000502',
    title: 'Soutien à la famille Bah',
    eventType: SocialEventType.Death,
    beneficiary: 'Famille Bah',
    startDate: '2026-09-10',
    endDate: '2026-09-30',
    status: SocialFundStatus.Open,
    targetAmount: 10000000,
    collectedAmount: 8200000,
    remainingToTargetAmount: 1800000,
    progressRate: 82.0,
    contributorCount: 67,
    contributionCount: 80,
    currency: 'GNF',
  },
];

const demoSocialFundDescriptions: Record<string, string> = {
  '10700000-0000-4000-8000-000000000500': "Collecte de soutien à l'occasion du mariage.",
  '10700000-0000-4000-8000-000000000501': 'Collecte de soutien à la famille éprouvée.',
  '10700000-0000-4000-8000-000000000502': 'Collecte de soutien à la famille éprouvée.',
};

const demoContributorNames = [
  'Aïcha Bah',
  'Ibrahima Sow',
  'Fatoumata Diallo',
  'Mamadou Barry',
  'Kadiatou Condé',
  'Ousmane Keïta',
  'Djénabou Baldé',
  'Alseny Touré',
  'Hawa Kaba',
  'Thierno Sylla',
  'Mariama Cissé',
  'Sékou Fofana',
];

const demoContributionMethods = [
  PaymentMethod.MobileMoney,
  PaymentMethod.Cash,
  PaymentMethod.BankTransfer,
];

const demoContributionAmountCycle = [250000, 150000, 100000, 200000, 50000, 300000, 75000, 125000];

/**
 * Génère l'historique de démonstration d'une cagnotte à partir de ses propres
 * agrégats (`contributionCount`, `contributorCount`, `collectedAmount`) pour
 * que `GET /social-funds/{socialFundId}/contributions` reste cohérent avec le
 * bilan présenté par `GET /social-funds/{socialFundId}` : même nombre de
 * contributions, mêmes contributeurs distincts et somme des montants égale au
 * montant collecté (T-91). Les montants suivent un cycle de valeurs
 * plausibles ; le dernier absorbe l'écart d'arrondi pour garder une somme exacte.
 */
function buildDemoContributions(
  summary: SocialFundSummary,
  recordedBy: { userId: string; displayName: string },
): Contribution[] {
  const contributionCount = summary.contributionCount ?? 0;
  const contributorCount = summary.contributorCount ?? 0;
  const totalAmount = summary.collectedAmount ?? 0;
  if (contributionCount === 0 || contributorCount === 0) {
    return [];
  }

  const amounts = Array.from(
    { length: contributionCount },
    (_, index) => demoContributionAmountCycle[index % demoContributionAmountCycle.length],
  );
  const generatedSum = amounts.reduce((sum, amount) => sum + amount, 0);
  amounts[amounts.length - 1] += totalAmount - generatedSum;

  const latestDate = new Date(`${summary.endDate ?? summary.startDate}T00:00:00Z`);
  const hasExternalDemoContribution = summary.id === '10700000-0000-4000-8000-000000000500';
  const memberContributorCount = Math.max(
    contributorCount - (hasExternalDemoContribution ? 1 : 0),
    1,
  );

  return amounts.map((amount, index) => {
    const isExternal = hasExternalDemoContribution && index === 0;
    const memberIndex = index % memberContributorCount;
    const contributionDate = new Date(latestDate);
    contributionDate.setUTCDate(contributionDate.getUTCDate() - index);
    const isoDate = contributionDate.toISOString().slice(0, 10);

    return {
      id: `${summary.id}-contrib-${String(index + 1).padStart(3, '0')}`,
      member: isExternal
        ? null
        : {
            id: `${summary.id}-member-${String(memberIndex + 1).padStart(3, '0')}`,
            displayName: demoContributorNames[memberIndex % demoContributorNames.length],
          },
      externalContributor: isExternal ? { firstName: 'Mamadou', lastName: 'Camara' } : null,
      socialFund: {
        id: summary.id,
        title: summary.title,
        eventType: summary.eventType,
        status: summary.status,
      },
      amount,
      contributionDate: isoDate,
      method: demoContributionMethods[index % demoContributionMethods.length],
      recordedBy,
      recordedAt: `${isoDate}T09:00:00Z`,
      currency: 'GNF',
    };
  });
}

/**
 * Contributions de démonstration pour `GET /social-funds/{socialFundId}/contributions`
 * (T-91), de la plus récente à la plus ancienne, comme le fait le serveur réel.
 */
const demoContributionsBySocialFundId: Record<string, Contribution[]> = Object.fromEntries(
  demoSocialFunds.map((summary) => [
    summary.id,
    buildDemoContributions(summary, {
      userId: '10700000-0000-4000-8000-000000000900',
      displayName: 'Mamadou Sy',
    }),
  ]),
);

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

function accessDenied(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.AccessDenied, message: 'Accès réservé à l’Administrateur et au Trésorier.' },
    { status: 403 },
  );
}

function socialFundAlreadyClosed(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.SocialFundAlreadyClosed, message: 'Cette cagnotte est déjà clôturée.' },
    { status: 409 },
  );
}

function contributionValidationError(message: string): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.ValidationError, message },
    { status: 400 },
  );
}

function isExternalContributionRequest(
  request: CreateContributionRequest,
): request is CreateExternalContributionRequest {
  return 'externalContributor' in request;
}

function canRecordContribution(
  account: ReturnType<typeof findDemoAccountByAuthorization>,
): boolean {
  if (!account) {
    return false;
  }
  return (
    account.user.role === UserRole.Administrator ||
    account.user.role === UserRole.Treasurer ||
    (account.user.role === UserRole.Operator && account.user.operatorCanRecordPayments)
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
 * Les filtres `q`, `status` et `eventType` (paramètres contractuels de
 * `besoins/openapi.yaml`) sont appliqués avant la pagination, comme sur le
 * serveur réel.
 *
 * `POST /api/v1/social-funds` (T-84, `createSocialFund`) ajoute la nouvelle
 * cagnotte au jeu de démonstration : statut ouvert, aucun montant collecté,
 * `remainingToTargetAmount`/`progressRate` présents uniquement lorsqu'un
 * objectif est fourni (même règle que le serveur réel). Réservé à
 * l'Administrateur et au Trésorier, comme sur le contrat ; le masquage de
 * l'action "Créer une cagnotte" pour l'Opérateur et le Membre (T-86,
 * RG-CAG-002/003) est une étape IHM distincte.
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
    const query = url.searchParams.get('q')?.trim().toLocaleLowerCase('fr-FR') ?? '';
    const eventType = url.searchParams.get('eventType') as SocialEventType | null;
    const status = url.searchParams.get('status') as SocialFundStatus | null;
    const filteredSocialFunds = demoSocialFunds.filter(
      (socialFund) =>
        (!query ||
          `${socialFund.title} ${socialFund.beneficiary}`
            .toLocaleLowerCase('fr-FR')
            .includes(query)) &&
        (!eventType || socialFund.eventType === eventType) &&
        (!status || socialFund.status === status),
    );
    const sortedSocialFunds = [...filteredSocialFunds].sort(
      (left, right) =>
        right.startDate.localeCompare(left.startDate) || right.endDate.localeCompare(left.endDate),
    );
    const totalElements = sortedSocialFunds.length;
    const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / pageSize);
    const items = sortedSocialFunds.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);

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
    if (account.user.role !== UserRole.Administrator && account.user.role !== UserRole.Treasurer) {
      return accessDenied();
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

  /**
   * Enregistre une contribution membre ou externe (T-134). Le mock conserve
   * la contribution dans l'historique et met à jour les agrégats pour rendre
   * observable le rafraîchissement de la fiche après la saisie.
   */
  http.post(
    '/api/v1/social-funds/:socialFundId/contributions',
    async ({ request, params }): Promise<Response> => {
      await delay(300);
      const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
      if (!account) {
        return authenticationRequired();
      }
      if (!canRecordContribution(account)) {
        return accessDenied();
      }

      const socialFundId = params['socialFundId'] as string;
      const summaryIndex = demoSocialFunds.findIndex((item) => item.id === socialFundId);
      if (summaryIndex === -1) {
        return socialFundNotFound();
      }
      if (demoSocialFunds[summaryIndex].status === SocialFundStatus.Closed) {
        return socialFundAlreadyClosed();
      }

      const body = (await request.json()) as CreateContributionRequest;
      const isExternal = isExternalContributionRequest(body);
      const hasMember = 'memberId' in body;
      if (isExternal === hasMember) {
        return contributionValidationError(
          'Une contribution doit être rattachée à un membre ou à un contributeur externe.',
        );
      }
      if (!body.amount || body.amount < 1 || !body.contributionDate || !body.method) {
        return contributionValidationError('Les informations de contribution sont invalides.');
      }
      if (
        isExternal &&
        (!body.externalContributor.firstName.trim() || !body.externalContributor.lastName.trim())
      ) {
        return contributionValidationError("L'identité du contributeur externe est obligatoire.");
      }
      if (!isExternal && !body.memberId) {
        return contributionValidationError('Le membre est obligatoire.');
      }

      const summary = demoSocialFunds[summaryIndex];
      const existingContributions = demoContributionsBySocialFundId[socialFundId] ?? [];
      const contributionDate = body.contributionDate;
      const contribution: Contribution = {
        id: crypto.randomUUID(),
        member: isExternal ? null : { id: body.memberId, displayName: 'Membre sélectionné' },
        externalContributor: isExternal ? body.externalContributor : null,
        socialFund: {
          id: summary.id,
          title: summary.title,
          eventType: summary.eventType,
          status: summary.status,
        },
        amount: body.amount,
        contributionDate,
        method: body.method,
        recordedBy: {
          userId: account.user.userId,
          displayName: account.user.member.displayName,
        },
        recordedAt: new Date().toISOString(),
        currency: 'GNF',
      };
      demoContributionsBySocialFundId[socialFundId] = [contribution, ...existingContributions];

      const memberAlreadyCounted = !isExternal
        ? existingContributions.some((item) => item.member?.id === body.memberId)
        : false;
      const updatedSummary: SocialFundSummary = {
        ...summary,
        collectedAmount: (summary.collectedAmount ?? 0) + body.amount,
        remainingToTargetAmount:
          summary.targetAmount === undefined
            ? undefined
            : Math.max(summary.targetAmount - ((summary.collectedAmount ?? 0) + body.amount), 0),
        progressRate:
          summary.targetAmount === undefined
            ? undefined
            : Math.min(((summary.collectedAmount ?? 0) + body.amount) / summary.targetAmount, 1) *
              100,
        contributorCount: (summary.contributorCount ?? 0) + (memberAlreadyCounted ? 0 : 1),
        contributionCount: (summary.contributionCount ?? 0) + 1,
      };
      demoSocialFunds[summaryIndex] = updatedSummary;

      const response: ContributionCreationResponse = {
        contribution,
        socialFund: buildDemoSocialFund(updatedSummary),
      };
      return HttpResponse.json<ContributionCreationResponse>(response, { status: 201 });
    },
  ),

  /**
   * Clôture d'une cagnotte (T-93, `openapi:closeSocialFund`) : réservée à
   * l'Administrateur et au Trésorier, refuse une cagnotte déjà clôturée, puis
   * conserve le statut `CLOSED` pour les lectures suivantes du jeu de
   * démonstration.
   */
  http.post(
    '/api/v1/social-funds/:socialFundId/closure',
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

      const socialFundId = params['socialFundId'] as string;
      const index = demoSocialFunds.findIndex((item) => item.id === socialFundId);
      if (index === -1) {
        return socialFundNotFound();
      }
      if (demoSocialFunds[index].status === SocialFundStatus.Closed) {
        return socialFundAlreadyClosed();
      }

      demoSocialFunds[index] = { ...demoSocialFunds[index], status: SocialFundStatus.Closed };

      return HttpResponse.json<SocialFund>(buildDemoSocialFund(demoSocialFunds[index]));
    },
  ),
];
