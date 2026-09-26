import { CampaignStatus } from '@api';

/**
 * Libellés français des statuts de campagne (schéma `CampaignStatus` de
 * `besoins/openapi.yaml`). La liste et le détail affichent le même statut
 * métier afin que le brouillon reste identifiable avant sa configuration.
 */
const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  [CampaignStatus.Upcoming]: 'À venir',
  [CampaignStatus.Open]: 'Ouverte',
  [CampaignStatus.Closed]: 'Clôturée',
};

export function campaignStatusLabel(status: CampaignStatus): string {
  return CAMPAIGN_STATUS_LABELS[status];
}

export type CampaignStatusTone = 'success' | 'neutral';

const CAMPAIGN_STATUS_TONES: Record<CampaignStatus, CampaignStatusTone> = {
  [CampaignStatus.Upcoming]: 'success',
  [CampaignStatus.Open]: 'success',
  [CampaignStatus.Closed]: 'neutral',
};

export function campaignStatusTone(status: CampaignStatus): CampaignStatusTone {
  return CAMPAIGN_STATUS_TONES[status];
}
