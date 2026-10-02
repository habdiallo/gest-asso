/**
 * Convertit les valeurs de `categoryAmounts` en tableau avant leur
 * sérialisation JSON. Le générateur OpenAPI produit un `Set` pour les champs
 * marqués `uniqueItems`, alors que le transport JSON attend un tableau.
 */
export function toCategoryAmountsArray<T>(values: Iterable<T>): T[] {
  return Array.from(values);
}
