import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DueStatus,
  ErrorCode,
  MemberStatus,
  MembresService,
  RglementsService,
  UserRole,
} from '@api';
import type {
  CreatePaymentRequest,
  Due,
  ErrorResponse,
  MemberDetails,
  PaymentMethod,
  UpdateMemberContactRequest,
  UpdateMemberRequest,
} from '@api';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';
import type { Observable } from 'rxjs';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { SessionService } from '@core/session/session.service';
import type { TranslationKey } from '@core/i18n/translation-keys';
import { ActionButton } from '@shared/action-button/action-button';
import { AmountInput } from '@shared/amount-input/amount-input';
import { ApiErrorRetry } from '@shared/api-error-retry/api-error-retry';
import type { CustomSelectOption } from '@shared/custom-select/custom-select';
import { CustomSelect } from '@shared/custom-select/custom-select';
import { DetailShell } from '@shared/detail-shell/detail-shell';
import type { DetailTab } from '@shared/detail-tabs/detail-tabs';
import { DetailTabs } from '@shared/detail-tabs/detail-tabs';
import { FormDialog } from '@shared/form-dialog/form-dialog';
import { LoadingSkeleton } from '@shared/loading-skeleton/loading-skeleton';
import { PaymentMethodSelect } from '@shared/payment-method-select/payment-method-select';
import { MemberContributionsTab } from '../components/member-contributions-tab/member-contributions-tab';
import { MemberDuesTab } from '../components/member-dues-tab/member-dues-tab';
import { MemberEditForm } from '../components/member-edit-form/member-edit-form';
import { MemberEditFormOperator } from '../components/member-edit-form-operator/member-edit-form-operator';
import { MemberPaymentsTab } from '../components/member-payments-tab/member-payments-tab';
import { memberAccountRoleLabel } from '../members-role-labels';
import { memberIsActive, memberStatusLabel } from '../members-status-labels';

/** Identifiant d'un onglet de la fiche membre (T-130) : les informations personnelles et associatives sont désormais portées par la carte principale, sans onglet dédié. */
export type MemberDetailTab = 'cotisations' | 'reglements' | 'contributions';

const MEMBER_DETAIL_TABS: readonly MemberDetailTab[] = [
  'cotisations',
  'reglements',
  'contributions',
];

/** Nombre de cotisations chargées pour peupler le sélecteur "Campagne" du règlement (T-130) : une association gère rarement plus de campagnes simultanées que cette limite. */
const PAYABLE_DUES_PAGE_SIZE = 50;

/**
 * Écran fiche membre (T-27, T-130) : appelle `GET /members/{memberId}`
 * (`@api`, `MembresService.getMember`) et affiche la fiche alignée sur le
 * prototype de détail partagé (`app-detail-shell`, `app-detail-tabs`) :
 * hero d'identité, carte principale (identité, informations personnelles et
 * associatives), colonne latérale (situation financière, compte associé) et
 * onglets Cotisations/Règlements/Contributions.
 *
 * Lecture seule pour un Opérateur non autorisé aux paiements (T-32, §2.3) :
 * `canRecordPayments` réutilise le flag `operatorCanRecordPayments` déjà
 * exposé par `SessionService` (T-13).
 *
 * Action "Enregistrer un règlement" (T-130) : ouvre un modal `Nouveau
 * règlement` qui charge les cotisations non soldées du membre
 * (`listMemberDues`, statut différent de Payé) pour peupler un sélecteur de
 * campagne, puis délègue à `RglementsService.createPayment(due.id, ...)`,
 * même appel que `CampaignDuesTab` (T-71). Après succès, le membre est
 * rechargé pour rafraîchir la situation financière affichée (`financialSummary`,
 * non renvoyée par la mutation de règlement) et `dataRefreshToken` est
 * incrémenté pour recharger les onglets Cotisations/Règlements déjà montés.
 *
 * Action "Désactiver" (T-41, US-MEM-005) / "Réactiver" (T-44, US-MEM-006) :
 * comportement inchangé depuis T-41/T-44, seule la présentation change.
 */
@Component({
  selector: 'app-member-detail-page',
  imports: [
    TranslocoPipe,
    ReactiveFormsModule,
    ActionButton,
    AmountInput,
    ApiErrorRetry,
    CustomSelect,
    DetailShell,
    DetailTabs,
    FormDialog,
    LoadingSkeleton,
    PaymentMethodSelect,
    MemberEditForm,
    MemberEditFormOperator,
    MemberDuesTab,
    MemberPaymentsTab,
    MemberContributionsTab,
  ],
  templateUrl: './member-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly membersService = inject(MembresService);
  private readonly paymentsService = inject(RglementsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly transloco = inject(TranslocoService);

  private readonly sessionService = inject(SessionService);
  private editSession = 0;
  readonly canEditFull = computed(() => {
    const role = this.sessionService.user()?.role;
    return role === UserRole.Administrator || role === UserRole.Treasurer;
  });
  readonly canEditRestricted = computed(
    () => this.sessionService.user()?.role === UserRole.Operator,
  );
  readonly canEdit = computed(() => this.canEditFull() || this.canEditRestricted());
  readonly canRecordPayments = computed(() => this.sessionService.canRecordPayments());
  readonly editOpen = signal(false);
  readonly saving = signal(false);
  readonly editError = signal(false);
  readonly editSuccess = signal(false);
  /** Formulaire de modification affiché (T-102), selon le rôle : relu par `retryEdit`. */
  private readonly editFormFull = viewChild<MemberEditForm>('editFormFull');
  private readonly editFormOperator = viewChild<MemberEditFormOperator>('editFormOperator');

  private deactivateSession = 0;
  readonly canDeactivate = computed(() => {
    const role = this.sessionService.user()?.role;
    return (
      role === UserRole.Administrator &&
      memberIsActive(this.member()?.status ?? MemberStatus.Inactive)
    );
  });
  readonly deactivateOpen = signal(false);
  readonly deactivating = signal(false);
  readonly deactivateError = signal(false);
  readonly deactivateSuccess = signal(false);

  private reactivateSession = 0;
  readonly canReactivate = computed(() => {
    const role = this.sessionService.user()?.role;
    return role === UserRole.Administrator && this.member()?.status === MemberStatus.Inactive;
  });
  readonly reactivateOpen = signal(false);
  readonly reactivating = signal(false);
  readonly reactivateError = signal(false);
  readonly reactivateSuccess = signal(false);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly notFound = signal(false);
  readonly member = signal<MemberDetails | null>(null);

  readonly activeTab = signal<MemberDetailTab>(MEMBER_DETAIL_TABS[0]);
  readonly memberStatusLabel = memberStatusLabel;
  readonly memberIsActive = memberIsActive;
  readonly memberAccountRoleLabel = memberAccountRoleLabel;
  readonly formatAmount = formatGnfAmountDetailed;

  /** Incrémenté après un règlement pour recharger les onglets Cotisations/Règlements déjà montés (T-130). */
  readonly dataRefreshToken = signal(0);

  readonly detailTabs = computed<readonly DetailTab[]>(() =>
    MEMBER_DETAIL_TABS.map((tab) => ({
      id: tab,
      label: this.transloco.translate(`memberDetail.tabs.${tab}`),
    })),
  );

  // --- Enregistrement d'un règlement (T-130) --------------------------------
  private recordPaymentSession = 0;
  readonly recordPaymentOpen = signal(false);
  readonly payableDues = signal<Due[] | null>(null);
  readonly payableDuesLoading = signal(false);
  readonly payableDuesError = signal(false);
  readonly recordPaymentSubmitting = signal(false);
  readonly recordPaymentError = signal<TranslationKey | null>(null);
  private readonly selectedDueId = signal<string | null>(null);

  readonly selectedDue = computed(
    () => this.payableDues()?.find((due) => due.id === this.selectedDueId()) ?? null,
  );

  readonly memberSelectOptions = computed<readonly CustomSelectOption[]>(() => {
    const member = this.member();
    return member ? [{ value: member.id, label: member.displayName }] : [];
  });

  readonly dueSelectOptions = computed<readonly CustomSelectOption[]>(() =>
    (this.payableDues() ?? []).map((due) => ({ value: due.id, label: due.campaign.name })),
  );

  readonly recordPaymentForm = this.formBuilder.group({
    dueId: this.formBuilder.control<string | null>(null, Validators.required),
    amount: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(1)]),
    paymentDate: this.formBuilder.nonNullable.control('', Validators.required),
    method: this.formBuilder.control<PaymentMethod | null>(null, Validators.required),
  });

  private recordPaymentMaxValidator = Validators.max(Infinity);

  constructor() {
    // RG-PAY-007 : borne le montant saisissable au reste à payer de la cotisation sélectionnée.
    effect(() => {
      const due = this.selectedDue();
      const amountControl = this.recordPaymentForm.controls.amount;
      amountControl.removeValidators(this.recordPaymentMaxValidator);
      this.recordPaymentMaxValidator = Validators.max(due?.remainingAmount ?? Infinity);
      amountControl.addValidators(this.recordPaymentMaxValidator);
      amountControl.updateValueAndValidity();
    });

    this.route.paramMap
      .pipe(
        map((params) => params.get('memberId')),
        filter((memberId): memberId is string => memberId !== null),
        tap(() => {
          this.closeEditDialog();
          this.editSuccess.set(false);
          ++this.deactivateSession;
          this.deactivateOpen.set(false);
          this.deactivating.set(false);
          this.deactivateError.set(false);
          this.deactivateSuccess.set(false);
          this.closeReactivateDialog();
          this.reactivateSuccess.set(false);
          this.closeRecordPaymentDialog();
          this.loading.set(true);
          this.loadError.set(false);
          this.notFound.set(false);
          this.member.set(null);
          this.activeTab.set(MEMBER_DETAIL_TABS[0]);
        }),
        switchMap((memberId) =>
          this.membersService.getMember(memberId).pipe(
            map((member) => ({ member, error: null }) as const),
            catchError((error: unknown) => of({ member: null, error } as const)),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ member, error }) => {
        this.loading.set(false);
        if (error !== null) {
          this.loadError.set(true);
          this.notFound.set(isResourceNotFound(error));
          return;
        }
        this.member.set(member);
      });
  }

  selectTab(tab: MemberDetailTab): void {
    this.activeTab.set(tab);
  }

  selectDetailTab(tab: string): void {
    if (MEMBER_DETAIL_TABS.includes(tab as MemberDetailTab)) {
      this.selectTab(tab as MemberDetailTab);
    }
  }

  isActiveTab(tab: MemberDetailTab): boolean {
    return this.activeTab() === tab;
  }

  /** Résumé affiché sous le titre du hero (T-130) : statut, puis fonction associative lorsqu'elle est renseignée. */
  heroIntro(member: MemberDetails): string {
    const status = this.memberStatusLabel(member.status);
    return member.associationFunction ? `${status} · ${member.associationFunction}` : status;
  }

  /** Initiales affichées dans l'avatar de la carte principale (T-130), même logique que `members-list-page.ts`. */
  memberInitials(member: MemberDetails): string {
    return member.displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  openEditDialog(): void {
    if (!this.canEdit() || !this.member() || this.editOpen()) {
      return;
    }
    ++this.editSession;
    this.editError.set(false);
    this.editSuccess.set(false);
    this.editOpen.set(true);
  }

  closeEditDialog(): void {
    ++this.editSession;
    this.editOpen.set(false);
    this.saving.set(false);
  }

  updateMember(request: UpdateMemberRequest): void {
    this.submitEdit((member) => this.membersService.updateMember(member.id, request));
  }

  updateMemberContact(request: UpdateMemberContactRequest): void {
    this.submitEdit((member) => this.membersService.updateMemberContact(member.id, request));
  }

  private submitEdit(buildRequest: (member: MemberDetails) => Observable<MemberDetails>): void {
    const member = this.member();
    if (!this.canEdit() || !member || !this.editOpen() || this.saving()) {
      return;
    }
    const session = this.editSession;
    this.saving.set(true);
    this.editError.set(false);
    buildRequest(member)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          if (this.member()?.id !== member.id) {
            return;
          }
          this.member.set(updated);
          if (session !== this.editSession) {
            return;
          }
          this.closeEditDialog();
          this.editSuccess.set(true);
        },
        error: () => {
          if (session !== this.editSession || this.member()?.id !== member.id) {
            return;
          }
          this.saving.set(false);
          this.editError.set(true);
        },
      });
  }

  /**
   * Nouvelle tentative (T-102) : redéclenche la soumission du formulaire de
   * modification affiché (générale ou restreinte Opérateur), qui reste
   * affiché et éditable après l'échec, afin de renvoyer la saisie courante
   * (et non un instantané figé lors du premier envoi).
   */
  retryEdit(): void {
    this.editFormFull()?.submit();
    this.editFormOperator()?.submit();
  }

  /**
   * Ouvre la boîte de confirmation avant désactivation (RG-MEM-016, T-42) :
   * l'appel `POST /members/{memberId}/deactivation` n'est déclenché qu'après
   * confirmation explicite dans `confirmDeactivate`, jamais depuis le bouton
   * "Désactiver" lui-même.
   */
  openDeactivateDialog(): void {
    if (!this.canDeactivate() || !this.member() || this.deactivateOpen()) {
      return;
    }
    ++this.deactivateSession;
    this.deactivateError.set(false);
    this.deactivateSuccess.set(false);
    this.deactivateOpen.set(true);
  }

  closeDeactivateDialog(): void {
    ++this.deactivateSession;
    this.deactivateOpen.set(false);
    this.deactivating.set(false);
  }

  confirmDeactivate(): void {
    const member = this.member();
    if (!this.canDeactivate() || !member || !this.deactivateOpen() || this.deactivating()) {
      return;
    }
    const session = this.deactivateSession;
    this.deactivating.set(true);
    this.deactivateError.set(false);
    this.membersService
      .deactivateMember(member.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          if (session !== this.deactivateSession || this.member()?.id !== member.id) {
            return;
          }
          this.member.set(updated);
          this.closeDeactivateDialog();
          this.deactivateSuccess.set(true);
        },
        error: () => {
          if (session !== this.deactivateSession || this.member()?.id !== member.id) {
            return;
          }
          this.deactivating.set(false);
          this.deactivateError.set(true);
        },
      });
  }

  openReactivateDialog(): void {
    if (!this.canReactivate() || this.reactivateOpen()) {
      return;
    }
    ++this.reactivateSession;
    this.reactivateError.set(false);
    this.reactivateSuccess.set(false);
    this.reactivateOpen.set(true);
  }

  closeReactivateDialog(): void {
    ++this.reactivateSession;
    this.reactivateOpen.set(false);
    this.reactivating.set(false);
  }

  confirmReactivate(): void {
    const member = this.member();
    if (!this.canReactivate() || !member || !this.reactivateOpen() || this.reactivating()) {
      return;
    }
    const session = this.reactivateSession;
    this.reactivating.set(true);
    this.reactivateError.set(false);
    this.membersService
      .reactivateMember(member.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reactivated) => {
          if (this.member()?.id !== member.id) {
            return;
          }
          this.member.set(reactivated);
          if (session !== this.reactivateSession) {
            return;
          }
          this.closeReactivateDialog();
          this.reactivateSuccess.set(true);
        },
        error: () => {
          if (session !== this.reactivateSession || this.member()?.id !== member.id) {
            return;
          }
          this.reactivating.set(false);
          this.reactivateError.set(true);
        },
      });
  }

  /** Ouvre le modal "Nouveau règlement" (T-130) et charge les cotisations non soldées du membre. */
  openRecordPaymentDialog(): void {
    const member = this.member();
    if (!this.canRecordPayments() || !member || this.recordPaymentOpen()) {
      return;
    }
    ++this.recordPaymentSession;
    this.selectedDueId.set(null);
    this.recordPaymentForm.reset({ dueId: null, amount: null, paymentDate: '', method: null });
    this.recordPaymentSubmitting.set(false);
    this.recordPaymentError.set(null);
    this.recordPaymentOpen.set(true);
    this.loadPayableDues(member.id);
  }

  closeRecordPaymentDialog(): void {
    ++this.recordPaymentSession;
    this.recordPaymentOpen.set(false);
    this.recordPaymentSubmitting.set(false);
  }

  retryLoadPayableDues(): void {
    const member = this.member();
    if (member) {
      this.loadPayableDues(member.id);
    }
  }

  onDueSelected(dueId: string | null): void {
    this.selectedDueId.set(dueId);
  }

  paymentDateInvalid(): boolean {
    const control = this.recordPaymentForm.controls.paymentDate;
    return control.invalid && control.touched;
  }

  /** Confirme l'enregistrement (T-130) : appelle `POST /dues/{dueId}/payments`, comme `CampaignDuesTab.handleRecordPayment`. */
  submitRecordPayment(): void {
    if (this.recordPaymentSubmitting()) {
      return;
    }
    if (this.recordPaymentForm.invalid) {
      this.recordPaymentForm.markAllAsTouched();
      return;
    }
    const member = this.member();
    const due = this.selectedDue();
    if (!member || !due) {
      return;
    }
    const raw = this.recordPaymentForm.getRawValue();
    if (raw.amount === null || raw.method === null) {
      return;
    }
    const request: CreatePaymentRequest = {
      amount: raw.amount,
      paymentDate: raw.paymentDate,
      method: raw.method,
    };
    const session = this.recordPaymentSession;
    this.recordPaymentSubmitting.set(true);
    this.recordPaymentError.set(null);

    this.paymentsService
      .createPayment(due.id, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.refreshMemberAfterPayment(member.id);
          this.dataRefreshToken.update((value) => value + 1);
          if (session !== this.recordPaymentSession) {
            return;
          }
          this.recordPaymentSubmitting.set(false);
          this.recordPaymentOpen.set(false);
        },
        error: (error: unknown) => {
          if (session !== this.recordPaymentSession) {
            return;
          }
          this.recordPaymentSubmitting.set(false);
          this.recordPaymentError.set(this.resolveRecordPaymentErrorKey(error));
        },
      });
  }

  private loadPayableDues(memberId: string): void {
    this.payableDuesLoading.set(true);
    this.payableDuesError.set(false);
    this.payableDues.set(null);
    const session = this.recordPaymentSession;
    this.membersService
      .listMemberDues(memberId, 0, PAYABLE_DUES_PAGE_SIZE)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          if (session !== this.recordPaymentSession) {
            return;
          }
          const payable = page.items.filter((due) => due.status !== DueStatus.Paid);
          this.payableDues.set(payable);
          this.payableDuesLoading.set(false);
          if (payable.length === 1) {
            this.recordPaymentForm.controls.dueId.setValue(payable[0].id);
            this.selectedDueId.set(payable[0].id);
          }
        },
        error: () => {
          if (session !== this.recordPaymentSession) {
            return;
          }
          this.payableDuesError.set(true);
          this.payableDuesLoading.set(false);
        },
      });
  }

  /** Le paiement ne renvoie que la cotisation mise à jour : le membre est rechargé pour rafraîchir `financialSummary`. */
  private refreshMemberAfterPayment(memberId: string): void {
    this.membersService
      .getMember(memberId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          if (this.member()?.id === memberId) {
            this.member.set(updated);
          }
        },
      });
  }

  private resolveRecordPaymentErrorKey(error: unknown): TranslationKey {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as ErrorResponse | undefined;
      switch (body?.code) {
        case ErrorCode.PaymentExceedsRemainingAmount:
          return 'members.recordPayment.errorExceedsRemaining';
        case ErrorCode.DueAlreadyPaid:
          return 'members.recordPayment.errorAlreadyPaid';
        case ErrorCode.ValidationError:
          return 'members.recordPayment.errorValidation';
        case ErrorCode.ResourceNotFound:
          return 'members.recordPayment.errorNotFound';
        case ErrorCode.AccessDenied:
          return 'members.recordPayment.errorAccessDenied';
        default:
          return 'members.recordPayment.error';
      }
    }
    return 'members.recordPayment.error';
  }
}

function isResourceNotFound(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse)) {
    return false;
  }
  const body = error.error as ErrorResponse | undefined;
  return body?.code === ErrorCode.ResourceNotFound;
}
