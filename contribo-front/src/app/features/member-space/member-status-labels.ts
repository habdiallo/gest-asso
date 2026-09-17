import { MemberStatus } from '@api';

/**
 * Libellés français du statut de membre (schéma `MemberStatus`), repris du
 * cahier (US-MEM-005/US-MEM-006, §"Désactiver/réactiver un membre") :
 * Actif / Inactif.
 */
const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  [MemberStatus.Active]: 'Actif',
  [MemberStatus.Inactive]: 'Inactif',
};

export function memberStatusLabel(status: MemberStatus): string {
  return MEMBER_STATUS_LABELS[status];
}
