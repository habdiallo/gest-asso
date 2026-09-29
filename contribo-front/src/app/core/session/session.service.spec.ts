import { TestBed } from '@angular/core/testing';
import type { CurrentUser, LoginResponse } from '@api';
import {
  CurrencyCode,
  LoginResponse as LoginResponseNamespace,
  MemberStatus,
  UserRole,
} from '@api';
import { SessionService } from './session.service';

function buildLoginResponse(overrides: Partial<CurrentUser> = {}): LoginResponse {
  const user: CurrentUser = {
    userId: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    association: {
      id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
      name: 'Association Test',
      currency: CurrencyCode.Gnf,
    },
    member: {
      id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12',
      firstName: 'Awa',
      lastName: 'Camara',
      displayName: 'Awa Camara',
      incomeCategory: { id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13', label: 'Standard' },
      status: MemberStatus.Active,
    },
    role: UserRole.Administrator,
    operatorCanRecordPayments: false,
    accountActive: true,
    ...overrides,
  };

  return {
    accessToken: 'session-token-value',
    tokenType: LoginResponseNamespace.TokenTypeEnum.Bearer,
    expiresIn: 3600,
    user,
  };
}

describe('SessionService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has no session when nothing is stored', () => {
    const service = TestBed.inject(SessionService);

    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.canRecordPayments()).toBe(false);
  });

  it('does not expose a session cookie to JavaScript', () => {
    localStorage.setItem('contribo-session-token', 'stored-token');
    const service = TestBed.inject(SessionService);

    expect(service.token()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('stores only the user on setSession', () => {
    const service = TestBed.inject(SessionService);
    const response = buildLoginResponse();

    service.setSession(response);

    expect(service.token()).toBeNull();
    expect(service.user()).toEqual(response.user);
    expect(service.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('contribo-session-token')).toBeNull();
  });

  it('updates the hydrated user without exposing a token', () => {
    const service = TestBed.inject(SessionService);
    const response = buildLoginResponse();
    service.setSession(response);

    const hydratedUser = { ...response.user, operatorCanRecordPayments: true };
    service.setUser(hydratedUser);

    expect(service.user()).toEqual(hydratedUser);
    expect(service.token()).toBeNull();
  });

  it('exposes canRecordPayments derived from the hydrated user, updated by setUser', () => {
    const service = TestBed.inject(SessionService);
    const response = buildLoginResponse({
      role: UserRole.Operator,
      operatorCanRecordPayments: false,
    });
    service.setSession(response);

    expect(service.canRecordPayments()).toBe(false);

    service.setUser({ ...response.user, operatorCanRecordPayments: true });

    expect(service.canRecordPayments()).toBe(true);
  });

  it('clears the session without storing a token', () => {
    const service = TestBed.inject(SessionService);
    service.setSession(buildLoginResponse());

    service.clear();

    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('contribo-session-token')).toBeNull();
  });
});
