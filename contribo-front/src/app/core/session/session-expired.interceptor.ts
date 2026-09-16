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

      if (isAuthenticationError && !req.url.endsWith(LOGIN_REQUEST_PATH)) {
        session.clear();
        void router.navigateByUrl('/login');
      }

      return throwError(() => error);
    }),
  );
};
