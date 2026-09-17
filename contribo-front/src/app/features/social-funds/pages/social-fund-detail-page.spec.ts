import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { CagnottesService, ContributionsService, PaymentMethod, SocialEventType } from '@api';
import type { Contribution, ContributionPage, SocialFund } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { SocialFundDetailPage } from './social-fund-detail-page';

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

async function createFixture(options: {
  getSocialFund: (socialFundId: string) => Observable<SocialFund>;
  listSocialFundContributions: (
    socialFundId: string,
    page?: number,
    size?: number,
  ) => Observable<ContributionPage>;
  socialFundId?: string;
}): Promise<ComponentFixture<SocialFundDetailPage>> {
  const socialFundId = options.socialFundId ?? SOCIAL_FUND_ID;
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
        useValue: { getSocialFund: options.getSocialFund } as unknown as CagnottesService,
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
    expect(alerts.some((el) => el.textContent?.includes('Impossible de charger les contributions'))).toBe(
      true,
    );
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
});
