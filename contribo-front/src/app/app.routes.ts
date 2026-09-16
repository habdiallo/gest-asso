import type { Routes } from '@angular/router';
import { authenticatedMatch } from '@core/session/authenticated.guard';

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
    path: '',
    loadChildren: () => import('@features/shell/shell.routes').then((m) => m.SHELL_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
