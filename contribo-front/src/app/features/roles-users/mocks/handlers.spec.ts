import { UserRole } from '@api';
import { demoAccounts } from '../../../../mocks/demo-accounts';
import { buildUserAccountsPage } from './handlers';

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
