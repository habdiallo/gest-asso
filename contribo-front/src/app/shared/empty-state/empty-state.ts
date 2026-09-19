import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * État vide (T-101 : "aucun membre", "aucune campagne", "aucune contribution", etc.)
 * pour les listes et onglets de l'application. Remplace un simple paragraphe gris
 * isolé par une présentation cohérente (icône neutre + message), affichée quand
 * une liste chargée avec succès ne contient aucun élément.
 *
 * Ce composant est neutre : il ne connaît aucune feature métier et ne fait aucun
 * appel API. `message` porte le texte déjà résolu (clé Transloco) décrivant la
 * liste concernée, par exemple "Aucun membre enregistré.".
 *
 * Accessibilité (RG transverse) : le message est annoncé aux technologies
 * d'assistance via `role="status"` ; l'icône est purement décorative
 * (`aria-hidden="true"`).
 */
@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  /** Message affiché (clé Transloco déjà résolue) décrivant l'absence de données. */
  readonly message = input.required<string>();
}
