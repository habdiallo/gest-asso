import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { CampagnesService, CurrencyCode, ErrorCode, UserRole } from '@api';
import type {
  Campaign,
  CurrentUser,
  ErrorResponse,
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
  return {
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
    role?: UserRole;
    campaignId?: string;
  } = {},
): Promise<ComponentFixture<CampaignDetailPage>> {
  const campaignId = options.campaignId ?? 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20';
  const updateCampaignCategoryAmounts =
    options.updateCampaignCategoryAmounts ??
    ((): Observable<Campaign> => throwError(() => new Error('not stubbed')));
  const closeCampaign =
    options.closeCampaign ??
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
          listCampaignDues: () =>
            of({ items: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } }),
        } as unknown as CampagnesService,
      },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ campaignId }) } },
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
  return (
    (Array.from(root.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Modifier le barème',
    ) as HTMLButtonElement | undefined) ?? null
  );
}

function findButtonByText(root: HTMLElement, text: string): HTMLButtonElement | null {
  return (
    (Array.from(root.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === text,
    ) as HTMLButtonElement | undefined) ?? null
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
    expect(root.textContent).toContain('1 septembre 2026');
    expect(root.textContent).toContain('30 septembre 2026');
    expect(root.textContent).toContain('Campagne générale de soutien.');
  });

  it('renders three tabs with the bareme tab active by default', async () => {
    const fixture = await createFixture(() => of(buildCampaign()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    expect(tabs.map((tab) => tab.textContent?.trim())).toEqual(['Barème', 'Cotisations', 'Bilan']);

    const baremeTab = tabs[0];
    expect(baremeTab.getAttribute('aria-selected')).toBe('true');
    expect(baremeTab.tabIndex).toBe(0);
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, 0, 0]);

    expect(root.querySelector('#campaign-tabpanel-bareme')).not.toBeNull();
    expect(root.querySelector('#campaign-tabpanel-cotisations')).toBeNull();
    expect(root.textContent).toContain('Standard');
    expect(root.textContent).toContain(formatGnfAmountDetailed(100_000));
  });

  it('switches to the cotisations tab without a full page reload', async () => {
    const fixture = await createFixture(() => of(buildCampaign()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    tabs[1].click();
    fixture.detectChanges();

    expect(root.querySelector('#campaign-tabpanel-bareme')).toBeNull();
    const cotisationsPanel = root.querySelector('#campaign-tabpanel-cotisations');
    expect(cotisationsPanel).not.toBeNull();
    expect(cotisationsPanel?.textContent).toContain('Aucune cotisation pour cette campagne.');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, 0, 0]);
  });

  it('switches to the bilan tab', async () => {
    const fixture = await createFixture(() => of(buildCampaign()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    tabs[2].click();
    fixture.detectChanges();

    const bilanPanel = root.querySelector('#campaign-tabpanel-bilan');
    expect(bilanPanel).not.toBeNull();
    expect(bilanPanel?.textContent).toContain(
      'Le bilan de la campagne sera disponible prochainement.',
    );
  });

  it('shows the empty bareme message when there is no category amount', async () => {
    const fixture = await createFixture(() => of(buildCampaign({ categoryAmounts: [] })));
    fixture.detectChanges();

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

      expect(findEditButton(fixture.nativeElement)).toBeNull();
    });

    it('does not show the edit action for an Administrator once the campaign is open', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'OPEN' })), {
        role: UserRole.Administrator,
      });
      fixture.detectChanges();

      expect(findEditButton(fixture.nativeElement)).toBeNull();
    });

    it('shows the edit action for an Administrator on an upcoming campaign', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Administrator,
      });
      fixture.detectChanges();

      expect(findEditButton(fixture.nativeElement)).not.toBeNull();
    });

    it('shows the edit action for a Treasurer on an upcoming campaign', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Treasurer,
      });
      fixture.detectChanges();

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

    it('blocks submission and shows a required error when an amount is cleared', async () => {
      const updateCampaignCategoryAmounts = vi.fn(() => of(buildCampaign({ status: 'UPCOMING' })));
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Administrator,
        updateCampaignCategoryAmounts,
      });
      fixture.detectChanges();

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

      findEditButton(fixture.nativeElement)?.click();
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const form = root.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(root.querySelector('[role="alert"]')?.textContent).toContain(
        'Le barème ne peut plus être modifié : la campagne a déjà commencé ou des règlements existent déjà.',
      );
      // Le formulaire reste ouvert avec la saisie conservée après l'échec.
      expect(root.querySelector('form')).not.toBeNull();
    });

    it('cancels editing without calling the API and restores the read-only table', async () => {
      const updateCampaignCategoryAmounts = vi.fn(() => of(buildCampaign({ status: 'UPCOMING' })));
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Administrator,
        updateCampaignCategoryAmounts,
      });
      fixture.detectChanges();

      findEditButton(fixture.nativeElement)?.click();
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const cancelButton = Array.from(root.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === 'Annuler',
      ) as HTMLButtonElement;
      cancelButton.click();
      fixture.detectChanges();

      expect(updateCampaignCategoryAmounts).not.toHaveBeenCalled();
      expect(root.querySelector('form')).toBeNull();
      expect(findEditButton(root)).not.toBeNull();
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

    it('shows the close action for a Treasurer on an upcoming campaign', async () => {
      const fixture = await createFixture(() => of(buildCampaign({ status: 'UPCOMING' })), {
        role: UserRole.Treasurer,
      });
      fixture.detectChanges();

      expect(findButtonByText(fixture.nativeElement, 'Clôturer la campagne')).not.toBeNull();
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
  });
});
