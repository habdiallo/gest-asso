import { CampaignStatus } from '@api';

/**
 * Libellés français des statuts de campagne (schéma `CampaignStatus` de
 * `besoins/openapi.yaml`) : à venir avant le début, ouverte jusqu'à la
 * clôture explicite, clôturée après clôture. Décision applicative reprise
 * de `features/dashboard/dashboard-status-labels.ts` : les features ne
 * s'importent pas entre elles (`.claude/rules/frontend/angular.md`), le
 * mapping est donc dupliqué ici plutôt que partagé directement.
 */
const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  [CampaignStatus.Upcoming]: 'À venir',
  [CampaignStatus.Open]: 'Ouverte',
  [CampaignStatus.Closed]: 'Clôturée',
};

export function campaignStatusLabel(status: CampaignStatus): string {
  return CAMPAIGN_STATUS_LABELS[status];
}
