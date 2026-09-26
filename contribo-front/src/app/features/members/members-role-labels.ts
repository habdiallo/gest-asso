import { UserRole } from '@api';

/**
 * Libellés français du rôle applicatif du compte associé à un membre (T-130),
 * affichés dans la carte "Compte associé" de la fiche membre. Même mapping
 * que `features/roles-users/roles-users-labels.ts` : duplication volontaire,
 * les features ne s'important pas entre elles.
 */
const MEMBER_ACCOUNT_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Administrator]: 'Administrateur',
  [UserRole.Treasurer]: 'Trésorier',
  [UserRole.Operator]: 'Opérateur',
  [UserRole.Member]: 'Membre',
};

export function memberAccountRoleLabel(role: UserRole): string {
  return MEMBER_ACCOUNT_ROLE_LABELS[role];
}
