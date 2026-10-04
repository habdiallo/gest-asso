import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UserRole, UtilisateursEtRolesService } from '@core/api';
import type {
  TemporaryCredentials,
  UserAccount,
  UserAccountListItem,
  UserAccountPage,
} from '@core/api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { provideCspTranspiler } from '@core/i18n/csp-transpiler';
import { Subject, of, throwError } from 'rxjs';
import fr from '@assets/i18n/fr.json';
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

function buildAccount(overrides: Partial<UserAccountListItem> = {}): UserAccountListItem {
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
  items: UserAccountListItem[],
  overrides: Partial<UserAccountPage['page']> = {},
): UserAccountPage {
  return {
    items,
    page: { number: 0, size: 20, totalElements: items.length, totalPages: 1, ...overrides },
  };
}

async function createFixture(
  listUsers: () => ReturnType<UtilisateursEtRolesService['listUsers']>,
  updateUserAccess?: (
    ...args: Parameters<UtilisateursEtRolesService['updateUserAccess']>
  ) => ReturnType<UtilisateursEtRolesService['updateUserAccess']>,
  resetUserCredentials?: (
    ...args: Parameters<UtilisateursEtRolesService['resetUserCredentials']>
  ) => ReturnType<UtilisateursEtRolesService['resetUserCredentials']>,
  getUser?: (
    ...args: Parameters<UtilisateursEtRolesService['getUser']>
  ) => ReturnType<UtilisateursEtRolesService['getUser']>,
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
      provideRouter([]),
      provideCspTranspiler(),
      {
        provide: UtilisateursEtRolesService,
        useValue: {
          listUsers,
          updateUserAccess,
          resetUserCredentials,
          getUser: getUser ?? (() => of({ identifier: 'awacamara-4821' } as UserAccount) as never),
        } as unknown as UtilisateursEtRolesService,
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
    const tableHost = root.querySelector('app-data-table');
    expect(tableHost?.className).toContain('hidden tablet:block');
    expect(tableHost?.querySelector('caption')?.textContent).toContain('Utilisateurs et rôles');
    expect(root.querySelector('[role="list"]')?.className).toContain('tablet:hidden');
    expect(root.textContent).toContain('Fatou Sow');
    expect(root.textContent).toContain('Opérateur');
    expect(root.textContent).toContain('Autorisé');
    expect(root.textContent).toContain('FS');
    expect(root.querySelector('.bg-success-wash')).not.toBeNull();
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
    expect(fixture.nativeElement.querySelector('.bg-surface-2')).not.toBeNull();
  });

  it('shows the login identifier only after opening the user details', async () => {
    const account = buildAccount();
    const details: UserAccount = {
      ...account,
      identifier: 'awacamara-4821',
    };
    const fixture = await createFixture(
      () => of(buildPage([account])) as never,
      undefined,
      undefined,
      () => of(details) as never,
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('awacamara-4821');
    (
      fixture.nativeElement.querySelector('button[aria-label*="Awa Camara"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Identifiant de connexion');
    expect(fixture.nativeElement.textContent).toContain('awacamara-4821');
  });

  it('shows a retryable error without displaying an identifier when the detail request fails', async () => {
    const account = buildAccount({ role: UserRole.Operator, operatorCanRecordPayments: false });
    const details: UserAccount = { ...account, identifier: 'awacamara-4821' };
    let attempts = 0;
    const getUser = vi.fn(() => {
      attempts += 1;
      return (attempts === 1 ? throwError(() => new Error('network error')) : of(details)) as never;
    });
    const fixture = await createFixture(
      () => of(buildPage([account])) as never,
      undefined,
      undefined,
      getUser,
    );
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const openButton = root.querySelector<HTMLButtonElement>('button[aria-label*="Awa Camara"]');
    expect(openButton).not.toBeNull();
    openButton?.click();
    fixture.detectChanges();

    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      "Impossible de charger l'identifiant de connexion",
    );
    expect(root.textContent).not.toContain('awacamara-4821');

    fixture.componentInstance.onRoleDraftChange(UserRole.Treasurer);
    fixture.componentInstance.onOperatorAuthorizationDraftChange({
      target: { checked: true },
    } as unknown as Event);
    const retryButton = Array.from(root.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Réessayer'),
    );
    retryButton?.click();
    fixture.detectChanges();

    expect(getUser).toHaveBeenCalledTimes(2);
    expect(root.textContent).toContain('awacamara-4821');
    expect(root.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.componentInstance.roleDraft()).toBe(UserRole.Treasurer);
    expect(fixture.componentInstance.operatorAuthorizationDraft()).toBe(true);
  });

  it('does not let a late detail response overwrite the role draft', async () => {
    const account = buildAccount({ role: UserRole.Member });
    const pendingDetails = new Subject<UserAccount>();
    const fixture = await createFixture(
      () => of(buildPage([account])) as never,
      undefined,
      undefined,
      () => pendingDetails.asObservable() as never,
    );
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector('button[aria-label*="Awa Camara"]') as HTMLButtonElement
    ).click();
    fixture.componentInstance.onRoleDraftChange(UserRole.Treasurer);
    pendingDetails.next({ ...account, identifier: 'awacamara-4821' });
    fixture.detectChanges();

    expect(fixture.componentInstance.roleDraft()).toBe(UserRole.Treasurer);
  });

  it('regenerates and displays a temporary password for the selected account', async () => {
    const account = buildAccount();
    const credentials: TemporaryCredentials = {
      identifier: 'awa.camara',
      temporaryPassword: 'Temporaire-1234!',
    };
    const resetUserCredentials = vi.fn(() => of(credentials) as never);
    const fixture = await createFixture(
      () => of(buildPage([account])) as never,
      undefined,
      resetUserCredentials,
    );
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    (root.querySelector('button[aria-label*="Awa Camara"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const resetButton = Array.from(root.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Régénérer le mot de passe'),
    ) as HTMLButtonElement;
    resetButton.click();
    fixture.detectChanges();

    expect(resetUserCredentials).toHaveBeenCalledWith(account.id);
    expect(root.textContent).toContain('Temporaire-1234!');
    expect(root.textContent).toContain('Transmettez-le au membre');
  });

  it('renders the compact toolbar and the structured role dialog', async () => {
    const account = buildAccount({ role: UserRole.Operator, operatorCanRecordPayments: true });
    const fixture = await createFixture(() => of(buildPage([account])) as never);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('#roles-users-search')?.getAttribute('aria-label')).toBe(
      'Rechercher un utilisateur',
    );
    expect(root.querySelector('#roles-users-role-filter')).not.toBeNull();

    const action = root.querySelector('button[aria-label*="Awa Camara"]') as HTMLButtonElement;
    expect(action).toBeTruthy();
    action.click();
    fixture.detectChanges();

    expect(root.textContent).toContain('01');
    expect(root.textContent).toContain('02');
    expect(root.textContent).toContain('Cette autorisation est globale');
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

    function accountForRoleTests(): UserAccountListItem {
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

      expect(fixture.componentInstance.roleDraft()).toBe(UserRole.Member);
    });

    it('appelle updateUserAccess avec le nouveau rôle et recharge la liste avec les critères courants', async () => {
      const account = accountForRoleTests();
      const updated: UserAccountListItem = { ...account, role: UserRole.Treasurer };
      const updateUserAccess = vi.fn(() => of(updated) as never);
      let listCallCount = 0;
      const listUsers = vi.fn(
        () =>
          (listCallCount++ === 0 ? of(buildPage([account])) : of(buildPage([updated]))) as never,
      );
      const fixture = await createFixture(listUsers, updateUserAccess);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      requireElement<HTMLButtonElement>(root, 'button[aria-label*="Mariama Diallo"]').click();
      fixture.detectChanges();

      fixture.componentInstance.onRoleDraftChange(UserRole.Treasurer);
      fixture.detectChanges();

      const form = requireElement<HTMLFormElement>(root, 'form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      fixture.detectChanges();

      expect(updateUserAccess).toHaveBeenCalledWith(account.id, {
        role: UserRole.Treasurer,
        operatorCanRecordPayments: false,
      });
      // La liste est rechargée (pas seulement remplacée localement) après la mutation,
      // afin de refléter les nouveaux totaux/filtre servis par le serveur.
      expect(listUsers).toHaveBeenCalledTimes(2);
      expect(root.querySelector('#role-dialog-select')).toBeNull();
      expect(root.textContent).toContain('Trésorier');
    });

    it('recharge la liste filtrée après un changement de rôle qui en sort le compte', async () => {
      const account = buildAccount({
        id: 'm5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d21',
        role: UserRole.Member,
        member: { id: 'n5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d22', displayName: 'Sekou Kaba' },
      });
      const updated: UserAccountListItem = { ...account, role: UserRole.Treasurer };
      const updateUserAccess = vi.fn(() => of(updated) as never);
      let listCallCount = 0;
      const listUsers = vi.fn(
        () =>
          (listCallCount++ === 0
            ? of(buildPage([account]))
            : of(buildPage([], { totalElements: 0 }))) as never,
      );
      const fixture = await createFixture(listUsers, updateUserAccess);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      requireElement<HTMLButtonElement>(root, 'button[aria-label*="Sekou Kaba"]').click();
      fixture.detectChanges();

      fixture.componentInstance.onRoleDraftChange(UserRole.Treasurer);
      fixture.detectChanges();

      requireElement<HTMLFormElement>(root, 'form').dispatchEvent(
        new Event('submit', { cancelable: true }),
      );
      fixture.detectChanges();

      // Le refetch, pas un simple retrait local, recalcule totaux/filtre : le
      // compte devenu Trésorier disparaît de la liste filtrée sur Membre.
      expect(listUsers).toHaveBeenCalledTimes(2);
      expect(root.textContent).toContain('Aucun utilisateur ne correspond');
    });

    it('ignore la réponse tardive de la fiche fermée A lorsque la fiche B est ouverte', async () => {
      const accountA = buildAccount({
        id: 'o5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d23',
        role: UserRole.Member,
        member: { id: 'p5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d24', displayName: 'Ibrahima Bah' },
      });
      const accountB = buildAccount({
        id: 'q5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d25',
        role: UserRole.Member,
        member: { id: 'r5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d26', displayName: 'Awa Camara' },
      });
      const pendingA = new Subject<UserAccountListItem>();
      const updateUserAccess = vi.fn(() => pendingA.asObservable() as never);
      const fixture = await createFixture(
        () => of(buildPage([accountA, accountB])) as never,
        updateUserAccess,
      );
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      requireElement<HTMLButtonElement>(root, 'button[aria-label*="Ibrahima Bah"]').click();
      fixture.detectChanges();

      fixture.componentInstance.onRoleDraftChange(UserRole.Treasurer);
      fixture.detectChanges();

      requireElement<HTMLFormElement>(root, 'form').dispatchEvent(
        new Event('submit', { cancelable: true }),
      );
      fixture.detectChanges();

      // Ferme la fiche de A (Annuler) pendant que sa requête de sauvegarde reste active.
      const cancelButton = Array.from(root.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === 'Annuler',
      );
      cancelButton?.click();
      fixture.detectChanges();
      expect(root.querySelector('#role-dialog-select')).toBeNull();

      // Ouvre la fiche de B et modifie sa sélection.
      requireElement<HTMLButtonElement>(root, 'button[aria-label*="Awa Camara"]').click();
      fixture.detectChanges();
      fixture.componentInstance.onRoleDraftChange(UserRole.Operator);
      fixture.detectChanges();

      // La réponse tardive de A arrive : la fiche de B doit rester ouverte avec sa saisie.
      pendingA.next({ ...accountA, role: UserRole.Treasurer });
      pendingA.complete();
      fixture.detectChanges();

      expect(root.textContent).toContain('Rôle applicatif de Awa Camara');
      expect(fixture.componentInstance.roleDraft()).toBe(UserRole.Operator);
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

      fixture.componentInstance.onRoleDraftChange(UserRole.Member);
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
      expect(fixture.componentInstance.roleDraft()).toBe(UserRole.Member);
    });

    it.each([
      [UserRole.Administrator, 'Fatoumata Keita'],
      [UserRole.Treasurer, 'Sekou Toure'],
      [UserRole.Member, 'Mariama Diallo'],
    ])(
      "n'affiche pas le contrôle peut_enregistrer_paiements pour un compte %s (T-56)",
      async (role, displayName) => {
        const account = buildAccount({
          role,
          operatorCanRecordPayments: false,
          member: { id: 'h5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d16', displayName },
        });
        const fixture = await createFixture(() => of(buildPage([account])) as never);
        fixture.detectChanges();

        const root: HTMLElement = fixture.nativeElement;
        requireElement<HTMLButtonElement>(root, `button[aria-label*="${displayName}"]`).click();
        fixture.detectChanges();

        expect(root.querySelector('#operator-authorization-toggle')).toBeNull();
      },
    );

    it("n'affiche aucune case peut_enregistrer_paiements dans la liste pour des comptes non-Opérateur (T-56)", async () => {
      const accounts = [
        buildAccount({
          role: UserRole.Administrator,
          member: { id: 'l5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20', displayName: 'Awa Camara' },
        }),
        buildAccount({
          role: UserRole.Treasurer,
          id: 'm5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d21',
          member: { id: 'n5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d22', displayName: 'Sekou Toure' },
        }),
        accountForRoleTests(),
      ];
      const fixture = await createFixture(() => of(buildPage(accounts)) as never);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('input[type="checkbox"]')).toBeNull();
    });

    it('affiche le contrôle peut_enregistrer_paiements présélectionné pour un compte Opérateur', async () => {
      const account = buildAccount({
        role: UserRole.Operator,
        operatorCanRecordPayments: true,
        member: { id: 'i5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d17', displayName: 'Ousmane Bangoura' },
      });
      const fixture = await createFixture(() => of(buildPage([account])) as never);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      requireElement<HTMLButtonElement>(root, 'button[aria-label*="Ousmane Bangoura"]').click();
      fixture.detectChanges();

      const toggle = requireElement<HTMLInputElement>(root, '#operator-authorization-toggle');
      expect(toggle.checked).toBe(true);
    });

    it('le contrôle peut_enregistrer_paiements apparaît en choisissant Opérateur dans la fiche', async () => {
      const fixture = await createFixture(() => of(buildPage([accountForRoleTests()])) as never);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      requireElement<HTMLButtonElement>(root, 'button[aria-label*="Mariama Diallo"]').click();
      fixture.detectChanges();

      fixture.componentInstance.onRoleDraftChange(UserRole.Operator);
      fixture.detectChanges();

      expect(root.querySelector('#operator-authorization-toggle')).not.toBeNull();
    });

    it('active peut_enregistrer_paiements pour un compte Opérateur (§2.3, T-55)', async () => {
      const account = buildAccount({
        role: UserRole.Operator,
        operatorCanRecordPayments: false,
        member: { id: 'j5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d18', displayName: 'Kadiatou Barry' },
      });
      const updateUserAccess = vi.fn(
        () => of({ ...account, operatorCanRecordPayments: true }) as never,
      );
      const fixture = await createFixture(
        () => of(buildPage([account])) as never,
        updateUserAccess,
      );
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      requireElement<HTMLButtonElement>(root, 'button[aria-label*="Kadiatou Barry"]').click();
      fixture.detectChanges();

      const toggle = requireElement<HTMLInputElement>(root, '#operator-authorization-toggle');
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      requireElement<HTMLFormElement>(root, 'form').dispatchEvent(
        new Event('submit', { cancelable: true }),
      );
      fixture.detectChanges();

      expect(updateUserAccess).toHaveBeenCalledWith(account.id, {
        role: UserRole.Operator,
        operatorCanRecordPayments: true,
      });
    });

    it('désactive peut_enregistrer_paiements pour un compte Opérateur (§2.3, T-55)', async () => {
      const account = buildAccount({
        role: UserRole.Operator,
        operatorCanRecordPayments: true,
        member: { id: 'k5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d19', displayName: 'Sidiki Cissé' },
      });
      const updateUserAccess = vi.fn(
        () => of({ ...account, operatorCanRecordPayments: false }) as never,
      );
      const fixture = await createFixture(
        () => of(buildPage([account])) as never,
        updateUserAccess,
      );
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      requireElement<HTMLButtonElement>(root, 'button[aria-label*="Sidiki Cissé"]').click();
      fixture.detectChanges();

      const toggle = requireElement<HTMLInputElement>(root, '#operator-authorization-toggle');
      toggle.checked = false;
      toggle.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      requireElement<HTMLFormElement>(root, 'form').dispatchEvent(
        new Event('submit', { cancelable: true }),
      );
      fixture.detectChanges();

      expect(updateUserAccess).toHaveBeenCalledWith(account.id, {
        role: UserRole.Operator,
        operatorCanRecordPayments: false,
      });
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
