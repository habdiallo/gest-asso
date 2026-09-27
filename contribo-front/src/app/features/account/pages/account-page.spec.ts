import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CurrencyCode, MemberStatus, UserRole } from '@api';
import type { CurrentUser } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { SessionService } from '@core/session/session.service';
import fr from '../../../../assets/i18n/fr.json';
import { AccountPage } from './account-page';

function buildCurrentUser(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return {
    userId: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    association: {
      id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
      name: 'Association Test',
      currency: CurrencyCode.Gnf,
    },
    member: {
      id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12',
      firstName: 'Amadou',
      lastName: 'Diallo',
      displayName: 'Amadou Diallo',
      incomeCategory: { id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13', label: 'Standard' },
      status: MemberStatus.Active,
    },
    role: UserRole.Administrator,
    operatorCanRecordPayments: false,
    accountActive: true,
    ...overrides,
  };
}

async function createFixture(user: CurrentUser | null): Promise<ComponentFixture<AccountPage>> {
  await TestBed.configureTestingModule({
    imports: [
      AccountPage,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [provideRouter([])],
  }).compileComponents();

  const session = TestBed.inject(SessionService);
  if (user) {
    session.setUser(user);
  } else {
    session.clear();
  }
  const fixture = TestBed.createComponent(AccountPage);
  fixture.detectChanges();
  return fixture;
}

describe('AccountPage', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders the account identity, role, association, theme and read-only GNF currency', async () => {
    const fixture = await createFixture(buildCurrentUser());
    const root: HTMLElement = fixture.nativeElement;

    expect(root.textContent).toContain('Amadou Diallo');
    expect(root.textContent).toContain('Compte actif');
    expect(root.textContent).toContain('Administrateur');
    expect(root.textContent).toContain('Association Test');
    expect(root.textContent).toContain('GNF - Franc Guinéen');
    expect(root.querySelector('input, select, textarea')).toBeNull();
  });

  it('shows an accessible error without session data', async () => {
    const fixture = await createFixture(null);

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger les informations de votre compte',
    );
  });

  it('keeps the theme and logout actions available', async () => {
    const fixture = await createFixture(buildCurrentUser());
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    const actionButtons = fixture.nativeElement.querySelectorAll('app-action-button button');
    const themeButton = actionButtons[0] as HTMLButtonElement;
    const logoutButton = actionButtons[1] as HTMLButtonElement;

    expect(themeButton.textContent).toContain('Changer de thème');
    expect(logoutButton.textContent).toContain('Se déconnecter');
    expect(themeButton.className).toContain('h-11');
    expect(themeButton.className).toContain('min-w-32');
    expect(logoutButton.className).toContain('h-11');
    expect(logoutButton.className).toContain('min-w-32');
    expect(logoutButton.className).toContain('text-error');
    themeButton.click();
    fixture.detectChanges();
    expect(document.documentElement.dataset['theme']).toBe('light');

    logoutButton.click();
    expect(TestBed.inject(SessionService).user()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });
});
