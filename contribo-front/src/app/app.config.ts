import {
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import type { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { TranslocoService, provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from '@core/i18n/transloco-http.loader';
import { EspacePersonnelService } from '@api';
import { authInterceptor } from '@core/session/auth.interceptor';
import { SessionService } from '@core/session/session.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
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
    provideAppInitializer(() => {
      const transloco = inject(TranslocoService);
      return firstValueFrom(transloco.load(transloco.getActiveLang()));
    }),
    provideAppInitializer(() => {
      const session = inject(SessionService);
      if (!session.token()) {
        return Promise.resolve();
      }

      const espacePersonnel = inject(EspacePersonnelService);
      return firstValueFrom(
        espacePersonnel.getCurrentUser().pipe(
          catchError(() => {
            session.clear();
            return of(null);
          }),
        ),
      ).then((user) => {
        if (user) {
          session.setUser(user);
        }
      });
    }),
  ],
};
