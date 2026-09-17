import type { Routes } from '@angular/router';

export const MEMBERS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Contribo — Membres',
    loadComponent: () => import('./pages/members-list-page').then((m) => m.MembersListPage),
  },
];
