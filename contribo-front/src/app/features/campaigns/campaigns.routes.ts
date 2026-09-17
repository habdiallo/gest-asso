import type { Routes } from '@angular/router';
import { UserRole } from '@api';
import { roleGuard } from '@core/session/role.guard';

/**
 * Écran liste des campagnes (T-57) : réservé à l'Administrateur, au
 * Trésorier et à l'Opérateur, conformément aux items de navigation
 * (`core/navigation/navigation-items.ts`) et à US-COT-004. Le Membre
 * consulte ses propres cotisations via son espace personnel, pas cet écran.
 */
export const CAMPAIGNS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Contribo - Campagnes',
    canMatch: [roleGuard(UserRole.Administrator, UserRole.Treasurer, UserRole.Operator)],
    loadComponent: () => import('./pages/campaigns-list-page').then((m) => m.CampaignsListPage),
  },
  {
    // Écran détail de campagne (T-60) : mêmes rôles autorisés que la liste,
    // US-COT-004 ; onglets barème/cotisations/bilan (`campaign-detail-page.ts`).
    path: ':campaignId',
    title: 'Contribo - Détail de campagne',
    canMatch: [roleGuard(UserRole.Administrator, UserRole.Treasurer, UserRole.Operator)],
    loadComponent: () => import('./pages/campaign-detail-page').then((m) => m.CampaignDetailPage),
  },
];
