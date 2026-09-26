import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Forme visuelle du squelette, alignée sur la mise en page réelle de l'écran qui charge. */
export type LoadingSkeletonVariant = 'table' | 'list' | 'grid' | 'detail' | 'dialog' | 'inline';

/**
 * État de chargement visuel (T-100, squelette/spinner) pour les listes et fiches
 * principales (membres, campagnes, cagnottes). Remplace le texte de chargement
 * isolé par une silhouette de la mise en page réellement affichée une fois les
 * données disponibles, tout en restant neutre : ce composant ne connaît aucune
 * feature métier et ne fait aucun appel API.
 *
 * Accessibilité (RG transverse) : le statut de chargement n'est pas porté
 * uniquement par l'animation visuelle. `label` fournit le texte annoncé aux
 * technologies d'assistance via `role="status"` ; les barres de silhouette sont
 * purement décoratives (`aria-hidden="true"`).
 */
@Component({
  selector: 'app-loading-skeleton',
  templateUrl: './loading-skeleton.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSkeleton {
  /** Mise en page à imiter : tableau, liste, grille, fiche détaillée ou dialogue de formulaire. */
  readonly variant = input.required<LoadingSkeletonVariant>();

  /** Nombre de lignes/cartes de silhouette pour les variantes `table`, `list` et `grid`. */
  readonly rows = input(3);

  /** Texte de chargement annoncé aux technologies d'assistance (clé Transloco déjà résolue). */
  readonly label = input.required<string>();

  /** Indices des lignes/cartes de silhouette à afficher, dérivés de `rows`. */
  readonly rowIndexes = computed(() => Array.from({ length: this.rows() }, (_, index) => index));

  /** Trois blocs de synthèse affichés dans la variante dialogue. */
  readonly dialogSummaryIndexes = [0, 1, 2] as const;

  /** Libellés métier affichés dans les blocs de synthèse du dialogue en attente. */
  readonly dialogSummaryLabels = input<ReadonlyArray<string>>([]);

  /** Libellés métier affichés dans les champs du dialogue en attente. */
  readonly dialogFieldLabels = input<ReadonlyArray<string>>([]);
}
