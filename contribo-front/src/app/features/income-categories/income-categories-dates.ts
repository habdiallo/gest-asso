/**
 * Formatage des dates de l'écran des catégories de revenu (T-48) en français,
 * sans dépendre du `LOCALE_ID` Angular (non configuré pour `fr-FR` dans ce
 * socle). Voir `features/dashboard/dashboard-dates.ts` pour le même besoin
 * sur un autre écran ; non factorisé dans `core/` tant qu'un seul autre écran
 * l'utilise, conformément à `.claude/rules/frontend/tests.md` (colocaliser,
 * mutualiser seulement ce qui est réellement partagé).
 */

const instantFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * Formate un instant (`format: date-time`, ici `updatedAt`) dans le fuseau
 * horaire local du navigateur, faute de fuseau associatif unique dans le contrat.
 */
export function formatInstant(value: string): string {
  return instantFormatter.format(new Date(value));
}
