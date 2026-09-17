import type { Routes } from '@angular/router';
import { UserRole } from '@api';
import { roleGuard } from '@core/session/role.guard';

/**
 * Écran liste des catégories de revenu (T-48), réservé à l'Administrateur
 * (US-REV-001, RG-ROLE-002). `app.routes.ts` applique déjà `roleGuard`
 * sur la route montée `/categories-de-revenu` ; la garde est répétée ici,
 * au niveau de la feature, pour que l'écran reste protégé quelle que soit
 * la manière dont ses routes sont composées dans l'application (T-49).
 */
export const INCOME_CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Contribo — Catégories de revenu',
    canMatch: [roleGuard(UserRole.Administrator)],
    loadComponent: () =>
      import('./pages/income-categories-page').then((m) => m.IncomeCategoriesPage),
  },
];
