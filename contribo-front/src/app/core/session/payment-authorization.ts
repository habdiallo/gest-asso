import { UserRole } from '@api';
import type { CurrentUser } from '@api';

export function canRecordPayments(user: CurrentUser | null): boolean {
  if (!user) {
    return false;
  }

  if (user.role === UserRole.Operator) {
    return user.operatorCanRecordPayments;
  }

  return user.role === UserRole.Administrator || user.role === UserRole.Treasurer;
}
