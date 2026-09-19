import { formatMemberPaymentCalendarDate, formatMemberPaymentDateTime } from './member-payment-dates';

describe('formatMemberPaymentCalendarDate', () => {
  it('formats a calendar date without shifting the day', () => {
    expect(formatMemberPaymentCalendarDate('2026-09-12')).toBe('12 septembre 2026');
  });
});

describe('formatMemberPaymentDateTime', () => {
  it('formats an ISO instant in French date and time style, in the local time zone', () => {
    const isoInstant = '2026-09-12T14:32:00Z';

    const result = formatMemberPaymentDateTime(isoInstant);

    // La valeur attendue est calculée avec le même fuseau local que
    // l'implémentation (`Intl.DateTimeFormat` sans `timeZone` explicite,
    // T-74) : le test reste correct quel que soit le fuseau d'exécution,
    // sans reproduire pour autant la logique de formatage testée.
    const expectedDate = new Date(isoInstant);
    const day = expectedDate.getDate().toString().padStart(2, '0');
    const month = (expectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = expectedDate.getFullYear();
    const hours = expectedDate.getHours().toString().padStart(2, '0');
    const minutes = expectedDate.getMinutes().toString().padStart(2, '0');

    expect(result).toContain(`${day}/${month}/${year}`);
    expect(result).toContain(`${hours}:${minutes}`);
  });

  it('formats two distinct instants differently', () => {
    const first = formatMemberPaymentDateTime('2026-09-12T09:05:00Z');
    const second = formatMemberPaymentDateTime('2026-09-12T18:30:00Z');

    expect(first).not.toEqual(second);
  });
});
