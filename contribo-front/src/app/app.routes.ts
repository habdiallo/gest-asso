import type { Routes } from '@angular/router';
import { authenticatedMatch } from '@core/session/authenticated.guard';
import { roleGuard } from '@core/session/role.guard';

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
    // Écran liste des membres (T-21, US-MEM-002) : réservé aux rôles qui
    // gèrent ou consultent le répertoire associatif ; le Membre dispose de
    // son propre espace personnel (`/mon-espace`), pas de ce répertoire.
    path: 'membres',
    canMatch: [roleGuard('ADMINISTRATOR', 'TREASURER', 'OPERATOR')],
    loadChildren: () => import('@features/members/members.routes').then((m) => m.MEMBERS_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('@features/shell/shell.routes').then((m) => m.SHELL_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
