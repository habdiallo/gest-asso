import { MemberStatus } from '@api';
import { buildMemberPageResponse } from './handlers';

describe('buildMemberPageResponse (mocks MSW, T-21)', () => {
  it('renvoie un total cohérent avec les compteurs actifs/inactifs', () => {
    const response = buildMemberPageResponse();

    const activeCount = response.items.filter(
      (member) => member.status === MemberStatus.Active,
    ).length;
    const inactiveCount = response.items.filter(
      (member) => member.status === MemberStatus.Inactive,
    ).length;

    expect(response.summary.total).toBe(response.items.length);
    expect(response.summary.active).toBe(activeCount);
    expect(response.summary.inactive).toBe(inactiveCount);
  });

  it("expose les colonnes attendues par l'écran (US-MEM-002)", () => {
    const response = buildMemberPageResponse();

    for (const member of response.items) {
      expect(member.lastName.length).toBeGreaterThan(0);
      expect(member.firstName.length).toBeGreaterThan(0);
      expect(member.incomeCategory.label.length).toBeGreaterThan(0);
      expect(Object.values(MemberStatus)).toContain(member.status);
    }
  });
});
