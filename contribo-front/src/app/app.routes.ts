import type { Routes } from '@angular/router';
import { authenticatedMatch } from '@core/session/authenticated.guard';
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
    // Écran liste des catégories de revenu (T-48), réservé à l'Administrateur
    // (US-REV-001). Nécessite une session active ; la garde de rôle dédiée
    // interdisant les autres rôles (RG-ROLE-002) reste à ajouter par T-49.
    path: NAVIGATION_PATHS.incomeCategories.slice(1),
    canMatch: [authenticatedMatch],
    loadChildren: () =>
      import('@features/income-categories/income-categories.routes').then(
        (m) => m.INCOME_CATEGORIES_ROUTES,
      ),
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
