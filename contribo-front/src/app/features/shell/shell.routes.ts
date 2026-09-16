import type { Routes } from '@angular/router';

export const SHELL_ROUTES: Routes = [
  {
    path: 'acces-refuse',
    pathMatch: 'full',
    title: 'Contribo — Accès refusé',
    loadComponent: () => import('./pages/access-denied-page').then((m) => m.AccessDeniedPage),
  },
];
