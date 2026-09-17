import type { Routes } from '@angular/router';

export const SOCIAL_FUNDS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Contribo - Cagnottes',
    loadComponent: () =>
      import('./pages/social-funds-list-page').then((m) => m.SocialFundsListPage),
  },
  {
    // Écran suivi de cagnotte (T-91) : total collecté, nombre de contributeurs
    // et liste des contributions (US-CAG-003), mêmes rôles autorisés que la
    // liste puisque cette route hérite du `roleGuard` posé sur `app.routes.ts`.
    path: ':socialFundId',
    title: 'Contribo - Suivi de cagnotte',
    loadComponent: () =>
      import('./pages/social-fund-detail-page').then((m) => m.SocialFundDetailPage),
  },
];
