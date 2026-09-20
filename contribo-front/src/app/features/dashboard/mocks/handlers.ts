import { HttpResponse, delay, http } from 'msw';
import {
  CampaignStatus,
  DueStatus,
  ErrorCode,
  PaymentMethod,
  SocialEventType,
  SocialFundStatus,
  UserRole,
} from '@api';
import type {
  DashboardResponse,
  ErrorResponse,
  ManagementDashboard,
  MemberDashboard,
  SocialFundSummary,
} from '@api';
import type { DemoAccount } from '../../../../mocks/demo-accounts';
import { findDemoAccountByAuthorization } from '../../../../mocks/demo-accounts';

/**
 * Périmètre des indicateurs (T-117) : mêmes identifiants que `features/social-funds/mocks/handlers.ts`,
 * pour rester cohérent avec les cagnottes retournées par `GET /social-funds` (le sélecteur de
 * périmètre du tableau de bord liste les cagnottes ouvertes de cet autre handler).
 */
const demoOpenSocialFund: SocialFundSummary = {
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
};

const demoManagementDashboardWithFinancials: Omit<ManagementDashboard, 'viewer'> = {
  view: 'MANAGEMENT',
  asOf: '2026-09-16T08:00:00Z',
  activeMemberCount: 86,
  registeredMemberCount: 91,
  newMemberCountThisMonth: 3,
  openCampaignCount: 2,
  recentCampaigns: [
    {
      id: '10700000-0000-4000-8000-000000000200',
      name: 'Solidarité septembre',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      status: CampaignStatus.Open,
      memberCount: 86,
      financialSummary: {
        expectedAmount: 18500000,
        collectedAmount: 12400000,
        remainingAmount: 6100000,
        collectionRate: 67,
        dueCounts: { total: 86, paid: 38, partiallyPaid: 12, unpaid: 36 },
        currency: 'GNF',
      },
    },
  ],
  financialOverview: {
    recentPayments: [
      {
        id: '10700000-0000-4000-8000-000000000300',
        dueId: '10700000-0000-4000-8000-000000000301',
        member: { id: '10700000-0000-4000-8000-000000000302', displayName: 'Moussa Bah' },
        campaign: {
          id: '10700000-0000-4000-8000-000000000200',
          name: 'Solidarité septembre',
          startDate: '2026-09-01',
          endDate: '2026-09-30',
          status: CampaignStatus.Open,
        },
        amount: 50000,
        paymentDate: '2026-09-12',
        method: PaymentMethod.MobileMoney,
        recordedBy: { userId: '10700000-0000-4000-8000-000000000003', displayName: 'Fatou Sow' },
        recordedAt: '2026-09-12T14:32:00Z',
        currency: 'GNF',
      },
    ],
  },
};

const demoManagementDashboardWithoutFinancials: Omit<ManagementDashboard, 'viewer'> = {
  ...demoManagementDashboardWithFinancials,
  recentCampaigns: demoManagementDashboardWithFinancials.recentCampaigns.map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    status: campaign.status,
    memberCount: campaign.memberCount,
  })),
  financialOverview: undefined,
};

const demoMemberDashboard: Omit<MemberDashboard, 'viewer'> = {
  view: 'MEMBER',
  asOf: '2026-09-16T08:00:00Z',
  unpaidDueCount: 1,
  totalRemainingAmount: 50000,
  paidDueCount: 2,
  totalContributionAmount: 120000,
  contributedSocialFundCount: 1,
  currency: 'GNF',
  recentDues: [
    {
      id: '10700000-0000-4000-8000-000000000400',
      // Toujours remplacé par le handler ci-dessous avec l'identité du membre connecté
      // (RG-DATA-001 : le tableau de bord Membre est strictement personnel).
      member: { id: '10700000-0000-4000-8000-000000000000', displayName: '' },
      campaign: {
        id: '10700000-0000-4000-8000-000000000200',
        name: 'Solidarité septembre',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        status: CampaignStatus.Open,
      },
      incomeCategorySnapshot: { id: '10700000-0000-4000-8000-000000000101', label: 'Salariée' },
      dueAmount: 100000,
      paidAmount: 50000,
      remainingAmount: 50000,
      status: DueStatus.PartiallyPaid,
      paymentCount: 1,
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

/**
 * Construit la réponse `/dashboard` pour un compte de démonstration donné.
 * Extraite de son handler MSW pour être testée directement (RG-DATA-001 : le
 * tableau de bord Membre est strictement personnel ; l'absence de
 * `financialOverview` doit aussi retirer `financialSummary` des campagnes
 * récentes, sinon le bilan financier fuite malgré la section masquée).
 */
export function buildDashboardResponse(
  account: DemoAccount,
  scope: { campaignId?: string; socialFundId?: string } = {},
): DashboardResponse {
  if (account.user.role === UserRole.Member) {
    const { member } = account.user;
    const response: MemberDashboard = {
      ...demoMemberDashboard,
      viewer: account.user,
      recentDues: demoMemberDashboard.recentDues.map((due) => ({
        ...due,
        member: { id: member.id, displayName: member.displayName },
      })),
    };
    return response;
  }

  const managementDashboard =
    account.user.role === UserRole.Operator && !account.user.operatorCanRecordPayments
      ? demoManagementDashboardWithoutFinancials
      : demoManagementDashboardWithFinancials;

  const response: ManagementDashboard = {
    ...managementDashboard,
    viewer: account.user,
    financialOverview: managementDashboard.financialOverview && {
      ...managementDashboard.financialOverview,
      selectedCampaign:
        managementDashboard.recentCampaigns.find((campaign) => campaign.id === scope.campaignId) ??
        managementDashboard.recentCampaigns[0],
      selectedSocialFund:
        scope.socialFundId === demoOpenSocialFund.id ? demoOpenSocialFund : undefined,
    },
  };
  return response;
}

/**
 * Handlers MSW de démonstration pour `GET /api/v1/dashboard` (T-16). Le rôle
 * porté par le jeton de démonstration détermine la vue renvoyée, conformément
 * au contrat (MEMBRE → `MemberDashboard`, autres rôles → `ManagementDashboard`).
 * L'Opérateur non autorisé aux paiements (`operateur.consultation.demo`, cf.
 * `src/mocks/demo-accounts.ts`) reçoit un bilan financier absent, pour exercer
 * la règle « ne pas afficher la section si le champ est absent ».
 */
export const dashboardHandlers = [
  http.get('/api/v1/dashboard', async ({ request }): Promise<Response> => {
    await delay(300);
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    if (!account) {
      return authenticationRequired();
    }

    const url = new URL(request.url);
    const scope = {
      campaignId: url.searchParams.get('campaignId') ?? undefined,
      socialFundId: url.searchParams.get('socialFundId') ?? undefined,
    };
    return HttpResponse.json<DashboardResponse>(buildDashboardResponse(account, scope));
  }),
];
