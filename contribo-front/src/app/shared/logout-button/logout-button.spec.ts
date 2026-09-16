import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SessionService } from '@core/session/session.service';
import { LogoutButton } from './logout-button';

describe('LogoutButton', () => {
  let session: SessionService;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [LogoutButton],
      providers: [provideRouter([])],
    });

    session = TestBed.inject(SessionService);
    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');

    session.setSession({
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
        role: 'ADMINISTRATOR',
        operatorCanRecordPayments: false,
        accountActive: true,
      },
    });
  });

  it('renders an explicit "Se déconnecter" action', () => {
    const fixture = TestBed.createComponent(LogoutButton);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.textContent).toContain('Se déconnecter');
  });

  it('clears the session and redirects to the login screen when activated', () => {
    const fixture = TestBed.createComponent(LogoutButton);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(session.token()).toBeNull();
    expect(session.user()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });
});
