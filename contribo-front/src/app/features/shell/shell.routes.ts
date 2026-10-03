import type { Routes } from '@angular/router';
import { sessionHydrationMatch } from '@core/session/authenticated.guard';

export const SHELL_ROUTES: Routes = [
  {
    path: 'acces-refuse',
    pathMatch: 'full',
    canMatch: [sessionHydrationMatch],
    title: 'Contribo — Accès refusé',
    loadComponent: () => import('./pages/access-denied-page').then((m) => m.AccessDeniedPage),
  },
];
