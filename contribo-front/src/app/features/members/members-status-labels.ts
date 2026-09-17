import { MemberStatus } from '@api';

/**
 * Libellés français du statut d'un membre (T-21), repris du cahier
 * (US-MEM-002 : Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone, Catégorie,
 * Fonction, Statut). La distinction visuelle actif/inactif (RG-MEM-007) est
 * traitée par le ticket T-22 ; cette fonction ne fournit que le texte.
 */
const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  [MemberStatus.Active]: 'Actif',
  [MemberStatus.Inactive]: 'Inactif',
};

export function memberStatusLabel(status: MemberStatus): string {
  return MEMBER_STATUS_LABELS[status];
}
