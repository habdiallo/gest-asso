import { formatCalendarDate as formatCoreCalendarDate } from '@core/formatting/calendar-date';

/**
 * Formate une date de calendrier (`format: date`, `paymentDate` d'un
 * règlement) sans décalage de jour : la valeur est interprétée à minuit UTC
 * puis affichée dans le même fuseau.
 */
export function formatMemberPaymentCalendarDate(value: string): string {
  return formatCoreCalendarDate(value);
}

/**
 * Formateur de l'horodatage d'enregistrement d'un règlement (`recordedAt`,
 * T-74, RG-PAY-008). Contrairement à `calendarDateFormatter`, `format:
 * date-time` représente un instant absolu (ISO 8601 avec fuseau, par exemple
 * `2026-09-12T14:32:00Z`) et non une date de calendrier : on ne fixe donc pas
 * `timeZone: 'UTC'` ici. Choix de fuseau d'affichage documenté
 * (`.claude/rules/frontend/i18n.md`, section Dates) : l'instant est affiché
 * dans le fuseau local du navigateur de l'utilisateur, c'est-à-dire le
 * comportement par défaut de `Intl.DateTimeFormat` lorsque `timeZone` n'est
 * pas précisé.
 */
const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

/**
 * Formate l'horodatage de saisie d'un règlement (`recordedAt`) dans le
 * fuseau local du navigateur, par exemple `12/09/2026 14:32`.
 */
export function formatMemberPaymentDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}
