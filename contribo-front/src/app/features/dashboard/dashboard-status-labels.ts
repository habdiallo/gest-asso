import { CampaignStatus, DueStatus } from '@api';
import type { PaymentMethod } from '@api';
import { PAYMENT_METHOD_OPTIONS } from '@shared/payment-method-select/payment-method-options';

/**
 * Libellés français des statuts de campagne (RG cf. `besoins/openapi.yaml`,
 * schéma `CampaignStatus`) : à venir avant le début, ouverte jusqu'à la
 * clôture explicite, clôturée après clôture. Décision applicative : le
 * cahier ne fixe pas de libellé exact pour `UPCOMING`/`OPEN`, `CLOSED`
 * reprend le vocabulaire des User Stories campagnes.
 */
const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  [CampaignStatus.Upcoming]: 'À venir',
  [CampaignStatus.Open]: 'Ouverte',
  [CampaignStatus.Closed]: 'Clôturée',
};

export function campaignStatusLabel(status: CampaignStatus): string {
  return CAMPAIGN_STATUS_LABELS[status];
}

/**
 * Libellés français des statuts de cotisation, repris tels quels du cahier
 * (US-COT, §"Statuts") : « À payer / Partiellement payé / Payé / En retard ».
 */
const DUE_STATUS_LABELS: Record<DueStatus, string> = {
  [DueStatus.Due]: 'À payer',
  [DueStatus.PartiallyPaid]: 'Partiellement payé',
  [DueStatus.Paid]: 'Payé',
  [DueStatus.Overdue]: 'En retard',
};

export function dueStatusLabel(status: DueStatus): string {
  return DUE_STATUS_LABELS[status];
}

/**
 * Réutilise le mapping partagé des modes de règlement (`payment-method-options.ts`,
 * T-20) plutôt que de dupliquer les libellés Espèces / Mobile Money / Virement bancaire.
 */
export function paymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? method;
}
