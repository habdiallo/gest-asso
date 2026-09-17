/**
 * Formatage des dates de calendrier de l'espace membre en français, sans
 * dépendre du `LOCALE_ID` Angular (non configuré pour `fr-FR` dans ce socle).
 * Reprend la logique de `features/campaigns/campaign-dates.ts` : les
 * features ne s'important pas entre elles, la fonction est donc dupliquée
 * ici plutôt que partagée.
 */

const calendarDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * Formate une date de calendrier (`format: date`, `startDate`/`endDate`
 * d'une campagne) sans décalage de jour : la valeur est interprétée à
 * minuit UTC puis affichée dans le même fuseau.
 */
export function formatCalendarDate(value: string): string {
  return calendarDateFormatter.format(new Date(`${value}T00:00:00Z`));
}
