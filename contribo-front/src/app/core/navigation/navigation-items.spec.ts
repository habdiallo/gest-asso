import { navigationItemsForRole } from './navigation-items';

describe('navigationItemsForRole', () => {
  it('returns the Administrator menu (membres, catégories, campagnes, cagnottes, rôles/utilisateurs, mon espace)', () => {
    expect(navigationItemsForRole('ADMINISTRATOR')).toEqual([
      { label: 'Membres', path: '/membres' },
      { label: 'Catégories de revenu', path: '/categories-de-revenu' },
      { label: 'Campagnes', path: '/campagnes' },
      { label: 'Cagnottes', path: '/cagnottes' },
      { label: 'Rôles et utilisateurs', path: '/roles-utilisateurs' },
      { label: 'Mon espace', path: '/mon-espace' },
    ]);
  });

  it('returns the Treasurer menu (membres, campagnes, cagnottes, mon espace, sans catégories ni rôles/utilisateurs)', () => {
    expect(navigationItemsForRole('TREASURER')).toEqual([
      { label: 'Membres', path: '/membres' },
      { label: 'Campagnes', path: '/campagnes' },
      { label: 'Cagnottes', path: '/cagnottes' },
      { label: 'Mon espace', path: '/mon-espace' },
    ]);
  });

  it('returns the Operator menu (consultation membres/campagnes/cagnottes, mon espace)', () => {
    expect(navigationItemsForRole('OPERATOR')).toEqual([
      { label: 'Membres', path: '/membres' },
      { label: 'Campagnes', path: '/campagnes' },
      { label: 'Cagnottes', path: '/cagnottes' },
      { label: 'Mon espace', path: '/mon-espace' },
    ]);
  });

  it('returns no items for a role without a menu defined yet', () => {
    expect(navigationItemsForRole('MEMBER')).toEqual([]);
  });

  it('returns no items when there is no authenticated role', () => {
    expect(navigationItemsForRole(null)).toEqual([]);
  });
});
