import { DueStatus } from '@api';

/**
 * Cles Transloco partagees pour le statut d'une cotisation (DueStatus),
 * reutilisees par toutes les fonctionnalites qui affichent ce statut
 * (campagnes, espace membre) afin d'eviter des mappings enum -> libelle
 * dupliques qui pourraient diverger si le cahier des charges change un libelle.
 */
export const DUE_STATUS_TRANSLATION_KEYS: Record<DueStatus, string> = {
  [DueStatus.Due]: 'sharedDueStatus.due',
  [DueStatus.PartiallyPaid]: 'sharedDueStatus.partiallyPaid',
  [DueStatus.Paid]: 'sharedDueStatus.paid',
  [DueStatus.Overdue]: 'sharedDueStatus.overdue',
};
