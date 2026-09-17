import { UserRole } from '@api';
import type { UserAccountSummary } from '@api';

/**
 * Libellés français des 4 rôles applicatifs (US-ROLE-001, RG-ROLE-001 à
 * RG-ROLE-004), indépendants de la fonction associative (RG-ROLE-006).
 */
const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Administrator]: 'Administrateur',
  [UserRole.Treasurer]: 'Trésorier',
  [UserRole.Operator]: 'Opérateur',
  [UserRole.Member]: 'Membre',
};

export function userRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role];
}

/**
 * Libellé de l'autorisation `operatorCanRecordPayments`, pertinente
 * uniquement pour un compte Opérateur (`null` sinon, cf. design/app.js
 * `usersPage()` où les autres rôles affichent « - »). Cette autorisation
 * n'est ni affichée ni modifiable ici : son contrôle relève des tâches
 * dédiées T-55/T-56.
 */
export function operatorAuthorizationLabel(
  account: Pick<UserAccountSummary, 'role' | 'operatorCanRecordPayments'>,
): string | null {
  if (account.role !== UserRole.Operator) {
    return null;
  }
  return account.operatorCanRecordPayments ? 'Autorisé' : 'Non autorisé';
}
