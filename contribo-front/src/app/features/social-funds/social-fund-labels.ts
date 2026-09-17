import { SocialEventType, SocialFundStatus } from '@api';

/**
 * Libellés français des statuts de cagnotte (T-82, schéma `SocialFundStatus` de
 * `besoins/openapi.yaml`). Domaine indépendant des campagnes de cotisation
 * (RG-CAG-001) : pas de mapping partagé avec `dashboard-status-labels.ts`.
 */
const SOCIAL_FUND_STATUS_LABELS: Record<SocialFundStatus, string> = {
  [SocialFundStatus.Open]: 'Ouverte',
  [SocialFundStatus.Closed]: 'Clôturée',
};

export function socialFundStatusLabel(status: SocialFundStatus): string {
  return SOCIAL_FUND_STATUS_LABELS[status];
}

/**
 * Libellés français des types d'événement social, repris tels quels du cahier
 * (US-CAG-001) : Mariage, Baptême, Décès, Naissance, Autre.
 */
const SOCIAL_EVENT_TYPE_LABELS: Record<SocialEventType, string> = {
  [SocialEventType.Wedding]: 'Mariage',
  [SocialEventType.Baptism]: 'Baptême',
  [SocialEventType.Death]: 'Décès',
  [SocialEventType.Birth]: 'Naissance',
  [SocialEventType.Other]: 'Autre',
};

export function socialEventTypeLabel(eventType: SocialEventType): string {
  return SOCIAL_EVENT_TYPE_LABELS[eventType];
}
