import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CatgoriesDeRevenuService, CurrencyCode, MembresService, MemberStatus } from '@api';
import type {
  CreateMemberRequest,
  CurrentUser,
  IncomeCategory,
  MemberDetails,
  MemberPage,
  MemberSummary,
  UserRole,
} from '@api';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { SessionService } from '@core/session/session.service';
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

function buildCurrentUser(role: UserRole): CurrentUser {
  return {
    userId: 'd5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d30',
    association: {
      id: 'e5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d31',
      name: 'Association Test',
      currency: CurrencyCode.Gnf,
    },
    member: {
      id: 'f5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d32',
      firstName: 'Awa',
      lastName: 'Camara',
      displayName: 'Awa Camara',
      incomeCategory: { id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', label: 'Catégorie B' },
      status: MemberStatus.Active,
    },
    role,
    operatorCanRecordPayments: false,
    accountActive: true,
  };
}

async function createFixture(
  listMembers: (
    page?: number,
    size?: number,
    q?: string,
    status?: MemberStatus,
  ) => Observable<MemberPage>,
  options: {
    createMember?: (request: CreateMemberRequest) => Observable<MemberDetails>;
    listIncomeCategories?: () => Observable<IncomeCategory[]>;
    role?: UserRole;
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

  // Rôle par défaut Administrateur (T-37, RG-MEM-001) : les tests qui ne
  // portent pas sur les droits par rôle restent inchangés, l'action "Ajouter
  // un membre" étant visible pour l'Administrateur comme pour le Trésorier.
  const sessionService = TestBed.inject(SessionService);
  sessionService.setUser(buildCurrentUser(options.role ?? 'ADMINISTRATOR'));

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

  it('hides the income category column for an Opérateur (RG-MEM-008)', async () => {
    const fixture = await createFixture(() => of(buildMemberPage()), { role: 'OPERATOR' });
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).not.toContain('Catégorie B');
    expect(
      Array.from(root.querySelectorAll('thead th')).some((th) =>
        th.textContent?.includes('Catégorie'),
      ),
    ).toBe(false);
    const row = root.querySelector('tbody tr');
    expect(row?.querySelectorAll('td').length).toBe(9);
  });

  it.each(['ADMINISTRATOR', 'TREASURER'] as const)(
    'keeps the income category column visible for %s',
    async (role) => {
      const fixture = await createFixture(() => of(buildMemberPage()), { role });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.textContent).toContain('Catégorie B');
    },
  );

  it('filters the member list by income category (T-26)', async () => {
    const memberA = buildMember({
      id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d30',
      lastName: 'Conde',
      incomeCategory: { id: 'cat-a', label: 'Catégorie A' },
    });
    const memberB = buildMember({
      id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d31',
      lastName: 'Toure',
      incomeCategory: { id: 'cat-b', label: 'Catégorie B' },
    });
    const fixture = await createFixture(() => of(buildMemberPage({ items: [memberA, memberB] })));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const select = root.querySelector('#member-income-category-filter') as HTMLSelectElement;
    expect(select).toBeTruthy();
    const optionLabels = Array.from(select.querySelectorAll('option')).map((option) =>
      option.textContent?.trim(),
    );
    expect(optionLabels).toEqual(['Toutes les catégories', 'Catégorie A', 'Catégorie B']);

    select.value = 'cat-b';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(root.textContent).toContain('Toure');
    expect(root.textContent).not.toContain('Conde');

    select.value = '';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(root.textContent).toContain('Toure');
    expect(root.textContent).toContain('Conde');
  });

  it('shows a dedicated message when no member matches the selected category', async () => {
    const memberA = buildMember({ incomeCategory: { id: 'cat-a', label: 'Catégorie A' } });
    const fixture = await createFixture(() => of(buildMemberPage({ items: [memberA] })));
    fixture.detectChanges();

    // Un identifiant absent de la page (par exemple parce que le membre
    // portant cette catégorie a disparu de la page rechargée) doit afficher
    // le message dédié plutôt qu'une liste vide silencieuse.
    fixture.componentInstance.selectedIncomeCategoryId.set('unknown-category');
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Aucun membre ne correspond à cette catégorie de revenu.');
    expect(root.querySelector('table')).toBeNull();
  });

  it('hides the income category filter for an Opérateur (RG-MEM-008)', async () => {
    const fixture = await createFixture(() => of(buildMemberPage()), { role: 'OPERATOR' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#member-income-category-filter')).toBeNull();
  });

  it('keeps the category filter selected when the page changes (P2, PR #83)', async () => {
    const memberA = buildMember({
      id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d40',
      incomeCategory: { id: 'cat-a', label: 'Catégorie A' },
    });
    const secondPageMemberA = buildMember({
      id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d41',
      lastName: 'SecondPageA',
      incomeCategory: { id: 'cat-a', label: 'Catégorie A' },
    });
    const secondPageMemberC = buildMember({
      id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d42',
      lastName: 'SecondPageC',
      incomeCategory: { id: 'cat-c', label: 'Catégorie C' },
    });
    const listMembers = vi.fn((page?: number) =>
      page === 1
        ? of(
            buildMemberPage({
              items: [secondPageMemberA, secondPageMemberC],
              page: { number: 1, size: 20, totalElements: 22, totalPages: 2 },
            }),
          )
        : of(
            buildMemberPage({
              items: [memberA],
              page: { number: 0, size: 20, totalElements: 22, totalPages: 2 },
            }),
          ),
    );
    const fixture = await createFixture(listMembers);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const select = root.querySelector('#member-income-category-filter') as HTMLSelectElement;
    select.value = 'cat-a';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIncomeCategoryId()).toBe('cat-a');

    const nextButton = root.querySelectorAll('nav button')[1] as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedIncomeCategoryId()).toBe('cat-a');
    const selectAfter = root.querySelector('#member-income-category-filter') as HTMLSelectElement;
    expect(selectAfter.value).toBe('cat-a');
    const rows = Array.from(root.querySelectorAll('tbody tr'));
    expect(rows).toHaveLength(1);
    expect(root.textContent).toContain('SecondPageA');
    expect(root.textContent).not.toContain('SecondPageC');
  });

  it('shows no member when the selected category is absent from the new page (P2, PR #83)', async () => {
    const memberA = buildMember({
      id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d43',
      incomeCategory: { id: 'cat-a', label: 'Catégorie A' },
    });
    const secondPageMemberC = buildMember({
      id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d44',
      lastName: 'SecondPageC',
      incomeCategory: { id: 'cat-c', label: 'Catégorie C' },
    });
    const listMembers = vi.fn((page?: number) =>
      page === 1
        ? of(
            buildMemberPage({
              items: [secondPageMemberC],
              page: { number: 1, size: 20, totalElements: 21, totalPages: 2 },
            }),
          )
        : of(
            buildMemberPage({
              items: [memberA],
              page: { number: 0, size: 20, totalElements: 21, totalPages: 2 },
            }),
          ),
    );
    const fixture = await createFixture(listMembers);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const select = root.querySelector('#member-income-category-filter') as HTMLSelectElement;
    select.value = 'cat-a';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const nextButton = root.querySelectorAll('nav button')[1] as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedIncomeCategoryId()).toBe('cat-a');
    expect(root.querySelectorAll('tbody tr')).toHaveLength(0);
    expect(root.textContent).not.toContain('SecondPageC');
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

    expect(listMembers).toHaveBeenCalledWith(0, undefined, undefined, undefined);
    expect(fixture.nativeElement.textContent).not.toContain('MembreVingtEtUnieme');

    const nextButton = fixture.nativeElement.querySelectorAll('nav button')[1] as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();

    expect(listMembers).toHaveBeenCalledWith(1, undefined, undefined, undefined);
    expect(fixture.nativeElement.textContent).toContain('MembreVingtEtUnieme');
  });

  it('requests members filtered by name after the search input is debounced (T-24)', async () => {
    vi.useFakeTimers();
    try {
      const requestedQueries: (string | undefined)[] = [];
      const fixture = await createFixture((_page, _size, q) => {
        requestedQueries.push(q);
        return of(buildMemberPage());
      });
      fixture.detectChanges();

      const input: HTMLInputElement = fixture.nativeElement.querySelector('#members-search');
      input.value = 'Diallo';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // La requête n'est déclenchée qu'après l'amortissement (debounceTime).
      expect(requestedQueries).toEqual([undefined]);

      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();

      expect(requestedQueries).toEqual([undefined, 'Diallo']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('requests the first page again once the debounced search query changes (T-24)', async () => {
    vi.useFakeTimers();
    try {
      const requestedPages: number[] = [];
      const fixture = await createFixture((page) => {
        requestedPages.push(page ?? 0);
        return of(
          buildMemberPage({
            page: { number: page ?? 0, size: 1, totalElements: 2, totalPages: 2 },
          }),
        );
      });
      fixture.detectChanges();

      const nextButton = fixture.nativeElement.querySelectorAll(
        'nav button',
      )[1] as HTMLButtonElement;
      nextButton.click();
      fixture.detectChanges();

      const input: HTMLInputElement = fixture.nativeElement.querySelector('#members-search');
      input.value = 'Diallo';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();

      expect(requestedPages).toEqual([0, 1, 0]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not request twice when the debounced search query is unchanged (T-24)', async () => {
    vi.useFakeTimers();
    try {
      const requestedQueries: (string | undefined)[] = [];
      const fixture = await createFixture((_page, _size, q) => {
        requestedQueries.push(q);
        return of(buildMemberPage());
      });
      fixture.detectChanges();

      const input: HTMLInputElement = fixture.nativeElement.querySelector('#members-search');
      input.value = '  Diallo  ';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();

      // La valeur amortie ('Diallo', une fois découpée) ne change pas même si
      // l'utilisateur ajoute puis retire des espaces autour, donc aucune
      // requête supplémentaire n'est déclenchée (distinctUntilChanged).
      input.value = 'Diallo';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();

      expect(requestedQueries).toEqual([undefined, 'Diallo']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('limits the search field to the 100 characters allowed by the SearchQuery contract (T-24)', async () => {
    const fixture = await createFixture(() => of(buildMemberPage()));
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('#members-search');

    expect(input.maxLength).toBe(100);
  });

  it('requests members filtered by status when the status filter changes (T-25)', async () => {
    const requestedStatuses: (MemberStatus | undefined)[] = [];
    const fixture = await createFixture((_page, _size, _q, status) => {
      requestedStatuses.push(status);
      return of(buildMemberPage());
    });
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#members-status-filter');
    select.value = MemberStatus.Inactive;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(requestedStatuses).toEqual([undefined, MemberStatus.Inactive]);
  });

  it('requests the first page again when the status filter changes (T-25)', async () => {
    const requestedPages: (number | undefined)[] = [];
    const fixture = await createFixture((page) => {
      requestedPages.push(page);
      return of(
        buildMemberPage({ page: { number: page ?? 0, size: 1, totalElements: 2, totalPages: 2 } }),
      );
    });
    fixture.detectChanges();

    const nextButton = fixture.nativeElement.querySelectorAll('nav button')[1] as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#members-status-filter');
    select.value = MemberStatus.Active;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(requestedPages).toEqual([0, 1, 0]);
  });

  it('ignores a stale response that resolves after a later filter change (T-25)', async () => {
    const active$ = new Subject<MemberPage>();
    const inactive$ = new Subject<MemberPage>();
    const fixture = await createFixture((_page, _size, _q, status) =>
      status === MemberStatus.Inactive ? inactive$.asObservable() : active$.asObservable(),
    );
    fixture.detectChanges();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#members-status-filter');
    select.value = MemberStatus.Active;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    select.value = MemberStatus.Inactive;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    // La réponse ACTIVE, arrivée après la sélection d'INACTIVE, ne doit pas
    // remplacer le résultat du filtre sélectionné en dernier.
    inactive$.next(
      buildMemberPage({ items: [buildMember({ lastName: 'Bangoura', status: 'INACTIVE' })] }),
    );
    fixture.detectChanges();
    active$.next(
      buildMemberPage({ items: [buildMember({ lastName: 'Diallo', status: 'ACTIVE' })] }),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.statusFilter()).toBe(MemberStatus.Inactive);
    expect(fixture.componentInstance.memberPage()?.items[0].lastName).toBe('Bangoura');
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

  it.each(['OPERATOR', 'MEMBER'] as const)(
    'hides the "Ajouter un membre" action for %s (T-37, RG-MEM-001)',
    async (role) => {
      const fixture = await createFixture(() => of(buildMemberPage()), { role });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const openButton = Array.from(root.querySelectorAll('button')).find((button) =>
        (button as HTMLButtonElement).textContent?.includes('Ajouter un membre'),
      );
      expect(openButton).toBeUndefined();
      expect(root.querySelector('dialog')).toBeNull();
    },
  );

  it.each(['ADMINISTRATOR', 'TREASURER'] as const)(
    'keeps the "Ajouter un membre" action visible for %s',
    async (role) => {
      const fixture = await createFixture(() => of(buildMemberPage()), { role });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const openButton = Array.from(root.querySelectorAll('button')).find((button) =>
        (button as HTMLButtonElement).textContent?.includes('Ajouter un membre'),
      );
      expect(openButton).toBeTruthy();
    },
  );

  it('does not open the create dialog when the role is not authorized (RG-MEM-001)', async () => {
    const fixture = await createFixture(() => of(buildMemberPage()), { role: 'OPERATOR' });
    fixture.detectChanges();

    fixture.componentInstance.openCreateDialog();
    fixture.detectChanges();

    expect(fixture.componentInstance.createDialogOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('dialog')).toBeNull();
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
    expect(listMembers).toHaveBeenCalledWith(0, undefined, undefined, undefined);
    expect(fixture.componentInstance.createDialogOpen()).toBe(false);
  });

  it('displays the default Actif status after creation, without a status field in the form (T-35, RG-MEM-003)', async () => {
    const listMembers = vi.fn(() => of(buildMemberPage()));
    const createMember = vi.fn((request: CreateMemberRequest) =>
      of(buildMemberDetails({ ...request, displayName: 'Mariama Barry', status: 'ACTIVE' })),
    );
    const fixture = await createFixture(listMembers, { createMember });
    fixture.detectChanges();
    fixture.componentInstance.openCreateDialog();
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.directive(MemberCreateForm))
      .componentInstance as MemberCreateForm;
    expect(Object.keys(form.form.controls)).not.toContain('status');

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

    const root: HTMLElement = fixture.nativeElement;
    const confirmation = root.querySelector('[role="status"]');
    expect(confirmation?.textContent).toContain('Mariama Barry');
    expect(confirmation?.textContent).toContain('Actif');
    expect(fixture.componentInstance.createDialogOpen()).toBe(false);
  });

  it('confirms that a user account was created after a successful member creation (T-36, RG-MEM-004)', async () => {
    const listMembers = vi.fn(() => of(buildMemberPage()));
    const createMember = vi.fn((request: CreateMemberRequest) =>
      of(buildMemberDetails({ ...request, displayName: 'Mariama Barry', status: 'ACTIVE' })),
    );
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

    const root: HTMLElement = fixture.nativeElement;
    const confirmation = root.querySelector('[role="status"]');
    expect(confirmation?.textContent).toContain('compte utilisateur');
  });

  it('clears the creation confirmation when reopening the dialog', async () => {
    const listMembers = vi.fn(() => of(buildMemberPage()));
    const createMember = vi.fn((request: CreateMemberRequest) =>
      of(buildMemberDetails({ ...request, displayName: 'Mariama Barry', status: 'ACTIVE' })),
    );
    const fixture = await createFixture(listMembers, { createMember });
    fixture.detectChanges();
    fixture.componentInstance.openCreateDialog();
    fixture.detectChanges();
    fixture.componentInstance.handleCreateMember({
      lastName: 'Barry',
      firstName: 'Mariama',
      incomeCategoryId: demoIncomeCategory.id,
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.createdConfirmation()).not.toBeNull();

    fixture.componentInstance.openCreateDialog();
    fixture.detectChanges();

    expect(fixture.componentInstance.createdConfirmation()).toBeNull();
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

  it('retries the same creation request and clears the error banner on success (T-102)', async () => {
    const request: CreateMemberRequest = {
      lastName: 'Barry',
      firstName: 'Mariama',
      incomeCategoryId: demoIncomeCategory.id,
    };
    const createMember = vi
      .fn()
      .mockReturnValueOnce(throwError(() => new Error('network error')))
      .mockReturnValueOnce(of(buildMemberDetails(request)));
    const fixture = await createFixture(() => of(buildMemberPage()), { createMember });
    fixture.detectChanges();
    fixture.componentInstance.openCreateDialog();
    fixture.detectChanges();

    fixture.componentInstance.handleCreateMember(request);
    fixture.detectChanges();

    const retryButton = Array.from(fixture.nativeElement.querySelectorAll('dialog button')).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Réessayer',
    ) as HTMLButtonElement | undefined;
    expect(retryButton).toBeTruthy();

    retryButton?.click();
    fixture.detectChanges();

    expect(createMember).toHaveBeenCalledTimes(2);
    expect(createMember).toHaveBeenNthCalledWith(2, request);
    expect(fixture.nativeElement.querySelector('dialog [role="alert"]')).toBeNull();
    expect(fixture.componentInstance.createDialogOpen()).toBe(false);
  });
});
