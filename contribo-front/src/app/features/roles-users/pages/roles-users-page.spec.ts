import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { UserRole, UtilisateursEtRlesService } from '@api';
import type { UserAccount, UserAccountPage } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { RolesUsersPage } from './roles-users-page';

/*
 * jsdom (Vitest/`@angular/build:unit-test`) n'implémente pas `showModal()`/`close()`
 * de `HTMLDialogElement` (https://github.com/jsdom/jsdom/issues/3294). Même correctif
 * minimal que `form-dialog.spec.ts` pour permettre l'ouverture de la fiche de rôle (T-53)
 * dans ces tests, sans vérifier le comportement natif réel (délégué au navigateur).
 */
if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement): void {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement): void {
    if (!this.hasAttribute('open')) {
      return;
    }
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

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
  updateUserAccess?: (
    ...args: Parameters<UtilisateursEtRlesService['updateUserAccess']>
  ) => ReturnType<UtilisateursEtRlesService['updateUserAccess']>,
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
        useValue: { listUsers, updateUserAccess } as unknown as UtilisateursEtRlesService,
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

  describe('changement de rôle applicatif (T-53, US-ROLE-001)', () => {
    function requireElement<T extends Element>(root: HTMLElement, selector: string): T {
      const element = root.querySelector(selector);
      if (!element) {
        throw new Error(`Élément introuvable pour le sélecteur "${selector}".`);
      }
      return element as T;
    }

    function accountForRoleTests(): UserAccount {
      return buildAccount({
        id: 'f5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d14',
        role: UserRole.Member,
        operatorCanRecordPayments: false,
        member: { id: 'g5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d15', displayName: 'Mariama Diallo' },
      });
    }

    it('ouvre la fiche de rôle avec le rôle courant présélectionné', async () => {
      const fixture = await createFixture(() => of(buildPage([accountForRoleTests()])) as never);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      requireElement<HTMLButtonElement>(root, 'button[aria-label*="Mariama Diallo"]').click();
      fixture.detectChanges();

      const select = requireElement<HTMLSelectElement>(root, '#role-dialog-select');
      expect(select.value).toBe(UserRole.Member);
    });

    it('appelle updateUserAccess avec le nouveau rôle et reflète le résultat dans la liste', async () => {
      const account = accountForRoleTests();
      const updated: UserAccount = { ...account, role: UserRole.Treasurer };
      const updateUserAccess = vi.fn(() => of(updated) as never);
      const fixture = await createFixture(
        () => of(buildPage([account])) as never,
        updateUserAccess,
      );
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      requireElement<HTMLButtonElement>(root, 'button[aria-label*="Mariama Diallo"]').click();
      fixture.detectChanges();

      const select = requireElement<HTMLSelectElement>(root, '#role-dialog-select');
      select.value = UserRole.Treasurer;
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      const form = requireElement<HTMLFormElement>(root, 'form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      fixture.detectChanges();

      expect(updateUserAccess).toHaveBeenCalledWith(account.id, {
        role: UserRole.Treasurer,
        operatorCanRecordPayments: false,
      });
      expect(root.querySelector('#role-dialog-select')).toBeNull();
      expect(root.textContent).toContain('Trésorier');
    });

    it("force operatorCanRecordPayments à false lorsque le nouveau rôle n'est pas Opérateur", async () => {
      const account = buildAccount({
        role: UserRole.Operator,
        operatorCanRecordPayments: true,
        member: { id: 'h5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d16', displayName: 'Aminata Touré' },
      });
      const updateUserAccess = vi.fn(() => of({ ...account, role: UserRole.Member }) as never);
      const fixture = await createFixture(
        () => of(buildPage([account])) as never,
        updateUserAccess,
      );
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      requireElement<HTMLButtonElement>(root, 'button[aria-label*="Aminata Touré"]').click();
      fixture.detectChanges();

      const select = requireElement<HTMLSelectElement>(root, '#role-dialog-select');
      select.value = UserRole.Member;
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      requireElement<HTMLFormElement>(root, 'form').dispatchEvent(
        new Event('submit', { cancelable: true }),
      );
      fixture.detectChanges();

      expect(updateUserAccess).toHaveBeenCalledWith(account.id, {
        role: UserRole.Member,
        operatorCanRecordPayments: false,
      });
    });

    it("affiche une erreur et conserve la sélection lorsque l'API échoue", async () => {
      const account = accountForRoleTests();
      const updateUserAccess = vi.fn(() => throwError(() => new Error('network error')) as never);
      const fixture = await createFixture(
        () => of(buildPage([account])) as never,
        updateUserAccess,
      );
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      requireElement<HTMLButtonElement>(root, 'button[aria-label*="Mariama Diallo"]').click();
      fixture.detectChanges();

      requireElement<HTMLFormElement>(root, 'form').dispatchEvent(
        new Event('submit', { cancelable: true }),
      );
      fixture.detectChanges();

      expect(root.querySelector('[role="alert"]')?.textContent).toContain(
        "Impossible d'enregistrer le rôle",
      );
      const select = requireElement<HTMLSelectElement>(root, '#role-dialog-select');
      expect(select.value).toBe(UserRole.Member);
    });

    it('le bouton Annuler ferme la fiche sans appeler updateUserAccess', async () => {
      const account = accountForRoleTests();
      const updateUserAccess = vi.fn(() => of(account) as never);
      const fixture = await createFixture(
        () => of(buildPage([account])) as never,
        updateUserAccess,
      );
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      requireElement<HTMLButtonElement>(root, 'button[aria-label*="Mariama Diallo"]').click();
      fixture.detectChanges();

      const buttons = Array.from(root.querySelectorAll('button'));
      const cancelButton = buttons.find((button) => button.textContent?.trim() === 'Annuler');
      cancelButton?.click();
      fixture.detectChanges();

      expect(root.querySelector('#role-dialog-select')).toBeNull();
      expect(updateUserAccess).not.toHaveBeenCalled();
    });
  });
});
