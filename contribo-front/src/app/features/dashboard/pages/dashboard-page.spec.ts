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
    listCampaigns?: () => Observable<CampaignPage>;
    listSocialFunds?: () => Observable<SocialFundPage>;
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
    expect(root.textContent).toContain('Bilan financier');
    expect(root.textContent).toContain('Moussa Bah');
    expect(root.textContent).toContain('1 250 000 GNF');
    expect(root.textContent).toContain('Mobile Money');

    const campaignLinks = Array.from(root.querySelectorAll('a[href="/campagnes"]'));
    expect(campaignLinks.map((link) => link.textContent?.trim())).toContain('Tout afficher');
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

    expect(fixture.nativeElement.textContent).not.toContain('Bilan financier');
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
    const campaignSelect: HTMLSelectElement = fixture.nativeElement.querySelector(
      '#dashboard-campaign-scope',
    );
    const socialFundSelect: HTMLSelectElement = fixture.nativeElement.querySelector(
      '#dashboard-social-fund-scope',
    );
    expect(campaignSelect.textContent).toContain('Solidarité septembre');
    expect(socialFundSelect.textContent).toContain('Mariage de Fanta');

    campaignSelect.value = 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20';
    campaignSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(lastCampaignId).toBe('e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20');
    expect(lastSocialFundId).toBeUndefined();
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
    expect(root.textContent).toContain('12 400 000 GNF');
    expect(root.textContent).toContain('18 500 000 GNF');
    expect(root.textContent).toContain('Synthèse de la cagnotte');
    expect(root.textContent).toContain('Mariage de Fanta');
    expect(root.textContent).toContain('4 750 000 GNF');
    expect(root.textContent).toContain('7 000 000 GNF');
    expect(root.textContent).toContain('12 contributeur(s)');
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
