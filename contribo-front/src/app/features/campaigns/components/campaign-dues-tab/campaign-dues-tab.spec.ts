import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import {
  CampagnesService,
  CampaignStatus,
  CurrencyCode,
  DueStatus,
  ErrorCode,
  MemberStatus,
  PaymentMethod,
  RglementsService,
  UserRole,
} from '@api';
import type { CreatePaymentRequest, CurrentUser, DuePage, PaymentCreationResponse } from '@api';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';
import { SessionService } from '@core/session/session.service';
import fr from '../../../../../assets/i18n/fr.json';
import { CampaignDuesTab } from './campaign-dues-tab';

/*
 * jsdom (utilisé par Vitest) reconnaît `HTMLDialogElement` mais n'implémente
 * pas `showModal()`/`close()` : voir la même limite documentée dans
 * `shared/form-dialog/form-dialog.spec.ts` et `campaigns-list-page.spec.ts`.
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

const treasurer: CurrentUser = {
  userId: 'u1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
  association: {
    id: 'assoc-1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
    name: 'Association Test',
    currency: CurrencyCode.Gnf,
  },
  member: {
    id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
    lastName: 'Diallo',
    firstName: 'Amadou',
    displayName: 'Amadou Diallo',
    incomeCategory: { id: 'e1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', label: 'Standard' },
    status: MemberStatus.Active,
  },
  role: UserRole.Treasurer,
  operatorCanRecordPayments: false,
  accountActive: true,
};

const result: DuePage = {
  items: [
    {
      id: 'a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
      member: { id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', displayName: 'Amadou Diallo' },
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

function buildPaymentResponse(): PaymentCreationResponse {
  return {
    payment: {
      id: 'p1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
      dueId: result.items[0].id,
      member: result.items[0].member,
      campaign: result.items[0].campaign,
      amount: 25_000,
      paymentDate: '2026-09-18',
      method: PaymentMethod.MobileMoney,
      recordedBy: { userId: 'u1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', displayName: 'Amadou Diallo' },
      recordedAt: '2026-09-18T10:00:00Z',
      currency: CurrencyCode.Gnf,
    },
    due: { ...result.items[0], paidAmount: 75_000, remainingAmount: 25_000 },
  };
}

async function createFixture(
  listCampaignDues: () => Observable<DuePage> = () => of(result),
  options: {
    createPayment?: (
      dueId: string,
      request: CreatePaymentRequest,
    ) => Observable<PaymentCreationResponse>;
    user?: CurrentUser | null;
  } = {},
): Promise<ComponentFixture<CampaignDuesTab>> {
  await TestBed.configureTestingModule({
    imports: [
      CampaignDuesTab,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      { provide: CampagnesService, useValue: { listCampaignDues } },
      {
        provide: RglementsService,
        useValue: { createPayment: options.createPayment ?? (() => of(buildPaymentResponse())) },
      },
    ],
  }).compileComponents();

  if (options.user !== undefined) {
    TestBed.inject(SessionService).user.set(options.user);
  }

  const fixture = TestBed.createComponent(CampaignDuesTab);
  fixture.componentRef.setInput('campaignId', result.items[0].campaign.id);
  fixture.detectChanges();
  return fixture;
}

describe('CampaignDuesTab', () => {
  it('loads and renders campaign dues', async () => {
    const fixture = await createFixture();
    const root: HTMLElement = fixture.nativeElement;

    expect(root.textContent).toContain('Amadou Diallo');
    expect(root.textContent).toContain('Partiellement payé');
  });

  it('shows a retry state when loading fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger les cotisations.',
    );
    expect(fixture.nativeElement.querySelector('button')?.textContent).toContain('Réessayer');
  });

  it('hides the record payment action when the user is not authorized', async () => {
    const fixture = await createFixture(undefined, { user: null });

    expect(
      fixture.nativeElement.textContent.includes(
        fr['campaigns.detail.cotisations.recordPayment.action'],
      ),
    ).toBe(false);
  });

  it('shows the record payment action for an authorized Treasurer', async () => {
    const fixture = await createFixture(undefined, { user: treasurer });

    const actionButtons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    expect(
      actionButtons.some((button) =>
        button.textContent?.includes(fr['campaigns.detail.cotisations.recordPayment.action']),
      ),
    ).toBe(true);
  });

  it('records a payment and replaces the due with the state returned by the API', async () => {
    const createPayment = vi.fn(() => of(buildPaymentResponse()));
    const fixture = await createFixture(undefined, { createPayment, user: treasurer });

    fixture.componentInstance.openRecordPayment(result.items[0]);
    fixture.detectChanges();

    fixture.componentInstance.handleRecordPayment({
      amount: 25_000,
      paymentDate: '2026-09-18',
      method: PaymentMethod.MobileMoney,
    });
    fixture.detectChanges();

    expect(createPayment).toHaveBeenCalledWith(result.items[0].id, {
      amount: 25_000,
      paymentDate: '2026-09-18',
      method: PaymentMethod.MobileMoney,
    });
    expect(fixture.componentInstance.recordPaymentDue()).toBeNull();
    expect(fixture.componentInstance.duePage()?.items[0].paidAmount).toBe(75_000);
    expect(fixture.componentInstance.duePage()?.items[0].remainingAmount).toBe(25_000);
  });

  it('shows a specific error when the amount exceeds the remaining amount', async () => {
    const createPayment = () =>
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { code: ErrorCode.PaymentExceedsRemainingAmount, message: 'Trop élevé' },
          }),
      );
    const fixture = await createFixture(undefined, { createPayment, user: treasurer });

    fixture.componentInstance.openRecordPayment(result.items[0]);
    fixture.componentInstance.handleRecordPayment({
      amount: 999_999,
      paymentDate: '2026-09-18',
      method: PaymentMethod.Cash,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      fr['campaigns.detail.cotisations.recordPayment.errorExceedsRemaining'],
    );
    expect(fixture.componentInstance.recordPaymentDue()).not.toBeNull();
  });

  it('closes the dialog when cancelled', async () => {
    const fixture = await createFixture(undefined, { user: treasurer });

    fixture.componentInstance.openRecordPayment(result.items[0]);
    fixture.detectChanges();
    expect(fixture.componentInstance.recordPaymentDue()).not.toBeNull();

    fixture.componentInstance.closeRecordPayment();
    fixture.detectChanges();
    expect(fixture.componentInstance.recordPaymentDue()).toBeNull();
  });
});
