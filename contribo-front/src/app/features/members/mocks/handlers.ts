import { HttpResponse, delay, http } from 'msw';
import {
  CampaignStatus,
  CurrencyCode,
  ErrorCode,
  MemberStatus,
  PaymentMethod,
  UserRole,
} from '@api';
import type {
  CreateMemberRequest,
  ErrorResponse,
  MemberDetails,
  MemberPage,
  MemberSummary,
  Payment,
  PaymentPage,
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
    preferredName: 'Bah',
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
 * `MemberDetails` ; ils ne sont pas affichés par cet écran, dont le
 * périmètre se limite au bloc informations personnelles, catégorie,
 * fonction et statut (US-MEM-003, cf. `member-detail-page.ts`).
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
        totalDueAmount: 0,
        totalPaidAmount: 0,
        totalRemainingAmount: 0,
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
      amount: 100_000,
      paymentDate: '2026-06-05',
      method: PaymentMethod.Cash,
      recordedBy: demoRecordedBy,
      recordedAt: '2026-06-05T09:10:00Z',
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

/** Construit la réponse `/members` pour l'ensemble des membres de démonstration. */
export function buildMemberPageResponse(): MemberPage {
  return {
    items: [...demoMembers],
    summary: {
      total: demoMembers.length,
      active: demoMembers.filter((member) => member.status === MemberStatus.Active).length,
      inactive: demoMembers.filter((member) => member.status === MemberStatus.Inactive).length,
    },
    page: { number: 0, size: demoMembers.length, totalElements: demoMembers.length, totalPages: 1 },
  };
}

/**
 * Handlers MSW de démonstration pour `GET /api/v1/members` (T-21) et
 * `GET /api/v1/members/{memberId}` (T-27). Seule l'authentification est
 * vérifiée ici ; la restriction du contenu affiché à l'Opérateur
 * (RG-MEM-008) relève du ticket T-23.
 */
export const membersHandlers = [
  http.get('/api/v1/members', async ({ request }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    return HttpResponse.json<MemberPage>(buildMemberPageResponse());
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
      demoMembers[index] = summary;
    }
    return HttpResponse.json<MemberDetails>(updated);
  }),
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
];
