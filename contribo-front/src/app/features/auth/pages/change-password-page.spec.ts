import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthentificationService } from '@core/api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { of } from 'rxjs';
import fr from '@assets/i18n/fr.json';
import { NAVIGATION_PATHS } from '@core/navigation/navigation-paths';
import { SessionLogoutService } from '@core/session/session-logout.service';
import { SessionService } from '@core/session/session.service';
import { ChangePasswordPage } from './change-password-page';

async function createFixture(): Promise<{
  fixture: ComponentFixture<ChangePasswordPage>;
  changePassword: ReturnType<typeof vi.fn>;
  setSession: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
}> {
  const changePassword = vi.fn(() =>
    of({ expiresIn: 900, user: {} }) as never,
  );
  const setSession = vi.fn();
  const logout = vi.fn(() => of(undefined));

  await TestBed.configureTestingModule({
    imports: [
      ChangePasswordPage,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      provideRouter([]),
      {
        provide: AuthentificationService,
        useValue: {
          getCsrfToken: () => of(undefined),
          changePassword,
        },
      },
      { provide: SessionService, useValue: { setSession } },
      { provide: SessionLogoutService, useValue: { logout } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ChangePasswordPage);
  fixture.detectChanges();
  return { fixture, changePassword, setSession, logout };
}

function fillPasswordForm(fixture: ComponentFixture<ChangePasswordPage>, value: string): void {
  const newPassword = fixture.nativeElement.querySelector('#new-password') as HTMLInputElement;
  const confirmation = fixture.nativeElement.querySelector(
    '#password-confirmation',
  ) as HTMLInputElement;
  newPassword.value = value;
  newPassword.dispatchEvent(new Event('input'));
  confirmation.value = value;
  confirmation.dispatchEvent(new Event('input'));
}

describe('ChangePasswordPage', () => {
  it('does not submit when the two passwords differ', async () => {
    const { fixture, changePassword } = await createFixture();
    fixture.componentInstance.form.setValue({
      newPassword: 'Changed-Password-123!',
      confirmation: 'Different-Password-123!',
    });
    fixture.componentInstance.submit();

    expect(changePassword).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.hasError('passwordsMismatch')).toBe(true);
  });

  it('changes the password, refreshes the session and navigates to the dashboard', async () => {
    const { fixture, changePassword, setSession } = await createFixture();
    fillPasswordForm(fixture, 'Changed-Password-123!');
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit'),
    );

    expect(changePassword).toHaveBeenCalledWith({ newPassword: 'Changed-Password-123!' });
    expect(setSession).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(NAVIGATION_PATHS.dashboard);
  });

  it('logs out and returns to the login page', async () => {
    const { fixture, logout } = await createFixture();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    (fixture.nativeElement.querySelector('button[type="button"]') as HTMLButtonElement).click();

    expect(logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });
});
