import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { PaymentMethod, RglementsService } from '@api';
import type { Payment, PaymentPage } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';
import fr from '../../../../../assets/i18n/fr.json';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { CampaignPaymentsTab } from './campaign-payments-tab';

const CAMPAIGN_ID = '10700000-0000-4000-8000-000000000200';

function buildPayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: '10700000-0000-4000-8000-000000000700',
    dueId: '10700000-0000-4000-8000-000000000410',
    member: { id: '10700000-0000-4000-8000-000000000500', displayName: 'Amadou Diallo' },
    campaign: {
      id: CAMPAIGN_ID,
      name: 'Solidarité septembre',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      status: 'OPEN',
    },
    amount: 50_000,
    paymentDate: '2026-09-12',
    method: PaymentMethod.MobileMoney,
    recordedBy: { userId: '10700000-0000-4000-8000-000000000900', displayName: 'Mamadou Sy' },
    recordedAt: '2026-09-12T14:32:00Z',
    currency: 'GNF',
    ...overrides,
  };
}

function buildPage(overrides: Partial<PaymentPage> = {}): PaymentPage {
  return {
    items: [buildPayment()],
    page: { number: 0, size: 10, totalElements: 1, totalPages: 1 },
    ...overrides,
  };
}

async function createFixture(
  listPayments: (
    page?: number,
    size?: number,
    q?: string,
    memberId?: string,
    campaignId?: string,
  ) => Observable<PaymentPage>,
): Promise<ComponentFixture<CampaignPaymentsTab>> {
  await TestBed.configureTestingModule({
    imports: [
      CampaignPaymentsTab,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      { provide: RglementsService, useValue: { listPayments } as unknown as RglementsService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(CampaignPaymentsTab);
  fixture.componentRef.setInput('campaignId', CAMPAIGN_ID);
  fixture.detectChanges();
  return fixture;
}

describe('CampaignPaymentsTab', () => {
  it('requests campaign-scoped payments and formats business dates', async () => {
    const listPayments = vi.fn(() => of(buildPage()));
    const fixture = await createFixture(listPayments);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(listPayments).toHaveBeenCalledWith(0, 10, undefined, undefined, CAMPAIGN_ID);
    expect(root.textContent).toContain('Amadou Diallo');
    expect(root.textContent).toContain(formatGnfAmountDetailed(50_000));
    expect(root.textContent).toContain('12 septembre 2026');
    expect(root.textContent).toContain('Mobile Money');
    expect(root.querySelectorAll('thead th')).toHaveLength(4);
  });

  it('does not render payment audit metadata in the MVP table', async () => {
    const fixture = await createFixture(() => of(buildPage()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).not.toContain('Mamadou Sy');
    expect(root.textContent).not.toContain('Horodatage');
  });

  it('shows an error and keeps the previous page when pagination fails', async () => {
    const listPayments = vi.fn((page = 0) =>
      page === 0
        ? of(
            buildPage({
              items: [buildPayment(), buildPayment({ id: '10700000-0000-0000-0000-000000000701' })],
              page: { number: 0, size: 10, totalElements: 20, totalPages: 2 },
            }),
          )
        : throwError(() => new Error('network error')),
    );
    const fixture = await createFixture(listPayments);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    root.querySelectorAll<HTMLButtonElement>('nav button')[1]?.click();
    fixture.detectChanges();

    expect(root.textContent).toContain('Amadou Diallo');
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger les règlements',
    );
    expect(root.textContent).toContain('Réessayer');
  });
});
