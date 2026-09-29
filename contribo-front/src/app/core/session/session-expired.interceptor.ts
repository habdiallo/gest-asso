import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionService } from './session.service';

const LOGIN_REQUEST_PATH = '/auth/login';

export const sessionExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const isAuthenticationError = error instanceof HttpErrorResponse && error.status === 401;
      const requiresPasswordChange =
        error instanceof HttpErrorResponse &&
        error.status === 403 &&
        error.error?.code === 'PASSWORD_CHANGE_REQUIRED';

      if (isAuthenticationError && !req.url.endsWith(LOGIN_REQUEST_PATH)) {
        session.clear();
        void router.navigateByUrl('/login');
      } else if (requiresPasswordChange) {
        void router.navigateByUrl('/changer-mot-de-passe');
      }

      return throwError(() => error);
    }),
  );
};
