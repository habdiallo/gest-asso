import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CagnottesService, CampagnesService, TableauDeBordService } from '@api';
import type {
  CampaignPage,
  DashboardResponse,
  ManagementDashboard,
  MemberDashboard,
  SocialFundPage,
} from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../assets/i18n/fr.json';
import { DashboardPage } from './dashboard-page';

const viewer: ManagementDashboard['viewer'] = {
  userId: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
  association: {
    id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
    name: 'Association Test',
    currency: 'GNF',
  },
  member: {
    id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12',
    firstName: 'Awa',
    lastName: 'Camara',
    displayName: 'Awa Camara',
    incomeCategory: { id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13', label: 'Standard' },
    status: 'ACTIVE',
  },
  role: 'ADMINISTRATOR',
  operatorCanRecordPayments: false,
  accountActive: true,
};

function buildManagementDashboard(
  overrides: Partial<ManagementDashboard> = {},
): ManagementDashboard {
  return {
    view: 'MANAGEMENT',
    asOf: '2026-09-16T08:00:00Z',
    viewer,
    activeMemberCount: 86,
    registeredMemberCount: 91,
    newMemberCountThisMonth: 3,
    openCampaignCount: 2,
    recentCampaigns: [
      {
        id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
        name: 'Solidarité septembre',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        status: 'OPEN',
        memberCount: 86,
      },
    ],
    ...overrides,
  };
}

function buildMemberDashboard(overrides: Partial<MemberDashboard> = {}): MemberDashboard {
  return {
    view: 'MEMBER',
    asOf: '2026-09-16T08:00:00Z',
    viewer: { ...viewer, role: 'MEMBER' },
    unpaidDueCount: 1,
    totalRemainingAmount: 50000,
    paidDueCount: 2,
    totalContributionAmount: 120000,
    contributedSocialFundCount: 1,
    currency: 'GNF',
    recentDues: [
      {
        id: 'f1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d30',
        member: { id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12', displayName: 'Awa Camara' },
        campaign: {
          id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
          name: 'Solidarité septembre',
          startDate: '2026-09-01',
          endDate: '2026-09-30',
          status: 'OPEN',
        },
        incomeCategorySnapshot: { id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13', label: 'Standard' },
        dueAmount: 100000,
        paidAmount: 50000,
        remainingAmount: 50000,
        status: 'PARTIALLY_PAID',
        paymentCount: 1,
        currency: 'GNF',
      },
    ],
    ...overrides,
  };
}

const emptyCampaignPage: CampaignPage = {
  items: [],
  page: { number: 0, size: 50, totalElements: 0, totalPages: 0 },
};

const emptySocialFundPage: SocialFundPage = {
  items: [],
  page: { number: 0, size: 50, totalElements: 0, totalPages: 0 },
};

async function createFixture(
  getDashboard: () => Observable<DashboardResponse>,
  options: {
    listCampaigns?: (page?: number) => Observable<CampaignPage>;
    listSocialFunds?: (page?: number) => Observable<SocialFundPage>;
  } = {},
): Promise<ComponentFixture<DashboardPage>> {
  await TestBed.configureTestingModule({
    imports: [
      DashboardPage,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      provideRouter([]),
      {
        provide: TableauDeBordService,
        useValue: { getDashboard } as unknown as TableauDeBordService,
      },
      {
        provide: CampagnesService,
        useValue: {
          listCampaigns:
            options.listCampaigns ?? ((): Observable<CampaignPage> => of(emptyCampaignPage)),
        } as unknown as CampagnesService,
      },
      {
        provide: CagnottesService,
        useValue: {
          listSocialFunds:
            options.listSocialFunds ?? ((): Observable<SocialFundPage> => of(emptySocialFundPage)),
        } as unknown as CagnottesService,
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(DashboardPage);
  fixture.detectChanges();
  return fixture;
}

describe('DashboardPage', () => {
  it('shows a loading state while the request is pending', async () => {
    const pending = new Subject<ManagementDashboard>();
    const fixture = await createFixture(() => pending.asObservable());

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Chargement du tableau de bord',
    );
  });

  it('shows an error state when the API call fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger le tableau de bord',
    );
  });

  it('renders the management indicators and formats GNF amounts', async () => {
    const dashboard = buildManagementDashboard({
      financialOverview: {
        recentPayments: [
          {
            id: 'a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d40',
            dueId: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d41',
            member: { id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12', displayName: 'Moussa Bah' },
            campaign: {
              id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
              name: 'Solidarité septembre',
              startDate: '2026-09-01',
              endDate: '2026-09-30',
              status: 'OPEN',
            },
            amount: 1250000,
            paymentDate: '2026-09-12',
            method: 'MOBILE_MONEY',
            recordedBy: {
              userId: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13',
              displayName: 'Fatou Sow',
            },
            recordedAt: '2026-09-12T14:32:00Z',
            currency: 'GNF',
          },
        ],
      },
    });
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Vue de gestion');
    expect(root.textContent).toContain('86');
    expect(root.textContent).toContain('sur 91 membres inscrits');
    expect(root.textContent).toContain('3');
    expect(root.textContent).toContain('2');
    expect(root.textContent).toContain('Solidarité septembre');
    expect(root.textContent).toContain('Ouverte');
    expect(root.textContent).toContain('Derniers règlements');
    expect(root.textContent).toContain('Moussa Bah');
    expect(root.textContent).toContain('1 250 000 GNF');
    expect(root.textContent).toContain('Mobile Money');

    const campaignLinks = Array.from(root.querySelectorAll('a[href="/campagnes"]'));
    expect(campaignLinks.map((link) => link.textContent?.trim())).toContain('Tout afficher');
  });

  it('shows at most 3 recent campaigns/payments with the scope label and a count, hiding the history link when no campaign is selected (T-126)', async () => {
    const payment = (id: string, paymentDate: string) => ({
      id,
      dueId: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d41',
      member: { id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d12', displayName: 'Moussa Bah' },
      campaign: {
        id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
        name: 'Solidarité septembre',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        status: 'OPEN' as const,
      },
      amount: 50000,
      paymentDate,
      method: 'CASH' as const,
      recordedBy: { userId: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13', displayName: 'Fatou Sow' },
      recordedAt: `${paymentDate}T14:32:00Z`,
      currency: 'GNF' as const,
    });
    const dashboard = buildManagementDashboard({
      recentCampaigns: [
        {
          id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
          name: 'Campagne A',
          startDate: '2026-09-01',
          endDate: '2026-09-30',
          status: 'OPEN',
          memberCount: 1,
        },
        {
          id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d21',
          name: 'Campagne B',
          startDate: '2026-08-15',
          endDate: '2026-10-15',
          status: 'OPEN',
          memberCount: 2,
        },
        {
          id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d22',
          name: 'Campagne C',
          startDate: '2026-10-01',
          endDate: '2026-10-31',
          status: 'UPCOMING',
          memberCount: 0,
        },
        {
          id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d23',
          name: 'Campagne D',
          startDate: '2026-07-01',
          endDate: '2026-07-31',
          status: 'CLOSED',
          memberCount: 4,
        },
      ],
      financialOverview: {
        allOpenCampaignsSummary: {
          openCampaignCount: 2,
          financialSummary: {
            expectedAmount: 100000,
            collectedAmount: 50000,
            remainingAmount: 50000,
            collectionRate: 50,
            dueCounts: { total: 2, paid: 1, partiallyPaid: 0, unpaid: 1 },
            currency: 'GNF',
          },
        },
        recentPayments: [
          payment('a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d40', '2026-09-14'),
          payment('a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d41', '2026-09-13'),
          payment('a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d42', '2026-09-12'),
          payment('a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d43', '2026-09-11'),
        ],
      },
    });
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelectorAll('a[href^="/campagnes/"]').length).toBe(3);
    expect(root.textContent).not.toContain('Campagne D');
    expect(root.textContent).toContain('Toutes les campagnes ouvertes · 2 campagne(s)');
    expect(root.textContent).toContain('3 dernier(s) règlement(s) affiché(s) sur 4');

    const historyLinks = Array.from(root.querySelectorAll('a')).filter(
      (link) => link.textContent?.trim() === "Voir l'historique",
    );
    expect(historyLinks).toHaveLength(0);
    expect(root.textContent).not.toContain("Voir l'historique");
  });

  it('shows "Voir l\'historique" as a link to the cotisations tab of the selected campaign (T-126)', async () => {
    const dashboard = buildManagementDashboard({
      financialOverview: {
        selectedCampaign: {
          id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
          name: 'Solidarité septembre',
          startDate: '2026-09-01',
          endDate: '2026-09-30',
          status: 'OPEN',
          memberCount: 86,
        },
        recentPayments: [],
      },
    });
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const historyLink = Array.from(root.querySelectorAll('a')).find(
      (link) => link.textContent?.trim() === "Voir l'historique",
    );
    expect(historyLink).toBeDefined();
    expect(historyLink?.getAttribute('href')).toBe(
      '/campagnes/e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20?onglet=cotisations',
    );
  });

  it('shows the campaign collection rate provided by the API as the progress bar width', async () => {
    const dashboard = buildManagementDashboard({
      recentCampaigns: [
        {
          id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
          name: 'Solidarité septembre',
          startDate: '2026-09-01',
          endDate: '2026-09-30',
          status: 'OPEN',
          memberCount: 86,
          financialSummary: {
            expectedAmount: 18500000,
            collectedAmount: 12400000,
            remainingAmount: 6100000,
            collectionRate: 67,
            dueCounts: { total: 86, paid: 50, partiallyPaid: 10, unpaid: 26 },
            currency: 'GNF',
          },
        },
      ],
    });
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('67%');
    const progressFill = root.querySelector<HTMLElement>('.bg-gradient-to-r.from-gold-hover');
    expect(progressFill?.style.width).toBe('67%');
  });

  it('hides the financial section entirely when financialOverview is absent', async () => {
    const dashboard = buildManagementDashboard({ financialOverview: undefined });
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Derniers règlements');
  });

  it('hides the scope panel and the quick actions campaign shortcut when financialOverview is absent', async () => {
    const dashboard = buildManagementDashboard({ financialOverview: undefined });
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Périmètre des indicateurs');
    expect(fixture.nativeElement.querySelector('#dashboard-campaign-scope')).toBeNull();
  });

  it('shows the scope selectors populated from the open campaigns/social funds and refetches on change', async () => {
    const dashboard = buildManagementDashboard({ financialOverview: { recentPayments: [] } });
    let lastCampaignId: string | undefined;
    let lastSocialFundId: string | undefined;
    const getDashboard = (
      campaignId?: string,
      socialFundId?: string,
    ): Observable<DashboardResponse> => {
      lastCampaignId = campaignId;
      lastSocialFundId = socialFundId;
      return of(dashboard);
    };
    const fixture = await createFixture(getDashboard, {
      listCampaigns: () =>
        of({
          items: [
            {
              id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
              name: 'Solidarité septembre',
              startDate: '2026-09-01',
              endDate: '2026-09-30',
              status: 'OPEN',
              memberCount: 86,
            },
          ],
          page: { number: 0, size: 50, totalElements: 1, totalPages: 1 },
        }),
      listSocialFunds: () =>
        of({
          items: [
            {
              id: 'g1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d50',
              title: 'Mariage de Fanta',
              eventType: 'WEDDING',
              beneficiary: 'Famille Camara',
              startDate: '2026-09-05',
              endDate: '2026-09-28',
              status: 'OPEN',
              collectedAmount: 4750000,
              contributorCount: 12,
              contributionCount: 15,
              currency: 'GNF',
            },
          ],
          page: { number: 0, size: 50, totalElements: 1, totalPages: 1 },
        }),
    });

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Périmètre des indicateurs');
    const campaignTrigger = root.querySelector('#dashboard-campaign-scope') as HTMLButtonElement;
    const socialFundTrigger = root.querySelector(
      '#dashboard-social-fund-scope',
    ) as HTMLButtonElement;

    campaignTrigger.click();
    fixture.detectChanges();
    expect(root.textContent).toContain('Solidarité septembre');
    const campaignOption = Array.from(root.querySelectorAll('[role="option"]')).find((option) =>
      option.textContent?.includes('Solidarité septembre'),
    ) as HTMLButtonElement;
    campaignOption.click();
    fixture.detectChanges();

    expect(lastCampaignId).toBe('e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20');
    expect(lastSocialFundId).toBeUndefined();
    expect(campaignTrigger.textContent).toContain('Solidarité septembre');

    socialFundTrigger.click();
    fixture.detectChanges();
    expect(root.textContent).toContain('Mariage de Fanta');
  });

  it('keeps the latest dashboard response when scope requests complete out of order', async () => {
    const initialRequest = new Subject<DashboardResponse>();
    const scopedRequest = new Subject<DashboardResponse>();
    let requestCount = 0;
    const fixture = await createFixture(() => {
      requestCount += 1;
      return requestCount === 1 ? initialRequest.asObservable() : scopedRequest.asObservable();
    });

    fixture.componentInstance.onCampaignScopeChange('campaign-id');
    scopedRequest.next(buildManagementDashboard({ activeMemberCount: 99 }));
    fixture.detectChanges();
    initialRequest.next(buildManagementDashboard({ activeMemberCount: 12 }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('99');
    expect(fixture.nativeElement.textContent).not.toContain('12');
  });

  it('keeps the current dashboard visible when a scope request fails', async () => {
    const dashboard = buildManagementDashboard({ financialOverview: { recentPayments: [] } });
    let requestCount = 0;
    const fixture = await createFixture(() => {
      requestCount += 1;
      return requestCount === 1
        ? of(dashboard)
        : throwError(() => new Error('scope network error'));
    });

    fixture.componentInstance.onCampaignScopeChange('campaign-id');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('86');
    expect(fixture.nativeElement.textContent).toContain(
      'Impossible de mettre à jour le périmètre. Réessayez.',
    );
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    expect(fixture.componentInstance.loadError()).toBe(false);
  });

  it('retries loading scope options after an option request fails', async () => {
    const dashboard = buildManagementDashboard({ financialOverview: { recentPayments: [] } });
    let campaignListCalls = 0;
    const campaign = {
      id: 'campaign-retried',
      name: 'Campagne réessayée',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      status: 'OPEN' as const,
      memberCount: 10,
    };
    const fixture = await createFixture(() => of(dashboard), {
      listCampaigns: () => {
        campaignListCalls += 1;
        return campaignListCalls === 1
          ? throwError(() => new Error('campaign options error'))
          : of({
              items: [campaign],
              page: { number: 0, size: 50, totalElements: 1, totalPages: 1 },
            });
      },
    });

    expect(fixture.componentInstance.openCampaigns()).toEqual([]);
    fixture.componentInstance.onCampaignScopeChange('campaign-id');
    fixture.detectChanges();

    expect(campaignListCalls).toBe(2);
    expect(fixture.componentInstance.openCampaigns()).toEqual([campaign]);
  });

  it('loads every page of open campaign and social fund options', async () => {
    const dashboard = buildManagementDashboard({ financialOverview: { recentPayments: [] } });
    const fixture = await createFixture(() => of(dashboard), {
      listCampaigns: (page = 0) =>
        of({
          items: [
            {
              id: `campaign-${page}`,
              name: `Campagne ${page}`,
              startDate: '2026-09-01',
              endDate: '2026-09-30',
              status: 'OPEN' as const,
              memberCount: 10,
            },
          ],
          page: { number: page, size: 1, totalElements: 2, totalPages: 2 },
        }),
      listSocialFunds: (page = 0) =>
        of({
          items: [
            {
              id: `fund-${page}`,
              title: `Cagnotte ${page}`,
              eventType: 'WEDDING' as const,
              beneficiary: 'Famille Test',
              startDate: '2026-09-01',
              endDate: '2026-09-30',
              status: 'OPEN' as const,
              collectedAmount: 1000,
              contributorCount: 1,
              contributionCount: 1,
              currency: 'GNF' as const,
            },
          ],
          page: { number: page, size: 1, totalElements: 2, totalPages: 2 },
        }),
    });

    fixture.detectChanges();
    expect(fixture.componentInstance.openCampaigns().map((item) => item.id)).toEqual([
      'campaign-0',
      'campaign-1',
    ]);
    expect(fixture.componentInstance.openSocialFunds().map((item) => item.id)).toEqual([
      'fund-0',
      'fund-1',
    ]);
  });

  it('shows the campaign and social fund synthesis panels from the selected scope', async () => {
    const dashboard = buildManagementDashboard({
      financialOverview: {
        selectedCampaign: {
          id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
          name: 'Solidarité septembre',
          startDate: '2026-09-01',
          endDate: '2026-09-30',
          status: 'OPEN',
          memberCount: 86,
          financialSummary: {
            expectedAmount: 18500000,
            collectedAmount: 12400000,
            remainingAmount: 6100000,
            collectionRate: 67,
            dueCounts: { total: 86, paid: 50, partiallyPaid: 10, unpaid: 26 },
            currency: 'GNF',
          },
        },
        selectedSocialFund: {
          id: 'g1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d50',
          title: 'Mariage de Fanta',
          eventType: 'WEDDING',
          beneficiary: 'Famille Camara',
          startDate: '2026-09-05',
          endDate: '2026-09-28',
          status: 'OPEN',
          targetAmount: 7000000,
          collectedAmount: 4750000,
          contributorCount: 12,
          contributionCount: 15,
          currency: 'GNF',
        },
        recentPayments: [],
      },
    });
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Synthèse des cotisations');
    expect(root.textContent).toContain('12,4M GNF');
    expect(root.textContent).toContain('18,5M GNF');
    expect(root.textContent).toContain('Synthèse de la cagnotte');
    expect(root.textContent).toContain('Mariage de Fanta');
    expect(root.textContent).toContain('4,8M GNF');
    expect(root.textContent).toContain('7M GNF');
    expect(root.textContent).toContain('12 contributeur(s)');
  });

  it('shows the top stat cards scoped to the selected campaign and social fund (T-117)', async () => {
    const dashboard = buildManagementDashboard({
      financialOverview: {
        selectedCampaign: {
          id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20',
          name: 'Solidarité septembre',
          startDate: '2026-09-01',
          endDate: '2026-09-30',
          status: 'OPEN',
          memberCount: 86,
          financialSummary: {
            expectedAmount: 18500000,
            collectedAmount: 12400000,
            remainingAmount: 6100000,
            collectionRate: 67,
            dueCounts: { total: 86, paid: 50, partiallyPaid: 10, unpaid: 26 },
            currency: 'GNF',
          },
        },
        selectedSocialFund: {
          id: 'g1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d50',
          title: 'Mariage de Fanta',
          eventType: 'WEDDING',
          beneficiary: 'Famille Camara',
          startDate: '2026-09-05',
          endDate: '2026-09-28',
          status: 'OPEN',
          targetAmount: 7000000,
          collectedAmount: 4750000,
          contributorCount: 12,
          contributionCount: 15,
          currency: 'GNF',
        },
        recentPayments: [],
      },
    });
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Cotisations encaissées');
    expect(root.textContent).toContain('67 % de 18,5M GNF');
    expect(root.textContent).toContain('Reste sur cotisations');
    expect(root.textContent).toContain('6 100 000 GNF');
    expect(root.textContent).toContain('18,5M GNF attendus');
    expect(root.textContent).toContain('Campagne · Solidarité septembre');
    expect(root.textContent).toContain('Contributions encaissées');
    expect(root.textContent).toContain('4 750 000 GNF');
    expect(root.textContent).toContain('68 % de 7M GNF');
    expect(root.textContent).toContain('Cagnotte · Mariage de Fanta');
    expect(root.textContent).not.toContain('Nouveaux membres ce mois');
    expect(root.textContent).not.toContain('Campagnes ouvertes');
  });

  it('shows a placeholder on the financial stat cards when no campaign or social fund is open', async () => {
    const dashboard = buildManagementDashboard({
      financialOverview: { recentPayments: [] },
    });
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Aucune campagne ouverte à afficher.');
    expect(root.textContent).toContain('Aucune cagnotte ouverte à afficher.');
  });

  it('shows the aggregate of all open campaigns/social funds on the "Toutes ouvertes" option (T-117)', async () => {
    const dashboard = buildManagementDashboard({
      financialOverview: {
        allOpenCampaignsSummary: {
          openCampaignCount: 2,
          financialSummary: {
            expectedAmount: 28300000,
            collectedAmount: 16600000,
            remainingAmount: 11700000,
            collectionRate: 59,
            dueCounts: { total: 148, paid: 80, partiallyPaid: 20, unpaid: 48 },
            currency: 'GNF',
          },
        },
        allOpenSocialFundsSummary: {
          openSocialFundCount: 2,
          targetAmount: 17000000,
          collectedAmount: 12950000,
          progressRate: 76.2,
          contributorCount: 110,
          currency: 'GNF',
        },
        recentPayments: [],
      },
    });
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('59 % de 28,3M GNF');
    expect(root.textContent).toContain('Toutes les campagnes ouvertes · 2 campagne(s)');
    expect(root.textContent).toContain('76 % de 17M GNF');
    expect(root.textContent).toContain('Toutes les cagnottes ouvertes · 2 cagnotte(s)');
  });

  it('keeps the non-financial stat cards when financialOverview is absent', async () => {
    const dashboard = buildManagementDashboard({ financialOverview: undefined });
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Nouveaux membres ce mois');
    expect(root.textContent).toContain('Campagnes ouvertes');
    expect(root.textContent).toContain('Membres inscrits');
    expect(root.textContent).not.toContain('Cotisations encaissées');
  });

  it('shows the Administrator quick actions (roles and categories)', async () => {
    const dashboard = buildManagementDashboard();
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Actions rapides');
    expect(root.textContent).toContain('Ajouter un membre');
    expect(root.textContent).toContain('Gérer les rôles');
    expect(root.textContent).toContain('Gérer les catégories');
    expect(root.textContent).toContain('Créer une campagne');
    expect(root.textContent).not.toContain('Créer une cagnotte');
  });

  it('shows the Operator quick actions limited to consultation shortcuts', async () => {
    const dashboard = buildManagementDashboard({
      viewer: { ...viewer, role: 'OPERATOR', operatorCanRecordPayments: false },
    });
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Consulter les membres');
    expect(root.textContent).toContain('Voir les cagnottes');
    expect(root.textContent).toContain('Voir les campagnes');
    expect(root.textContent).not.toContain('Gérer les rôles');
    expect(root.textContent).not.toContain('Ajouter un membre');
  });

  it('renders the member indicators and formats GNF amounts', async () => {
    const dashboard = buildMemberDashboard();
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Espace membre');
    expect(root.textContent).toContain('Cotisations à payer');
    expect(root.textContent).toContain('50 000 GNF');
    expect(root.textContent).toContain('120 000 GNF');
    expect(root.textContent).toContain('Partiellement payé');
  });

  it('shows the empty-list message when the member has no recent due', async () => {
    const dashboard = buildMemberDashboard({ recentDues: [] });
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucune cotisation récente.');
  });

  it('shows the member profile summary with a link to the personal space', async () => {
    const dashboard = buildMemberDashboard();
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Mon profil');
    expect(root.textContent).toContain('Awa Camara');
    expect(root.textContent).toContain('Standard');
    const profileLink = root.querySelector('a[href="/mon-espace"]');
    expect(profileLink?.textContent?.trim()).toBe('Voir mon profil');
  });
});
