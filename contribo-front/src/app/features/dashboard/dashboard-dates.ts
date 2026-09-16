/**
 * Formatage des dates du tableau de bord en français, sans dépendre du
 * `LOCALE_ID` Angular (non configuré pour `fr-FR` dans ce socle).
 */

const calendarDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * Formate une date de calendrier (`format: date`, par ex. `startDate`/`endDate`
 * d'une campagne ou `paymentDate` d'un règlement) sans décalage de jour :
 * la valeur est interprétée à minuit UTC puis affichée dans le même fuseau.
 */
export function formatCalendarDate(value: string): string {
  return calendarDateFormatter.format(new Date(`${value}T00:00:00Z`));
}

const instantFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * Formate un instant (`format: date-time`, par ex. `asOf`) dans le fuseau
 * horaire local du navigateur — choix documenté, faute de fuseau associatif
 * unique dans le contrat.
 */
export function formatInstant(value: string): string {
  return instantFormatter.format(new Date(value));
}
