import { NAVIGATION_PATHS } from './navigation-paths';
import { sidebarProfilePath } from './sidebar-profile';

describe('sidebarProfilePath', () => {
  it.each(['ADMINISTRATOR', 'TREASURER', 'OPERATOR'] as const)(
    'opens the account page for %s',
    (role) => {
      expect(sidebarProfilePath(role)).toBe(NAVIGATION_PATHS.account);
    },
  );

  it('keeps members on their personal space', () => {
    expect(sidebarProfilePath('MEMBER')).toBe(NAVIGATION_PATHS.memberSpace);
  });

  it('keeps the existing fallback when the session data is not hydrated', () => {
    expect(sidebarProfilePath(null)).toBe(NAVIGATION_PATHS.memberSpace);
  });
});
