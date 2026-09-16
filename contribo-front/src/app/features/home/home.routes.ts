import type { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Contribo — Gestion associative',
    loadComponent: () => import('./pages/home-page').then((m) => m.HomePage),
  },
];
