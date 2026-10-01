import type { CurrentUser } from '@core/api';
import { NAVIGATION_PATHS } from './navigation-paths';

export const SIDEBAR_ROLE_LABEL_KEYS: Record<CurrentUser['role'], string> = {
  ADMINISTRATOR: 'shell.sidebar.roles.administrator',
  TREASURER: 'shell.sidebar.roles.treasurer',
  OPERATOR: 'shell.sidebar.roles.operator',
  MEMBER: 'shell.sidebar.roles.member',
};

export function sidebarProfilePath(role: CurrentUser['role'] | null): string {
  return role === 'MEMBER' || role === null
    ? NAVIGATION_PATHS.memberSpace
    : NAVIGATION_PATHS.account;
}
