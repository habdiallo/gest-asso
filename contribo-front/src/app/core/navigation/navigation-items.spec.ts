import { navigationItemsForRole } from './navigation-items';

describe('navigationItemsForRole', () => {
  it('returns the Administrator menu in the design order and labels', () => {
    expect(navigationItemsForRole('ADMINISTRATOR')).toEqual([
      { label: 'Membres', path: '/membres' },
      { label: 'Cotisations', path: '/campagnes' },
      { label: 'Cagnottes', path: '/cagnottes' },
      { label: 'Utilisateurs & rôles', path: '/roles-utilisateurs' },
      { label: 'Catégories', path: '/categories-de-revenu' },
    ]);
  });

  it('returns the Treasurer menu (membres, campagnes, cagnottes, mon espace, sans catégories ni rôles/utilisateurs)', () => {
    expect(navigationItemsForRole('TREASURER')).toEqual([
      { label: 'Membres', path: '/membres' },
      { label: 'Cotisations', path: '/campagnes' },
      { label: 'Cagnottes', path: '/cagnottes' },
      { label: 'Mon espace', path: '/mon-espace' },
    ]);
  });

  it('returns the Operator menu (consultation membres/campagnes/cagnottes, mon espace)', () => {
    expect(navigationItemsForRole('OPERATOR')).toEqual([
      { label: 'Membres', path: '/membres' },
      { label: 'Cotisations', path: '/campagnes' },
      { label: 'Cagnottes', path: '/cagnottes' },
      { label: 'Mon espace', path: '/mon-espace' },
    ]);
  });

  it('returns the Member menu limited to their personal space', () => {
    expect(navigationItemsForRole('MEMBER')).toEqual([
      { label: 'Mon espace', path: '/mon-espace' },
    ]);
  });

  it('returns no items when there is no authenticated role', () => {
    expect(navigationItemsForRole(null)).toEqual([]);
  });
});
