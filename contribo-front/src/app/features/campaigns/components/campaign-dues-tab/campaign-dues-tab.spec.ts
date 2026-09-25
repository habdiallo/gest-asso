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
import { Subject, of, throwError } from 'rxjs';
import { SessionService } from '@core/session/session.service';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
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
  listCampaignDues: (
    campaignId: string,
    page?: number,
    size?: number,
    q?: string,
    status?: DueStatus,
  ) => Observable<DuePage> = () => of(result),
  options: {
    createPayment?: (
      dueId: string,
      request: CreatePaymentRequest,
    ) => Observable<PaymentCreationResponse>;
    user?: CurrentUser | null;
    role?: UserRole;
    campaignClosed?: boolean;
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
  } else if (options.role) {
    const sessionService = TestBed.inject(SessionService);
    sessionService.setUser(buildCurrentUser(options.role));
  }

  const fixture = TestBed.createComponent(CampaignDuesTab);
  fixture.componentRef.setInput('campaignId', result.items[0].campaign.id);
  if (options.campaignClosed !== undefined) {
    fixture.componentRef.setInput('campaignClosed', options.campaignClosed);
  }
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

  it('hides the income category column for an Opérateur (RG-MEM-008, T-62)', async () => {
    const fixture = await createFixture(() => of(result), { role: 'OPERATOR' });
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).not.toContain('Standard');
    expect(
      Array.from(root.querySelectorAll('thead th')).some((th) =>
        th.textContent?.includes('Catégorie'),
      ),
    ).toBe(false);
    const row = root.querySelector('tbody tr');
    expect(row?.querySelectorAll('td').length).toBe(4);
  });

  it.each(['ADMINISTRATOR', 'TREASURER'] as const)(
    'keeps the income category column visible for %s',
    async (role) => {
      const fixture = await createFixture(() => of(result), { role });
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(root.textContent).toContain('Cat. D');
    },
  );

  it('shows a retry state when loading fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger les cotisations.',
    );
    expect(
      fixture.nativeElement.querySelector('button[type="button"]:not([aria-haspopup="listbox"])')
        ?.textContent,
    ).toContain('Réessayer');
  });

  it('hides the record payment action when the user is not authorized', async () => {
    const fixture = await createFixture(undefined, { user: null });

    expect(
      fixture.nativeElement.textContent.includes(
        fr['campaigns.detail.cotisations.recordPayment.action'],
      ),
    ).toBe(false);
  });

  it('renders the record payment action inside the table for an authorized Treasurer', async () => {
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

  it('hides the record payment action on a closed campaign, even for an authorized Treasurer (T-81)', async () => {
    const fixture = await createFixture(undefined, { user: treasurer, campaignClosed: true });

    expect(
      fixture.nativeElement.textContent.includes(
        fr['campaigns.detail.cotisations.recordPayment.action'],
      ),
    ).toBe(false);
  });

  it('renders the record payment action inside an open campaign table (T-81)', async () => {
    const fixture = await createFixture(undefined, { user: treasurer, campaignClosed: false });

    const actionButtons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    expect(
      actionButtons.some((button) =>
        button.textContent?.includes(fr['campaigns.detail.cotisations.recordPayment.action']),
      ),
    ).toBe(true);
  });

  it('hides the record payment action for an already settled due (status Payé, T-76)', async () => {
    const paidResult: DuePage = {
      items: [
        { ...result.items[0], paidAmount: 100_000, remainingAmount: 0, status: DueStatus.Paid },
      ],
      page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    };
    const fixture = await createFixture(() => of(paidResult), { user: treasurer });

    const actionButtons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    expect(
      actionButtons.some((button) =>
        button.textContent?.includes(fr['campaigns.detail.cotisations.recordPayment.action']),
      ),
    ).toBe(false);
  });

  it('ignores an attempt to open the record payment dialog on an already settled due (T-76)', async () => {
    const paidResult: DuePage = {
      items: [
        { ...result.items[0], paidAmount: 100_000, remainingAmount: 0, status: DueStatus.Paid },
      ],
      page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    };
    const fixture = await createFixture(() => of(paidResult), { user: treasurer });

    fixture.componentInstance.openRecordPayment(paidResult.items[0]);
    fixture.detectChanges();

    expect(fixture.componentInstance.recordPaymentDue()).toBeNull();
  });

  it('ignores an attempt to open the record payment dialog on a closed campaign (T-81)', async () => {
    const fixture = await createFixture(undefined, { user: treasurer, campaignClosed: true });

    fixture.componentInstance.openRecordPayment(result.items[0]);
    fixture.detectChanges();

    expect(fixture.componentInstance.recordPaymentDue()).toBeNull();
  });

  it('hides the record payment action for an Opérateur without peut_enregistrer_paiements (T-73, §2.3)', async () => {
    const fixture = await createFixture(undefined, {
      user: { ...buildCurrentUser(UserRole.Operator), operatorCanRecordPayments: false },
    });

    expect(
      fixture.nativeElement.textContent.includes(
        fr['campaigns.detail.cotisations.recordPayment.action'],
      ),
    ).toBe(false);
    expect(
      Array.from(fixture.nativeElement.querySelectorAll('thead th')).some((th) =>
        (th as HTMLElement).textContent?.includes(
          fr['campaigns.detail.cotisations.recordPayment.action'],
        ),
      ),
    ).toBe(false);
  });

  it('renders the record payment action for an authorized Opérateur (T-73, §2.3)', async () => {
    const fixture = await createFixture(undefined, {
      user: { ...buildCurrentUser(UserRole.Operator), operatorCanRecordPayments: true },
    });

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

  it('applies a payment success received after the dialog was closed and blocks a second write while it is pending', async () => {
    const response$ = new Subject<PaymentCreationResponse>();
    const createPayment = vi.fn(() => response$.asObservable());
    const fixture = await createFixture(undefined, { createPayment, user: treasurer });

    fixture.componentInstance.openRecordPayment(result.items[0]);
    fixture.componentInstance.handleRecordPayment({
      amount: 25_000,
      paymentDate: '2026-09-18',
      method: PaymentMethod.MobileMoney,
    });
    fixture.detectChanges();

    // Fermeture (Annuler/Échap/Fermer) pendant que la requête est encore en attente.
    fixture.componentInstance.closeRecordPayment();
    fixture.detectChanges();
    expect(fixture.componentInstance.recordPaymentDue()).toBeNull();

    // Réouverture et nouvelle tentative sur la même cotisation : bloquée tant
    // que la première écriture n'est pas résolue, aucun second appel API.
    fixture.componentInstance.openRecordPayment(result.items[0]);
    fixture.componentInstance.handleRecordPayment({
      amount: 25_000,
      paymentDate: '2026-09-18',
      method: PaymentMethod.MobileMoney,
    });
    fixture.detectChanges();
    expect(createPayment).toHaveBeenCalledTimes(1);

    response$.next(buildPaymentResponse());
    response$.complete();
    fixture.detectChanges();

    expect(fixture.componentInstance.duePage()?.items[0].paidAmount).toBe(75_000);
    expect(fixture.componentInstance.duePage()?.items[0].remainingAmount).toBe(25_000);
  });

  it('recalculates and refreshes the remaining amount and status after several successive payments, including one that fully settles the due (T-75, RG-PAY-004 a RG-PAY-006)', async () => {
    const secondPaymentResponse: PaymentCreationResponse = {
      ...buildPaymentResponse(),
      due: { ...result.items[0], paidAmount: 100_000, remainingAmount: 0, status: DueStatus.Paid },
    };
    const createPayment = vi
      .fn<(dueId: string, request: CreatePaymentRequest) => Observable<PaymentCreationResponse>>()
      .mockReturnValueOnce(of(buildPaymentResponse()))
      .mockReturnValueOnce(of(secondPaymentResponse));
    const fixture = await createFixture(undefined, { createPayment, user: treasurer });
    const root: HTMLElement = fixture.nativeElement;

    // Etat initial : cotisation partiellement payee, reste a payer de 50 000 GNF.
    expect(root.textContent).toContain('Partiellement payé');
    expect(root.textContent).toContain(formatGnfAmountDetailed(50_000));

    // Premier reglement partiel : reste a payer recalcule a 25 000 GNF, statut inchange.
    fixture.componentInstance.openRecordPayment(result.items[0]);
    fixture.componentInstance.handleRecordPayment({
      amount: 25_000,
      paymentDate: '2026-09-18',
      method: PaymentMethod.MobileMoney,
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.duePage()?.items[0].remainingAmount).toBe(25_000);
    expect(fixture.componentInstance.duePage()?.items[0].status).toBe(DueStatus.PartiallyPaid);
    expect(root.textContent).toContain(formatGnfAmountDetailed(25_000));
    expect(root.textContent).toContain('Partiellement payé');

    // Second reglement, sur la cotisation rafraichie, soldant totalement le reste a payer.
    const refreshedPage = fixture.componentInstance.duePage();
    if (!refreshedPage) {
      throw new Error('La page des cotisations rafraîchie est introuvable.');
    }
    const refreshedDue = refreshedPage.items[0];
    fixture.componentInstance.openRecordPayment(refreshedDue);
    fixture.componentInstance.handleRecordPayment({
      amount: 25_000,
      paymentDate: '2026-09-18',
      method: PaymentMethod.MobileMoney,
    });
    fixture.detectChanges();

    expect(createPayment).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.duePage()?.items[0].paidAmount).toBe(100_000);
    expect(fixture.componentInstance.duePage()?.items[0].remainingAmount).toBe(0);
    expect(fixture.componentInstance.duePage()?.items[0].status).toBe(DueStatus.Paid);
    expect(root.textContent).toContain(formatGnfAmountDetailed(0));

    // Le badge de statut de la ligne (et non l'option du filtre) affiche desormais "Payé".
    const statusBadge = root.querySelector('tbody td span');
    expect(statusBadge?.textContent?.trim()).toBe('Payé');
    expect(statusBadge?.classList.contains('text-success')).toBe(true);

    // L'action d'enregistrement disparait immediatement, sans rechargement de page (T-76).
    const actionButtonsAfterSettlement = Array.from(
      root.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    expect(
      actionButtonsAfterSettlement.some((button) =>
        button.textContent?.includes(fr['campaigns.detail.cotisations.recordPayment.action']),
      ),
    ).toBe(false);
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

  it('reloads with the selected status filter and resets to the first page', async () => {
    const listCampaignDues = vi.fn(() => of(result));
    const fixture = await createFixture(listCampaignDues);
    listCampaignDues.mockClear();
    fixture.componentInstance.onStatusFilterChange(DueStatus.Paid);
    fixture.detectChanges();

    expect(listCampaignDues).toHaveBeenCalledWith(
      result.items[0].campaign.id,
      0,
      10,
      undefined,
      DueStatus.Paid,
    );
  });

  it('ignores a stale response received after a newer filter was applied', async () => {
    const initial$ = new Subject<DuePage>();
    const filtered$ = new Subject<DuePage>();
    let callCount = 0;
    const listCampaignDues = vi.fn(() => {
      callCount += 1;
      return callCount === 1 ? initial$.asObservable() : filtered$.asObservable();
    });
    const fixture = await createFixture(listCampaignDues);
    // Chargement initial encore en attente lorsque l'utilisateur choisit PAID.
    fixture.componentInstance.onStatusFilterChange(DueStatus.Paid);
    fixture.detectChanges();

    const paidResult: DuePage = {
      items: [{ ...result.items[0], status: DueStatus.Paid, remainingAmount: 0 }],
      page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    };
    filtered$.next(paidResult);
    filtered$.complete();
    fixture.detectChanges();

    // Réponse tardive du chargement initial (statut DUE) : ne doit pas écraser le filtre courant.
    initial$.next(result);
    initial$.complete();
    fixture.detectChanges();

    expect(fixture.componentInstance.duePage()?.items[0].status).toBe(DueStatus.Paid);
  });
});
