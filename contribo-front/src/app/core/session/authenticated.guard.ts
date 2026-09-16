import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { SessionService } from './session.service';

/**
 * Sélectionne une route uniquement pour un utilisateur authentifié. Utilisé
 * pour la route racine (`''`) : le tableau de bord (T-16) devient le point
 * d'entrée après connexion, tandis qu'Angular retente la route `''` suivante
 * — la page d'accueil visiteur, inchangée — lorsque `canMatch` refuse.
 * Ne remplace pas `roleGuard`, qui reste responsable des routes protégées
 * par rôle applicatif.
 */
export const authenticatedMatch: CanMatchFn = () => inject(SessionService).isAuthenticated();
