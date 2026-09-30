import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import type { CurrentUser, LoginResponse } from '@core/api';
import { authenticatedMatch } from './authenticated.guard';
import { SessionService } from './session.service';

@Component({
  template: '<p>Tableau de bord</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DashboardStub {}

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

describe('authenticatedMatch', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'dashboard', canMatch: [authenticatedMatch], component: DashboardStub },
          { path: 'login', component: DashboardStub },
          { path: '**', redirectTo: 'login' },
        ]),
      ],
    });
  });

  it('does not match the dashboard route when no session is active', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');

    expect(TestBed.inject(Router).url).toBe('/login');
    expect(harness.routeNativeElement?.textContent).toContain('Tableau de bord');
  });

  it('matches the dashboard route once a session is active', async () => {
    TestBed.inject(SessionService).setSession(buildLoginResponse('MEMBER'));

    const harness = await RouterTestingHarness.create('/dashboard');

    expect(harness.routeNativeElement?.textContent).toContain('Tableau de bord');
  });
});
