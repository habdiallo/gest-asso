import { Injectable, inject } from '@angular/core';
import { AuthentificationService } from '@api';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class SessionLogoutService {
  private readonly authenticationService = inject(AuthentificationService);
  private readonly sessionService = inject(SessionService);

  logout(): Observable<void> {
    return this.authenticationService.getCsrfToken().pipe(
      switchMap(() => this.authenticationService.logout()),
      map(() => undefined),
      catchError(() => of(undefined)),
      tap(() => this.sessionService.clear()),
    );
  }
}
