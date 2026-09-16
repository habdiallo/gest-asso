import { UserRole } from '@api';
import type { NavigationItem } from './navigation-item';
import { NAVIGATION_PATHS } from './navigation-paths';

const ADMINISTRATOR_ITEMS: NavigationItem[] = [
  { label: 'Membres', path: NAVIGATION_PATHS.members },
  { label: 'Catégories de revenu', path: NAVIGATION_PATHS.incomeCategories },
  { label: 'Campagnes', path: NAVIGATION_PATHS.campaigns },
  { label: 'Cagnottes', path: NAVIGATION_PATHS.socialFunds },
  { label: 'Rôles et utilisateurs', path: NAVIGATION_PATHS.rolesAndUsers },
  { label: 'Mon espace', path: NAVIGATION_PATHS.memberSpace },
];

export function navigationItemsForRole(role: UserRole | null): NavigationItem[] {
  if (role === UserRole.Administrator) {
    return ADMINISTRATOR_ITEMS;
  }

  return [];
}
