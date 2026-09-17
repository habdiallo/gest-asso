/**
 * Formatage de la période d'une cagnotte (T-82) en français, sans dépendre du
 * `LOCALE_ID` Angular (non configuré pour `fr-FR` dans ce socle). Même logique
 * que `features/dashboard/dashboard-dates.ts` : duplication volontaire, ce
 * petit formateur pur reste propre à cette feature (pas d'import inter-features).
 */
const calendarDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * Formate une date de calendrier (`format: date`, `startDate`/`endDate` d'une
 * cagnotte) sans décalage de jour : la valeur est interprétée à minuit UTC
 * puis affichée dans le même fuseau.
 */
export function formatSocialFundCalendarDate(value: string): string {
  return calendarDateFormatter.format(new Date(`${value}T00:00:00Z`));
}
