import type { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Contribo — Connexion',
    loadComponent: () => import('./pages/login-page').then((m) => m.LoginPage),
  },
];
