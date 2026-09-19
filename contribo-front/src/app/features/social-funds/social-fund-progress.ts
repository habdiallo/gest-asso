/**
 * Largeur affichée de la barre de progression objectif/collecté d'une
 * cagnotte, bornée à 100 même si `progressRate` dépasse cette valeur
 * (objectif atteint et dépassé).
 *
 * L'objectif (`targetAmount`) est facultatif (T-85, US-CAG-001) : cette
 * fonction n'est appelée que lorsqu'une cagnotte a un objectif défini, la
 * barre étant sinon entièrement masquée par le template appelant (voir
 * `social-funds-list-page.html`, T-85, et `social-fund-detail-page.html`,
 * T-92).
 *
 * Partagée entre l'écran liste (T-85) et l'écran suivi de cagnotte (T-92)
 * pour ne pas dupliquer ce calcul, tout en restant un utilitaire propre à la
 * feature `social-funds` (pas `shared/` ni `core/`, ce calcul n'a de sens
 * que pour une cagnotte).
 */
export function progressBarWidth(progressRate: number): number {
  return Math.min(100, Math.max(0, progressRate));
}
