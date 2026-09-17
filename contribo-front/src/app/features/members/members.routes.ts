import type { Routes } from '@angular/router';

export const MEMBERS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Contribo — Membres',
    loadComponent: () => import('./pages/members-list-page').then((m) => m.MembersListPage),
  },
  {
    // Écran fiche membre (T-27, US-MEM-003) : accessible depuis une ligne de
    // la liste des membres via son identifiant.
    path: ':memberId',
    title: 'Contribo — Fiche membre',
    loadComponent: () => import('./pages/member-detail-page').then((m) => m.MemberDetailPage),
  },
];
