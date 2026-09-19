import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { CampaignFinancialSummary } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';

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
 * cotisations.
 *
 * Limite connue, hors périmètre de T-77/T-78 : la notation condensée des
 * montants (T-79) n'est pas encore appliquée ici ; seule la valeur détaillée
 * des trois totaux l'est.
 */
@Component({
  selector: 'app-campaign-bilan-tab',
  imports: [TranslocoPipe],
  templateUrl: './campaign-bilan-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignBilanTab {
  readonly financialSummary = input<CampaignFinancialSummary | undefined>(undefined);

  readonly formatAmount = formatGnfAmountDetailed;
}
