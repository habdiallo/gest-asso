import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { Router } from '@angular/router';
import type { UserRole } from '@core/api';
import { SessionService } from './session.service';

export function roleGuard(...allowedRoles: UserRole[]): CanMatchFn {
  return () => {
    const session = inject(SessionService);
    const router = inject(Router);
    const user = session.user();

    if (!user) {
      return router.createUrlTree(['/login']);
    }

    if (session.mustChangePassword()) {
      return router.createUrlTree(['/changer-mot-de-passe']);
    }

    if (!allowedRoles.includes(user.role)) {
      return router.createUrlTree(['/acces-refuse']);
    }

    return true;
  };
}
