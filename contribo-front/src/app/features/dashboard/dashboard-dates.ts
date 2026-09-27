import { formatCalendarDate as formatCoreCalendarDate } from '@core/formatting/calendar-date';

/**
 * Formate une date de calendrier (`format: date`, par ex. `startDate`/`endDate`
 * d'une campagne ou `paymentDate` d'un règlement) sans décalage de jour :
 * la valeur est interprétée à minuit UTC puis affichée dans le même fuseau.
 */
export function formatCalendarDate(value: string): string {
  return formatCoreCalendarDate(value);
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
