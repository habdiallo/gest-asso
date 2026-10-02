import { HttpResponse, type HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
let csrfTokenFromResponse: string | null = null;

function csrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CSRF_COOKIE_NAME}=`));

  if (!cookie) {
    return null;
  }

  try {
    return decodeURIComponent(cookie.slice(CSRF_COOKIE_NAME.length + 1));
  } catch {
    return cookie.slice(CSRF_COOKIE_NAME.length + 1);
  }
}

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const token = csrfTokenFromCookie() ?? csrfTokenFromResponse;
  const request =
    MUTATING_METHODS.has(req.method) && !req.headers.has(CSRF_HEADER_NAME) && token
      ? req.clone({ setHeaders: { [CSRF_HEADER_NAME]: token } })
      : req;

  return next(request).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const responseToken = event.headers.get(CSRF_HEADER_NAME);
        if (responseToken) {
          csrfTokenFromResponse = responseToken;
          if (typeof document !== 'undefined') {
            document.cookie = `${CSRF_COOKIE_NAME}=${encodeURIComponent(responseToken)}; path=/; SameSite=Lax`;
          }
        }
      }
    }),
  );
};
