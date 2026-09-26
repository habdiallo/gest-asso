import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { CampagnesService, CurrencyCode, ErrorCode, UserRole } from '@api';
import type {
  Campaign,
  CurrentUser,
  DuePage,
  ErrorResponse,
  CampaignOpeningReadiness,
  UpdateCampaignCategoryAmountsRequest,
} from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { formatGnfAmountDetailed, formatGnfAmountInputDigits } from '@core/formatting/currency';
import { SessionService } from '@core/session/session.service';
import { CampaignDetailPage } from './campaign-detail-page';

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

function buildCampaign(overrides: Partial<Campaign> = {}): Campaign {
  const campaign: Campaign = {
    id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
    name: 'Solidarité septembre',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    status: 'OPEN',
    memberCount: 86,
    description: 'Campagne générale de soutien.',
    categoryAmounts: [
      {
        incomeCategory: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
        amount: 100_000,
        memberCount: 60,
        expectedAmount: 6_000_000,
        currency: CurrencyCode.Gnf,
      },
    ],
    financialSummary: {
      expectedAmount: 6_000_000,
      collectedAmount: 4_000_000,
      remainingAmount: 2_000_000,
      collectionRate: 66.7,
      dueCounts: { total: 60, paid: 40, partiallyPaid: 5, unpaid: 15 },
      currency: CurrencyCode.Gnf,
    },
    openingReadiness: {
      baremeComplete: true,
      datesValid: true,
      startDateReached: true,
      duesReady: true,
      ready: true,
      blockingReasons: [],
    } satisfies CampaignOpeningReadiness,
    ...overrides,
  };
  if (campaign.status !== 'UPCOMING' && !overrides.openingReadiness) {
    campaign.openingReadiness = undefined;
  }
  return campaign;
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
      incomeCategory: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
      status: 'ACTIVE',
    },
    role,
    operatorCanRecordPayments: false,
    accountActive: true,
  };
}

async function createFixture(
  getCampaign: (campaignId: string) => Observable<Campaign>,
  options: {
    updateCampaignCategoryAmounts?: (
      campaignId: string,
      request: UpdateCampaignCategoryAmountsRequest,
    ) => Observable<Campaign>;
    closeCampaign?: (campaignId: string) => Observable<Campaign>;
    openCampaign?: (campaignId: string) => Observable<Campaign>;
    listCampaignDues?: () => Observable<DuePage>;
    role?: UserRole;
    campaignId?: string;
    queryParams?: Record<string, string>;
  } = {},
): Promise<ComponentFixture<CampaignDetailPage>> {
  const campaignId = options.campaignId ?? 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20';
  const updateCampaignCategoryAmounts =
    options.updateCampaignCategoryAmounts ??
    ((): Observable<Campaign> => throwError(() => new Error('not stubbed')));
  const closeCampaign =
    options.closeCampaign ??
    ((): Observable<Campaign> => throwError(() => new Error('not stubbed')));
  const openCampaign =
    options.openCampaign ??
    ((): Observable<Campaign> => throwError(() => new Error('not stubbed')));

  await TestBed.configureTestingModule({
    imports: [
      CampaignDetailPage,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      provideRouter([]),
      {
        provide: CampagnesService,
        useValue: {
          getCampaign,
          updateCampaignCategoryAmounts,
          closeCampaign,
          openCampaign,
          listCampaignDues:
            options.listCampaignDues ??
            (() =>
              of({ items: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } })),
        } as unknown as CampagnesService,
      },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: convertToParamMap({ campaignId }),
            queryParamMap: convertToParamMap(options.queryParams ?? {}),
          },
        },
      },
    ],
  }).compileComponents();

  if (options.role) {
    TestBed.inject(SessionService).setUser(buildCurrentUser(options.role));
  }

  const fixture = TestBed.createComponent(CampaignDetailPage);
  fixture.detectChanges();
  return fixture;
}

function findEditButton(root: HTMLElement): HTMLButtonElement | null {
  const buttons = Array.from(root.querySelectorAll('button')) as HTMLButtonElement[];
  const editButton = buttons.find(
    (button) => button.textContent?.trim() === 'Modifier les montants',
  );
  if (editButton) {
    return editButton;
  }
  buttons.find((button) => button.textContent?.includes('Montants par catégorie'))?.click();
  return (
    (Array.from(root.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Modifier les montants',
    ) as HTMLButtonElement | undefined) ?? null
  );
}

function selectCategoriesTab(fixture: ComponentFixture<CampaignDetailPage>): void {
  const root: HTMLElement = fixture.nativeElement;
  root.querySelectorAll<HTMLButtonElement>('[role="tab"]')[1]?.click();
  fixture.detectChanges();
}

function findButtonByText(root: HTMLElement, text: string): HTMLButtonElement | null {
  const buttons = Array.from(root.querySelectorAll('button')) as HTMLButtonElement[];
  return (
    buttons.find((button) => button.textContent?.trim() === text) ??
    buttons.find((button) => button.textContent?.includes(text)) ??
    null
  );
}

describe('CampaignDetailPage', () => {
  it('shows a loading state while the request is pending', async () => {
    const pending = new Subject<Campaign>();
    const fixture = await createFixture(() => pending.asObservable());

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Chargement de la campagne',
    );
  });

  it('shows an error state when the API call fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger la campagne',
    );
  });

  it('renders campaign name, period, status and description', async () => {
    const fixture = await createFixture(() => of(buildCampaign()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Solidarité septembre');
    expect(root.textContent).toContain('Ouverte');
    expect(root.textContent).toContain('1er septembre 2026');
    expect(root.textContent).toContain('30 septembre 2026');
    expect(root.textContent).toContain('Campagne générale de soutien.');
  });

  it('renders three tabs with the member situation tab active by default', async () => {
    const fixture = await createFixture(() => of(buildCampaign()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    expect(tabs.map((tab) => tab.textContent?.trim())).toEqual([
      'Situation des membres',
      'Montants par catégorie',
      'Règlements',
    ]);

    const situationTab = tabs[0];
    expect(situationTab.getAttribute('aria-selected')).toBe('true');
    expect(situationTab.tabIndex).toBe(0);
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);

    expect(root.querySelector('#campaign-detail-panel-situation')).not.toBeNull();
    expect(root.querySelector('#campaign-detail-panel-categories')).toBeNull();
    expect(root.textContent).toContain('Aucune cotisation pour cette campagne.');
  });

  it('activates the cotisations tab at load from the onglet query param (T-127)', async () => {
    const fixture = await createFixture(() => of(buildCampaign()), {
      queryParams: { onglet: 'cotisations' },
    });
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(root.querySelector('#campaign-detail-panel-situation')).not.toBeNull();
  });

  it('ignores an unrecognized onglet query param and keeps the default tab (T-127)', async () => {
    const fixture = await createFixture(() => of(buildCampaign()), {
      queryParams: { onglet: 'inconnu' },
    });
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  });

  it('switches to the categories tab without a full page reload', async () => {
    const fixture = await createFixture(() => of(buildCampaign()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    tabs[1].click();
    fixture.detectChanges();

    expect(root.querySelector('#campaign-detail-panel-situation')).toBeNull();
    const categoriesPanel = root.querySelector('#campaign-detail-panel-categories');
    expect(categoriesPanel).not.toBeNull();
    expect(categoriesPanel?.textContent).toContain('Barème de la campagne');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([-1, 0, -1]);
  });

  it('renders the target bareme columns, category badges and member units', async () => {
    const fixture = await createFixture(() => of(buildCampaign()));
    fixture.detectChanges();
    selectCategoriesTab(fixture);

    const root: HTMLElement = fixture.nativeElement;
    const table = root.querySelector('#campaign-detail-panel-categories app-data-table table');
    const headers = Array.from(table?.querySelectorAll('thead th') ?? []).map((header) =>
      header.textContent?.trim(),
    );

    expect(headers).toEqual([
      'Catégorie',
      'Montant de cette campagne',
      'Membres concernés',
      'Total attendu',
    ]);
    expect(table?.textContent).toContain('Standard');
    expect(table?.textContent).toContain('60 membres');
    expect(table?.textContent).toContain('6\u202f000\u202f000 GNF');
    expect(root.querySelector('[data-testid="campaign-bareme-mobile-cards"]')).not.toBeNull();
  });

  it('opens the bareme editor from the visible edit action', async () => {
    const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
      role: UserRole.Administrator,
    });
    fixture.detectChanges();
    selectCategoriesTab(fixture);

    const editButton = findEditButton(fixture.nativeElement);
    expect(editButton).not.toBeNull();
    editButton?.click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('dialog[aria-label="Montants de campagne"][open]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Configuration propre à cette campagne.');
    expect(fixture.nativeElement.textContent).toContain('Brouillon');
    expect(fixture.nativeElement.textContent).toContain('Enregistrer');
  });

  it('shows the campaign financial summary in the hero metrics', async () => {
    const fixture = await createFixture(() => of(buildCampaign()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Total attendu');
    expect(root.textContent).toContain('6 000 000 GNF');
    expect(root.textContent).toContain('Total encaissé');
    expect(root.textContent).toContain('4 000 000 GNF');
    expect(root.textContent).toContain('Reste à encaisser');
    expect(root.textContent).toContain('2 000 000 GNF');
    expect(root.textContent).toContain('40 / 60');
  });

  it('does not invent financial metrics when financialSummary is absent', async () => {
    const fixture = await createFixture(() => of(buildCampaign({ financialSummary: undefined })));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).not.toContain('Total attendu');
    expect(root.textContent).not.toContain('Total encaissé');
  });

  describe('keyboard navigation between tabs (T-64)', () => {
    function findActiveTabButton(root: HTMLElement): HTMLButtonElement {
      return root.querySelector('[role="tab"][aria-selected="true"]') as HTMLButtonElement;
    }

    function dispatchArrowKey(target: HTMLElement, key: 'ArrowLeft' | 'ArrowRight'): void {
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    }

    it('moves focus and activation to the next tab on ArrowRight, without a page reload', async () => {
      const fixture = await createFixture(() => of(buildCampaign()));
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      dispatchArrowKey(findActiveTabButton(root), 'ArrowRight');
      fixture.detectChanges();

      const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
      expect(tabs[1].getAttribute('aria-selected')).toBe('true');
      expect(tabs.map((tab) => tab.tabIndex)).toEqual([-1, 0, -1]);
      expect(root.querySelector('#campaign-detail-panel-categories')).not.toBeNull();
      expect(root.querySelector('#campaign-detail-panel-situation')).toBeNull();
      expect(document.activeElement).toBe(tabs[1]);
    });

    it('moves focus and activation to the previous tab on ArrowLeft', async () => {
      const fixture = await createFixture(() => of(buildCampaign()));
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      let tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
      tabs[2].click();
      fixture.detectChanges();

      dispatchArrowKey(findActiveTabButton(root), 'ArrowLeft');
      fixture.detectChanges();

      tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
      expect(tabs[1].getAttribute('aria-selected')).toBe('true');
      expect(document.activeElement).toBe(tabs[1]);
    });

    it('wraps from the last tab to the first on ArrowRight', async () => {
      const fixture = await createFixture(() => of(buildCampaign()));
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      let tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
      tabs[2].click();
      fixture.detectChanges();

      dispatchArrowKey(findActiveTabButton(root), 'ArrowRight');
      fixture.detectChanges();

      tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
      expect(tabs[0].getAttribute('aria-selected')).toBe('true');
      expect(document.activeElement).toBe(tabs[0]);
    });

    it('wraps from the first tab to the last on ArrowLeft', async () => {
      const fixture = await createFixture(() => of(buildCampaign()));
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      dispatchArrowKey(findActiveTabButton(root), 'ArrowLeft');
      fixture.detectChanges();

      const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
      expect(tabs[2].getAttribute('aria-selected')).toBe('true');
      expect(document.activeElement).toBe(tabs[2]);
    });

    it('ignores other keys on the tablist', async () => {
      const fixture = await createFixture(() => of(buildCampaign()));
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      findActiveTabButton(root).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();

      const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
      expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    });
  });

  it('shows the empty bareme message when there is no category amount', async () => {
    const fixture = await createFixture(() => of(buildCampaign({ categoryAmounts: [] })));
    fixture.detectChanges();
    selectCategoriesTab(fixture);

    expect(fixture.nativeElement.textContent).toContain(
      'Aucune catégorie de revenu dans le barème.',
    );
  });

  describe('bareme configuration (T-68)', () => {
    it('does not show the edit action for an Operator, even on an upcoming campaign', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Operator,
      });
      fixture.detectChanges();
      selectCategoriesTab(fixture);

      expect(findEditButton(fixture.nativeElement)).toBeNull();
    });

    it('does not show the edit action for an Administrator while the campaign is open', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'OPEN' })), {
        role: UserRole.Administrator,
      });
      fixture.detectChanges();
      selectCategoriesTab(fixture);

      expect(findEditButton(fixture.nativeElement)).toBeNull();
    });

    it('shows the edit action for an Administrator on an upcoming campaign', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Administrator,
      });
      fixture.detectChanges();
      selectCategoriesTab(fixture);

      expect(findEditButton(fixture.nativeElement)).not.toBeNull();
    });

    it('shows the edit action for a Treasurer on an upcoming campaign', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Treasurer,
      });
      fixture.detectChanges();
      selectCategoriesTab(fixture);

      expect(findEditButton(fixture.nativeElement)).not.toBeNull();
    });

    it('opens an amount input per category pre-filled with the current amount', async () => {
      const fixture = await createFixture(
        () =>
          of(
            buildCampaign({
              status: 'UPCOMING',
              categoryAmounts: [
                {
                  incomeCategory: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
                  amount: 100_000,
                  memberCount: 60,
                  expectedAmount: 6_000_000,
                  currency: CurrencyCode.Gnf,
                },
                {
                  incomeCategory: {
                    id: '10700000-0000-4000-8000-000000000102',
                    label: 'Bienfaiteur',
                  },
                  amount: 250_000,
                  memberCount: 26,
                  expectedAmount: 6_500_000,
                  currency: CurrencyCode.Gnf,
                },
              ],
            }),
          ),
        { role: UserRole.Administrator },
      );
      fixture.detectChanges();
      selectCategoriesTab(fixture);

      findEditButton(fixture.nativeElement)?.click();
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const inputs = Array.from(
        root.querySelectorAll('input[inputmode="numeric"]'),
      ) as HTMLInputElement[];
      expect(inputs).toHaveLength(2);
      expect(inputs[0].value).toBe(formatGnfAmountInputDigits('100000'));
      expect(inputs[1].value).toBe(formatGnfAmountInputDigits('250000'));
      expect(root.textContent).toContain('Standard');
      expect(root.textContent).toContain('Bienfaiteur');
    });

    it('submits the updated amounts and replaces the campaign with the returned state', async () => {
      let capturedRequest: UpdateCampaignCategoryAmountsRequest | undefined;
      const updatedCampaign = buildCampaign({
        status: 'UPCOMING',
        categoryAmounts: [
          {
            incomeCategory: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
            amount: 120_000,
            memberCount: 60,
            expectedAmount: 7_200_000,
            currency: CurrencyCode.Gnf,
          },
        ],
      });

      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Administrator,
        updateCampaignCategoryAmounts: (_campaignId, request) => {
          capturedRequest = request;
          return of(updatedCampaign);
        },
      });
      fixture.detectChanges();
      selectCategoriesTab(fixture);

      findEditButton(fixture.nativeElement)?.click();
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const input = root.querySelector('input[inputmode="numeric"]') as HTMLInputElement;
      input.value = '120000';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const form = root.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(capturedRequest).toEqual({
        categoryAmounts: [
          { incomeCategoryId: '10700000-0000-4000-8000-000000000101', amount: 120_000 },
        ],
      });
      expect(findEditButton(root)).not.toBeNull();
      expect(root.textContent).toContain(formatGnfAmountDetailed(120_000));
    });

    it('formats the bareme amount field live with GNF thousands separators while typing and submits the raw integer (T-70)', async () => {
      let capturedRequest: UpdateCampaignCategoryAmountsRequest | undefined;
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Administrator,
        updateCampaignCategoryAmounts: (_campaignId, request) => {
          capturedRequest = request;
          return of(buildCampaign({ status: 'UPCOMING' }));
        },
      });
      fixture.detectChanges();
      selectCategoriesTab(fixture);

      findEditButton(fixture.nativeElement)?.click();
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const input = root.querySelector('input[inputmode="numeric"]') as HTMLInputElement;

      input.value = '1250000';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Formatage GNF en direct pendant la frappe (RG-FMT-002) : séparateurs
      // de milliers affichés, sans décimale, avec le suffixe GNF porté par
      // `AmountInput` à côté du champ.
      expect(input.value).toBe(formatGnfAmountInputDigits('1250000'));
      expect(root.textContent).toContain('GNF');

      const form = root.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      // La valeur transmise à l'API reste un entier non formaté (RG-FMT-001).
      expect(capturedRequest).toEqual({
        categoryAmounts: [
          { incomeCategoryId: '10700000-0000-4000-8000-000000000101', amount: 1_250_000 },
        ],
      });
    });

    it('blocks submission and shows a required error when an amount is cleared', async () => {
      const updateCampaignCategoryAmounts = vi.fn(() => of(buildCampaign({ status: 'UPCOMING' })));
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Administrator,
        updateCampaignCategoryAmounts,
      });
      fixture.detectChanges();
      selectCategoriesTab(fixture);

      findEditButton(fixture.nativeElement)?.click();
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const input = root.querySelector('input[inputmode="numeric"]') as HTMLInputElement;
      input.value = '';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      const form = root.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(updateCampaignCategoryAmounts).not.toHaveBeenCalled();
      expect(root.querySelector('[role="alert"]')?.textContent).toContain(
        'Le montant est obligatoire.',
      );
    });

    it('blocks submission when an amount of 0 is typed (P2, PR #115: 0 must stay reserved for "not configured")', async () => {
      const updateCampaignCategoryAmounts = vi.fn(() => of(buildCampaign({ status: 'UPCOMING' })));
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Administrator,
        updateCampaignCategoryAmounts,
      });
      fixture.detectChanges();
      selectCategoriesTab(fixture);

      findEditButton(fixture.nativeElement)?.click();
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const input = root.querySelector('input[inputmode="numeric"]') as HTMLInputElement;
      input.value = '0';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      const form = root.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(updateCampaignCategoryAmounts).not.toHaveBeenCalled();
      expect(root.querySelector('[role="alert"]')?.textContent).toContain(
        "Le montant doit être d'au moins 1 GNF.",
      );
    });

    it('shows a dedicated error message when the campaign is no longer editable', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Administrator,
        updateCampaignCategoryAmounts: () =>
          throwError(
            () =>
              new HttpErrorResponse({
                status: 409,
                error: {
                  code: ErrorCode.CampaignNotEditable,
                  message: 'Le barème ne peut plus être modifié.',
                } as ErrorResponse,
              }),
          ),
      });
      fixture.detectChanges();
      selectCategoriesTab(fixture);

      findEditButton(fixture.nativeElement)?.click();
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const form = root.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(root.querySelector('[role="alert"]')?.textContent).toContain(
        'Le barème ne peut plus être modifié : la campagne a déjà commencé ou des règlements existent déjà.',
      );
      // Le dialogue reste ouvert avec la saisie conservée après l'échec.
      expect(root.querySelector('dialog[aria-label="Montants de campagne"][open]')).not.toBeNull();
    });

    it('retries the same bareme submission and clears the error banner on success (T-102)', async () => {
      const updatedCampaign = buildCampaign({ status: 'UPCOMING' });
      const updateCampaignCategoryAmounts = vi
        .fn()
        .mockReturnValueOnce(throwError(() => new Error('network error')))
        .mockReturnValueOnce(of(updatedCampaign));
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Administrator,
        updateCampaignCategoryAmounts,
      });
      fixture.detectChanges();
      selectCategoriesTab(fixture);

      findEditButton(fixture.nativeElement)?.click();
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const form = root.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      const retryButton = Array.from(root.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === 'Réessayer',
      ) as HTMLButtonElement | undefined;
      expect(retryButton).toBeTruthy();

      retryButton?.click();
      fixture.detectChanges();

      expect(updateCampaignCategoryAmounts).toHaveBeenCalledTimes(2);
      expect(root.querySelector('[role="alert"]')).toBeNull();
      expect(findEditButton(root)).not.toBeNull();
    });

    it('cancels editing without calling the API and restores the read-only table', async () => {
      const updateCampaignCategoryAmounts = vi.fn(() => of(buildCampaign({ status: 'UPCOMING' })));
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Administrator,
        updateCampaignCategoryAmounts,
      });
      fixture.detectChanges();
      selectCategoriesTab(fixture);

      findEditButton(fixture.nativeElement)?.click();
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const cancelButton = Array.from(root.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === 'Retour',
      ) as HTMLButtonElement;
      cancelButton.click();
      fixture.detectChanges();

      expect(updateCampaignCategoryAmounts).not.toHaveBeenCalled();
      expect(root.querySelector('dialog[aria-label="Montants de campagne"][open]')).toBeNull();
      expect(findEditButton(root)).not.toBeNull();
    });
  });

  describe("signalement d'une categorie sans montant configure (T-69)", () => {
    function buildCategoryAmounts(): Campaign['categoryAmounts'] {
      return [
        {
          incomeCategory: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
          amount: 0,
          memberCount: 60,
          expectedAmount: 0,
          currency: CurrencyCode.Gnf,
        },
        {
          incomeCategory: { id: '10700000-0000-4000-8000-000000000102', label: 'Bienfaiteur' },
          amount: 250_000,
          memberCount: 26,
          expectedAmount: 6_500_000,
          currency: CurrencyCode.Gnf,
        },
      ];
    }

    it('shows a dedicated badge next to a category whose amount is not configured', async () => {
      const fixture = await createFixture(() =>
        of(buildCampaign({ categoryAmounts: buildCategoryAmounts() })),
      );
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      root.querySelectorAll<HTMLButtonElement>('[role="tab"]')[1]?.click();
      fixture.detectChanges();
      const rows = Array.from(root.querySelectorAll('tbody tr'));
      expect(rows).toHaveLength(2);
      expect(rows[0].textContent).toContain('Montant non configuré');
      expect(rows[1].textContent).not.toContain('Montant non configuré');
    });

    it('does not show the badge for a category with a configured amount', async () => {
      const fixture = await createFixture(() =>
        of(
          buildCampaign({
            categoryAmounts: [
              {
                incomeCategory: { id: '10700000-0000-4000-8000-000000000101', label: 'Standard' },
                amount: 100_000,
                memberCount: 60,
                expectedAmount: 6_000_000,
                currency: CurrencyCode.Gnf,
              },
            ],
          }),
        ),
      );
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      root.querySelectorAll<HTMLButtonElement>('[role="tab"]')[1]?.click();
      fixture.detectChanges();
      expect(root.textContent).not.toContain('Montant non configuré');
    });

    it('also shows the badge while editing a category whose current amount is not configured', async () => {
      const fixture = await createFixture(
        () => of(buildCampaign({ status: 'UPCOMING', categoryAmounts: buildCategoryAmounts() })),
        { role: UserRole.Administrator },
      );
      fixture.detectChanges();
      selectCategoriesTab(fixture);

      findEditButton(fixture.nativeElement)?.click();
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      root.querySelectorAll<HTMLButtonElement>('[role="tab"]')[1]?.click();
      fixture.detectChanges();
      const rows = Array.from(root.querySelectorAll('[data-testid="campaign-bareme-edit-row"]'));
      expect(rows).toHaveLength(2);
      expect(rows[0].textContent).toContain('Montant non configuré');
      expect(rows[1].textContent).not.toContain('Montant non configuré');
    });

    it('removes the badge in edit mode once a non-zero amount is typed', async () => {
      const fixture = await createFixture(
        () => of(buildCampaign({ status: 'UPCOMING', categoryAmounts: buildCategoryAmounts() })),
        { role: UserRole.Administrator },
      );
      fixture.detectChanges();
      selectCategoriesTab(fixture);

      findEditButton(fixture.nativeElement)?.click();
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      root.querySelectorAll<HTMLButtonElement>('[role="tab"]')[1]?.click();
      fixture.detectChanges();
      const inputs = Array.from(
        root.querySelectorAll('input[inputmode="numeric"]'),
      ) as HTMLInputElement[];
      const firstInput = inputs[0];
      firstInput.value = formatGnfAmountInputDigits('150000');
      firstInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const rows = Array.from(root.querySelectorAll('[data-testid="campaign-bareme-edit-row"]'));
      expect(rows[0].textContent).not.toContain('Montant non configuré');
    });
  });

  describe('ouverture explicite de campagne (T-131)', () => {
    it('affiche une checklist bloquante lorsque le barème est incomplet', async () => {
      const fixture = await createFixture(
        () =>
          of(
            buildCampaign({
              status: 'UPCOMING',
              openingReadiness: {
                baremeComplete: false,
                datesValid: true,
                startDateReached: true,
                duesReady: true,
                ready: false,
                blockingReasons: ['BAREME_INCOMPLETE'],
              },
            }),
          ),
        { role: UserRole.Administrator },
      );
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('[data-testid="campaign-opening-readiness"]')).not.toBeNull();
      expect(
        root.querySelector('[detail-metrics-slot] [data-testid="campaign-opening-readiness"]'),
      ).not.toBeNull();
      expect(root.textContent).toContain('Préparation incomplète');
      expect(root.textContent).toContain('Le barème doit être complété.');
      expect(findButtonByText(root, 'Ouvrir la campagne')).toBeNull();
    });

    it('propose l’ouverture à un rôle habilité lorsque la checklist est prête', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Administrator,
      });
      fixture.detectChanges();
      expect(findButtonByText(fixture.nativeElement, 'Ouvrir la campagne')).not.toBeNull();
    });

    it('ne propose pas l’ouverture à un membre même lorsque la checklist est prête', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Member,
      });
      fixture.detectChanges();
      expect(findButtonByText(fixture.nativeElement, 'Ouvrir la campagne')).toBeNull();
    });

    it('demande une confirmation puis remplace la campagne par l’état ouvert', async () => {
      const openCampaign = vi.fn(() =>
        of(
          buildCampaign({
            status: 'OPEN',
            openedAt: '2026-09-26T14:00:00Z',
            openedBy: { userId: 'user-1', displayName: 'Awa Camara' },
          }),
        ),
      );
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Treasurer,
        openCampaign,
      });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      findButtonByText(root, 'Ouvrir la campagne')?.click();
      fixture.detectChanges();

      expect(openCampaign).not.toHaveBeenCalled();
      expect(root.textContent).toContain(
        "Cette action fige définitivement le barème et autorise l'enregistrement des règlements.",
      );

      findButtonByText(root, 'Ouvrir')?.click();
      fixture.detectChanges();

      expect(openCampaign).toHaveBeenCalledWith('e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20');
      expect(fixture.componentInstance.campaign()?.status).toBe('OPEN');
      expect(findButtonByText(root, 'Ouvrir la campagne')).toBeNull();
    });

    it('affiche le conflit serveur lorsque la campagne n’est plus prête', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Administrator,
        openCampaign: () =>
          throwError(
            () =>
              new HttpErrorResponse({
                status: 409,
                error: {
                  code: ErrorCode.CampaignNotReady,
                  message: 'Préparation incomplète.',
                } as ErrorResponse,
              }),
          ),
      });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      findButtonByText(root, 'Ouvrir la campagne')?.click();
      fixture.detectChanges();
      findButtonByText(root, 'Ouvrir')?.click();
      fixture.detectChanges();

      expect(root.querySelector('[role="alert"]')?.textContent).toContain(
        'La campagne ne peut pas encore être ouverte',
      );
      expect(fixture.componentInstance.campaign()?.status).toBe('UPCOMING');
    });
  });

  describe('closure de campagne (T-80)', () => {
    it('does not show the close action for an Operator', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'OPEN' })), {
        role: UserRole.Operator,
      });
      fixture.detectChanges();

      expect(findButtonByText(fixture.nativeElement, 'Clôturer la campagne')).toBeNull();
    });

    it('does not show the close action for a Member', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'OPEN' })), {
        role: UserRole.Member,
      });
      fixture.detectChanges();

      expect(findButtonByText(fixture.nativeElement, 'Clôturer la campagne')).toBeNull();
    });

    it('shows the close action for an Administrator on an open campaign', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'OPEN' })), {
        role: UserRole.Administrator,
      });
      fixture.detectChanges();

      expect(findButtonByText(fixture.nativeElement, 'Clôturer la campagne')).not.toBeNull();
    });

    it('keeps consultation secondary and makes closure primary on an open campaign', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'OPEN' })), {
        role: UserRole.Administrator,
      });
      fixture.detectChanges();

      const root = fixture.nativeElement as HTMLElement;
      const situationButton = findButtonByText(root, 'Voir la situation des membres');
      const closeButton = findButtonByText(root, 'Clôturer la campagne');

      expect(situationButton?.classList.contains('bg-gold')).toBe(false);
      expect(closeButton?.classList.contains('bg-gold')).toBe(true);
    });

    it('does not show the close action for a Treasurer on an upcoming campaign', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Treasurer,
      });
      fixture.detectChanges();

      expect(findButtonByText(fixture.nativeElement, 'Clôturer la campagne')).toBeNull();
      expect(fixture.componentInstance.canCloseCampaignNow()).toBe(false);
    });

    it('does not show the close action for an Administrator once the campaign is already closed', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'CLOSED' })), {
        role: UserRole.Administrator,
      });
      fixture.detectChanges();

      expect(findButtonByText(fixture.nativeElement, 'Clôturer la campagne')).toBeNull();
    });

    it('requires confirmation before calling closeCampaign', async () => {
      const closeCampaign = vi.fn(() => of(buildCampaign({ status: 'CLOSED' })));
      const fixture = await createFixture(() => of(buildCampaign({ status: 'OPEN' })), {
        role: UserRole.Administrator,
        closeCampaign,
      });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      findButtonByText(root, 'Clôturer la campagne')?.click();
      fixture.detectChanges();

      expect(closeCampaign).not.toHaveBeenCalled();
      expect(root.textContent).toContain(
        "Cette action est définitive. Une fois clôturée, la campagne reste consultable mais n'accepte plus de modification ni de nouveau règlement.",
      );

      findButtonByText(root, 'Clôturer')?.click();
      fixture.detectChanges();

      expect(closeCampaign).toHaveBeenCalledWith('e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20');
    });

    it('cancelling the confirmation dialog does not call closeCampaign', async () => {
      const closeCampaign = vi.fn(() => of(buildCampaign({ status: 'CLOSED' })));
      const fixture = await createFixture(() => of(buildCampaign({ status: 'OPEN' })), {
        role: UserRole.Administrator,
        closeCampaign,
      });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      findButtonByText(root, 'Clôturer la campagne')?.click();
      fixture.detectChanges();

      findButtonByText(root, 'Annuler')?.click();
      fixture.detectChanges();

      expect(closeCampaign).not.toHaveBeenCalled();
      expect(findButtonByText(root, 'Clôturer la campagne')).not.toBeNull();
    });

    it('replaces the displayed campaign with the closed state returned by the API', async () => {
      const closedCampaign = buildCampaign({ status: 'CLOSED' });
      const fixture = await createFixture(() => of(buildCampaign({ status: 'OPEN' })), {
        role: UserRole.Administrator,
        closeCampaign: () => of(closedCampaign),
      });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      findButtonByText(root, 'Clôturer la campagne')?.click();
      fixture.detectChanges();
      findButtonByText(root, 'Clôturer')?.click();
      fixture.detectChanges();

      expect(root.textContent).toContain('Clôturée');
      expect(findButtonByText(root, 'Clôturer la campagne')).toBeNull();
    });

    it('applies the closed state returned after the confirmation dialog was closed', async () => {
      const response$ = new Subject<Campaign>();
      const fixture = await createFixture(() => of(buildCampaign({ status: 'OPEN' })), {
        role: UserRole.Administrator,
        closeCampaign: () => response$.asObservable(),
      });
      fixture.detectChanges();

      fixture.componentInstance.openCloseCampaignDialog();
      fixture.componentInstance.confirmCloseCampaign();
      fixture.detectChanges();

      // Fermeture (Annuler/Échap/Fermer) pendant que la requête est encore en attente.
      fixture.componentInstance.cancelCloseCampaignDialog();
      fixture.detectChanges();
      expect(fixture.componentInstance.closeCampaignDialogOpen()).toBe(false);

      response$.next(buildCampaign({ status: 'CLOSED' }));
      response$.complete();
      fixture.detectChanges();

      expect(fixture.componentInstance.campaign()?.status).toBe('CLOSED');
      expect(fixture.componentInstance.canCloseCampaignNow()).toBe(false);
    });

    it('ignores a late bareme response arriving after the campaign is closed (P2, PR #73)', async () => {
      const baremeResponse$ = new Subject<Campaign>();
      const openCampaign = buildCampaign({ status: 'UPCOMING' });
      const fixture = await createFixture(() => of(openCampaign), {
        role: UserRole.Administrator,
        updateCampaignCategoryAmounts: () => baremeResponse$.asObservable(),
        closeCampaign: () => of(buildCampaign({ status: 'CLOSED' })),
      });
      fixture.detectChanges();

      fixture.componentInstance.startEditingBareme();
      fixture.componentInstance.submitBareme();
      fixture.detectChanges();

      fixture.componentInstance.openCloseCampaignDialog();
      fixture.componentInstance.confirmCloseCampaign();
      fixture.detectChanges();

      expect(fixture.componentInstance.campaign()?.status).toBe('CLOSED');

      baremeResponse$.next(buildCampaign({ status: 'OPEN' }));
      baremeResponse$.complete();
      fixture.detectChanges();

      expect(fixture.componentInstance.campaign()?.status).toBe('CLOSED');
      expect(fixture.componentInstance.canCloseCampaignNow()).toBe(false);
    });

    it('shows a dedicated error message when the campaign is already closed server-side', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'OPEN' })), {
        role: UserRole.Administrator,
        closeCampaign: () =>
          throwError(
            () =>
              new HttpErrorResponse({
                status: 409,
                error: {
                  code: ErrorCode.CampaignAlreadyClosed,
                  message: 'Cette campagne est déjà clôturée.',
                } as ErrorResponse,
              }),
          ),
      });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      findButtonByText(root, 'Clôturer la campagne')?.click();
      fixture.detectChanges();
      findButtonByText(root, 'Clôturer')?.click();
      fixture.detectChanges();

      expect(root.querySelector('[role="alert"]')?.textContent).toContain(
        'Cette campagne est déjà clôturée.',
      );
    });

    it('hides the record payment action of the cotisations tab on a closed campaign (T-81)', async () => {
      const due: DuePage = {
        items: [
          {
            id: 'a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
            member: { id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', displayName: 'Amadou Diallo' },
            campaign: {
              id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
              name: 'Solidarité septembre',
              startDate: '2026-09-01',
              endDate: '2026-09-30',
              status: 'CLOSED',
            },
            incomeCategorySnapshot: {
              id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
              label: 'Standard',
            },
            dueAmount: 100_000,
            paidAmount: 50_000,
            remainingAmount: 50_000,
            status: 'PARTIALLY_PAID',
            paymentCount: 1,
            currency: CurrencyCode.Gnf,
          },
        ],
        page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
      };
      const fixture = await createFixture(() => of(buildCampaign({ status: 'CLOSED' })), {
        role: UserRole.Treasurer,
        listCampaignDues: () => of(due),
      });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      findButtonByText(root, 'Cotisations')?.click();
      fixture.detectChanges();

      expect(
        root.textContent?.includes(fr['campaigns.detail.cotisations.recordPayment.action']),
      ).toBe(false);
    });

    it('hides the record payment action of the cotisations tab on an upcoming campaign (T-131)', async () => {
      const upcomingDue: DuePage = {
        items: [
          {
            id: 'a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
            member: { id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', displayName: 'Amadou Diallo' },
            campaign: {
              id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
              name: 'Solidarité septembre',
              startDate: '2026-10-01',
              endDate: '2026-10-31',
              status: 'UPCOMING',
            },
            incomeCategorySnapshot: {
              id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
              label: 'Standard',
            },
            dueAmount: 100_000,
            paidAmount: 50_000,
            remainingAmount: 50_000,
            status: 'PARTIALLY_PAID',
            paymentCount: 1,
            currency: CurrencyCode.Gnf,
          },
        ],
        page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
      };
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Treasurer,
        listCampaignDues: () => of(upcomingDue),
      });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      findButtonByText(root, 'Cotisations')?.click();
      fixture.detectChanges();

      expect(
        root.textContent?.includes(fr['campaigns.detail.cotisations.recordPayment.action']),
      ).toBe(false);
    });
  });
});
