import type { HttpHandler } from 'msw';

import { authHandlers } from '@features/auth/mocks/handlers';
import { campaignsHandlers } from '@features/campaigns/mocks/handlers';
import { dashboardHandlers } from '@features/dashboard/mocks/handlers';

/**
 * Point d'agrégation des handlers MSW actifs. Chaque feature qui consomme l'API
 * en mode mock ajoute ses handlers ici depuis son propre dossier
 * `features/<feature>/mocks/handlers.ts`.
 */
export const handlers: HttpHandler[] = [
  ...authHandlers,
  ...dashboardHandlers,
  ...campaignsHandlers,
];
