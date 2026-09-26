import { MemberStatus } from '@api';
import type { ContributionPage, MemberDetails, MemberPage } from '@api';
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

  describe('recherche par nom (T-24)', () => {
    it('filtre les membres dont un champ nominatif correspond au terme saisi', () => {
      const response = buildMemberPageResponse('Diallo');

      expect(response.items).toHaveLength(1);
      expect(response.items[0].lastName).toBe('Diallo');
    });

    it('ignore la casse et les accents de la saisie', () => {
      const response = buildMemberPageResponse('cAmArA');

      expect(response.items.map((member) => member.lastName)).toEqual(['Camara']);
    });

    it('garde des compteurs globaux indépendants du filtre courant', () => {
      const unfiltered = buildMemberPageResponse();
      const filtered = buildMemberPageResponse('Diallo');

      expect(filtered.summary).toEqual(unfiltered.summary);
      expect(filtered.items.length).toBeLessThan(unfiltered.items.length);
    });

    it("renvoie une liste vide sans lever d'erreur quand aucun membre ne correspond", () => {
      const response = buildMemberPageResponse('Terme introuvable');

      expect(response.items).toEqual([]);
    });

    it('filtre via le paramètre `q` de la requête `GET /api/v1/members`', async () => {
      const headers = { Authorization: `Bearer ${demoAccounts[0].accessToken}` };
      const response = await runRequest(
        new Request('http://localhost/api/v1/members?q=Sow', { headers }),
      );
      const page = (await response.json()) as MemberPage;

      expect(page.items.map((member) => member.lastName)).toEqual(['Sow']);
    });
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

describe('GET /api/v1/contributions (mocks MSW, T-30)', () => {
  const headers = {
    Authorization: `Bearer ${demoAccounts[0].accessToken}`,
    'Content-Type': 'application/json',
  };

  it('returns the contributions to social funds of a member with contributions', async () => {
    const page = buildMemberPageResponse();
    const memberId = page.items[0].id;

    const response = await runRequest(
      new Request(`http://localhost/api/v1/contributions?memberId=${memberId}`, { headers }),
    );
    const contributionPage = (await response.json()) as ContributionPage;

    expect(response.status).toBe(200);
    expect(contributionPage.items.length).toBeGreaterThan(0);
    expect(
      contributionPage.items.every(
        (item) => item.member?.id === memberId && item.externalContributor === null,
      ),
    ).toBe(true);
  });

  it('returns an empty page for a member without any contribution', async () => {
    const page = buildMemberPageResponse();
    const memberWithContribution = page.items[0].id;
    const memberWithoutContribution = page.items.find((item) => item.id !== memberWithContribution);
    expect(memberWithoutContribution).toBeDefined();

    const response = await runRequest(
      new Request(
        `http://localhost/api/v1/contributions?memberId=${memberWithoutContribution?.id}`,
        { headers },
      ),
    );
    const contributionPage = (await response.json()) as ContributionPage;

    expect(response.status).toBe(200);
    expect(contributionPage.items).toEqual([]);
    expect(contributionPage.page.totalElements).toBe(0);
  });

  it('requires authentication', async () => {
    const response = await runRequest(
      new Request('http://localhost/api/v1/contributions?memberId=unknown'),
    );

    expect(response.status).toBe(401);
  });
});
