import { HttpResponse, delay, http } from 'msw';
import {
  CampaignStatus,
  CurrencyCode,
  DueStatus,
  ErrorCode,
  MemberStatus,
  PaymentMethod,
  SocialEventType,
  SocialFundStatus,
  UserRole,
} from '@api';
import type {
  Contribution,
  ContributionPage,
  CreateMemberRequest,
  Due,
  DuePage,
  ErrorResponse,
  MemberDetails,
  MemberPage,
  MemberSummary,
  Payment,
  PaymentPage,
  UpdateMemberContactRequest,
  UpdateMemberRequest,
} from '@api';
import { findDemoAccountByAuthorization } from '../../../../mocks/demo-accounts';

/**
 * Répertoire de démonstration pour `GET /api/v1/members` (T-21). Les données
 * respectent le contrat `MemberSummary` (`besoins/openapi.yaml`) : nom
 * d'usage, pays, ville et téléphone sont facultatifs et volontairement
 * absents pour un des membres, afin d'exercer l'affichage d'une valeur de
 * remplacement (cf. `.claude/rules/frontend/templates.md`).
 */
const demoMembers: MemberSummary[] = [
  {
    id: '10700000-0000-4000-8000-000000000500',
    firstName: 'Amadou',
    lastName: 'Diallo',
    displayName: 'Amadou Diallo',
    country: 'Guinée',
    city: 'Conakry',
    phone: '+224 622 12 34 56',
    incomeCategory: { id: '10700000-0000-4000-8000-000000000101', label: 'Catégorie B' },
    associationFunction: 'Président',
    status: MemberStatus.Active,
  },
  {
    id: '10700000-0000-4000-8000-000000000501',
    firstName: 'Fatoumata',
    lastName: 'Camara',
    displayName: 'Fatoumata Camara',
    country: 'Guinée',
    city: 'Kindia',
    phone: '+224 655 44 33 22',
    incomeCategory: { id: '10700000-0000-4000-8000-000000000102', label: 'Catégorie A' },
    status: MemberStatus.Active,
  },
  {
    id: '10700000-0000-4000-8000-000000000502',
    firstName: 'Mamadou',
    lastName: 'Sow',
    displayName: 'Mamadou Sow',
    country: 'Guinée',
    city: 'Mamou',
    phone: '+224 666 33 20 19',
    incomeCategory: { id: '10700000-0000-4000-8000-000000000103', label: 'Catégorie C' },
    associationFunction: 'Trésorier adjoint',
    status: MemberStatus.Inactive,
  },
];

/**
 * Duplique les identifiants et libellés connus de
 * `features/income-categories/mocks/handlers.ts` (T-48) : les mocks MSW ne
 * partagent pas de magasin commun entre features, ce fichier reste
 * autonome pour construire un libellé plausible dans la réponse de création.
 */
const demoIncomeCategoryLabelsById: Readonly<Record<string, string>> = {
  '10700000-0000-4000-8000-000000000101': 'Standard',
  '10700000-0000-4000-8000-000000000102': 'Catégorie A',
  '10700000-0000-4000-8000-000000000103': 'Catégorie B',
};

/**
 * Détails de fiche de démonstration pour `GET /api/v1/members/{memberId}`
 * (T-27). `account` et `financialSummary` complètent le contrat
 * `MemberDetails` pour alimenter les cartes de compte et de situation
 * financière de la fiche membre.
 */
const demoMemberDetails: Map<string, MemberDetails> = new Map(
  demoMembers.map((member, index) => [
    member.id,
    {
      ...member,
      account: {
        id: `10700000-0000-4000-8000-0000000006${String(index).padStart(2, '0')}`,
        role: UserRole.Member,
        operatorCanRecordPayments: false,
        active: member.status === MemberStatus.Active,
      },
      financialSummary: {
        totalDueAmount: index === 0 ? 250_000 : 0,
        totalPaidAmount: index === 0 ? 200_000 : 0,
        totalRemainingAmount: index === 0 ? 50_000 : 0,
        currency: CurrencyCode.Gnf,
      },
    },
  ]),
);

/**
 * Références de campagnes dupliquées depuis `features/campaigns/mocks/handlers.ts`
 * (T-57) : les mocks MSW ne partagent pas de magasin commun entre features,
 * ce jeu de démonstration reste autonome pour construire des règlements
 * plausibles (T-29).
 */
const demoCampaignReferences = [
  {
    id: '10700000-0000-4000-8000-000000000200',
    name: 'Solidarité septembre',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    status: CampaignStatus.Open,
  },
  {
    id: '10700000-0000-4000-8000-000000000202',
    name: 'Soutien juin 2026',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    status: CampaignStatus.Closed,
  },
];

const demoRecordedBy = {
  userId: '10700000-0000-4000-8000-000000000900',
  displayName: 'Mamadou Sy',
};

/**
 * Règlements de démonstration pour `GET /api/v1/payments?memberId=...`
 * (T-29), de la plus récente à la plus ancienne, comme le fait le serveur
 * réel. Seul le premier membre du répertoire dispose d'un historique non
 * vide, afin d'exercer aussi l'état "aucun règlement" (T-29).
 */
const demoPaymentsByMemberId: Record<string, Payment[]> = {
  [demoMembers[0].id]: [
    {
      id: '10700000-0000-4000-8000-000000000700',
      dueId: '10700000-0000-4000-8000-000000000800',
      member: { id: demoMembers[0].id, displayName: demoMembers[0].displayName },
      campaign: demoCampaignReferences[0],
      amount: 50_000,
      paymentDate: '2026-09-12',
      method: PaymentMethod.MobileMoney,
      recordedBy: demoRecordedBy,
      recordedAt: '2026-09-12T14:32:00Z',
      currency: CurrencyCode.Gnf,
    },
    {
      id: '10700000-0000-4000-8000-000000000701',
      dueId: '10700000-0000-4000-8000-000000000801',
      member: { id: demoMembers[0].id, displayName: demoMembers[0].displayName },
      campaign: demoCampaignReferences[1],
      amount: 150_000,
      paymentDate: '2026-06-18',
      method: PaymentMethod.MobileMoney,
      recordedBy: demoRecordedBy,
      recordedAt: '2026-06-18T09:10:00Z',
      currency: CurrencyCode.Gnf,
    },
  ],
};

/**
 * Cotisations de démonstration pour `GET /api/v1/members/{memberId}/dues`
 * (T-28). Duplique volontairement une campagne plausible plutôt que
 * d'importer `features/campaigns/mocks/handlers.ts` : les mocks MSW restent
 * autonomes par fonctionnalité (cf. commentaire équivalent sur
 * `demoIncomeCategoryLabelsById` ci-dessus).
 */
const demoMemberDues: Record<string, Due[]> = {
  '10700000-0000-4000-8000-000000000500': [
    {
      id: '10700000-0000-4000-8000-000000000420',
      member: { id: '10700000-0000-4000-8000-000000000500', displayName: 'Amadou Diallo' },
      campaign: {
        id: '10700000-0000-4000-8000-000000000200',
        name: 'Solidarité septembre',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        status: CampaignStatus.Open,
      },
      incomeCategorySnapshot: { id: '10700000-0000-4000-8000-000000000101', label: 'Catégorie B' },
      dueAmount: 100_000,
      paidAmount: 50_000,
      remainingAmount: 50_000,
      status: DueStatus.PartiallyPaid,
      paymentCount: 1,
      currency: CurrencyCode.Gnf,
    },
    {
      id: '10700000-0000-4000-8000-000000000421',
      member: { id: '10700000-0000-4000-8000-000000000500', displayName: 'Amadou Diallo' },
      campaign: {
        id: '10700000-0000-4000-8000-000000000202',
        name: 'Soutien juin 2026',
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        status: CampaignStatus.Closed,
      },
      incomeCategorySnapshot: { id: '10700000-0000-4000-8000-000000000101', label: 'Catégorie B' },
      dueAmount: 150_000,
      paidAmount: 150_000,
      remainingAmount: 0,
      status: DueStatus.Paid,
      paymentCount: 1,
      currency: CurrencyCode.Gnf,
    },
  ],
};

/**
 * Contributions aux cagnottes de démonstration pour l'onglet dédié de la
 * fiche membre (T-30, `GET /api/v1/contributions?memberId=...`). Un seul
 * membre en porte pour exercer l'affichage de la liste ; les autres
 * exercent l'état vide (RG-CAG-004 à RG-CAG-007 : aucune limite de nombre ni
 * de montant minimal, traçabilité de l'utilisateur et de l'horodatage de
 * saisie, non affichées dans cet onglet centré sur le membre).
 */
const demoContributionsByMemberId: Readonly<Record<string, Contribution[]>> = {
  [demoMembers[0].id]: [
    {
      id: '10700000-0000-4000-8000-000000000710',
      member: { id: demoMembers[0].id, displayName: demoMembers[0].displayName },
      socialFund: {
        id: '10700000-0000-4000-8000-000000000300',
        title: 'Mariage de Fanta et Sekou',
        eventType: SocialEventType.Wedding,
        status: SocialFundStatus.Open,
      },
      amount: 150_000,
      contributionDate: '2026-09-14',
      method: PaymentMethod.MobileMoney,
      recordedBy: { userId: '10700000-0000-4000-8000-000000000900', displayName: 'M. Bah' },
      recordedAt: '2026-09-14T09:05:00Z',
      currency: CurrencyCode.Gnf,
    },
    {
      id: '10700000-0000-4000-8000-000000000711',
      member: { id: demoMembers[0].id, displayName: demoMembers[0].displayName },
      socialFund: {
        id: '10700000-0000-4000-8000-000000000301',
        title: 'Naissance chez les Camara',
        eventType: SocialEventType.Birth,
        status: SocialFundStatus.Closed,
      },
      amount: 50_000,
      contributionDate: '2026-06-02',
      method: PaymentMethod.Cash,
      recordedBy: { userId: '10700000-0000-4000-8000-000000000900', displayName: 'M. Bah' },
      recordedAt: '2026-06-02T08:30:00Z',
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

function memberNotFound(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.ResourceNotFound, message: 'Membre introuvable.' },
    { status: 404 },
  );
}

function accessDenied(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.AccessDenied, message: 'Accès refusé.' },
    { status: 403 },
  );
}

function normalizeForSearch(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Un membre correspond au terme de recherche (T-24) si l'un de ses champs
 * nominatifs (nom, prénom, nom d'usage) le contient, comparaison insensible
 * à la casse et aux accents.
 */
function matchesNameQuery(member: MemberSummary, normalizedQuery: string): boolean {
  return [member.lastName, member.firstName, member.preferredName]
    .filter((value): value is string => Boolean(value))
    .some((value) => normalizeForSearch(value).includes(normalizedQuery));
}

function memberAlreadyInactive(): Response {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.MemberAlreadyInactive, message: 'Ce membre est déjà inactif.' },
    { status: 409 },
  );
}

/**
 * Construit la réponse `/members` pour l'ensemble des membres de démonstration.
 * `nameQuery` (T-24, paramètre contractuel `q`) filtre `items` sur les champs
 * nominatifs ; `summary` reste calculé sur l'ensemble du répertoire, ces
 * compteurs étant indépendants du filtre courant (`MemberCountSummary`).
 */
export function buildMemberPageResponse(nameQuery?: string): MemberPage {
  const normalizedQuery = nameQuery?.trim() ? normalizeForSearch(nameQuery.trim()) : null;
  const items = normalizedQuery
    ? demoMembers.filter((member) => matchesNameQuery(member, normalizedQuery))
    : [...demoMembers];

  return {
    items,
    summary: {
      total: demoMembers.length,
      active: demoMembers.filter((member) => member.status === MemberStatus.Active).length,
      inactive: demoMembers.filter((member) => member.status === MemberStatus.Inactive).length,
    },
    page: { number: 0, size: items.length, totalElements: items.length, totalPages: 1 },
  };
}

/**
 * Handlers MSW de démonstration pour `GET /api/v1/members` (T-21, recherche
 * par nom T-24 via le paramètre contractuel `q`, filtre statut T-25 via le
 * paramètre contractuel `status`) et
 * `GET /api/v1/members/{memberId}` (T-27). Seule l'authentification est
 * vérifiée ici ; la restriction du contenu affiché à l'Opérateur
 * (RG-MEM-008) relève du ticket T-23. Le résumé (`summary`) reste calculé
 * sur l'ensemble des membres, indépendamment du filtre appliqué à `items`,
 * conformément à `MemberPage` (`besoins/openapi.yaml`).
 */
export const membersHandlers = [
  http.get('/api/v1/members', async ({ request }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const url = new URL(request.url);
    const nameQuery = url.searchParams.get('q') ?? undefined;
    const status = url.searchParams.get('status') as MemberStatus | null;
    const response = buildMemberPageResponse(nameQuery);
    if (status) {
      const items = response.items.filter((member) => member.status === status);
      return HttpResponse.json<MemberPage>({
        ...response,
        items,
        page: { ...response.page, totalElements: items.length },
      });
    }

    return HttpResponse.json<MemberPage>(response);
  }),

  /**
   * `POST /api/v1/members` (T-33) : construit un `MemberDetails` de
   * démonstration avec le statut Actif par défaut (RG-MEM-003) et un compte
   * utilisateur associé (rôle Membre). La validation "catégorie obligatoire"
   * (RG-MEM-002) et le message de confirmation dédié (RG-MEM-004) relèvent
   * des tickets T-34 et T-36.
   */
  http.post('/api/v1/members', async ({ request }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const body = (await request.json()) as CreateMemberRequest;
    const member: MemberDetails = {
      id: crypto.randomUUID(),
      firstName: body.firstName,
      lastName: body.lastName,
      preferredName: body.preferredName,
      displayName: `${body.firstName} ${body.lastName}`,
      country: body.country,
      city: body.city,
      phone: body.phone,
      incomeCategory: {
        id: body.incomeCategoryId,
        label: demoIncomeCategoryLabelsById[body.incomeCategoryId] ?? 'Catégorie',
      },
      associationFunction: body.associationFunction,
      status: MemberStatus.Active,
      account: {
        id: crypto.randomUUID(),
        role: UserRole.Member,
        operatorCanRecordPayments: false,
        active: true,
      },
      financialSummary: {
        totalDueAmount: 0,
        totalPaidAmount: 0,
        totalRemainingAmount: 0,
        currency: CurrencyCode.Gnf,
      },
    };

    const { account: memberAccount, financialSummary, ...summary } = member;
    demoMembers.push(summary);
    demoMemberDetails.set(member.id, { ...summary, account: memberAccount, financialSummary });

    return HttpResponse.json<MemberDetails>(member, { status: 201 });
  }),
  http.patch('/api/v1/members/:memberId', async ({ request, params }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }
    if (account.user.role !== UserRole.Administrator && account.user.role !== UserRole.Treasurer) {
      return accessDenied();
    }

    const memberId = typeof params['memberId'] === 'string' ? params['memberId'] : '';
    const existing = demoMemberDetails.get(memberId);
    if (!existing) {
      return memberNotFound();
    }
    const body = (await request.json()) as UpdateMemberRequest;
    const updated: MemberDetails = {
      ...existing,
      ...body,
      preferredName:
        body.preferredName === null ? undefined : (body.preferredName ?? existing.preferredName),
      displayName: `${body.firstName ?? existing.firstName} ${body.lastName ?? existing.lastName}`,
      incomeCategory: body.incomeCategoryId
        ? {
            id: body.incomeCategoryId,
            label:
              demoIncomeCategoryLabelsById[body.incomeCategoryId] ?? existing.incomeCategory.label,
          }
        : existing.incomeCategory,
    };
    demoMemberDetails.set(memberId, updated);
    const index = demoMembers.findIndex((member) => member.id === memberId);
    if (index >= 0) {
      const { account: memberAccount, financialSummary, ...summary } = updated;
      void memberAccount;
      void financialSummary;
      demoMembers[index] = summary;
    }
    return HttpResponse.json<MemberDetails>(updated);
  }),
  http.patch(
    '/api/v1/members/:memberId/contact',
    async ({ request, params }): Promise<Response> => {
      await delay(300);
      const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
      if (!account) {
        return authenticationRequired();
      }
      if (
        account.user.role !== UserRole.Administrator &&
        account.user.role !== UserRole.Treasurer &&
        account.user.role !== UserRole.Operator
      ) {
        return accessDenied();
      }

      const memberId = typeof params['memberId'] === 'string' ? params['memberId'] : '';
      const existing = demoMemberDetails.get(memberId);
      if (!existing) {
        return memberNotFound();
      }
      const body = (await request.json()) as UpdateMemberContactRequest;
      const updated: MemberDetails = {
        ...existing,
        ...body,
        preferredName:
          body.preferredName === null ? undefined : (body.preferredName ?? existing.preferredName),
      };
      demoMemberDetails.set(memberId, updated);
      const index = demoMembers.findIndex((member) => member.id === memberId);
      if (index >= 0) {
        const { account: memberAccount, financialSummary, ...summary } = updated;
        void memberAccount;
        void financialSummary;
        demoMembers[index] = summary;
      }
      return HttpResponse.json<MemberDetails>(updated);
    },
  ),
  /**
   * `POST /api/v1/members/{memberId}/deactivation` (T-41) : réservé à
   * l'Administrateur (US-MEM-005). Refuse une seconde désactivation par un
   * conflit métier, conserve les données historiques du membre (RG-MEM-012 à
   * RG-MEM-015). La boîte de confirmation (T-42) et l'action symétrique
   * "Réactiver" (T-44) relèvent d'autres tickets.
   */
  http.post(
    '/api/v1/members/:memberId/deactivation',
    async ({ request, params }): Promise<Response> => {
      await delay(300);
      const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
      if (!account) {
        return authenticationRequired();
      }
      if (account.user.role !== UserRole.Administrator) {
        return accessDenied();
      }

      const memberId = typeof params['memberId'] === 'string' ? params['memberId'] : '';
      const existing = demoMemberDetails.get(memberId);
      if (!existing) {
        return memberNotFound();
      }
      if (existing.status === MemberStatus.Inactive) {
        return memberAlreadyInactive();
      }

      const updated: MemberDetails = {
        ...existing,
        status: MemberStatus.Inactive,
        account: { ...existing.account, active: false },
      };
      demoMemberDetails.set(memberId, updated);
      const index = demoMembers.findIndex((member) => member.id === memberId);
      if (index >= 0) {
        demoMembers[index] = { ...demoMembers[index], status: MemberStatus.Inactive };
      }
      return HttpResponse.json<MemberDetails>(updated);
    },
  ),
  http.get('/api/v1/members/:memberId', async ({ request, params }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const memberId = typeof params['memberId'] === 'string' ? params['memberId'] : '';
    const member = demoMemberDetails.get(memberId);
    if (!member) {
      return memberNotFound();
    }

    return HttpResponse.json<MemberDetails>(member);
  }),

  /**
   * `POST /api/v1/members/{memberId}/reactivation` (T-44, US-MEM-006) : réservé
   * à l'Administrateur. Rend le membre actif sans modifier son historique
   * financier (RG-MEM-020, RG-MEM-021) ; refuse par conflit métier la
   * réactivation d'un membre déjà actif (RG-MEM-022), conformément au contrat.
   */
  http.post(
    '/api/v1/members/:memberId/reactivation',
    async ({ request, params }): Promise<Response> => {
      await delay(300);
      const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
      if (!account) {
        return authenticationRequired();
      }
      if (account.user.role !== UserRole.Administrator) {
        return accessDenied();
      }

      const memberId = typeof params['memberId'] === 'string' ? params['memberId'] : '';
      const existing = demoMemberDetails.get(memberId);
      if (!existing) {
        return memberNotFound();
      }
      if (existing.status === MemberStatus.Active) {
        return HttpResponse.json<ErrorResponse>(
          { code: ErrorCode.MemberAlreadyActive, message: 'Ce membre est déjà actif.' },
          { status: 409 },
        );
      }

      const reactivated: MemberDetails = {
        ...existing,
        status: MemberStatus.Active,
        account: existing.account ? { ...existing.account, active: true } : existing.account,
      };
      demoMemberDetails.set(memberId, reactivated);
      const index = demoMembers.findIndex((member) => member.id === memberId);
      if (index >= 0) {
        demoMembers[index] = { ...demoMembers[index], status: MemberStatus.Active };
      }

      return HttpResponse.json<MemberDetails>(reactivated);
    },
  ),

  /**
   * Historique des règlements (T-29, `openapi:listPayments`), filtré par
   * `memberId` pour l'onglet règlements de la fiche membre. La pagination
   * suit le même modèle que les autres listes paginées de démonstration.
   */
  http.get('/api/v1/payments', async ({ request }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const url = new URL(request.url);
    const pageNumber = Number(url.searchParams.get('page') ?? '0');
    const pageSize = Number(url.searchParams.get('size') ?? '20');
    const memberId = url.searchParams.get('memberId');
    const payments = memberId ? (demoPaymentsByMemberId[memberId] ?? []) : [];
    const totalElements = payments.length;
    const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / pageSize);
    const items = payments.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);

    const page: PaymentPage = {
      items,
      page: { number: pageNumber, size: pageSize, totalElements, totalPages },
    };
    return HttpResponse.json<PaymentPage>(page);
  }),

  /**
   * `GET /api/v1/members/{memberId}/dues` (T-28, `openapi:listMemberDues`) :
   * situation des cotisations du membre, paginée, de la plus récente à la
   * plus ancienne (contrat `DuePage`). Le contenu affiché n'est pas encore
   * restreint pour l'Opérateur ici : `MemberDuesTab` masque déjà la colonne
   * catégorie de revenu côté IHM (RG-MEM-008), sans qu'un filtrage serveur
   * supplémentaire soit prévu par ce mock.
   */
  http.get('/api/v1/members/:memberId/dues', async ({ request, params }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const memberId = typeof params['memberId'] === 'string' ? params['memberId'] : '';
    if (!demoMemberDetails.has(memberId)) {
      return memberNotFound();
    }

    const url = new URL(request.url);
    const size = Number(url.searchParams.get('size') ?? '20');
    const page = Number(url.searchParams.get('page') ?? '0');
    const dues = demoMemberDues[memberId] ?? [];
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
   * Contributions aux cagnottes d'un membre pour l'onglet dédié de la fiche
   * membre (T-30, `openapi:listContributions`), de la plus récente à la plus
   * ancienne, comme le fait le serveur réel. `memberId` est requis par cet
   * onglet ; les autres filtres du contrat (recherche, cagnotte) ne sont pas
   * exercés ici.
   */
  http.get('/api/v1/contributions', async ({ request }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const url = new URL(request.url);
    const memberId = url.searchParams.get('memberId') ?? '';
    const pageNumber = Number(url.searchParams.get('page') ?? '0');
    const pageSize = Number(url.searchParams.get('size') ?? '20');
    const contributions = demoContributionsByMemberId[memberId] ?? [];
    const totalElements = contributions.length;
    const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / pageSize);
    const items = contributions.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);

    return HttpResponse.json<ContributionPage>({
      items,
      page: { number: pageNumber, size: pageSize, totalElements, totalPages },
    });
  }),
];
