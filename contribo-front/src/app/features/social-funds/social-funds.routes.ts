import type { Routes } from '@angular/router';

export const SOCIAL_FUNDS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Contribo - Cagnottes',
    loadComponent: () =>
      import('./pages/social-funds-list-page').then((m) => m.SocialFundsListPage),
  },
];
