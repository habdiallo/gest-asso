import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import {
  ContributionsService,
  CurrencyCode,
  PaymentMethod,
  SocialEventType,
  SocialFundStatus,
} from '@api';
import type { ContributionPage } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';
import fr from '../../../../../assets/i18n/fr.json';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { MemberContributionsTab } from './member-contributions-tab';

const memberId = 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11';

const result: ContributionPage = {
  items: [
    {
      id: 'a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
      member: { id: memberId, displayName: 'Amadou Diallo' },
      socialFund: {
        id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
        title: 'Mariage de Fanta et Sekou',
        eventType: SocialEventType.Wedding,
        status: SocialFundStatus.Open,
      },
      amount: 150_000,
      contributionDate: '2026-09-14',
      method: PaymentMethod.MobileMoney,
      recordedBy: { userId: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', displayName: 'M. Bah' },
      recordedAt: '2026-09-14T09:05:00Z',
      currency: CurrencyCode.Gnf,
    },
  ],
  page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
};

async function createFixture(
  listContributions: (
    page?: number,
    size?: number,
    q?: string,
    memberIdFilter?: string,
  ) => Observable<ContributionPage> = () => of(result),
): Promise<ComponentFixture<MemberContributionsTab>> {
  await TestBed.configureTestingModule({
    imports: [
      MemberContributionsTab,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [{ provide: ContributionsService, useValue: { listContributions } }],
  }).compileComponents();

  const fixture = TestBed.createComponent(MemberContributionsTab);
  fixture.componentRef.setInput('memberId', memberId);
  fixture.detectChanges();
  return fixture;
}

describe('MemberContributionsTab', () => {
  it('loads and renders the member contributions to social funds (T-30, US-MEM-003)', async () => {
    const listContributions = vi.fn(() => of(result));
    const fixture = await createFixture(listContributions);
    const root: HTMLElement = fixture.nativeElement;

    expect(listContributions).toHaveBeenCalledWith(0, 10, undefined, memberId);
    expect(root.textContent).toContain('Mariage de Fanta et Sekou');
    expect(root.textContent).toContain(formatGnfAmountDetailed(150_000));
    expect(root.textContent).toContain('Mobile Money');
  });

  it('shows an empty state when the member has no contribution', async () => {
    const fixture = await createFixture(() =>
      of({ items: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } }),
    );

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Aucune contribution aux cagnottes',
    );
  });

  it('shows a retry state when loading fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger les contributions',
    );
    expect(root.querySelector('button')?.textContent).toContain('Réessayer');
  });
});
