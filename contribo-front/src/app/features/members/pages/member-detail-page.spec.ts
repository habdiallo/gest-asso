import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { CurrencyCode, ErrorCode, MemberStatus, MembresService, UserRole } from '@api';
import type { CurrentUser, ErrorResponse, MemberDetails } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { Observable, of, Subject, throwError } from 'rxjs';
import { SessionService } from '@core/session/session.service';
import fr from '../../../../assets/i18n/fr.json';
import { MemberDetailPage } from './member-detail-page';

/*
 * jsdom (utilisé par Vitest) reconnaît `HTMLDialogElement` mais n'implémente
 * pas `showModal()`/`close()` : voir la même limite documentée dans
 * `shared/form-dialog/form-dialog.spec.ts`.
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

/**
 * Le titre du dialogue de confirmation ("Réactiver le membre") reste présent
 * dans le DOM même fermé (`app-form-dialog` garde son contenu projeté) :
 * chercher le bouton d'ouverture précisément plutôt qu'une sous-chaîne du
 * texte de la page évite un faux positif avec ce titre.
 */
function findReactivateButton(root: HTMLElement): HTMLButtonElement | undefined {
  return Array.from(root.querySelectorAll('button')).find(
    (button) => button.textContent?.trim() === 'Réactiver',
  );
}

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

async function createFixture(
  getMember: (memberId: string) => Observable<MemberDetails>,
  options: {
    memberId?: string;
    reactivateMember?: (memberId: string) => Observable<MemberDetails>;
    role?: UserRole;
  } = {},
): Promise<ComponentFixture<MemberDetailPage>> {
  const memberId = options.memberId ?? 'a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10';
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
          reactivateMember: options.reactivateMember ?? (() => new Observable<MemberDetails>()),
        } as unknown as MembresService,
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
        { provide: MembresService, useValue: { getMember } as unknown as MembresService },
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

  describe('reactivation (T-44, US-MEM-006)', () => {
    it('shows the "Réactiver" action for an Administrator on an inactive member', async () => {
      const fixture = await createFixture(
        () => of(buildMemberDetails({ status: MemberStatus.Inactive })),
        { role: UserRole.Administrator },
      );
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(findReactivateButton(root)).toBeDefined();
    });

    it('hides the action for an Administrator on an already active member', async () => {
      const fixture = await createFixture(
        () => of(buildMemberDetails({ status: MemberStatus.Active })),
        { role: UserRole.Administrator },
      );
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      expect(findReactivateButton(root)).toBeUndefined();
    });

    it.each([UserRole.Treasurer, UserRole.Operator, UserRole.Member])(
      'hides the action for role %s even on an inactive member',
      async (role) => {
        const fixture = await createFixture(
          () => of(buildMemberDetails({ status: MemberStatus.Inactive })),
          { role },
        );
        fixture.detectChanges();

        const root: HTMLElement = fixture.nativeElement;
        expect(findReactivateButton(root)).toBeUndefined();
      },
    );

    it('calls reactivateMember and updates the displayed status after confirmation', async () => {
      const reactivateMember = vi.fn(() => of(buildMemberDetails({ status: MemberStatus.Active })));
      const fixture = await createFixture(
        () => of(buildMemberDetails({ status: MemberStatus.Inactive })),
        { role: UserRole.Administrator, reactivateMember },
      );
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      findReactivateButton(root)?.click();
      fixture.detectChanges();

      const confirmButton = Array.from(root.querySelectorAll('button')).find((button) =>
        button.textContent?.includes('Confirmer la réactivation'),
      );
      confirmButton?.click();
      fixture.detectChanges();

      expect(reactivateMember).toHaveBeenCalledWith('a5c2f0d0-1c1a-4e3a-9d1b-7f2a5b6c9d10');
      expect(root.querySelector('[role="status"]')?.textContent).toContain('a été réactivé');
      expect(root.textContent).toContain('Actif');
      expect(findReactivateButton(root)).toBeUndefined();
    });

    it('shows an error and keeps the dialog open when reactivation fails', async () => {
      const reactivateMember = vi.fn(() => throwError(() => new Error('network error')));
      const fixture = await createFixture(
        () => of(buildMemberDetails({ status: MemberStatus.Inactive })),
        { role: UserRole.Administrator, reactivateMember },
      );
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      findReactivateButton(root)?.click();
      fixture.detectChanges();

      const confirmButton = Array.from(root.querySelectorAll('button')).find((button) =>
        button.textContent?.includes('Confirmer la réactivation'),
      );
      confirmButton?.click();
      fixture.detectChanges();

      expect(reactivateMember).toHaveBeenCalled();
      expect(root.querySelector('[role="alert"]')?.textContent).toContain(
        'Impossible de réactiver ce membre',
      );
    });

    it('cancels without calling the API', async () => {
      const reactivateMember = vi.fn(() => of(buildMemberDetails({ status: MemberStatus.Active })));
      const fixture = await createFixture(
        () => of(buildMemberDetails({ status: MemberStatus.Inactive })),
        { role: UserRole.Administrator, reactivateMember },
      );
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      findReactivateButton(root)?.click();
      fixture.detectChanges();

      const cancelButton = Array.from(root.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === 'Annuler',
      );
      cancelButton?.click();
      fixture.detectChanges();

      expect(reactivateMember).not.toHaveBeenCalled();
      expect(findReactivateButton(root)).toBeDefined();
    });
  });
});
