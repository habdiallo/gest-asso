import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { RglementsService, PaymentMethod } from '@api';
import type { Payment, PaymentPage } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { Subject, of, throwError } from 'rxjs';
import fr from '../../../../../assets/i18n/fr.json';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { MemberPaymentsTab } from './member-payments-tab';

const MEMBER_ID = '10700000-0000-4000-8000-000000000500';

function buildPayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: '10700000-0000-4000-8000-000000000700',
    dueId: '10700000-0000-4000-8000-000000000800',
    member: { id: MEMBER_ID, displayName: 'Amadou Diallo' },
    campaign: {
      id: '10700000-0000-4000-8000-000000000200',
      name: 'Solidarité septembre',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      status: 'OPEN',
    },
    amount: 50000,
    paymentDate: '2026-09-12',
    method: PaymentMethod.MobileMoney,
    recordedBy: { userId: '10700000-0000-4000-8000-000000000900', displayName: 'Mamadou Sy' },
    recordedAt: '2026-09-12T14:32:00Z',
    currency: 'GNF',
    ...overrides,
  };
}

function buildPaymentPage(overrides: Partial<PaymentPage> = {}): PaymentPage {
  return {
    items: [buildPayment()],
    page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    ...overrides,
  };
}

async function createFixture(
  listPayments: (
    page?: number,
    size?: number,
    q?: string,
    memberId?: string,
  ) => Observable<PaymentPage>,
  memberId = MEMBER_ID,
): Promise<ComponentFixture<MemberPaymentsTab>> {
  await TestBed.configureTestingModule({
    imports: [
      MemberPaymentsTab,
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

  const fixture = TestBed.createComponent(MemberPaymentsTab);
  fixture.componentRef.setInput('memberId', memberId);
  fixture.detectChanges();
  return fixture;
}

describe('MemberPaymentsTab', () => {
  it('shows a loading state while the request is pending', async () => {
    const pending = new Subject<PaymentPage>();
    const fixture = await createFixture(() => pending.asObservable());

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Chargement des règlements',
    );
  });

  it('shows an error state when the request fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger les règlements',
    );
  });

  it('shows the empty-list message when there is no payment', async () => {
    const fixture = await createFixture(() => of(buildPaymentPage({ items: [] })));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucun règlement pour le moment.');
  });

  it('renders the list of payments with campaign, amount, date and method', async () => {
    const fixture = await createFixture(() => of(buildPaymentPage()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Solidarité septembre');
    expect(root.textContent).toContain(formatGnfAmountDetailed(50000));
    expect(root.textContent).toContain('12 septembre 2026');
    expect(root.textContent).toContain('Mobile Money');
    expect(root.querySelectorAll('thead th')).toHaveLength(4);
  });

  it('shows exactly the business columns Date, Campagne, Montant, Mode, in this order (T-130)', async () => {
    const fixture = await createFixture(() => of(buildPaymentPage()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const headers = Array.from(root.querySelectorAll('thead th')).map((th) =>
      th.textContent?.trim(),
    );
    expect(headers).toEqual(['Date', 'Campagne', 'Montant', 'Mode de règlement']);
  });

  it('reloads the first page when refreshToken changes (T-130)', async () => {
    const listPayments = vi.fn(() => of(buildPaymentPage()));
    const fixture = await createFixture(listPayments);
    expect(listPayments).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('refreshToken', 1);
    fixture.detectChanges();

    expect(listPayments).toHaveBeenCalledTimes(2);
    expect(listPayments).toHaveBeenNthCalledWith(2, 0, 10, undefined, MEMBER_ID);
  });

  it('does not render audit metadata in the payment table MVP', async () => {
    const fixture = await createFixture(() => of(buildPaymentPage()));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).not.toContain('Enregistré par');
    expect(root.textContent).not.toContain('Horodatage');
    expect(root.textContent).not.toContain('Mamadou Sy');
  });

  it('requests the history filtered by the given member', async () => {
    const listPayments = vi.fn(() => of(buildPaymentPage()));
    await createFixture(listPayments);

    expect(listPayments).toHaveBeenCalledWith(0, 10, undefined, MEMBER_ID);
  });

  describe('pagination', () => {
    function buildManyPayments(count: number): Payment[] {
      return Array.from({ length: count }, (_, index) =>
        buildPayment({
          id: `10700000-0000-4000-8000-0000000007${index.toString().padStart(2, '0')}`,
        }),
      );
    }

    it('does not show pagination controls when a single page is returned', async () => {
      const fixture = await createFixture(() => of(buildPaymentPage()));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('nav[aria-label]')).toBeNull();
    });

    it('shows pagination controls and requests the next page beyond 20 payments', async () => {
      const listPayments = vi.fn((page = 0) =>
        of(
          buildPaymentPage({
            items: page === 0 ? buildManyPayments(20) : buildManyPayments(5),
            page: { number: page, size: 20, totalElements: 25, totalPages: 2 },
          }),
        ),
      );
      const fixture = await createFixture(listPayments);
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.textContent).toContain('Page 1 sur 2');

      const nextButton = root.querySelectorAll<HTMLButtonElement>('nav button')[1];
      nextButton.click();
      fixture.detectChanges();

      expect(listPayments).toHaveBeenCalledWith(1, 10, undefined, MEMBER_ID);
      expect(root.textContent).toContain('Page 2 sur 2');
    });

    it('keeps the currently displayed page when a page change request fails', async () => {
      const listPayments = vi.fn((page = 0) =>
        page === 0
          ? of(
              buildPaymentPage({
                items: buildManyPayments(20),
                page: { number: 0, size: 20, totalElements: 25, totalPages: 2 },
              }),
            )
          : throwError(() => new Error('network error')),
      );
      const fixture = await createFixture(listPayments);
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
