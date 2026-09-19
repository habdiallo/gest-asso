import { MemberStatus } from '@api';
import type { MemberDetails, MemberPage } from '@api';
import { demoAccounts } from '../../../../mocks/demo-accounts';
import { buildMemberPageResponse, membersHandlers } from './handlers';

async function runRequest(request: Request): Promise<Response> {
  for (const handler of membersHandlers) {
    const result = await handler.run({
      request,
      requestId: crypto.randomUUID(),
      resolutionContext: { baseUrl: 'http://localhost' },
    });
    if (result?.response) {
      return result.response;
    }
  }
  throw new Error('No matching member handler');
}

describe('buildMemberPageResponse (mocks MSW, T-21)', () => {
  it('keeps a created member in subsequent GET responses and increases the active count', async () => {
    const headers = {
      Authorization: `Bearer ${demoAccounts[0].accessToken}`,
      'Content-Type': 'application/json',
    };
    const before = await runRequest(new Request('http://localhost/api/v1/members', { headers }));
    const initial = (await before.json()) as MemberPage;
    const created = await runRequest(
      new Request('http://localhost/api/v1/members', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          lastName: 'Barry',
          firstName: 'Mariama',
          incomeCategoryId: '10700000-0000-4000-8000-000000000101',
        }),
      }),
    );
    expect(created.status).toBe(201);
    const member = (await created.json()) as MemberDetails;
    const response = await runRequest(new Request('http://localhost/api/v1/members', { headers }));
    const page = (await response.json()) as MemberPage;

    expect(page.items.find((item) => item.id === member.id)).toMatchObject({
      lastName: 'Barry',
      firstName: 'Mariama',
      status: MemberStatus.Active,
    });
    expect(page.summary.total).toBe(initial.summary.total + 1);
    expect(page.summary.active).toBe(initial.summary.active + 1);
    expect(page.summary.inactive).toBe(initial.summary.inactive);
    expect(page.page.totalElements).toBe(initial.page.totalElements + 1);
    const detail = await runRequest(
      new Request(`http://localhost/api/v1/members/${member.id}`, { headers }),
    );
    expect(detail.status).toBe(200);
    expect(await detail.json()).toEqual(member);
  });

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

describe('POST /api/v1/members/{memberId}/reactivation (mocks MSW, T-44)', () => {
  const adminHeaders = {
    Authorization: `Bearer ${demoAccounts[0].accessToken}`,
    'Content-Type': 'application/json',
  };

  it('réactive un membre inactif pour un Administrateur et conserve son historique financier', async () => {
    const inactiveMemberId = '10700000-0000-4000-8000-000000000502';
    const before = (await (
      await runRequest(
        new Request(`http://localhost/api/v1/members/${inactiveMemberId}`, {
          headers: adminHeaders,
        }),
      )
    ).json()) as MemberDetails;
    expect(before.status).toBe(MemberStatus.Inactive);

    const response = await runRequest(
      new Request(`http://localhost/api/v1/members/${inactiveMemberId}/reactivation`, {
        method: 'POST',
        headers: adminHeaders,
      }),
    );

    expect(response.status).toBe(200);
    const reactivated = (await response.json()) as MemberDetails;
    expect(reactivated.status).toBe(MemberStatus.Active);
    expect(reactivated.financialSummary).toEqual(before.financialSummary);

    const after = (await (
      await runRequest(
        new Request(`http://localhost/api/v1/members/${inactiveMemberId}`, {
          headers: adminHeaders,
        }),
      )
    ).json()) as MemberDetails;
    expect(after.status).toBe(MemberStatus.Active);
  });

  it('refuse un conflit métier pour un membre déjà actif', async () => {
    const activeMemberId = '10700000-0000-4000-8000-000000000500';

    const response = await runRequest(
      new Request(`http://localhost/api/v1/members/${activeMemberId}/reactivation`, {
        method: 'POST',
        headers: adminHeaders,
      }),
    );

    expect(response.status).toBe(409);
  });

  it("refuse l'accès à un rôle autre qu'Administrateur", async () => {
    const inactiveMemberId = '10700000-0000-4000-8000-000000000502';
    const treasurerAccount = demoAccounts.find((account) => account.user.role === 'TREASURER');
    if (!treasurerAccount) {
      throw new Error('Aucun compte Trésorier de démonstration disponible.');
    }

    const response = await runRequest(
      new Request(`http://localhost/api/v1/members/${inactiveMemberId}/reactivation`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${treasurerAccount.accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
    );

    expect(response.status).toBe(403);
  });
});
