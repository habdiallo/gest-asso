import type { Routes } from '@angular/router';
import { UserRole } from '@api';
import { authenticatedMatch } from '@core/session/authenticated.guard';
import { roleGuard } from '@core/session/role.guard';
import { NAVIGATION_PATHS } from '@core/navigation/navigation-paths';

export const routes: Routes = [
  {
    path: '',
    // Point d'entrée après connexion (T-16) : le tableau de bord n'est
    // sélectionné que pour un utilisateur authentifié ; sinon Angular
    // retente la route '' suivante, la page d'accueil visiteur.
    canMatch: [authenticatedMatch],
    loadChildren: () =>
      import('@features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('@features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'login',
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    // Écran liste des cagnottes (T-82), route/feature distincte de l'écran
    // des campagnes de cotisation (RG-CAG-001). `roleGuard` redirige vers la
    // connexion sans session, et vers l'accès refusé pour un rôle non listé
    // (le Membre consulte ses propres contributions ailleurs, cf. cahier).
    path: NAVIGATION_PATHS.socialFunds.slice(1),
    canMatch: [roleGuard(UserRole.Administrator, UserRole.Treasurer, UserRole.Operator)],
    loadChildren: () =>
      import('@features/social-funds/social-funds.routes').then((m) => m.SOCIAL_FUNDS_ROUTES),
  },
  {
    path: 'mon-espace',
    // Espace personnel du membre (T-95) : profil en lecture seule, réservé à
    // un utilisateur authentifié, quel que soit son rôle applicatif.
    canMatch: [authenticatedMatch],
    loadChildren: () =>
      import('@features/member-space/member-space.routes').then((m) => m.MEMBER_SPACE_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('@features/shell/shell.routes').then((m) => m.SHELL_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
