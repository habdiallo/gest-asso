import { formatCalendarDate } from './calendar-date';

describe('formatCalendarDate', () => {
  it('formats a calendar date in French without shifting the day', () => {
    expect(formatCalendarDate('2026-09-12')).toBe('12 septembre 2026');
  });

  it('formats dates at the beginning and end of a year consistently', () => {
    expect(formatCalendarDate('2026-01-01')).toBe('1 janvier 2026');
    expect(formatCalendarDate('2026-12-31')).toBe('31 décembre 2026');
  });
});
