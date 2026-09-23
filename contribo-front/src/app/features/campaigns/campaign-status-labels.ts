import { CampaignStatus } from '@api';

/**
 * Libellés français des statuts de campagne (schéma `CampaignStatus` de
 * `besoins/openapi.yaml`). Le détail conserve le libellé technique « À venir »
 * pour les règles d'édition du barème, tandis que la liste normalise ce statut
 * dans son vocabulaire visuel ouvert/clôturé.
 */
const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  [CampaignStatus.Upcoming]: 'À venir',
  [CampaignStatus.Open]: 'Ouverte',
  [CampaignStatus.Closed]: 'Clôturée',
};

export function campaignStatusLabel(status: CampaignStatus): string {
  return CAMPAIGN_STATUS_LABELS[status];
}

/** Statut présenté par la liste Campagnes, limitée aux états ouverts et clôturés. */
export type CampaignListStatus = typeof CampaignStatus.Open | typeof CampaignStatus.Closed;

export function campaignListStatus(status: CampaignStatus): CampaignListStatus {
  return status === CampaignStatus.Closed ? CampaignStatus.Closed : CampaignStatus.Open;
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
