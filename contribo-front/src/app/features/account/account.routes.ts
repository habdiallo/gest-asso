import type { Routes } from '@angular/router';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Contribo - Mon accès',
    loadComponent: () => import('./pages/account-page').then((m) => m.AccountPage),
  },
];
