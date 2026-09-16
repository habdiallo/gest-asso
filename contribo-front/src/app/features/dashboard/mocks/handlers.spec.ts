import type { ManagementDashboard, MemberDashboard } from '@api';
import { demoAccounts } from '../../../../mocks/demo-accounts';
import { buildDashboardResponse } from './handlers';

function findAccount(identifier: string) {
  const account = demoAccounts.find((candidate) => candidate.identifier === identifier);
  if (!account) throw new Error(`compte de démonstration introuvable : ${identifier}`);
  return account;
}

describe('buildDashboardResponse (mocks MSW, T-16)', () => {
  it("ne renvoie aucune donnee financiere a l'Operateur non autorise aux paiements", () => {
    const account = findAccount('operateur.consultation.demo');

    const response = buildDashboardResponse(account) as ManagementDashboard;

    expect(response.financialOverview).toBeUndefined();
    expect(response.recentCampaigns.length).toBeGreaterThan(0);
    for (const campaign of response.recentCampaigns) {
      expect(campaign.financialSummary).toBeUndefined();
    }
  });

  it("expose le bilan financier a l'Operateur autorise aux paiements", () => {
    const account = findAccount('operateur.demo');

    const response = buildDashboardResponse(account) as ManagementDashboard;

    expect(response.financialOverview).toBeDefined();
    expect(response.recentCampaigns[0].financialSummary).toBeDefined();
  });

  it('ne renvoie que les cotisations appartenant au membre connecte (RG-DATA-001)', () => {
    const account = findAccount('membre.demo');

    const response = buildDashboardResponse(account) as MemberDashboard;

    expect(response.recentDues.length).toBeGreaterThan(0);
    for (const due of response.recentDues) {
      expect(due.member.id).toBe(account.user.member.id);
      expect(due.member.displayName).toBe(account.user.member.displayName);
    }
  });

  it('reflete le compte connecte dans le champ viewer, quel que soit le role', () => {
    for (const account of demoAccounts) {
      const response = buildDashboardResponse(account);
      expect(response.viewer).toEqual(account.user);
    }
  });
});
