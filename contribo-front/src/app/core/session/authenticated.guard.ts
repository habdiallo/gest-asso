import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { SessionService } from './session.service';
import { SessionHydrationService } from './session-hydration';

/**
 * Sélectionne une route uniquement pour un utilisateur authentifié. Le garde
 * permet notamment de protéger `/dashboard` et les features accessibles à
 * tous les rôles authentifiés.
 * Ne remplace pas `roleGuard`, qui reste responsable des routes protégées par
 * rôle applicatif.
 */
export const authenticatedMatch: CanMatchFn = () => {
  const session = inject(SessionService);
  return inject(SessionHydrationService)
    .ensureHydrated()
    .then(() => session.isAuthenticated());
};

export const activeSessionMatch: CanMatchFn = () => {
  const session = inject(SessionService);
  return inject(SessionHydrationService)
    .ensureHydrated()
    .then(() => session.isAuthenticated() && !session.mustChangePassword());
};

export const passwordChangeMatch: CanMatchFn = () => {
  const session = inject(SessionService);
  return inject(SessionHydrationService)
    .ensureHydrated()
    .then(() => session.isAuthenticated() && session.mustChangePassword());
};

/**
 * Hydrate une route publique qui doit conserver le shell authentifié, sans
 * imposer de condition d'accès à la route elle-même.
 */
export const sessionHydrationMatch: CanMatchFn = () =>
  inject(SessionHydrationService)
    .ensureHydrated()
    .then(() => true);
