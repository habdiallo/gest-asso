import type { Routes } from '@angular/router';
import { UserRole } from '@api';
import { roleGuard } from '@core/session/role.guard';

export const ROLES_USERS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Contribo — Utilisateurs et rôles',
    // Écran réservé à l'Administrateur (RG-ROLE-002 : seul un Administrateur
    // peut attribuer/modifier les rôles ; T-52 se limite à la consultation).
    canMatch: [roleGuard(UserRole.Administrator)],
    loadComponent: () => import('./pages/roles-users-page').then((m) => m.RolesUsersPage),
  },
];
