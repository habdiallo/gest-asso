import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  CagnottesService,
  CurrencyCode,
  MemberStatus,
  SocialEventType,
  SocialFundStatus,
} from '@api';
import type {
  CreateSocialFundRequest,
  CurrentUser,
  SocialFund,
  SocialFundPage,
  UserRole,
} from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { SessionService } from '@core/session/session.service';
import { SocialFundCreateForm } from '../components/social-fund-create-form/social-fund-create-form';
import { SocialFundsListPage } from './social-funds-list-page';

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

function buildSocialFund(overrides: Partial<SocialFund> = {}): SocialFund {
  return {
    id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d30',
    title: 'Mariage de Fanta et Sékou',
    eventType: SocialEventType.Wedding,
    beneficiary: 'Famille Camara',
    startDate: '2026-09-05',
    endDate: '2026-09-28',
    status: 'OPEN',
    collectedAmount: 0,
    contributorCount: 0,
    contributionCount: 0,
    currency: 'GNF',
    ...overrides,
  };
}

function buildSocialFundPage(overrides: Partial<SocialFundPage> = {}): SocialFundPage {
  return {
    items: [
      {
        id: 'a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
        title: 'Mariage de Fanta et Sékou',
        eventType: 'WEDDING',
        beneficiary: 'Famille Camara',
        startDate: '2026-09-05',
        endDate: '2026-09-28',
        status: 'OPEN',
        targetAmount: 7000000,
        collectedAmount: 4750000,
        remainingToTargetAmount: 2250000,
        progressRate: 67.9,
        contributorCount: 43,
        contributionCount: 51,
        currency: 'GNF',
      },
    ],
    page: { number: 0, size: 6, totalElements: 1, totalPages: 1 },
    ...overrides,
  };
}

type ListSocialFunds = (
  page?: number,
  size?: number,
  q?: string,
  status?: string,
  eventType?: string,
) => Observable<SocialFundPage>;

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
  listSocialFunds: ListSocialFunds,
  options: {
    createSocialFund?: (request: CreateSocialFundRequest) => Observable<SocialFund>;
    role?: UserRole;
  } = {},
): Promise<ComponentFixture<SocialFundsListPage>> {
  const createSocialFund =
    options.createSocialFund ?? ((): Observable<SocialFund> => of(buildSocialFund()));

  await TestBed.configureTestingModule({
    imports: [
      SocialFundsListPage,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      provideRouter([]),
      {
        provide: CagnottesService,
        useValue: { listSocialFunds, createSocialFund } as unknown as CagnottesService,
      },
    ],
  }).compileComponents();

  // Rôle par défaut Administrateur (T-86) : les tests qui ne portent pas sur
  // les droits par rôle restent inchangés, l'action "Créer une cagnotte"
  // étant visible pour l'Administrateur comme pour le Trésorier.
  const sessionService = TestBed.inject(SessionService);
  sessionService.setUser(buildCurrentUser(options.role ?? 'ADMINISTRATOR'));

  const fixture = TestBed.createComponent(SocialFundsListPage);
  fixture.detectChanges();
  return fixture;
}

function buildManyItems(count: number): SocialFundPage['items'] {
  return Array.from({ length: count }, (_, index) => ({
    id: `c0000000-0000-4000-8000-${index.toString().padStart(12, '0')}`,
    title: `Cagnotte ${index + 1}`,
    eventType: 'BIRTH',
    beneficiary: 'Famille Test',
    startDate: '2026-09-05',
    endDate: '2026-09-28',
    status: 'OPEN',
    collectedAmount: 10_000,
    contributorCount: 1,
    contributionCount: 1,
    currency: 'GNF',
  }));
}

describe('SocialFundsListPage', () => {
  it('preserves focus while the next page loads and prevents repeated requests', async () => {
    const pending = new Subject<SocialFundPage>();
    const requestedPages: (number | undefined)[] = [];
    const fixture = await createFixture((page) => {
      requestedPages.push(page);
      return page === 0
        ? of(
            buildSocialFundPage({
              page: { number: 0, size: 6, totalElements: 21, totalPages: 2 },
            }),
          )
        : pending.asObservable();
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

    pending.next(
      buildSocialFundPage({ page: { number: 1, size: 6, totalElements: 21, totalPages: 2 } }),
    );
    pending.complete();
    fixture.detectChanges();

    expect(document.activeElement).toBe(nextButton);
    expect(nextButton.getAttribute('aria-disabled')).toBe('true');
    expect(root.textContent).toContain('Page 2 sur 2');
  });

  it('shows a loading state while the request is pending', async () => {
    const pending = new Subject<SocialFundPage>();
    const fixture = await createFixture(() => pending.asObservable());

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Chargement des cagnottes',
    );
  });

  it('shows an error state when the API call fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger les cagnottes',
    );
  });

  it('renders the social funds returned by the API with their progress bar', async () => {
    const fixture = await createFixture(() => of(buildSocialFundPage()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Mariage de Fanta et Sékou');
    expect(root.textContent).toContain('Mariage');
    expect(root.textContent).toContain('Ouverte');
    expect(root.textContent).toContain('Famille Camara');
    expect(root.textContent).toContain('43 contributeur(s)');

    const progressBar = root.querySelector<HTMLElement>(
      '[data-testid="financial-card-progress-bar"]',
    );
    expect(progressBar?.style.width).toBe('67.9%');
    expect(root.querySelector('[data-testid="financial-card-status-dot"]')).not.toBeNull();
    expect(root.querySelector('[role="group"]')?.textContent).toContain('Toutes');
    expect(root.querySelector('[role="group"]')?.textContent).toContain('Ouvertes');
    expect(root.querySelector('[role="group"]')?.textContent).toContain('Clôturées');
  });

  it('requests the selected social fund status on the first page', async () => {
    const listSocialFunds = vi.fn(() => of(buildSocialFundPage()));
    const fixture = await createFixture(listSocialFunds);
    fixture.detectChanges();

    fixture.componentInstance.onStatusFilterChange(SocialFundStatus.Closed);
    fixture.detectChanges();

    expect(listSocialFunds).toHaveBeenLastCalledWith(0, 6, undefined, 'CLOSED', undefined);
  });

  it('debounces the name search and sends the trimmed query to the API', async () => {
    const listSocialFunds = vi.fn(() => of(buildSocialFundPage()));
    const fixture = await createFixture(listSocialFunds);
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector(
      '#social-funds-search',
    ) as HTMLInputElement;
    input.value = '  Bah  ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    expect(listSocialFunds).toHaveBeenLastCalledWith(0, 6, 'Bah', undefined, undefined);
  });

  it('shows the condensed GNF amounts with the full detailed value as a tooltip (RG-FMT-003)', async () => {
    const fixture = await createFixture(() => of(buildSocialFundPage()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('4,8M GNF');
    expect(root.textContent).toContain('7M GNF');
    // La valeur détaillée reste disponible au survol et aux lecteurs d'écran.
    expect(root.querySelector('[title] [aria-hidden="true"]')?.textContent).toBe('4,8M GNF');
    expect(root.querySelector('[title] .sr-only')?.textContent).toBe('4 750 000 GNF');

    const amountSpans = Array.from(root.querySelectorAll<HTMLElement>('[title]')).filter((el) =>
      (el.getAttribute('title') ?? '').includes('GNF'),
    );
    expect(amountSpans.some((el) => el.getAttribute('title') === '4 750 000 GNF')).toBe(true);
    expect(amountSpans.some((el) => el.getAttribute('title') === '7 000 000 GNF')).toBe(true);
  });

  // T-85 : objectif de montant facultatif, avec masquage de la barre de
  // progression et du comparatif "collecté / objectif" quand il est absent.
  it('hides the progress bar when no target amount is defined', async () => {
    const fixture = await createFixture(() =>
      of(
        buildSocialFundPage({
          items: [
            {
              id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d21',
              title: 'Soutien à la famille Diallo',
              eventType: 'DEATH',
              beneficiary: 'Famille Diallo',
              startDate: '2026-08-10',
              endDate: '2026-09-10',
              status: 'CLOSED',
              collectedAmount: 1850000,
              contributorCount: 22,
              contributionCount: 26,
              currency: 'GNF',
            },
          ],
        }),
      ),
    );
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('1,9M GNF');
    expect(root.querySelector('[data-testid="financial-card-progress-bar"]')).toBeNull();
    // Aucun comparatif "collecté / objectif" ne doit apparaître sans objectif défini.
    expect(root.textContent).not.toContain('/');
  });

  it('shows the empty-list message when there is no social fund', async () => {
    const fixture = await createFixture(() => of(buildSocialFundPage({ items: [] })));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucune cagnotte pour le moment.');
  });

  describe('pagination', () => {
    it('does not show pagination controls when a single page is returned', async () => {
      const fixture = await createFixture(() => of(buildSocialFundPage()));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('nav[aria-label]')).toBeNull();
    });

    it('shows pagination controls and requests the next page beyond six social funds', async () => {
      const listSocialFunds = vi.fn((page = 0) =>
        of(
          buildSocialFundPage({
            items: page === 0 ? buildManyItems(6) : buildManyItems(5),
            page: { number: page, size: 6, totalElements: 11, totalPages: 2 },
          }),
        ),
      );
      const fixture = await createFixture(listSocialFunds);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.textContent).toContain('Page 1 sur 2');

      const previousButton = root.querySelectorAll<HTMLButtonElement>('nav button')[0];
      const nextButton = root.querySelectorAll<HTMLButtonElement>('nav button')[1];
      expect(previousButton.getAttribute('aria-disabled')).toBe('true');
      expect(nextButton.getAttribute('aria-disabled')).toBeNull();

      nextButton.click();
      fixture.detectChanges();

      expect(listSocialFunds).toHaveBeenCalledWith(1, 6, undefined, undefined, undefined);
      expect(root.textContent).toContain('Page 2 sur 2');
      expect(previousButton.getAttribute('aria-disabled')).toBeNull();
      expect(nextButton.getAttribute('aria-disabled')).toBe('true');

      previousButton.click();
      fixture.detectChanges();

      expect(listSocialFunds).toHaveBeenCalledWith(0, 6, undefined, undefined, undefined);
      expect(root.textContent).toContain('Page 1 sur 2');
    });

    it('keeps the currently displayed page when a page change request fails', async () => {
      const listSocialFunds = vi.fn((page = 0) =>
        page === 0
          ? of(
              buildSocialFundPage({
                items: buildManyItems(6),
                page: { number: 0, size: 6, totalElements: 11, totalPages: 2 },
              }),
            )
          : throwError(() => new Error('network error')),
      );
      const fixture = await createFixture(listSocialFunds);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const nextButton = root.querySelectorAll<HTMLButtonElement>('nav button')[1];
      nextButton.click();
      fixture.detectChanges();

      expect(root.textContent).toContain('Page 1 sur 2');
      expect(root.querySelector('[role="alert"]')).not.toBeNull();
    });
  });

  describe('event type filter (T-83)', () => {
    it('requests the first page filtered by the selected event type', async () => {
      const listSocialFunds = vi.fn((page = 0) =>
        of(
          buildSocialFundPage({
            page: { number: page, size: 6, totalElements: 1, totalPages: 1 },
          }),
        ),
      );
      const fixture = await createFixture(listSocialFunds);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('#social-funds-event-type-filter')).not.toBeNull();
      fixture.componentInstance.onEventTypeFilterChange('DEATH');
      fixture.detectChanges();

      expect(listSocialFunds).toHaveBeenCalledWith(0, 6, undefined, undefined, 'DEATH');
    });

    it('clears the filter and requests every event type again', async () => {
      const listSocialFunds = vi.fn(() => of(buildSocialFundPage()));
      const fixture = await createFixture(listSocialFunds);
      fixture.detectChanges();

      fixture.componentInstance.onEventTypeFilterChange('WEDDING');
      fixture.detectChanges();

      fixture.componentInstance.onEventTypeFilterChange('');
      fixture.detectChanges();

      expect(listSocialFunds).toHaveBeenLastCalledWith(0, 6, undefined, undefined, undefined);
    });

    it('shows the empty-list message when no social fund matches the selected event type', async () => {
      const listSocialFunds = vi.fn((...args: unknown[]) => {
        const eventType = args[4] as string | undefined;
        return of(
          buildSocialFundPage({
            items: eventType ? [] : buildSocialFundPage().items,
            page: {
              number: 0,
              size: 6,
              totalElements: eventType ? 0 : 1,
              totalPages: eventType ? 0 : 1,
            },
          }),
        );
      });
      const fixture = await createFixture(listSocialFunds);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      fixture.componentInstance.onEventTypeFilterChange('BAPTISM');
      fixture.detectChanges();

      expect(root.textContent).toContain('Aucune cagnotte pour le moment.');
    });

    it('ignores a late response from a filter no longer selected', async () => {
      const responses = new Map<string, Subject<SocialFundPage>>([
        ['', new Subject<SocialFundPage>()],
        ['WEDDING', new Subject<SocialFundPage>()],
        ['DEATH', new Subject<SocialFundPage>()],
      ]);
      const listSocialFunds = vi.fn((...args: unknown[]) => {
        const eventType = (args[4] as string | undefined) ?? '';
        const response = responses.get(eventType);
        if (!response) {
          throw new Error(`Réponse absente pour le filtre ${eventType}.`);
        }
        return response.asObservable();
      });
      const fixture = await createFixture(listSocialFunds);
      fixture.detectChanges();
      responses.get('')?.next(buildSocialFundPage());
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      fixture.componentInstance.onEventTypeFilterChange('WEDDING');
      fixture.detectChanges();

      fixture.componentInstance.onEventTypeFilterChange('DEATH');
      fixture.detectChanges();

      responses
        .get('DEATH')
        ?.next(
          buildSocialFundPage({ items: [{ ...buildSocialFundPage().items[0], title: 'Deces' }] }),
        );
      responses.get('WEDDING')?.next(
        buildSocialFundPage({
          items: [{ ...buildSocialFundPage().items[0], title: 'Mariage tardif' }],
        }),
      );
      fixture.detectChanges();

      expect(root.textContent).toContain('Deces');
      expect(root.textContent).not.toContain('Mariage tardif');
    });

    // T-114 : retours P2 de la PR #43, l'ancienne page (avec pagination) ne
    // doit plus rester affichée ni cliquable pendant/après une erreur sur le
    // nouveau filtre.
    it('clears the previously displayed page and hides stale pagination while the filtered page zero is loading', async () => {
      const pending = new Subject<SocialFundPage>();
      const listSocialFunds = vi.fn(
        (page = 0, _size?: number, _q?: string, _status?: string, eventType?: string) =>
          eventType === undefined
            ? of(
                buildSocialFundPage({
                  items: buildManyItems(6),
                  page: { number: page, size: 6, totalElements: 11, totalPages: 2 },
                }),
              )
            : pending.asObservable(),
      );
      const fixture = await createFixture(listSocialFunds);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('nav[aria-label]')).not.toBeNull();

      fixture.componentInstance.onEventTypeFilterChange('DEATH');
      fixture.detectChanges();

      // La page précédente (issue du filtre "tous types") est vidée et sa
      // pagination masquée pendant le chargement de la nouvelle page zéro
      // filtrée : aucun ancien bouton "Suivant" ne reste cliquable. Le
      // message affiché est un état de chargement distinct de l'état vide
      // (retour P3 de la PR #96), pour ne pas laisser croire que le filtre
      // ne renvoie aucun résultat pendant l'attente.
      expect(root.textContent).toContain('Chargement des cagnottes');
      expect(root.textContent).not.toContain('Aucune cagnotte pour le moment.');
      expect(root.querySelector('nav[aria-label]')).toBeNull();

      pending.next(
        buildSocialFundPage({
          items: buildManyItems(3),
          page: { number: 0, size: 6, totalElements: 3, totalPages: 1 },
        }),
      );
      fixture.detectChanges();

      expect(root.textContent).toContain('Cagnotte 1');
      expect(root.querySelector('[role="alert"]')).toBeNull();
    });

    // Retour P3 de la revue de la PR #96 : le message vide ne doit pas
    // s'afficher pendant le chargement d'un filtre, sous peine de laisser
    // croire à tort que le filtre ne renvoie aucun résultat.
    it('shows a loading status, not the empty message, while a filter change is pending', async () => {
      const pending = new Subject<SocialFundPage>();
      const listSocialFunds = vi.fn((...args: unknown[]) => {
        const eventType = args[4] as string | undefined;
        return eventType === undefined ? of(buildSocialFundPage()) : pending.asObservable();
      });
      const fixture = await createFixture(listSocialFunds);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      fixture.componentInstance.onEventTypeFilterChange('DEATH');
      fixture.detectChanges();

      expect(root.textContent).toContain('Chargement des cagnottes');
      expect(root.textContent).not.toContain('Aucune cagnotte pour le moment.');
      expect(root.querySelector('[role="status"]')).not.toBeNull();

      pending.next(buildSocialFundPage({ items: [] }));
      fixture.detectChanges();

      expect(root.textContent).not.toContain('Chargement des cagnottes');
      expect(root.textContent).toContain('Aucune cagnotte pour le moment.');
    });

    it('treats a failed filtered load as an absent page: shows the error even on a single-page result and blocks any request from the previous controls', async () => {
      const listSocialFunds = vi.fn(
        (page = 0, _size?: number, _q?: string, _status?: string, eventType?: string) =>
          eventType === undefined
            ? of(
                buildSocialFundPage({
                  items: buildManyItems(6),
                  page: { number: page, size: 6, totalElements: 11, totalPages: 2 },
                }),
              )
            : throwError(() => new Error('network error')),
      );
      const fixture = await createFixture(listSocialFunds);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelectorAll<HTMLButtonElement>('nav button')).toHaveLength(2);

      fixture.componentInstance.onEventTypeFilterChange('DEATH');
      fixture.detectChanges();

      // Échec du chargement filtré traité comme une absence de page : la
      // liste précédente n'est plus affichée, l'erreur est visible même sans
      // pagination (une seule page filtrée, ici aucune), et il n'existe plus
      // de bouton "Suivant" issu de l'ancien filtre à cliquer.
      expect(root.textContent).toContain('Aucune cagnotte pour le moment.');
      expect(root.querySelector('[role="alert"]')?.textContent).toContain(
        'Impossible de charger les cagnottes',
      );
      expect(root.querySelector('nav[aria-label]')).toBeNull();
      expect(listSocialFunds).toHaveBeenCalledTimes(2);
    });
  });

  describe('creation (T-84)', () => {
    it('opens the create-social-fund dialog from the button and closes it on cancel', async () => {
      const fixture = await createFixture(() => of(buildSocialFundPage()));
      fixture.detectChanges();

      const openButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
        (button) => (button as HTMLButtonElement).textContent?.includes('Créer une cagnotte'),
      ) as HTMLButtonElement | undefined;
      expect(openButton).toBeTruthy();
      openButton?.click();
      fixture.detectChanges();

      const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
      expect(dialog.open).toBe(true);

      const form = fixture.debugElement.query(By.directive(SocialFundCreateForm))
        .componentInstance as SocialFundCreateForm;
      form.cancel();
      fixture.detectChanges();

      expect(dialog.open).toBe(false);
    });

    it('creates a social fund, refreshes the first page and closes the dialog on success', async () => {
      const listSocialFunds = vi.fn(() => of(buildSocialFundPage()));
      const createSocialFund = vi.fn((request: CreateSocialFundRequest) =>
        of(buildSocialFund(request)),
      );
      const fixture = await createFixture(listSocialFunds, { createSocialFund });
      fixture.detectChanges();
      fixture.componentInstance.openCreateDialog();
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.directive(SocialFundCreateForm))
        .componentInstance as SocialFundCreateForm;
      form.form.setValue({
        title: 'Naissance chez les Bah',
        eventType: SocialEventType.Birth,
        description: '',
        beneficiary: 'Famille Bah',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        targetAmount: null,
      });
      form.submit();
      fixture.detectChanges();

      expect(createSocialFund).toHaveBeenCalledWith({
        title: 'Naissance chez les Bah',
        eventType: SocialEventType.Birth,
        beneficiary: 'Famille Bah',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
      });
      expect(listSocialFunds).toHaveBeenLastCalledWith(0, 6, undefined, undefined, undefined);
      expect(fixture.componentInstance.createDialogOpen()).toBe(false);
    });

    it('shows an error banner and keeps the dialog open when creation fails', async () => {
      const createSocialFund = vi.fn(() => throwError(() => new Error('network error')));
      const fixture = await createFixture(() => of(buildSocialFundPage()), { createSocialFund });
      fixture.detectChanges();
      fixture.componentInstance.openCreateDialog();
      fixture.detectChanges();

      fixture.componentInstance.handleCreateSocialFund({
        title: 'Naissance chez les Bah',
        eventType: SocialEventType.Birth,
        beneficiary: 'Famille Bah',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
      });
      fixture.detectChanges();

      expect(fixture.componentInstance.createDialogOpen()).toBe(true);
      expect(fixture.nativeElement.querySelector('dialog [role="alert"]')?.textContent).toContain(
        'Impossible de créer la cagnotte',
      );
    });

    it('retries the same creation request and clears the error banner on success (T-102)', async () => {
      const request: CreateSocialFundRequest = {
        title: 'Naissance chez les Bah',
        eventType: SocialEventType.Birth,
        beneficiary: 'Famille Bah',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
      };
      const createSocialFund = vi
        .fn()
        .mockReturnValueOnce(throwError(() => new Error('network error')))
        .mockReturnValueOnce(of(buildSocialFund(request)));
      const fixture = await createFixture(() => of(buildSocialFundPage()), { createSocialFund });
      fixture.detectChanges();
      fixture.componentInstance.openCreateDialog();
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.directive(SocialFundCreateForm))
        .componentInstance as SocialFundCreateForm;
      form.form.setValue({ ...request, description: '', targetAmount: null });
      form.submit();
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const retryButton = Array.from(root.querySelectorAll('dialog button')).find(
        (button) => button.textContent?.trim() === 'Réessayer',
      ) as HTMLButtonElement | undefined;
      expect(retryButton).toBeTruthy();

      retryButton?.click();
      fixture.detectChanges();

      expect(createSocialFund).toHaveBeenCalledTimes(2);
      expect(createSocialFund).toHaveBeenNthCalledWith(2, request);
      expect(root.querySelector('dialog [role="alert"]')).toBeNull();
      expect(fixture.componentInstance.createDialogOpen()).toBe(false);
    });

    it('sends the field corrected after a failed creation, not the stale request, on retry (T-102)', async () => {
      const request: CreateSocialFundRequest = {
        title: 'Naissance chez les Bah',
        eventType: SocialEventType.Birth,
        beneficiary: 'Famille Bah',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
      };
      const createSocialFund = vi
        .fn()
        .mockReturnValueOnce(throwError(() => new Error('network error')))
        .mockReturnValueOnce(of(buildSocialFund(request)));
      const fixture = await createFixture(() => of(buildSocialFundPage()), { createSocialFund });
      fixture.detectChanges();
      fixture.componentInstance.openCreateDialog();
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.directive(SocialFundCreateForm))
        .componentInstance as SocialFundCreateForm;
      form.form.setValue({ ...request, description: '', targetAmount: null });
      form.submit();
      fixture.detectChanges();

      form.form.patchValue({ beneficiary: 'Famille Diallo' });
      fixture.componentInstance.retryCreateSocialFund();
      fixture.detectChanges();

      expect(createSocialFund).toHaveBeenCalledTimes(2);
      expect(createSocialFund).toHaveBeenNthCalledWith(2, {
        ...request,
        beneficiary: 'Famille Diallo',
      });
    });
  });

  describe('role-based access to creation (T-86)', () => {
    it.each(['OPERATOR', 'MEMBER'] as const)(
      'hides the "Créer une cagnotte" action for %s (RG-CAG-002/003)',
      async (role) => {
        const fixture = await createFixture(() => of(buildSocialFundPage()), { role });
        fixture.detectChanges();

        const root: HTMLElement = fixture.nativeElement;
        const openButton = Array.from(root.querySelectorAll('button')).find((button) =>
          (button as HTMLButtonElement).textContent?.includes('Créer une cagnotte'),
        );
        expect(openButton).toBeUndefined();
        expect(root.querySelector('dialog')).toBeNull();
      },
    );

    it.each(['ADMINISTRATOR', 'TREASURER'] as const)(
      'keeps the "Créer une cagnotte" action visible for %s',
      async (role) => {
        const fixture = await createFixture(() => of(buildSocialFundPage()), { role });
        fixture.detectChanges();

        const root: HTMLElement = fixture.nativeElement;
        const openButton = Array.from(root.querySelectorAll('button')).find((button) =>
          (button as HTMLButtonElement).textContent?.includes('Créer une cagnotte'),
        );
        expect(openButton).toBeTruthy();
      },
    );

    it('does not open the create dialog when the role is not authorized (RG-CAG-002/003)', async () => {
      const fixture = await createFixture(() => of(buildSocialFundPage()), { role: 'OPERATOR' });
      fixture.detectChanges();

      fixture.componentInstance.openCreateDialog();
      fixture.detectChanges();

      expect(fixture.componentInstance.createDialogOpen()).toBe(false);
    });
  });
});
