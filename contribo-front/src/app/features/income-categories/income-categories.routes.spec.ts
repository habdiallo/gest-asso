import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import type { CurrentUser, LoginResponse } from '@api';
import { SessionService } from '@core/session/session.service';
import { INCOME_CATEGORIES_ROUTES } from './income-categories.routes';

@Component({ template: '<p>Connexion</p>', changeDetection: ChangeDetectionStrategy.OnPush })
class LoginStub {}

@Component({ template: '<p>Accès refusé</p>', changeDetection: ChangeDetectionStrategy.OnPush })
class AccessDeniedStub {}

function buildLoginResponse(role: CurrentUser['role']): LoginResponse {
  return {
    accessToken: 'session-token-value',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
      userId: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
      association: {
        id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
        name: 'Association Test',
        currency: 'GNF',
      },
      member: {
        id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12',
        firstName: 'Awa',
        lastName: 'Camara',
        displayName: 'Awa Camara',
        incomeCategory: { id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13', label: 'Standard' },
        status: 'ACTIVE',
      },
      role,
      operatorCanRecordPayments: false,
      accountActive: true,
    },
  };
}

describe('INCOME_CATEGORIES_ROUTES guard (RG-ROLE-002)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'categories-de-revenu', children: INCOME_CATEGORIES_ROUTES },
          { path: 'login', component: LoginStub },
          { path: 'acces-refuse', component: AccessDeniedStub },
        ]),
      ],
    });
  });

  it.each(['TREASURER', 'OPERATOR', 'MEMBER'] as const)(
    'redirects a %s to the access-denied screen',
    async (role) => {
      TestBed.inject(SessionService).setSession(buildLoginResponse(role));

      const harness = await RouterTestingHarness.create('/categories-de-revenu');

      expect(harness.routeNativeElement?.textContent).toContain('Accès refusé');
    },
  );

  it('redirects an unauthenticated visitor to the login screen', async () => {
    const harness = await RouterTestingHarness.create('/categories-de-revenu');

    expect(harness.routeNativeElement?.textContent).toContain('Connexion');
  });
});
