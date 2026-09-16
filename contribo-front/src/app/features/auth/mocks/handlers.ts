import { HttpResponse, http } from 'msw';
import { ErrorCode, LoginResponse } from '@api';
import type { CurrentUser, ErrorResponse } from '@api';
import {
  findDemoAccount,
  findDemoAccountByAuthorization,
  isLoginRequest,
} from '../../../../mocks/demo-accounts';

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
    return HttpResponse.json<LoginResponse>({
      accessToken: account.accessToken,
      tokenType: LoginResponse.TokenTypeEnum.Bearer,
      expiresIn: 3600,
      user: account.user,
    });
  }),
  http.get('/api/v1/me', ({ request }): Response => {
    const account = findDemoAccountByAuthorization(request.headers.get('Authorization'));
    return account ? HttpResponse.json<CurrentUser>(account.user) : authenticationRequired();
  }),
];
