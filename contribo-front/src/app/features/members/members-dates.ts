import { formatCalendarDate as formatCoreCalendarDate } from '@core/formatting/calendar-date';

/**
 * Formate une date de calendrier (`format: date`, `contributionDate` d'une
 * contribution) sans décalage de jour : la valeur est interprétée à minuit
 * UTC puis affichée dans le même fuseau.
 */
export function formatMemberCalendarDate(value: string): string {
  return formatCoreCalendarDate(value);
}
