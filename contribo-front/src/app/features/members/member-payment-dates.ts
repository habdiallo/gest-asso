/**
 * Formatage de la date d'un règlement (T-29) en français, sans dépendre du
 * `LOCALE_ID` Angular (non configuré pour `fr-FR` dans ce socle). Même
 * logique que `features/social-funds/social-fund-dates.ts` : duplication
 * volontaire, ce petit formateur pur reste propre à cette feature (pas
 * d'import inter-features).
 */
const calendarDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * Formate une date de calendrier (`format: date`, `paymentDate` d'un
 * règlement) sans décalage de jour : la valeur est interprétée à minuit UTC
 * puis affichée dans le même fuseau.
 */
export function formatMemberPaymentCalendarDate(value: string): string {
  return calendarDateFormatter.format(new Date(`${value}T00:00:00Z`));
}
