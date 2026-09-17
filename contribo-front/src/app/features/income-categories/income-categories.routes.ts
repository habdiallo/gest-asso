import type { Routes } from '@angular/router';

export const INCOME_CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Contribo — Catégories de revenu',
    loadComponent: () =>
      import('./pages/income-categories-page').then((m) => m.IncomeCategoriesPage),
  },
];
