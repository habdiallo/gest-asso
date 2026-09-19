import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import {
  CurrencyCode,
  ErrorCode,
  MemberStatus,
  MembresService,
  RglementsService,
  UserRole,
} from '@api';
import type { CurrentUser, DuePage, ErrorResponse, MemberDetails, PaymentPage } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { Observable, of, Subject, throwError } from 'rxjs';
import { SessionService } from '@core/session/session.service';
import fr from '../../../../assets/i18n/fr.json';
import { MemberDetailPage } from './member-detail-page';

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

const emptyDuePage: DuePage = {
  items: [],
  page: { number: 0, size: 20, totalElements: 0, totalPages: 1 },
};

function buildMemberDetails(overrides: Partial<MemberDetails> = {}): MemberDetails {
  return {
    id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    firstName: 'Amadou',
    lastName: 'Diallo',
    preferredName: 'Bah',
    displayName: 'Amadou Diallo',
    country: 'Guinée',
    city: 'Conakry',
    phone: '+224 622 12 34 56',
    incomeCategory: { id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11', label: 'Catégorie B' },
    associationFunction: 'Président',
    status: 'ACTIVE',
    account: { id: 'account-1', role: 'MEMBER', operatorCanRecordPayments: false, active: true },
    financialSummary: {
      totalDueAmount: 0,
      totalPaidAmount: 0,
      totalRemainingAmount: 0,
      currency: 'GNF',
    },
    ...overrides,
  };
}

function buildPaymentPage(overrides: Partial<PaymentPage> = {}): PaymentPage {
  return {
    items: [],
    page: { number: 0, size: 20, totalElements: 0, totalPages: 0 },
    ...overrides,
  };
}

async function createFixture(
  getMember: (memberId: string) => Observable<MemberDetails>,
  memberId = 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
  options: {
    role?: UserRole;
    deactivateMember?: (memberId: string) => Observable<MemberDetails>;
  } = {},
): Promise<ComponentFixture<MemberDetailPage>> {
  await TestBed.configureTestingModule({
    imports: [
      MemberDetailPage,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
    providers: [
      provideRouter([]),
      {
        provide: MembresService,
        useValue: {
          getMember,
          deactivateMember: options.deactivateMember ?? (() => new Observable<MemberDetails>()),
          listMemberDues: () => of(emptyDuePage),
        } as unknown as MembresService,
      },
      {
        provide: RglementsService,
        useValue: {
          listPayments: () => of(buildPaymentPage()),
        } as unknown as RglementsService,
      },
      {
        provide: ActivatedRoute,
        useValue: { paramMap: of(convertToParamMap({ memberId })) },
      },
    ],
  }).compileComponents();

  if (options.role) {
    TestBed.inject(SessionService).setUser(buildCurrentUser(options.role));
  }

  const fixture = TestBed.createComponent(MemberDetailPage);
  fixture.detectChanges();
  return fixture;
}

describe('MemberDetailPage', () => {
  it('shows a loading state while the request is pending', async () => {
    const fixture = await createFixture(() => new Observable<MemberDetails>());

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Chargement de la fiche du membre',
    );
  });

  it('renders the personal information block required by US-MEM-003', async () => {
    const getMember = vi.fn(() => of(buildMemberDetails()));
    const fixture = await createFixture(getMember);
    fixture.detectChanges();

    expect(getMember).toHaveBeenCalledWith('a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10');
    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Amadou Diallo');
    expect(root.textContent).toContain('Diallo');
    expect(root.textContent).toContain('Amadou');
    expect(root.textContent).toContain('Bah');
    expect(root.textContent).toContain('Guinée');
    expect(root.textContent).toContain('Conakry');
    expect(root.textContent).toContain('+224 622 12 34 56');
    expect(root.textContent).toContain('Catégorie B');
    expect(root.textContent).toContain('Président');
    expect(root.textContent).toContain('Actif');
  });

  it('shows a placeholder for optional fields left absent by the API', async () => {
    const fixture = await createFixture(() =>
      of(
        buildMemberDetails({
          preferredName: undefined,
          country: undefined,
          city: undefined,
          phone: undefined,
          associationFunction: undefined,
        }),
      ),
    );
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent?.match(/Non renseigné/g)?.length).toBe(5);
  });

  it('shows a generic error state when the API call fails', async () => {
    const fixture = await createFixture(() => throwError(() => new Error('network error')));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de charger la fiche du membre',
    );
  });

  it('shows a not-found message when the API reports a missing member', async () => {
    const notFoundError = new HttpErrorResponse({
      status: 404,
      error: { code: ErrorCode.ResourceNotFound, message: 'Membre introuvable.' } as ErrorResponse,
    });
    const fixture = await createFixture(() => throwError(() => notFoundError));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('introuvable');
  });

  it('renders the payments tab and requests the history for the current member', async () => {
    const listPayments = vi.fn(() => of(buildPaymentPage()));
    await TestBed.configureTestingModule({
      imports: [
        MemberDetailPage,
        TranslocoTestingModule.forRoot({
          langs: { fr },
          translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
          preloadLangs: true,
        }),
      ],
      providers: [
        provideRouter([]),
        {
          provide: MembresService,
          useValue: { getMember: () => of(buildMemberDetails()) } as unknown as MembresService,
        },
        { provide: RglementsService, useValue: { listPayments } as unknown as RglementsService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ memberId: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10' })),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(MemberDetailPage);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="tablist"]')).not.toBeNull();
    const paymentsTab = Array.from(root.querySelectorAll('[role="tab"]')).find((tab) =>
      tab.textContent?.includes('Règlements'),
    ) as HTMLButtonElement | undefined;
    expect(paymentsTab).toBeDefined();

    paymentsTab?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(root.textContent).toContain('Règlements');
    expect(listPayments).toHaveBeenCalledWith(
      0,
      20,
      undefined,
      'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10',
    );
  });

  it('ignores a late response from a member no longer selected by the route', async () => {
    const memberIdA = 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10';
    const memberIdB = 'b5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d20';
    const responses = new Map<string, Subject<MemberDetails>>([
      [memberIdA, new Subject<MemberDetails>()],
      [memberIdB, new Subject<MemberDetails>()],
    ]);
    const paramMap = new Subject<ReturnType<typeof convertToParamMap>>();
    const getMember = vi.fn((memberId: string) => responses.get(memberId)!.asObservable());

    await TestBed.configureTestingModule({
      imports: [
        MemberDetailPage,
        TranslocoTestingModule.forRoot({
          langs: { fr },
          translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
          preloadLangs: true,
        }),
      ],
      providers: [
        provideRouter([]),
        {
          provide: MembresService,
          useValue: {
            getMember,
            listMemberDues: () => of(emptyDuePage),
          } as unknown as MembresService,
        },
        {
          provide: RglementsService,
          useValue: {
            listPayments: () => of(buildPaymentPage()),
          } as unknown as RglementsService,
        },
        { provide: ActivatedRoute, useValue: { paramMap: paramMap.asObservable() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(MemberDetailPage);
    fixture.detectChanges();

    paramMap.next(convertToParamMap({ memberId: memberIdA }));
    paramMap.next(convertToParamMap({ memberId: memberIdB }));

    responses.get(memberIdB)!.next(buildMemberDetails({ id: memberIdB, displayName: 'Membre B' }));
    responses.get(memberIdA)!.next(buildMemberDetails({ id: memberIdA, displayName: 'Membre A' }));
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Membre B');
    expect(root.textContent).not.toContain('Membre A');
  });

  it('shows the deactivate action to an Administrator for an active member', async () => {
    const fixture = await createFixture(() => of(buildMemberDetails()), undefined, {
      role: UserRole.Administrator,
    });
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const button = Array.from(root.querySelectorAll('button')).find(
      (element) => element.textContent?.trim() === 'Désactiver',
    );
    expect(button).toBeTruthy();
  });

  it('hides the deactivate action for a non-Administrator role', async () => {
    const fixture = await createFixture(() => of(buildMemberDetails()), undefined, {
      role: UserRole.Treasurer,
    });
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const button = Array.from(root.querySelectorAll('button')).find(
      (element) => element.textContent?.trim() === 'Désactiver',
    );
    expect(button).toBeFalsy();
  });

  it('hides the deactivate action for an already inactive member', async () => {
    const fixture = await createFixture(
      () => of(buildMemberDetails({ status: MemberStatus.Inactive })),
      undefined,
      { role: UserRole.Administrator },
    );
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const button = Array.from(root.querySelectorAll('button')).find(
      (element) => element.textContent?.trim() === 'Désactiver',
    );
    expect(button).toBeFalsy();
  });

  it('deactivates an active member and shows the updated status on success', async () => {
    const deactivateMember = vi.fn(() =>
      of(
        buildMemberDetails({
          status: MemberStatus.Inactive,
          account: {
            id: 'account-1',
            role: 'MEMBER',
            operatorCanRecordPayments: false,
            active: false,
          },
        }),
      ),
    );
    const fixture = await createFixture(() => of(buildMemberDetails()), undefined, {
      role: UserRole.Administrator,
      deactivateMember,
    });
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const button = Array.from(root.querySelectorAll('button')).find(
      (element) => element.textContent?.trim() === 'Désactiver',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(deactivateMember).toHaveBeenCalledWith('a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10');
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Le membre a été désactivé.',
    );
    expect(root.textContent).toContain('Inactif');
    expect(
      Array.from(root.querySelectorAll('button')).find(
        (element) => element.textContent?.trim() === 'Désactiver',
      ),
    ).toBeFalsy();
  });

  it('shows an error message and keeps the action available when deactivation fails', async () => {
    const deactivateMember = vi.fn(() => throwError(() => new Error('network error')));
    const fixture = await createFixture(() => of(buildMemberDetails()), undefined, {
      role: UserRole.Administrator,
      deactivateMember,
    });
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const button = Array.from(root.querySelectorAll('button')).find(
      (element) => element.textContent?.trim() === 'Désactiver',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Impossible de désactiver ce membre',
    );
    expect(
      Array.from(root.querySelectorAll('button')).find(
        (element) => element.textContent?.trim() === 'Désactiver',
      ),
    ).toBeTruthy();
  });

  it('shows the situation des cotisations tab and loads the member dues (T-28)', async () => {
    const duePage: DuePage = {
      items: [
        {
          id: 'a1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
          member: { id: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10', displayName: 'Amadou Diallo' },
          campaign: {
            id: 'c1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
            name: 'Solidarité septembre',
            startDate: '2026-09-01',
            endDate: '2026-09-30',
            status: 'OPEN',
          },
          incomeCategorySnapshot: {
            id: 'b1e2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d11',
            label: 'Catégorie B',
          },
          dueAmount: 100_000,
          paidAmount: 50_000,
          remainingAmount: 50_000,
          status: 'PARTIALLY_PAID',
          paymentCount: 1,
          currency: 'GNF',
        },
      ],
      page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    };
    const listMemberDues = vi.fn(() => of(duePage));
    const getMember = () => of(buildMemberDetails());

    await TestBed.configureTestingModule({
      imports: [
        MemberDetailPage,
        TranslocoTestingModule.forRoot({
          langs: { fr },
          translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
          preloadLangs: true,
        }),
      ],
      providers: [
        provideRouter([]),
        {
          provide: MembresService,
          useValue: { getMember, listMemberDues } as unknown as MembresService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ memberId: 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10' })),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(MemberDetailPage);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const cotisationsTab = Array.from(root.querySelectorAll('[role="tab"]')).find((tab) =>
      tab.textContent?.includes('Situation des cotisations'),
    ) as HTMLButtonElement | undefined;
    expect(cotisationsTab).toBeDefined();

    cotisationsTab?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(listMemberDues).toHaveBeenCalledWith('a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10', 0);
    expect(root.textContent).toContain('Solidarité septembre');
    expect(root.textContent).toContain('Partiellement payé');
  });
});
