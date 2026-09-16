import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import type { CurrentUser, LoginResponse } from '@api';
import { roleGuard } from './role.guard';
import { SessionService } from './session.service';

@Component({ template: '<p>Écran protégé</p>', changeDetection: ChangeDetectionStrategy.OnPush })
class ProtectedStub {}

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

describe('roleGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'protege',
            component: ProtectedStub,
            canMatch: [roleGuard('ADMINISTRATOR', 'TREASURER')],
          },
          { path: 'login', component: LoginStub },
          { path: 'acces-refuse', component: AccessDeniedStub },
        ]),
      ],
    });
  });

  it('redirects to the login screen when no session is active', async () => {
    const harness = await RouterTestingHarness.create('/protege');

    expect(harness.routeNativeElement?.textContent).toContain('Connexion');
  });

  it('redirects to the access-denied screen for a role outside the allow-list', async () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('OPERATOR'));

    const harness = await RouterTestingHarness.create('/protege');

    expect(harness.routeNativeElement?.textContent).toContain('Accès refusé');
  });

  it('allows access for a role included in the allow-list', async () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('ADMINISTRATOR'));

    const harness = await RouterTestingHarness.create('/protege');

    expect(harness.routeNativeElement?.textContent).toContain('Écran protégé');
  });
});
