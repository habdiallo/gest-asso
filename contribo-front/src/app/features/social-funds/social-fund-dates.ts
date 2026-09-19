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

/**
 * Formateur de l'horodatage d'une contribution (`recordedAt`, T-90, RG-CAG-007).
 * Contrairement à `calendarDateFormatter`, `format: date-time` représente un
 * instant absolu (ISO 8601 avec fuseau, par exemple `2026-09-14T09:05:00Z`) et
 * non une date de calendrier : on ne fixe donc pas `timeZone: 'UTC'` ici. Choix
 * de fuseau d'affichage documenté (`.claude/rules/frontend/i18n.md`, section
 * Dates) : l'instant est affiché dans le fuseau local du navigateur de
 * l'utilisateur, c'est-à-dire le comportement par défaut de `Intl.DateTimeFormat`
 * lorsque `timeZone` n'est pas précisé.
 */
const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

/**
 * Formate l'horodatage de saisie d'une contribution (`recordedAt`) dans le
 * fuseau local du navigateur, par exemple `14/09/2026 09:05`.
 */
export function formatSocialFundDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}
