import { HttpResponse, delay, http } from 'msw';
import {
  CampaignStatus,
  DueStatus,
  ErrorCode,
  PaymentMethod,
  SocialFundStatus,
  UserRole,
} from '@api';
import type {
  CampaignSummary,
  CampaignsAggregateOverview,
  DashboardResponse,
  ErrorResponse,
  ManagementDashboard,
  MemberDashboard,
  SocialFundSummary,
  SocialFundsAggregateOverview,
} from '@api';
import type { DemoAccount } from '../../../../mocks/demo-accounts';
import { findDemoAccountByAuthorization } from '../../../../mocks/demo-accounts';
import { demoSocialFunds } from '../../social-funds/mocks/handlers';

/**
 * Agrégat de démonstration pour `allOpenCampaignsSummary` (T-117) : somme des
 * `financialSummary` des campagnes ouvertes, calculée dynamiquement (jamais de
 * valeur figée) afin de rester cohérente avec `recentCampaigns` ci-dessous.
 */
function buildCampaignsAggregate(
  openCampaigns: readonly CampaignSummary[],
): CampaignsAggregateOverview {
  const summaries = openCampaigns
    .map((campaign) => campaign.financialSummary)
    .filter(
      (summary): summary is NonNullable<CampaignSummary['financialSummary']> =>
        summary !== undefined,
    );

  const expectedAmount = summaries.reduce((sum, summary) => sum + summary.expectedAmount, 0);
  const collectedAmount = summaries.reduce((sum, summary) => sum + summary.collectedAmount, 0);
  const remainingAmount = summaries.reduce((sum, summary) => sum + summary.remainingAmount, 0);
  const dueCounts = summaries.reduce(
    (acc, summary) => ({
      total: acc.total + summary.dueCounts.total,
      paid: acc.paid + summary.dueCounts.paid,
      partiallyPaid: acc.partiallyPaid + summary.dueCounts.partiallyPaid,
      unpaid: acc.unpaid + summary.dueCounts.unpaid,
    }),
    { total: 0, paid: 0, partiallyPaid: 0, unpaid: 0 },
  );

  return {
    openCampaignCount: openCampaigns.length,
    financialSummary: {
      expectedAmount,
      collectedAmount,
      remainingAmount,
      collectionRate: expectedAmount > 0 ? Math.round((collectedAmount / expectedAmount) * 100) : 0,
      dueCounts,
      currency: 'GNF',
    },
  };
}

/**
 * Agrégat de démonstration pour `allOpenSocialFundsSummary` (T-117) : somme des
 * cagnottes ouvertes de `demoSocialFunds` (`features/social-funds/mocks/handlers.ts`,
 * même source que le sélecteur de périmètre), calculée dynamiquement.
 */
function buildSocialFundsAggregate(
  openSocialFunds: readonly SocialFundSummary[],
): SocialFundsAggregateOverview {
  const collectedAmount = openSocialFunds.reduce((sum, fund) => sum + fund.collectedAmount, 0);
  const fundsWithTarget = openSocialFunds.filter((fund) => fund.targetAmount !== undefined);
  const targetAmount = fundsWithTarget.length
    ? fundsWithTarget.reduce((sum, fund) => sum + (fund.targetAmount ?? 0), 0)
    : undefined;
  const contributorCount = openSocialFunds.reduce((sum, fund) => sum + fund.contributorCount, 0);

  return {
    openSocialFundCount: openSocialFunds.length,
    targetAmount,
    collectedAmount,
    progressRate:
      targetAmount !== undefined && targetAmount > 0
        ? Math.round((collectedAmount / targetAmount) * 1000) / 10
        : undefined,
    contributorCount,
    currency: 'GNF',
  };
}

const demoManagementDashboardWithFinancials: Omit<ManagementDashboard, 'viewer'> = {
  view: 'MANAGEMENT',
  asOf: '2026-09-16T08:00:00Z',
  activeMemberCount: 86,
  registeredMemberCount: 91,
  newMemberCountThisMonth: 3,
  openCampaignCount: 2,
  // Alignées sur `demoCampaignDetails` de `features/campaigns/mocks/handlers.ts`
  // (mêmes campagnes, mêmes montants) : deux campagnes ouvertes permettent de
  // vérifier que le sélecteur de périmètre distingue bien une sélection
  // précise d'un agrégat sur plusieurs campagnes ouvertes (T-117), comme pour
  // `demoSocialFunds`.
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
    {
      id: '10700000-0000-4000-8000-000000000203',
      name: 'Cotisation trimestrielle T3',
      startDate: '2026-07-01',
      endDate: '2026-09-30',
      status: CampaignStatus.Open,
      memberCount: 86,
      financialSummary: {
        expectedAmount: 9900000,
        collectedAmount: 4950000,
        remainingAmount: 4950000,
        collectionRate: 50,
        dueCounts: { total: 86, paid: 43, partiallyPaid: 8, unpaid: 35 },
        currency: 'GNF',
      },
    },
  ],
  financialOverview: {
    // Rattachés à des campagnes différentes (une ouverte parmi celles de
    // `recentCampaigns`, une clôturée absente de cette liste) pour que le
    // filtrage par `campaignId` de `buildDashboardResponse` soit observable :
    // sélectionner une campagne précise n'affiche que son propre règlement.
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
      {
        id: '10700000-0000-4000-8000-000000000303',
        dueId: '10700000-0000-4000-8000-000000000304',
        member: { id: '10700000-0000-4000-8000-000000000305', displayName: 'Aissatou Sow' },
        campaign: {
          id: '10700000-0000-4000-8000-000000000203',
          name: 'Cotisation trimestrielle T3',
          startDate: '2026-07-01',
          endDate: '2026-09-30',
          status: CampaignStatus.Open,
        },
        amount: 100000,
        paymentDate: '2026-09-10',
        method: PaymentMethod.Cash,
        recordedBy: { userId: '10700000-0000-4000-8000-000000000003', displayName: 'Fatou Sow' },
        recordedAt: '2026-09-10T10:15:00Z',
        currency: 'GNF',
      },
      {
        id: '10700000-0000-4000-8000-000000000306',
        dueId: '10700000-0000-4000-8000-000000000307',
        member: { id: '10700000-0000-4000-8000-000000000308', displayName: 'Mamadou Bah' },
        campaign: {
          id: '10700000-0000-4000-8000-000000000202',
          name: 'Soutien juin 2026',
          startDate: '2026-06-01',
          endDate: '2026-06-30',
          status: CampaignStatus.Closed,
        },
        amount: 250000,
        paymentDate: '2026-06-20',
        method: PaymentMethod.BankTransfer,
        recordedBy: { userId: '10700000-0000-4000-8000-000000000003', displayName: 'Fatou Sow' },
        recordedAt: '2026-06-20T11:00:00Z',
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

  if (!managementDashboard.financialOverview) {
    return { ...managementDashboard, viewer: account.user };
  }

  const openCampaigns = managementDashboard.recentCampaigns.filter(
    (campaign) => campaign.status === CampaignStatus.Open,
  );
  const selectedCampaign = scope.campaignId
    ? openCampaigns.find((campaign) => campaign.id === scope.campaignId)
    : undefined;

  const openSocialFunds = demoSocialFunds.filter((fund) => fund.status === SocialFundStatus.Open);
  const selectedSocialFund = scope.socialFundId
    ? openSocialFunds.find((fund) => fund.id === scope.socialFundId)
    : undefined;

  // Derniers règlements alignés sur le périmètre de campagne (T-127) : une
  // campagne précise sélectionnée n'affiche que ses propres règlements ;
  // sans sélection, seuls ceux des campagnes ouvertes sont retenus, plafonnés
  // à 5 éléments conformément au contrat (`maxItems` de `recentPayments`).
  const openCampaignIds = new Set(openCampaigns.map((campaign) => campaign.id));
  const scopedRecentPayments = selectedCampaign
    ? managementDashboard.financialOverview.recentPayments.filter(
        (payment) => payment.campaign.id === selectedCampaign.id,
      )
    : managementDashboard.financialOverview.recentPayments
        .filter((payment) => openCampaignIds.has(payment.campaign.id))
        .slice(0, 5);

  const response: ManagementDashboard = {
    ...managementDashboard,
    viewer: account.user,
    financialOverview: {
      ...managementDashboard.financialOverview,
      selectedCampaign,
      allOpenCampaignsSummary: selectedCampaign
        ? undefined
        : buildCampaignsAggregate(openCampaigns),
      selectedSocialFund,
      allOpenSocialFundsSummary: selectedSocialFund
        ? undefined
        : buildSocialFundsAggregate(openSocialFunds),
      recentPayments: scopedRecentPayments,
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
