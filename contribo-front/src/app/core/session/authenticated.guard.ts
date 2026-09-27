import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { SessionService } from './session.service';

/**
 * Sélectionne une route uniquement pour un utilisateur authentifié. Le garde
 * permet notamment de protéger `/dashboard` et les features accessibles à
 * tous les rôles authentifiés.
 * Ne remplace pas `roleGuard`, qui reste responsable des routes protégées par
 * rôle applicatif.
 */
export const authenticatedMatch: CanMatchFn = () => inject(SessionService).isAuthenticated();
