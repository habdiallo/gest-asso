import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EspacePersonnelService } from '@core/api';
import { catchError, firstValueFrom, of } from 'rxjs';
import { SessionService } from './session.service';

/**
 * Hydrate l'utilisateur courant depuis /api/v1/me. Seule une erreur 401
 * invalide la session portée par cookie, une panne transitoire ne déconnecte
 * pas un utilisateur dont la session reste valide.
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

@Injectable({ providedIn: 'root' })
export class SessionHydrationService {
  private readonly session = inject(SessionService);
  private readonly espacePersonnel = inject(EspacePersonnelService);
  private hydration: Promise<void> | null = null;

  ensureHydrated(): Promise<void> {
    if (this.session.isAuthenticated()) {
      return Promise.resolve();
    }

    this.hydration ??= hydrateCurrentUser(this.session, this.espacePersonnel);
    return this.hydration;
  }
}
