import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Bandeau d'erreur générique pour un appel de création/modification en échec
 * (T-102), utilisé de façon cohérente par les formulaires de création et de
 * modification de l'application (membre, catégorie de revenu, campagne,
 * barème de campagne, cagnotte) : un message déjà résolu, sans détail
 * technique (pas de message HTTP brut ni de trace), plus une action de
 * nouvelle tentative explicite ("Réessayer").
 *
 * La saisie de l'utilisateur n'est jamais effacée par un échec dans ces
 * formulaires : rejouer l'appel reprend donc les valeurs déjà présentes,
 * sans resaisie. Composant neutre (shared/), sans connaissance de la requête
 * réellement rejouée ; l'appelant retente l'appel API concerné depuis
 * `(retry)`. `message` et `retryLabel` sont déjà résolus par Transloco côté
 * appelant, comme `EmptyState` (T-101) : ce composant ne connaît aucune
 * feature métier et ne fait aucun appel API lui-même.
 */
@Component({
  selector: 'app-api-error-retry',
  templateUrl: './api-error-retry.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiErrorRetry {
  /** Message d'erreur déjà résolu (clé Transloco), sans détail technique exposé. */
  readonly message = input.required<string>();

  /** Libellé déjà résolu (clé Transloco) du bouton de nouvelle tentative. */
  readonly retryLabel = input.required<string>();

  /** Émis lorsque l'utilisateur demande de rejouer l'appel en échec. */
  readonly retry = output<void>();
}
