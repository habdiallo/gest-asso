import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CatgoriesDeRevenuService, MembresService } from '@api';
import type {
  CreateMemberRequest,
  IncomeCategory,
  MemberDetails,
  MemberPage,
  MemberSummary,
} from '@api';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { MemberCreateForm } from '../components/member-create-form/member-create-form';
import { MembersListPage } from './members-list-page';

/*
 * jsdom (utilisé par Vitest) reconnaît `HTMLDialogElement` mais n'implémente
 * pas `showModal()`/`close()` : voir la même limite documentée dans
 * `shared/form-dialog/form-dialog.spec.ts`.
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

const demoIncomeCategory: IncomeCategory = {
  id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
  label: 'Catégorie B',
  memberCount: 12,
  updatedAt: '2026-08-01T09:00:00Z',
};

function buildMemberDetails(overrides: Partial<MemberDetails> = {}): MemberDetails {
  return {
    id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d99',
    firstName: 'Mariama',
    lastName: 'Barry',
    displayName: 'Mariama Barry',
    incomeCategory: { id: demoIncomeCategory.id, label: demoIncomeCategory.label },
    status: 'ACTIVE',
    account: {
      id: 'c5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d99',
      role: 'MEMBER',
      operatorCanRecordPayments: false,
      active: true,
    },
    financialSummary: {
      totalDueAmount: 0,
      totalPaidAmount: 0,
      totalRemainingAmount: 0,
      currency: 'GNF',
    },
    ...overrides,
  };
}

function buildMember(overrides: Partial<MemberSummary> = {}): MemberSummary {
  return {
    id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    firstName: 'Amadou',
    lastName: 'Diallo',
    preferredName: 'Bah',
    displayName: 'Amadou Diallo',
    country: 'Guinée',
    city: 'Conakry',
    phone: '+224 622 12 34 56',
    incomeCategory: { id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', label: 'Catégorie B' },
    associationFunction: 'Président',
    status: 'ACTIVE',
    ...overrides,
  };
}

function buildMemberPage(overrides: Partial<MemberPage> = {}): MemberPage {
  return {
    items: [buildMember()],
    summary: { total: 91, active: 86, inactive: 5 },
    page: { number: 0, size: 20, totalElements: 91, totalPages: 5 },
    ...overrides,
  };
}

async function createFixture(
  listMembers: (page?: number) => Observable<MemberPage>,
  options: {
    createMember?: (request: CreateMemberRequest) => Observable<MemberDetails>;
    listIncomeCategories?: () => Observable<IncomeCategory[]>;
  } = {},
): Promise<ComponentFixture<MembersListPage>> {
  const createMember =
    options.createMember ?? ((): Observable<MemberDetails> => of(buildMemberDetails()));
  const listIncomeCategories =
    options.listIncomeCategories ?? ((): Observable<IncomeCategory[]> => of([demoIncomeCategory]));

  await TestBed.configureTestingModule({
    imports: [
      MembersListPage,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      {
        provide: MembresService,
        useValue: { listMembers, createMember } as unknown as MembresService,
      },
      {
        provide: CatgoriesDeRevenuService,
        useValue: { listIncomeCategories } as unknown as CatgoriesDeRevenuService,
      },
      provideRouter([]),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(MembersListPage);
  fixture.detectChanges();
  return fixture;
}

describe('MembersListPage', () => {
  it('keeps focus during pagination, blocks repeat requests and preserves the page on failure', async () => {
    const pending = new Subject<MemberPage>();
    const requestedPages: (number | undefined)[] = [];
    const fixture = await createFixture((page) => {
      requestedPages.push(page);
      return page === 0 ? of(buildMemberPage()) : pending.asObservable();
    });
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const nextButton = root.querySelectorAll('nav button')[1] as HTMLButtonElement;
    nextButton.focus();
    nextButton.click();
    fixture.detectChanges();

    expect(nextButton.isConnected).toBe(true);
    expect(nextButton.disabled).toBe(false);
    expect(nextButton.getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(nextButton);
    nextButton.click();
    fixture.componentInstance.goToPreviousPage();
    expect(requestedPages).toEqual([0, 1]);

    pending.error(new Error('network error'));
    fixture.detectChanges();

    expect(document.activeElement).toBe(nextButton);
    expect(root.textContent).toContain('Amadou');
    expect(root.querySelector('[role="alert"]')).toBeTruthy();
    expect(nextButton.getAttribute('aria-disabled')).toBeNull();
  });

  it('keeps the focused next button when the last page arrives', async () => {
    const pending = new Subject<MemberPage>();
    const fixture = await createFixture((page) =>
      page === 0
        ? of(buildMemberPage({ page: { number: 0, size: 20, totalElements: 21, totalPages: 2 } }))
        : pending.asObservable(),
    );
    fixture.detectChanges();
    const nextButton = fixture.nativeElement.querySelectorAll('nav button')[1] as HTMLButtonElement;
    nextButton.focus();
    nextButton.click();
    fixture.detectChanges();
    pending.next(
      buildMemberPage({ page: { number: 1, size: 20, totalElements: 21, totalPages: 2 } }),
    );
    pending.complete();
    fixture.detectChanges();

    expect(document.activeElement).toBe(nextButton);
    expect(nextButton.disabled).toBe(false);
    expect(nextButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('shows a loading state while the request is pending', async () => {
    const pending = new Subject<MemberPage>();
    const fixture = await createFixture(() => pending.asObservable());

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"]')?.textContent).toContain('Chargement des membres');
  });

  it('shows an error state when the API call fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger la liste des membres',
    );
  });

  it('shows the empty-list message when no member is registered', async () => {
    const fixture = await createFixture(() => of(buildMemberPage({ items: [] })));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucun membre enregistré.');
  });

  it('renders the member table with the columns required by US-MEM-002', async () => {
    const fixture = await createFixture(() => of(buildMemberPage()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const row = root.querySelector('tbody tr');
    expect(row?.textContent).toContain('Diallo');
    expect(row?.textContent).toContain('Amadou');
    expect(row?.textContent).toContain('Bah');
    expect(row?.textContent).toContain('Guinée');
    expect(row?.textContent).toContain('Conakry');
    expect(row?.textContent).toContain('+224 622 12 34 56');
    expect(row?.textContent).toContain('Catégorie B');
    expect(row?.textContent).toContain('Président');
    expect(row?.textContent).toContain('Actif');
    expect(root.textContent).toContain('86 membre(s) actif(s) sur 91 membre(s) enregistré(s)');
  });

  it('shows a placeholder for optional fields left absent by the API', async () => {
    const fixture = await createFixture(() =>
      of(
        buildMemberPage({
          items: [
            {
              id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
              firstName: 'Fatoumata',
              lastName: 'Camara',
              displayName: 'Fatoumata Camara',
              incomeCategory: { id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', label: 'Catégorie A' },
              status: 'INACTIVE',
            },
          ],
        }),
      ),
    );
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const row = root.querySelector('tbody tr');
    expect(row?.textContent).toContain('Inactif');
    expect(row?.textContent?.match(/Non renseigné/g)?.length).toBe(5);
  });

  it('distinguishes active and inactive members visually in the status column (RG-MEM-007)', async () => {
    const fixture = await createFixture(() =>
      of(
        buildMemberPage({
          items: [
            buildMember({
              id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
              lastName: 'Camara',
              status: 'ACTIVE',
            }),
            buildMember({
              id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d21',
              lastName: 'Bangoura',
              status: 'INACTIVE',
            }),
          ],
        }),
      ),
    );
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    const activeBadge = rows[0].querySelector('td:nth-last-child(2) span');
    const inactiveBadge = rows[1].querySelector('td:nth-last-child(2) span');

    expect(activeBadge?.className).not.toEqual(inactiveBadge?.className);
    expect(activeBadge?.className).toContain('text-success');
    expect(inactiveBadge?.className).not.toContain('text-success');
  });

  it('disables the previous page control on the first page and enables the next one', async () => {
    const fixture = await createFixture(() =>
      of(buildMemberPage({ page: { number: 0, size: 20, totalElements: 21, totalPages: 2 } })),
    );
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('nav button');
    const previousButton = buttons[0] as HTMLButtonElement;
    const nextButton = buttons[1] as HTMLButtonElement;

    expect(previousButton.getAttribute('aria-disabled')).toBe('true');
    expect(nextButton.getAttribute('aria-disabled')).toBeNull();
  });

  it('loads and displays the members beyond the first page of 20', async () => {
    // Régression T-21 : au-delà de 20 membres, la première réponse ne contient
    // qu'`items` de la page 0. Sans pagination, les membres suivants restent
    // invisibles bien que le compteur affiche le total réel.
    const firstPageItems = Array.from({ length: 20 }, (_, index) =>
      buildMember({
        id: `a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d${index.toString().padStart(2, '0')}`,
        lastName: `Membre${index}`,
      }),
    );
    const secondPageMember = buildMember({
      id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d99',
      lastName: 'MembreVingtEtUnieme',
    });

    const listMembers = vi.fn((page?: number) => {
      if (page === 1) {
        return of(
          buildMemberPage({
            items: [secondPageMember],
            page: { number: 1, size: 20, totalElements: 21, totalPages: 2 },
          }),
        );
      }
      return of(
        buildMemberPage({
          items: firstPageItems,
          page: { number: 0, size: 20, totalElements: 21, totalPages: 2 },
        }),
      );
    });

    const fixture = await createFixture(listMembers);
    fixture.detectChanges();

    expect(listMembers).toHaveBeenCalledWith(0);
    expect(fixture.nativeElement.textContent).not.toContain('MembreVingtEtUnieme');

    const nextButton = fixture.nativeElement.querySelectorAll('nav button')[1] as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();

    expect(listMembers).toHaveBeenCalledWith(1);
    expect(fixture.nativeElement.textContent).toContain('MembreVingtEtUnieme');
  });

  it('opens the create-member dialog from the button and closes it on cancel', async () => {
    const fixture = await createFixture(() => of(buildMemberPage()));
    fixture.detectChanges();

    const openButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find((button) =>
      (button as HTMLButtonElement).textContent?.includes('Ajouter un membre'),
    ) as HTMLButtonElement | undefined;
    expect(openButton).toBeTruthy();
    openButton?.click();
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    expect(dialog.open).toBe(true);

    const form = fixture.debugElement.query(By.directive(MemberCreateForm));
    (form.componentInstance as MemberCreateForm).cancel();
    fixture.detectChanges();

    expect(dialog.open).toBe(false);
  });

  it('creates a member, refreshes the list and closes the dialog on success', async () => {
    const listMembers = vi.fn(() => of(buildMemberPage()));
    const createMember = vi.fn((request: CreateMemberRequest) => of(buildMemberDetails(request)));
    const fixture = await createFixture(listMembers, { createMember });
    fixture.detectChanges();
    fixture.componentInstance.openCreateDialog();
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.directive(MemberCreateForm))
      .componentInstance as MemberCreateForm;
    form.form.setValue({
      lastName: 'Barry',
      firstName: 'Mariama',
      preferredName: '',
      country: '',
      city: '',
      phone: '',
      incomeCategoryId: demoIncomeCategory.id,
      associationFunction: '',
    });
    form.submit();
    fixture.detectChanges();

    expect(createMember).toHaveBeenCalledWith({
      lastName: 'Barry',
      firstName: 'Mariama',
      incomeCategoryId: demoIncomeCategory.id,
    });
    expect(listMembers).toHaveBeenCalledWith(0);
    expect(fixture.componentInstance.createDialogOpen()).toBe(false);
  });

  it.each([
    ['success', false],
    ['error', false],
    ['success', true],
    ['error', true],
  ] as const)(
    'preserves a reopened form after an old %s response with a new request pending: %s',
    async (outcome, newRequestPending) => {
      const oldRequest = new Subject<MemberDetails>();
      const newRequest = new Subject<MemberDetails>();
      const createMember = vi
        .fn()
        .mockReturnValueOnce(oldRequest.asObservable())
        .mockReturnValueOnce(newRequest.asObservable());
      const listMembers = vi.fn(() => of(buildMemberPage()));
      const fixture = await createFixture(listMembers, { createMember });
      const page = fixture.componentInstance;
      page.openCreateDialog();
      fixture.detectChanges();
      const firstForm = fixture.debugElement.query(By.directive(MemberCreateForm))
        .componentInstance as MemberCreateForm;
      firstForm.form.patchValue({
        lastName: 'Barry',
        firstName: 'Mariama',
        incomeCategoryId: demoIncomeCategory.id,
      });
      firstForm.submit();
      fixture.detectChanges();
      firstForm.cancel();
      fixture.detectChanges();
      page.openCreateDialog();
      fixture.detectChanges();
      const reopenedForm = fixture.debugElement.query(By.directive(MemberCreateForm))
        .componentInstance as MemberCreateForm;
      reopenedForm.form.patchValue({
        lastName: 'Camara',
        firstName: 'Fatou',
        incomeCategoryId: demoIncomeCategory.id,
      });
      expect(reopenedForm.submitting()).toBe(false);
      if (newRequestPending) {
        reopenedForm.submit();
        fixture.detectChanges();
      }

      const respond = (): void => {
        if (outcome === 'success') {
          oldRequest.next(buildMemberDetails());
          oldRequest.complete();
        } else {
          oldRequest.error(new Error('old request failed'));
        }
        fixture.detectChanges();
        expect(page.createDialogOpen()).toBe(true);
        expect(page.createError()).toBe(false);
        expect(fixture.debugElement.query(By.directive(MemberCreateForm)).componentInstance).toBe(
          reopenedForm,
        );
        const name: HTMLInputElement = fixture.nativeElement.querySelector(
          '#member-create-last-name',
        );
        expect(name.value).toBe('Camara');
      };
      respond();
      expect(page.creating()).toBe(newRequestPending);
      if (!newRequestPending) {
        reopenedForm.submit();
        fixture.detectChanges();
      }
      expect(createMember).toHaveBeenCalledTimes(2);
      expect(page.creating()).toBe(true);
      newRequest.next(buildMemberDetails({ lastName: 'Camara' }));
      newRequest.complete();
      fixture.detectChanges();
      expect(page.createDialogOpen()).toBe(false);
      expect(page.creating()).toBe(false);
      expect(listMembers).toHaveBeenCalledTimes(outcome === 'success' ? 3 : 2);
    },
  );

  it('shows an error banner and keeps the dialog open when member creation fails', async () => {
    const createMember = vi.fn(() => throwError(() => new Error('network error')));
    const fixture = await createFixture(() => of(buildMemberPage()), { createMember });
    fixture.detectChanges();
    fixture.componentInstance.openCreateDialog();
    fixture.detectChanges();

    fixture.componentInstance.handleCreateMember({
      lastName: 'Barry',
      firstName: 'Mariama',
      incomeCategoryId: demoIncomeCategory.id,
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.createDialogOpen()).toBe(true);
    expect(fixture.nativeElement.querySelector('dialog [role="alert"]')?.textContent).toContain(
      "Impossible d'enregistrer ce membre",
    );
  });
});
