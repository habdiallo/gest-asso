import type { Routes } from '@angular/router';

export const MEMBER_SPACE_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Contribo - Mon profil',
    loadComponent: () => import('./pages/profile-page').then((m) => m.ProfilePage),
  },
];
