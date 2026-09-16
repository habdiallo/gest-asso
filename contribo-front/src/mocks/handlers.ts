import type { HttpHandler } from 'msw';

import { homeHandlers } from '@features/home/mocks/handlers';
import { authHandlers } from '@features/auth/mocks/handlers';

/**
 * Point d'agrégation des handlers MSW actifs. Chaque feature qui consomme l'API
 * en mode mock ajoute ses handlers ici depuis son propre dossier
 * `features/<feature>/mocks/handlers.ts`.
 */
export const handlers: HttpHandler[] = [...authHandlers, ...homeHandlers];
