import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EspacePersonnelService } from '@api';
import { SessionService } from '@core/session/session.service';
import { authInterceptor } from '@core/session/auth.interceptor';
import { hydrateCurrentUser } from '../app/app.config';
import {
  demoAccounts,
  findDemoAccount,
  findDemoAccountByAuthorization,
  isLoginRequest,
} from './demo-accounts';

describe('Comptes de démonstration', () => {
  it('couvre les quatre rôles et les deux autorisations Opérateur avec des identités distinctes', () => {
    expect(
      demoAccounts.map(({ identifier, user }) => [
        identifier,
        user.role,
        user.operatorCanRecordPayments,
      ]),
    ).toEqual([
      ['admin.demo', 'ADMINISTRATOR', false],
      ['tresorier.demo', 'TREASURER', false],
      ['operateur.demo', 'OPERATOR', true],
      ['operateur.consultation.demo', 'OPERATOR', false],
      ['membre.demo', 'MEMBER', false],
    ]);
    expect(new Set(demoAccounts.map(({ user }) => user.userId)).size).toBe(5);
    expect(new Set(demoAccounts.map(({ user }) => user.member.id)).size).toBe(5);
    expect(new Set(demoAccounts.map(({ accessToken }) => accessToken)).size).toBe(5);
    for (const account of demoAccounts) {
      expect(account.user.userId).toMatch(
        /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i,
      );
      expect(findDemoAccount({ identifier: account.identifier, password: 'demo-contribo' })).toBe(
        account,
      );
      expect(findDemoAccountByAuthorization(`Bearer ${account.accessToken}`)?.user).toEqual(
        account.user,
      );
    }
  });

  it('refuse les mauvais identifiants sans sélectionner un compte par défaut', () => {
    expect(findDemoAccount({ identifier: 'admin.demo', password: 'incorrect' })).toBeUndefined();
    expect(findDemoAccount({ identifier: 'inconnu', password: 'demo-contribo' })).toBeUndefined();
  });

  it.each([
    null,
    [],
    'json',
    {},
    { identifier: 'a' },
    { identifier: 1, password: 'b' },
    { identifier: '', password: 'b' },
    { identifier: 'a', password: '' },
    { identifier: 'a'.repeat(151), password: 'b' },
    { identifier: 'a', password: 'b'.repeat(201) },
    { identifier: 'a', password: 'b', role: 'ADMINISTRATOR' },
  ])('refuse un corps hors contrat : %j', (body) => {
    expect(isLoginRequest(body)).toBe(false);
  });

  it('accepte les limites inclusives du contrat sans normaliser les credentials', () => {
    expect(isLoginRequest({ identifier: 'a', password: 'b' })).toBe(true);
    expect(isLoginRequest({ identifier: 'a'.repeat(150), password: 'b'.repeat(200) })).toBe(true);
    expect(isLoginRequest({ identifier: '😀'.repeat(150), password: '😀'.repeat(200) })).toBe(true);
    expect(isLoginRequest({ identifier: '😀'.repeat(151), password: 'b' })).toBe(false);
  });

  it.each([
    null,
    '',
    'Bearer',
    'Basic secret',
    'Bearer inconnu',
    'Bearer token extra',
    'Bearer  token',
  ])('refuse un Authorization invalide : %s', (header) => {
    expect(findDemoAccountByAuthorization(header)).toBeUndefined();
  });
});

describe('Restauration des sessions de démonstration via le client applicatif', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.removeItem('contribo-session-token');
  });

  it.each(demoAccounts)('restaure $identifier depuis le seul jeton stocké', async (account) => {
    localStorage.setItem('contribo-session-token', account.accessToken);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    const session = TestBed.inject(SessionService);
    expect(session.user()).toBeNull();
    const hydration = hydrateCurrentUser(session, TestBed.inject(EspacePersonnelService));
    const request = TestBed.inject(HttpTestingController).expectOne('/api/v1/me');
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${account.accessToken}`);
    request.flush(account.user);
    await hydration;
    expect(session.user()).toEqual(account.user);
    expect(session.token()).toBe(account.accessToken);
  });
});
