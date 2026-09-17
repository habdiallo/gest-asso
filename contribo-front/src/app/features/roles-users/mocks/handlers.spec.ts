import { CurrencyCode, MemberStatus, UserRole } from '@api';
import type { DemoAccount } from '../../../../mocks/demo-accounts';
import { demoAccounts } from '../../../../mocks/demo-accounts';
import { applyUserAccessUpdate, buildUserAccountsPage } from './handlers';

/**
 * Compte de démonstration isolé (indépendant de `demoAccounts`) : les tests
 * de `applyUserAccessUpdate` mutent l'entrée reçue, donc chaque cas construit
 * la sienne plutôt que de partager le catalogue global de fixtures.
 */
function buildDemoAccount(overrides: Partial<DemoAccount['user']> = {}): DemoAccount {
  return {
    identifier: 'operateur.isole.demo',
    password: 'demo-contribo',
    accessToken: 'contribo-demo-session-operateur-isole-v1',
    user: {
      userId: 'e5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
      association: {
        id: '10700000-0000-4000-8000-000000000100',
        name: 'Association Démo',
        currency: CurrencyCode.Gnf,
      },
      member: {
        id: 'e5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d21',
        firstName: 'Test',
        lastName: 'Isolé',
        displayName: 'Test Isolé',
        incomeCategory: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
        status: MemberStatus.Active,
      },
      role: UserRole.Operator,
      operatorCanRecordPayments: true,
      accountActive: true,
      ...overrides,
    },
  };
}

describe('buildUserAccountsPage (mocks MSW, T-52)', () => {
  it('renvoie tous les comptes de démonstration avec leur rôle applicatif', () => {
    const result = buildUserAccountsPage(demoAccounts, 0, 20);

    expect(result.items).toHaveLength(demoAccounts.length);
    expect(result.page).toEqual({
      number: 0,
      size: 20,
      totalElements: demoAccounts.length,
      totalPages: 1,
    });
    for (const item of result.items) {
      expect(item.role).toBeDefined();
      expect(item.member.displayName.length).toBeGreaterThan(0);
    }
  });

  it('filtre par rôle applicatif (RG-ROLE-002 : le rôle affiché est celui du contrat)', () => {
    const result = buildUserAccountsPage(demoAccounts, 0, 20, undefined, UserRole.Operator);

    expect(result.items.length).toBeGreaterThan(0);
    for (const item of result.items) {
      expect(item.role).toBe(UserRole.Operator);
    }
  });

  it('filtre par recherche insensible à la casse sur le nom affiché du membre', () => {
    const target = demoAccounts[0];
    const result = buildUserAccountsPage(
      demoAccounts,
      0,
      20,
      target.user.member.displayName.toUpperCase(),
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(target.user.userId);
  });

  it('pagine les résultats selon page/size', () => {
    const firstPage = buildUserAccountsPage(demoAccounts, 0, 2);
    const secondPage = buildUserAccountsPage(demoAccounts, 1, 2);

    expect(firstPage.items).toHaveLength(2);
    expect(firstPage.page.totalElements).toBe(demoAccounts.length);
    expect(secondPage.items[0].id).not.toBe(firstPage.items[0].id);
  });
});

describe('applyUserAccessUpdate (mocks MSW, T-53)', () => {
  it("change le rôle applicatif et le reflète dans l'entrée retournée", () => {
    const account = buildDemoAccount({ role: UserRole.Member, operatorCanRecordPayments: false });

    const result = applyUserAccessUpdate([account], account.user.userId, {
      role: UserRole.Treasurer,
      operatorCanRecordPayments: false,
    });

    expect(result.status).toBe(200);
    if (result.status === 200) {
      expect(result.account.role).toBe(UserRole.Treasurer);
    }
    expect(account.user.role).toBe(UserRole.Treasurer);
  });

  it('ne modifie pas la fonction associative ni les autres champs du membre', () => {
    const account = buildDemoAccount();
    const displayNameBefore = account.user.member.displayName;

    applyUserAccessUpdate([account], account.user.userId, {
      role: UserRole.Administrator,
      operatorCanRecordPayments: false,
    });

    expect(account.user.member.displayName).toBe(displayNameBefore);
  });

  it('force operatorCanRecordPayments à false hors du rôle Opérateur (contrat)', () => {
    const account = buildDemoAccount();

    const result = applyUserAccessUpdate([account], account.user.userId, {
      role: UserRole.Member,
      operatorCanRecordPayments: true,
    });

    expect(result.status).toBe(400);
    expect(account.user.role).toBe(UserRole.Operator);
  });

  it('retourne 404 pour un utilisateur inconnu', () => {
    const account = buildDemoAccount();

    const result = applyUserAccessUpdate([account], 'identifiant-inconnu', {
      role: UserRole.Member,
      operatorCanRecordPayments: false,
    });

    expect(result.status).toBe(404);
  });
});
