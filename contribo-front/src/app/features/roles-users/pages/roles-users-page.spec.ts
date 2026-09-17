import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { UserRole, UtilisateursEtRlesService } from '@api';
import type { UserAccount, UserAccountPage } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { RolesUsersPage } from './roles-users-page';

function buildAccount(overrides: Partial<UserAccount> = {}): UserAccount {
  return {
    id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    role: UserRole.Administrator,
    operatorCanRecordPayments: false,
    active: true,
    member: { id: 'b5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', displayName: 'Awa Camara' },
    ...overrides,
  };
}

function buildPage(
  items: UserAccount[],
  overrides: Partial<UserAccountPage['page']> = {},
): UserAccountPage {
  return {
    items,
    page: { number: 0, size: 20, totalElements: items.length, totalPages: 1, ...overrides },
  };
}

async function createFixture(
  listUsers: () => ReturnType<UtilisateursEtRlesService['listUsers']>,
): Promise<ComponentFixture<RolesUsersPage>> {
  await TestBed.configureTestingModule({
    imports: [
      RolesUsersPage,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      {
        provide: UtilisateursEtRlesService,
        useValue: { listUsers } as unknown as UtilisateursEtRlesService,
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(RolesUsersPage);
  fixture.detectChanges();
  return fixture;
}

describe('RolesUsersPage', () => {
  it('shows a loading state while the request is pending', async () => {
    const pending = new Subject<UserAccountPage>();
    const fixture = await createFixture(() => pending.asObservable() as never);

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Chargement des utilisateurs',
    );
  });

  it('shows an error state when the API call fails', async () => {
    const fixture = await createFixture(
      () => throwError(() => new Error('network error')) as never,
    );
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger la liste des utilisateurs',
    );
  });

  it('shows the empty-list message when no user matches', async () => {
    const fixture = await createFixture(() => of(buildPage([], { totalElements: 0 })) as never);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucun utilisateur ne correspond');
  });

  it('renders the applicative role, not the associative role, for each user', async () => {
    const page = buildPage([
      buildAccount({
        id: 'c5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12',
        role: UserRole.Operator,
        operatorCanRecordPayments: true,
        member: { id: 'd5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13', displayName: 'Fatou Sow' },
      }),
    ]);
    const fixture = await createFixture(() => of(page) as never);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Fatou Sow');
    expect(root.textContent).toContain('Opérateur');
    expect(root.textContent).toContain('Autorisé');
  });

  it('shows "-" for the operator authorization column outside the Operator role', async () => {
    const page = buildPage([buildAccount({ role: UserRole.Treasurer })]);
    const fixture = await createFixture(() => of(page) as never);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('—');
  });

  it('renders the account status', async () => {
    const page = buildPage([buildAccount({ active: false })]);
    const fixture = await createFixture(() => of(page) as never);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Inactif');
  });

  it('keeps keyboard focus on the pagination control while the next page loads', async () => {
    const firstPage = buildPage([buildAccount()], { number: 0, totalPages: 2, totalElements: 21 });
    const pending = new Subject<UserAccountPage>();
    let callCount = 0;
    const fixture = await createFixture(
      () => (callCount++ === 0 ? of(firstPage) : pending.asObservable()) as never,
    );
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const nextButton = Array.from(root.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Suivant'),
    ) as HTMLButtonElement;
    expect(nextButton).toBeTruthy();

    nextButton.focus();
    expect(document.activeElement).toBe(nextButton);

    nextButton.click();
    fixture.detectChanges();

    // Le bouton reste dans le DOM et gardé focusable (aria-disabled, pas
    // l'attribut natif disabled) pendant le rechargement de la page suivante.
    expect(nextButton.isConnected).toBe(true);
    expect(nextButton.hasAttribute('disabled')).toBe(false);
    expect(nextButton.getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(nextButton);

    pending.next(buildPage([buildAccount()], { number: 1, totalPages: 2, totalElements: 21 }));
    pending.complete();
    fixture.detectChanges();

    expect(document.activeElement).toBe(nextButton);
    expect(nextButton.getAttribute('aria-disabled')).toBe('true');
  });
});
