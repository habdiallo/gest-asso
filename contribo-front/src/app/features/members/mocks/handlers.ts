import { HttpResponse, delay, http } from 'msw';
import { CurrencyCode, ErrorCode, MemberStatus, UserRole } from '@api';
import type { ErrorResponse, MemberDetails, MemberPage, MemberSummary } from '@api';
import { findDemoAccountByAuthorization } from '../../../../mocks/demo-accounts';

/**
 * Répertoire de démonstration pour `GET /api/v1/members` (T-21). Les données
 * respectent le contrat `MemberSummary` (`besoins/openapi.yaml`) : nom
 * d'usage, pays, ville et téléphone sont facultatifs et volontairement
 * absents pour un des membres, afin d'exercer l'affichage d'une valeur de
 * remplacement (cf. `.claude/rules/frontend/templates.md`).
 */
const demoMembers: readonly MemberSummary[] = [
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
 * Détails de fiche de démonstration pour `GET /api/v1/members/{memberId}`
 * (T-27). `account` et `financialSummary` complètent le contrat
 * `MemberDetails` ; ils ne sont pas affichés par cet écran, dont le
 * périmètre se limite au bloc informations personnelles, catégorie,
 * fonction et statut (US-MEM-003, cf. `member-detail-page.ts`).
 */
const demoMemberDetails: ReadonlyMap<string, MemberDetails> = new Map(
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
];
