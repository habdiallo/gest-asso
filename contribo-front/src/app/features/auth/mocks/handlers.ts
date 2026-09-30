import { HttpResponse, http } from 'msw';
import { ErrorCode, LoginResponse } from '@core/api';
import type { CurrentUser, ErrorResponse } from '@core/api';
import {
  findDemoAccount,
  findDemoAccountByRequest,
  isLoginRequest,
} from '@mocks/demo-accounts';

function authenticationRequired() {
  return HttpResponse.json<ErrorResponse>(
    { code: ErrorCode.AuthenticationRequired, message: 'Authentification requise.' },
    { status: 401 },
  );
}

export const authHandlers = [
  http.post('/api/v1/auth/login', async ({ request }): Promise<Response> => {
    const body: unknown = await request.json().catch(() => null);
    if (!isLoginRequest(body)) {
      return HttpResponse.json<ErrorResponse>(
        { code: ErrorCode.ValidationError, message: 'Identifiant et mot de passe invalides.' },
        { status: 400 },
      );
    }
    const account = findDemoAccount(body);
    if (!account) return authenticationRequired();
    return HttpResponse.json<LoginResponse>(
      { expiresIn: 900, user: account.user },
      {
        headers: {
          'Set-Cookie': `__Host-contribo-session=${account.accessToken}; Path=/; Secure; HttpOnly; SameSite=Strict`,
        },
      },
    );
  }),
  http.get('/api/v1/auth/csrf', () =>
    new HttpResponse(null, {
      status: 204,
      headers: { 'Set-Cookie': 'XSRF-TOKEN=mock-csrf-token; Path=/' },
    }),
  ),
  http.post('/api/v1/auth/logout', () =>
    new HttpResponse(null, {
      status: 204,
      headers: { 'Set-Cookie': '__Host-contribo-session=; Path=/; Max-Age=0; Secure; HttpOnly' },
    }),
  ),
  http.get('/api/v1/me', ({ request }): Response => {
    const account = findDemoAccountByRequest(request);
    return account ? HttpResponse.json<CurrentUser>(account.user) : authenticationRequired();
  }),
];
