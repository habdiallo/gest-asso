import { HttpResponse, delay, http } from 'msw';
import { CurrencyCode, MemberDashboard, MemberStatus, UserRole } from '@api';

const demoMemberDashboard: MemberDashboard = {
  view: MemberDashboard.ViewEnum.Member,
  asOf: '2026-09-16T08:00:00Z',
  viewer: {
    userId: 'demo-user-1',
    association: {
      id: 'demo-association-1',
      name: 'Association Démo',
      currency: CurrencyCode.Gnf,
    },
    member: {
      id: 'demo-member-1',
      firstName: 'Aminata',
      lastName: 'Diallo',
      displayName: 'Aminata Diallo',
      incomeCategory: { id: 'demo-category-1', label: 'Salariée' },
      status: MemberStatus.Active,
    },
    role: UserRole.Member,
    operatorCanRecordPayments: false,
    accountActive: true,
  },
  unpaidDueCount: 1,
  totalRemainingAmount: 50000,
  paidDueCount: 2,
  totalContributionAmount: 120000,
  contributedSocialFundCount: 1,
  currency: CurrencyCode.Gnf,
  recentDues: [],
};

/**
 * Handlers de démonstration MSW pour le tableau de bord (GET /api/v1/dashboard).
 * Sert à valider le dispositif mock de bout en bout (T-105) : chemin/operationId,
 * modèle généré (MemberDashboard) et enums exacts du contrat.
 */
export const homeHandlers = [
  http.get('/api/v1/dashboard', async () => {
    await delay(300);
    return HttpResponse.json(demoMemberDashboard);
  }),
];
