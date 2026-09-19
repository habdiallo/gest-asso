import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import {
  CagnottesService,
  ContributionsService,
  CurrencyCode,
  MemberStatus,
  PaymentMethod,
  SocialEventType,
  UserRole,
} from '@api';
import type { Contribution, ContributionPage, CurrentUser, SocialFund } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { SessionService } from '@core/session/session.service';
import { SocialFundDetailPage } from './social-fund-detail-page';

/*
 * jsdom (Vitest/`@angular/build:unit-test`) n'implémente pas `showModal()`/`close()`
 * de `HTMLDialogElement` (https://github.com/jsdom/jsdom/issues/3294). Même correctif
 * minimal que `roles-users-page.spec.ts`/`form-dialog.spec.ts` pour permettre
 * l'ouverture de la confirmation de clôture (T-93) dans ces tests, sans vérifier le
 * comportement natif réel (délégué au navigateur).
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

const SOCIAL_FUND_ID = '10700000-0000-4000-8000-000000000500';

function buildSocialFund(overrides: Partial<SocialFund> = {}): SocialFund {
  return {
    id: SOCIAL_FUND_ID,
    title: 'Mariage de Fanta et Sékou',
    eventType: SocialEventType.Wedding,
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
    description: "Collecte de soutien à l'occasion du mariage.",
    ...overrides,
  };
}

function buildContribution(overrides: Partial<Contribution> = {}): Contribution {
  return {
    id: '10700000-0000-4000-8000-000000000600',
    member: { id: '10700000-0000-4000-8000-000000000200', displayName: 'Aïcha Bah' },
    socialFund: {
      id: SOCIAL_FUND_ID,
      title: 'Mariage de Fanta et Sékou',
      eventType: SocialEventType.Wedding,
      status: 'OPEN',
    },
    amount: 250000,
    contributionDate: '2026-09-14',
    method: PaymentMethod.MobileMoney,
    recordedBy: { userId: '10700000-0000-4000-8000-000000000900', displayName: 'Mamadou Sy' },
    recordedAt: '2026-09-14T09:05:00Z',
    currency: 'GNF',
    ...overrides,
  };
}

function buildContributionPage(overrides: Partial<ContributionPage> = {}): ContributionPage {
  return {
    items: [buildContribution()],
    page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    ...overrides,
  };
}

function buildCurrentUser(role: UserRole): CurrentUser {
  return {
    userId: '10700000-0000-4000-8000-000000000900',
    association: {
      id: '10700000-0000-4000-8000-000000000901',
      name: 'Association Test',
      currency: CurrencyCode.Gnf,
    },
    member: {
      id: '10700000-0000-4000-8000-000000000902',
      firstName: 'Mamadou',
      lastName: 'Sy',
      displayName: 'Mamadou Sy',
      incomeCategory: { id: '10700000-0000-4000-8000-000000000903', label: 'Catégorie B' },
      status: MemberStatus.Active,
    },
    role,
    operatorCanRecordPayments: false,
    accountActive: true,
  };
}

async function createFixture(options: {
  getSocialFund: (socialFundId: string) => Observable<SocialFund>;
  listSocialFundContributions: (
    socialFundId: string,
    page?: number,
    size?: number,
  ) => Observable<ContributionPage>;
  closeSocialFund?: (socialFundId: string) => Observable<SocialFund>;
  socialFundId?: string;
  role?: UserRole;
}): Promise<ComponentFixture<SocialFundDetailPage>> {
  const socialFundId = options.socialFundId ?? SOCIAL_FUND_ID;
  const closeSocialFund =
    options.closeSocialFund ??
    ((): Observable<SocialFund> => of(buildSocialFund({ status: 'CLOSED' })));
  await TestBed.configureTestingModule({
    imports: [
      SocialFundDetailPage,
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
        useValue: {
          getSocialFund: options.getSocialFund,
          closeSocialFund,
        } as unknown as CagnottesService,
      },
      {
        provide: ContributionsService,
        useValue: {
          listSocialFundContributions: options.listSocialFundContributions,
        } as unknown as ContributionsService,
      },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ socialFundId }) } },
      },
    ],
  }).compileComponents();

  const sessionService = TestBed.inject(SessionService);
  sessionService.setUser(buildCurrentUser(options.role ?? UserRole.Administrator));

  const fixture = TestBed.createComponent(SocialFundDetailPage);
  fixture.detectChanges();
  return fixture;
}

describe('SocialFundDetailPage', () => {
  it('shows a loading state while the social fund request is pending', async () => {
    const pending = new Subject<SocialFund>();
    const fixture = await createFixture({
      getSocialFund: () => pending.asObservable(),
      listSocialFundContributions: () => of(buildContributionPage()),
    });

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Chargement de la cagnotte',
    );
  });

  it('shows an error state when the social fund request fails', async () => {
    const fixture = await createFixture({
      getSocialFund: () => throwError(() => new Error('network error')),
      listSocialFundContributions: () => of(buildContributionPage()),
    });
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger la cagnotte',
    );
  });

  it('renders the social fund title, period, status, description, total collected and contributor count', async () => {
    const fixture = await createFixture({
      getSocialFund: () => of(buildSocialFund()),
      listSocialFundContributions: () => of(buildContributionPage()),
    });
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Mariage de Fanta et Sékou');
    expect(root.textContent).toContain('Mariage');
    expect(root.textContent).toContain('Ouverte');
    expect(root.textContent).toContain('Famille Camara');
    expect(root.textContent).toContain("Collecte de soutien à l'occasion du mariage.");
    expect(root.textContent).toContain(formatGnfAmountDetailed(4750000));
    expect(root.textContent).toContain('43 contributeur(s)');
  });

  it('shows a loading state while the contributions request is pending', async () => {
    const pendingContributions = new Subject<ContributionPage>();
    const fixture = await createFixture({
      getSocialFund: () => of(buildSocialFund()),
      listSocialFundContributions: () => pendingContributions.asObservable(),
    });
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Chargement des contributions');
  });

  it('shows an error state when the contributions request fails', async () => {
    const fixture = await createFixture({
      getSocialFund: () => of(buildSocialFund()),
      listSocialFundContributions: () => throwError(() => new Error('network error')),
    });
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const alerts = Array.from(root.querySelectorAll('[role="alert"]'));
    expect(
      alerts.some((el) => el.textContent?.includes('Impossible de charger les contributions')),
    ).toBe(true);
  });

  it('shows the empty-list message when there is no contribution', async () => {
    const fixture = await createFixture({
      getSocialFund: () => of(buildSocialFund()),
      listSocialFundContributions: () => of(buildContributionPage({ items: [] })),
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucune contribution pour le moment.');
  });

  it('renders the list of contributions with member, amount, date and method', async () => {
    const fixture = await createFixture({
      getSocialFund: () => of(buildSocialFund()),
      listSocialFundContributions: () => of(buildContributionPage()),
    });
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Aïcha Bah');
    expect(root.textContent).toContain(formatGnfAmountDetailed(250000));
    expect(root.textContent).toContain('14 septembre 2026');
    expect(root.textContent).toContain('Mobile Money');
  });

  describe('contributions pagination', () => {
    function buildManyContributions(count: number): Contribution[] {
      return Array.from({ length: count }, (_, index) =>
        buildContribution({
          id: `10700000-0000-4000-8000-0000000007${index.toString().padStart(2, '0')}`,
          member: { id: `member-${index}`, displayName: `Membre ${index + 1}` },
        }),
      );
    }

    it('does not show pagination controls when a single page is returned', async () => {
      const fixture = await createFixture({
        getSocialFund: () => of(buildSocialFund()),
        listSocialFundContributions: () => of(buildContributionPage()),
      });
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('nav[aria-label]')).toBeNull();
    });

    it('shows pagination controls and requests the next page beyond 20 contributions', async () => {
      const listSocialFundContributions = vi.fn((_socialFundId: string, page = 0) =>
        of(
          buildContributionPage({
            items: page === 0 ? buildManyContributions(20) : buildManyContributions(5),
            page: { number: page, size: 20, totalElements: 25, totalPages: 2 },
          }),
        ),
      );
      const fixture = await createFixture({
        getSocialFund: () => of(buildSocialFund()),
        listSocialFundContributions,
      });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.textContent).toContain('Page 1 sur 2');

      const nextButton = root.querySelectorAll<HTMLButtonElement>('nav button')[1];
      nextButton.click();
      fixture.detectChanges();

      expect(listSocialFundContributions).toHaveBeenCalledWith(SOCIAL_FUND_ID, 1, 20);
      expect(root.textContent).toContain('Page 2 sur 2');
    });

    it('keeps the currently displayed page when a page change request fails', async () => {
      const listSocialFundContributions = vi.fn((_socialFundId: string, page = 0) =>
        page === 0
          ? of(
              buildContributionPage({
                items: buildManyContributions(20),
                page: { number: 0, size: 20, totalElements: 25, totalPages: 2 },
              }),
            )
          : throwError(() => new Error('network error')),
      );
      const fixture = await createFixture({
        getSocialFund: () => of(buildSocialFund()),
        listSocialFundContributions,
      });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const nextButton = root.querySelectorAll<HTMLButtonElement>('nav button')[1];
      nextButton.click();
      fixture.detectChanges();

      expect(root.textContent).toContain('Page 1 sur 2');
      expect(root.querySelector('[role="alert"]')).not.toBeNull();
    });
  });

  describe('clôture de la cagnotte (T-93, US-CAG-004)', () => {
    function closeButton(root: HTMLElement): HTMLButtonElement | null {
      return (
        Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
          button.textContent?.includes('Clôturer la cagnotte'),
        ) ?? null
      );
    }

    /**
     * Boutons Annuler/Confirmer de la confirmation, hors bouton de fermeture
     * natif de `FormDialog` (icône dans `<header>`, dont le nom accessible
     * réutilise aussi la clé `socialFunds.close.cancel`, "Annuler").
     */
    function dialogButtonByText(root: HTMLElement, text: string): HTMLButtonElement | undefined {
      return Array.from(
        root.querySelectorAll<HTMLButtonElement>('dialog .overflow-y-auto button'),
      ).find((button) => button.textContent?.trim() === text);
    }

    it('hides the close action for an Opérateur', async () => {
      const fixture = await createFixture({
        getSocialFund: () => of(buildSocialFund()),
        listSocialFundContributions: () => of(buildContributionPage()),
        role: UserRole.Operator,
      });
      fixture.detectChanges();

      expect(closeButton(fixture.nativeElement)).toBeNull();
    });

    it('hides the close action for a Membre', async () => {
      const fixture = await createFixture({
        getSocialFund: () => of(buildSocialFund()),
        listSocialFundContributions: () => of(buildContributionPage()),
        role: UserRole.Member,
      });
      fixture.detectChanges();

      expect(closeButton(fixture.nativeElement)).toBeNull();
    });

    it('hides the close action once the social fund is already closed', async () => {
      const fixture = await createFixture({
        getSocialFund: () => of(buildSocialFund({ status: 'CLOSED' })),
        listSocialFundContributions: () => of(buildContributionPage()),
        role: UserRole.Administrator,
      });
      fixture.detectChanges();

      expect(closeButton(fixture.nativeElement)).toBeNull();
    });

    it('shows the close action for an Administrateur and opens a confirmation dialog without calling the API', async () => {
      const closeSocialFund = vi.fn(() => of(buildSocialFund({ status: 'CLOSED' })));
      const fixture = await createFixture({
        getSocialFund: () => of(buildSocialFund()),
        listSocialFundContributions: () => of(buildContributionPage()),
        closeSocialFund,
        role: UserRole.Administrator,
      });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const button = closeButton(root);
      expect(button).not.toBeNull();
      button?.click();
      fixture.detectChanges();

      const dialog = root.querySelector('dialog');
      expect(dialog?.open).toBe(true);
      expect(root.textContent).toContain('Mariage de Fanta et Sékou');
      expect(closeSocialFund).not.toHaveBeenCalled();
    });

    it('shows the close action for a Trésorier', async () => {
      const fixture = await createFixture({
        getSocialFund: () => of(buildSocialFund()),
        listSocialFundContributions: () => of(buildContributionPage()),
        role: UserRole.Treasurer,
      });
      fixture.detectChanges();

      expect(closeButton(fixture.nativeElement)).not.toBeNull();
    });

    it('closes the dialog without calling the API when cancelling', async () => {
      const closeSocialFund = vi.fn(() => of(buildSocialFund({ status: 'CLOSED' })));
      const fixture = await createFixture({
        getSocialFund: () => of(buildSocialFund()),
        listSocialFundContributions: () => of(buildContributionPage()),
        closeSocialFund,
        role: UserRole.Administrator,
      });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      closeButton(root)?.click();
      fixture.detectChanges();

      const cancelButton = Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(
        (button) => button.textContent?.trim() === 'Annuler',
      );
      cancelButton?.click();
      fixture.detectChanges();

      expect(root.querySelector('dialog')?.open).toBe(false);
      expect(closeSocialFund).not.toHaveBeenCalled();
    });

    it('calls the closure API on confirmation and shows the social fund as closed', async () => {
      const closeSocialFund = vi.fn((socialFundId: string) =>
        of(buildSocialFund({ id: socialFundId, status: 'CLOSED' })),
      );
      const fixture = await createFixture({
        getSocialFund: () => of(buildSocialFund()),
        listSocialFundContributions: () => of(buildContributionPage()),
        closeSocialFund,
        role: UserRole.Administrator,
      });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      closeButton(root)?.click();
      fixture.detectChanges();

      const confirmButton = Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(
        (button) => button.textContent?.trim() === 'Confirmer la clôture',
      );
      confirmButton?.click();
      fixture.detectChanges();

      expect(closeSocialFund).toHaveBeenCalledWith(SOCIAL_FUND_ID);
      expect(root.querySelector('dialog')?.open).toBe(false);
      expect(root.textContent).toContain('Clôturée');
      expect(closeButton(root)).toBeNull();
    });

    it('shows an error and keeps the dialog open when the closure request fails', async () => {
      const closeSocialFund = vi.fn(() => throwError(() => new Error('network error')));
      const fixture = await createFixture({
        getSocialFund: () => of(buildSocialFund()),
        listSocialFundContributions: () => of(buildContributionPage()),
        closeSocialFund,
        role: UserRole.Administrator,
      });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      closeButton(root)?.click();
      fixture.detectChanges();

      const confirmButton = Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(
        (button) => button.textContent?.trim() === 'Confirmer la clôture',
      );
      confirmButton?.click();
      fixture.detectChanges();

      expect(root.querySelector('dialog')?.open).toBe(true);
      expect(root.querySelector('[role="alert"]')?.textContent).toContain(
        'Impossible de clôturer la cagnotte',
      );
    });

    it('ignores Annuler while a closure request is still pending and sends only one request', async () => {
      const response$ = new Subject<SocialFund>();
      const closeSocialFund = vi.fn(() => response$.asObservable());
      const fixture = await createFixture({
        getSocialFund: () => of(buildSocialFund()),
        listSocialFundContributions: () => of(buildContributionPage()),
        closeSocialFund,
        role: UserRole.Administrator,
      });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      closeButton(root)?.click();
      fixture.detectChanges();

      const confirmButton = dialogButtonByText(root, 'Confirmer la clôture');
      confirmButton?.click();
      fixture.detectChanges();

      // Annuler (bouton de confirmation, pas la croix de FormDialog) pendant
      // que la requête est encore en attente.
      const cancelButton = dialogButtonByText(root, 'Annuler');
      cancelButton?.click();
      fixture.detectChanges();
      expect(root.querySelector('dialog')?.open).toBe(true);

      cancelButton?.click();
      confirmButton?.click();
      fixture.detectChanges();

      expect(closeSocialFund).toHaveBeenCalledTimes(1);

      response$.next(buildSocialFund({ status: 'CLOSED' }));
      response$.complete();
      fixture.detectChanges();

      expect(root.querySelector('dialog')?.open).toBe(false);
      expect(root.textContent).toContain('Clôturée');
    });
  });
});
