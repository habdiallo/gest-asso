import { inject } from '@angular/core';
import type { RedirectFunction, Routes } from '@angular/router';
import { UserRole } from '@core/api';
import {
  activeSessionMatch,
  authenticatedMatch,
  passwordChangeMatch,
} from '@core/session/authenticated.guard';
import { roleGuard } from '@core/session/role.guard';
import { NAVIGATION_PATHS } from '@core/navigation/navigation-paths';
import { SessionService } from '@core/session/session.service';

const sessionEntryRedirect: RedirectFunction = () => {
  const session = inject(SessionService);
  if (!session.isAuthenticated()) {
    return 'login';
  }
  return session.mustChangePassword()
    ? NAVIGATION_PATHS.passwordChange.slice(1)
    : NAVIGATION_PATHS.dashboard.slice(1);
};

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    // Le tableau de bord est le point d'entrée d'une session active. Angular
    // ne permet pas de combiner `canMatch` et `redirectTo`, le redirect
    // fonctionnel porte donc directement la décision de session.
    redirectTo: sessionEntryRedirect,
  },
  {
    path: NAVIGATION_PATHS.dashboard.slice(1),
    canMatch: [activeSessionMatch],
    loadChildren: () =>
      import('@features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: NAVIGATION_PATHS.passwordChange.slice(1),
    canMatch: [passwordChangeMatch],
    loadComponent: () =>
      import('@features/auth/pages/change-password-page').then((m) => m.ChangePasswordPage),
  },
  {
    // Écran liste des catégories de revenu (T-48), réservé à l'Administrateur
    // (US-REV-001). `roleGuard` protège cette route montée, et la même garde
    // est répétée dans `income-categories.routes.ts` pour couvrir l'écran de
    // façon transverse, indépendamment de sa composition (RG-ROLE-002, T-49).
    path: NAVIGATION_PATHS.incomeCategories.slice(1),
    canMatch: [activeSessionMatch, roleGuard('ADMINISTRATOR')],
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
    // Écran liste des utilisateurs (T-52), réservé à l'Administrateur via
    // `roleGuard` dans les routes de la feature (RG-ROLE-002).
    path: 'roles-utilisateurs',
    loadChildren: () =>
      import('@features/roles-users/roles-users.routes').then((m) => m.ROLES_USERS_ROUTES),
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
    path: 'campagnes',
    loadChildren: () =>
      import('@features/campaigns/campaigns.routes').then((m) => m.CAMPAIGNS_ROUTES),
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
    path: NAVIGATION_PATHS.account.slice(1),
    canMatch: [roleGuard(UserRole.Administrator, UserRole.Treasurer, UserRole.Operator)],
    loadChildren: () => import('@features/account/account.routes').then((m) => m.ACCOUNT_ROUTES),
  },
  {
    path: 'mon-espace',
    // Espace personnel du membre (T-95) : profil en lecture seule, réservé à
    // un utilisateur authentifié, quel que soit son rôle applicatif.
    canMatch: [activeSessionMatch],
    loadChildren: () =>
      import('@features/member-space/member-space.routes').then((m) => m.MEMBER_SPACE_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('@features/shell/shell.routes').then((m) => m.SHELL_ROUTES),
  },
  { path: '**', redirectTo: sessionEntryRedirect },
];
