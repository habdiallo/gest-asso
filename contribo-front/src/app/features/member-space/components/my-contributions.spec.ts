import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import {
  CurrencyCode,
  EspacePersonnelService,
  PaymentMethod,
  SocialEventType,
  SocialFundStatus,
} from '@api';
import type { ContributionPage } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import fr from '../../../../assets/i18n/fr.json';
import { MyContributions } from './my-contributions';

const result: ContributionPage = {
  items: [
    {
      id: 'a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
      member: { id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', displayName: 'Mariama Diallo' },
      externalContributor: null,
      socialFund: {
        id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
        title: 'Mariage de Fanta et Sekou',
        eventType: SocialEventType.Wedding,
        status: SocialFundStatus.Open,
      },
      amount: 150_000,
      contributionDate: '2026-09-14',
      method: PaymentMethod.MobileMoney,
      recordedBy: { userId: 'd1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d13', displayName: 'M. Bah' },
      recordedAt: '2026-09-14T09:05:00Z',
      currency: CurrencyCode.Gnf,
    },
  ],
  page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
};

async function createFixture(
  listMyContributions: () => Observable<ContributionPage> = () => of(result),
): Promise<ComponentFixture<MyContributions>> {
  await TestBed.configureTestingModule({
    imports: [
      MyContributions,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [{ provide: EspacePersonnelService, useValue: { listMyContributions } }],
  }).compileComponents();

  const fixture = TestBed.createComponent(MyContributions);
  fixture.detectChanges();
  return fixture;
}

describe('MyContributions', () => {
  it('renders the connected member contributions with fund name, amount and date', async () => {
    const fixture = await createFixture();
    expect(fixture.nativeElement.textContent).toContain('Mariage de Fanta et Sekou');
    expect(fixture.nativeElement.textContent).toContain(formatGnfAmountDetailed(150_000));
    expect(fixture.nativeElement.textContent).toContain('14 septembre 2026');
  });

  it('shows the empty state when the member has no contribution', async () => {
    const fixture = await createFixture(() =>
      of({ items: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } }),
    );
    expect(fixture.nativeElement.textContent).toContain('Aucune contribution pour le moment.');
  });

  it('clears the previous result when a subsequent page fails', async () => {
    let calls = 0;
    const fixture = await createFixture(() => {
      calls += 1;
      return calls === 1 ? of(result) : throwError(() => new Error('network error'));
    });
    fixture.componentInstance.loadPage(1);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Mariage de Fanta et Sekou');
  });
});
