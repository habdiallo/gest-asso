import type { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Contribo — Tableau de bord',
    loadComponent: () => import('./pages/dashboard-page').then((m) => m.DashboardPage),
  },
];
