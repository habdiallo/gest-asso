import type { Routes } from '@angular/router';
import { activeSessionMatch, sessionHydrationMatch } from '@core/session/authenticated.guard';

export const SHELL_ROUTES: Routes = [
  {
    path: 'plus',
    pathMatch: 'full',
    canMatch: [activeSessionMatch],
    title: 'Contribo - Plus',
    loadComponent: () => import('./pages/plus-page').then((m) => m.PlusPage),
  },
  {
    path: 'acces-refuse',
    pathMatch: 'full',
    canMatch: [sessionHydrationMatch],
    title: 'Contribo — Accès refusé',
    loadComponent: () => import('./pages/access-denied-page').then((m) => m.AccessDeniedPage),
  },
];
