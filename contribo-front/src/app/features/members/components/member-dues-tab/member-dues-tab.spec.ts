import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { CampaignStatus, CurrencyCode, DueStatus, MemberStatus, MembresService } from '@api';
import type { CurrentUser, DuePage, UserRole } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';
import fr from '../../../../../assets/i18n/fr.json';
import { SessionService } from '@core/session/session.service';
import { MemberDuesTab } from './member-dues-tab';

const memberId = 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10';

const result: DuePage = {
  items: [
    {
      id: 'a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
      member: { id: memberId, displayName: 'Amadou Diallo' },
      campaign: {
        id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
        name: 'Solidarité septembre',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        status: CampaignStatus.Open,
      },
      incomeCategorySnapshot: { id: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', label: 'Standard' },
      dueAmount: 100_000,
      paidAmount: 50_000,
      remainingAmount: 50_000,
      status: DueStatus.PartiallyPaid,
      paymentCount: 1,
      currency: CurrencyCode.Gnf,
    },
  ],
  page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
};

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
  listMemberDues: () => Observable<DuePage> = () => of(result),
  options: { role?: UserRole } = {},
): Promise<ComponentFixture<MemberDuesTab>> {
  await TestBed.configureTestingModule({
    imports: [
      MemberDuesTab,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [{ provide: MembresService, useValue: { listMemberDues } }],
  }).compileComponents();

  if (options.role) {
    const sessionService = TestBed.inject(SessionService);
    sessionService.setUser(buildCurrentUser(options.role));
  }

  const fixture = TestBed.createComponent(MemberDuesTab);
  fixture.componentRef.setInput('memberId', memberId);
  fixture.detectChanges();
  return fixture;
}

describe('MemberDuesTab', () => {
  it('loads and renders the member dues', async () => {
    const fixture = await createFixture();
    const root: HTMLElement = fixture.nativeElement;

    expect(root.textContent).toContain('Solidarité septembre');
    expect(root.textContent).toContain('Partiellement payé');
  });

  it.each(['ADMINISTRATOR', 'TREASURER', 'OPERATOR'] as const)(
    'shows exactly the business columns Campagne, Dû, Payé, Reste, Statut for %s, without an income category column (T-130)',
    async (role) => {
      const fixture = await createFixture(() => of(result), { role });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.textContent).not.toContain('Standard');
      const headers = Array.from(root.querySelectorAll('thead th')).map((th) =>
        th.textContent?.trim(),
      );
      expect(headers).toEqual([
        'Campagne',
        'Montant dû',
        'Montant payé',
        'Reste à payer',
        'Statut',
      ]);
      const row = root.querySelector('tbody tr');
      expect(row?.querySelectorAll('td').length).toBe(4);
    },
  );

  it('reloads the first page when refreshToken changes (T-130)', async () => {
    const listMemberDues = vi.fn(() => of(result));
    const fixture = await createFixture(listMemberDues);
    expect(listMemberDues).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('refreshToken', 1);
    fixture.detectChanges();

    expect(listMemberDues).toHaveBeenCalledTimes(2);
    expect(listMemberDues).toHaveBeenNthCalledWith(2, memberId, 0, 10);
  });

  it('shows an empty state when the member has no due', async () => {
    const emptyPage: DuePage = {
      items: [],
      page: { number: 0, size: 20, totalElements: 0, totalPages: 1 },
    };
    const fixture = await createFixture(() => of(emptyPage));

    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'Aucune cotisation',
    );
  });

  it('shows a retry state when loading fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger les cotisations',
    );
    expect(fixture.nativeElement.querySelector('button')?.textContent).toContain('Réessayer');
  });
});
