import { UserRole } from '@api';
import type { NavigationItem } from './navigation-item';
import { NAVIGATION_PATHS } from './navigation-paths';

const ADMINISTRATOR_ITEMS: NavigationItem[] = [
  { label: 'Membres', path: NAVIGATION_PATHS.members },
  { label: 'Cotisations', path: NAVIGATION_PATHS.campaigns },
  { label: 'Cagnottes', path: NAVIGATION_PATHS.socialFunds },
  { label: 'Utilisateurs & rôles', path: NAVIGATION_PATHS.rolesAndUsers },
  { label: 'Catégories', path: NAVIGATION_PATHS.incomeCategories },
];

const TREASURER_ITEMS: NavigationItem[] = [
  { label: 'Membres', path: NAVIGATION_PATHS.members },
  { label: 'Cotisations', path: NAVIGATION_PATHS.campaigns },
  { label: 'Cagnottes', path: NAVIGATION_PATHS.socialFunds },
  { label: 'Mon espace', path: NAVIGATION_PATHS.memberSpace },
];

const OPERATOR_ITEMS: NavigationItem[] = [
  { label: 'Membres', path: NAVIGATION_PATHS.members },
  { label: 'Cotisations', path: NAVIGATION_PATHS.campaigns },
  { label: 'Cagnottes', path: NAVIGATION_PATHS.socialFunds },
  { label: 'Mon espace', path: NAVIGATION_PATHS.memberSpace },
];

const MEMBER_ITEMS: NavigationItem[] = [
  { label: 'Mon espace', path: NAVIGATION_PATHS.memberSpace },
];

export function navigationItemsForRole(role: UserRole | null): NavigationItem[] {
  if (role === UserRole.Administrator) {
    return ADMINISTRATOR_ITEMS;
  }

  if (role === UserRole.Treasurer) {
    return TREASURER_ITEMS;
  }

  if (role === UserRole.Operator) {
    return OPERATOR_ITEMS;
  }

  if (role === UserRole.Member) {
    return MEMBER_ITEMS;
  }

  return [];
}
