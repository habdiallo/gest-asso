/**
 * Formateur partagé des dates de calendrier en français.
 *
 * Les valeurs `format: date` du contrat ne représentent pas un instant. Elles
 * sont donc interprétées à minuit UTC afin de conserver le jour affiché dans
 * tous les fuseaux horaires.
 */
const calendarDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatCalendarDate(value: string): string {
  return calendarDateFormatter.format(new Date(`${value}T00:00:00Z`));
}
