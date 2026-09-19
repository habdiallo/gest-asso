import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { CampaignFinancialSummary } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountCondensed } from '@core/formatting/currency';

/**
 * Onglet bilan de campagne (T-77, US-COT-007) : total attendu, total encaissé
 * et reste à encaisser, lus depuis `Campaign.financialSummary`
 * (`openapi:getCampaign`). Ce composant n'effectue aucun appel réseau propre :
 * l'écran détail (`campaign-detail-page.ts`) a déjà chargé la campagne
 * complète et transmet le sous-objet financier en entrée.
 *
 * `financialSummary` est absent lorsque le rôle consulté n'est pas autorisé à
 * voir le bilan financier de la campagne (contrat
 * `CampaignSummary.financialSummary`) ; ce cas est distinct du chargement ou
 * de l'erreur réseau, déjà gérés par la page parente.
 *
 * La répartition des membres par statut de paiement (T-78, US-COT-007) est
 * lue depuis `financialSummary.dueCounts` (contrat `DueCountSummary`) : ce
 * décompte est déjà agrégé côté serveur (paid/partiallyPaid/unpaid), ce
 * composant n'effectue aucun recalcul local à partir d'une liste de
 * cotisations. Ce sont des effectifs de membres, pas des montants : ils ne
 * passent pas par la notation condensée.
 *
 * Les trois totaux (attendu, encaissé, reste à encaisser) utilisent la
 * notation condensée GNF (T-79) : la valeur brute reste accessible via une
 * info-bulle (`title`) et un texte masqué visuellement pour les lecteurs
 * d'écran, selon le même patron que `social-funds-list-page.html`.
 */
@Component({
  selector: 'app-campaign-bilan-tab',
  imports: [TranslocoPipe],
  templateUrl: './campaign-bilan-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignBilanTab {
  readonly financialSummary = input<CampaignFinancialSummary | undefined>(undefined);

  readonly formatAmount = formatGnfAmountCondensed;
}
