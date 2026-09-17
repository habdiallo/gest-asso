import { MemberStatus } from '@api';

/**
 * Libellés français du statut d'un membre (T-21), repris du cahier
 * (US-MEM-002 : Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone, Catégorie,
 * Fonction, Statut).
 */
const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  [MemberStatus.Active]: 'Actif',
  [MemberStatus.Inactive]: 'Inactif',
};

export function memberStatusLabel(status: MemberStatus): string {
  return MEMBER_STATUS_LABELS[status];
}

/**
 * Indique si un statut de membre correspond à un membre actif (T-22,
 * RG-MEM-007), afin d'appliquer une distinction visuelle actif/inactif dans
 * la liste des membres sans dupliquer la comparaison à l'enum dans le
 * template.
 */
export function memberIsActive(status: MemberStatus): boolean {
  return status === MemberStatus.Active;
}
