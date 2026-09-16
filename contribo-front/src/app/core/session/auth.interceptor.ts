import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { SessionService } from './session.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(SessionService).token();

  if (!token) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
