import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TableauDeBordService } from '@api';
import type { DashboardResponse, ManagementDashboard, MemberDashboard } from '@api';
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

async function createFixture(
  getDashboard: () => Observable<DashboardResponse>,
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
      {
        provide: TableauDeBordService,
        useValue: { getDashboard } as unknown as TableauDeBordService,
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
  });

  it('hides the financial section entirely when financialOverview is absent', async () => {
    const dashboard = buildManagementDashboard({ financialOverview: undefined });
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Bilan financier');
  });

  it('renders the member indicators and formats GNF amounts', async () => {
    const dashboard = buildMemberDashboard();
    const fixture = await createFixture(() => of(dashboard));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
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
});
