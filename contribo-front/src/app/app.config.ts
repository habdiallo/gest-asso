import {
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import type { ApplicationConfig } from '@angular/core';
import {
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
  withXsrfConfiguration,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { TranslocoService, provideTransloco } from '@jsverse/transloco';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';
import { TranslocoHttpLoader } from '@core/i18n/transloco-http.loader';
import { EspacePersonnelService } from '@core/api';
import { authInterceptor } from '@core/session/auth.interceptor';
import { sessionExpiredInterceptor } from '@core/session/session-expired.interceptor';
import { SessionService } from '@core/session/session.service';

import { routes } from './app.routes';

/**
 * Hydrate l'utilisateur courant depuis /api/v1/me. Seule une erreur 401 invalide la
 * session portée par cookie : une panne transitoire (5xx, erreur réseau) ne doit pas
 * déconnecter un utilisateur dont la session reste valide.
 */
export function hydrateCurrentUser(
  session: SessionService,
  espacePersonnel: EspacePersonnelService,
): Promise<void> {
  return firstValueFrom(
    espacePersonnel.getCurrentUser().pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          session.clear();
        }
        return of(null);
      }),
    ),
  ).then((user) => {
    if (user) {
      session.setUser(user);
    }
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      withInterceptors([authInterceptor, sessionExpiredInterceptor]),
    ),
    provideRouter(routes),
    provideTransloco({
      config: {
        availableLangs: ['fr'],
        defaultLang: 'fr',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideTranslocoMessageformat({ locales: 'fr' }),
    provideAppInitializer(() => {
      const transloco = inject(TranslocoService);
      return firstValueFrom(transloco.load(transloco.getActiveLang()));
    }),
    provideAppInitializer(() => {
      const session = inject(SessionService);
      const espacePersonnel = inject(EspacePersonnelService);
      return hydrateCurrentUser(session, espacePersonnel);
    }),
  ],
};
