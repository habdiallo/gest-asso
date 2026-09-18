import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import type { OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { CampagnesService, DueStatus, ErrorCode, RglementsService } from '@api';
import type { CreatePaymentRequest, Due, DuePage, ErrorResponse } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { SessionService } from '@core/session/session.service';
import type { TranslationKey } from '@core/i18n/translation-keys';
import { FormDialog } from '@shared/form-dialog/form-dialog';
import { DUE_STATUS_TRANSLATION_KEYS } from '@shared/due-status/due-status-i18n';
import { RecordPaymentForm } from '../record-payment-form/record-payment-form';

@Component({
  selector: 'app-campaign-dues-tab',
  imports: [TranslocoPipe, FormDialog, RecordPaymentForm],
  templateUrl: './campaign-dues-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignDuesTab implements OnInit {
  private readonly campaignsService = inject(CampagnesService);
  private readonly paymentsService = inject(RglementsService);
  private readonly sessionService = inject(SessionService);
  private readonly destroyRef = inject(DestroyRef);
  private requestedPage = 0;
  private recordPaymentSession = 0;

  readonly campaignId = input.required<string>();
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly duePage = signal<DuePage | null>(null);
  readonly formatAmount = formatGnfAmountDetailed;
  readonly statusLabels = DUE_STATUS_TRANSLATION_KEYS;
  readonly paidStatus = DueStatus.Paid;
  readonly overdueStatus = DueStatus.Overdue;

  /** Administrateur/Trésorier/Opérateur autorisé uniquement (RG-ROLE-007 à RG-ROLE-009). */
  readonly canRecordPayments = this.sessionService.canRecordPayments;

  readonly recordPaymentDue = signal<Due | null>(null);
  readonly recordPaymentSubmitting = signal(false);
  readonly recordPaymentError = signal<TranslationKey | null>(null);

  readonly previousPageDisabled = computed(
    () => this.loading() || this.loadError() || (this.duePage()?.page.number ?? 0) === 0,
  );
  readonly nextPageDisabled = computed(() => {
    const result = this.duePage();
    return (
      this.loading() ||
      this.loadError() ||
      !result ||
      result.page.number + 1 >= result.page.totalPages
    );
  });

  ngOnInit(): void {
    this.loadPage(0);
  }

  retry(): void {
    if (!this.loading()) {
      this.loadPage(this.requestedPage);
    }
  }

  previousPage(): void {
    const result = this.duePage();
    if (result && !this.previousPageDisabled()) {
      this.loadPage(result.page.number - 1);
    }
  }

  nextPage(): void {
    const result = this.duePage();
    if (result && !this.nextPageDisabled()) {
      this.loadPage(result.page.number + 1);
    }
  }

  private loadPage(page: number): void {
    this.requestedPage = page;
    this.loading.set(true);
    this.loadError.set(false);
    this.campaignsService
      .listCampaignDues(this.campaignId(), page)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.duePage.set(result);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }

  /** Ouvre le formulaire d'enregistrement d'un règlement (T-71, US-COT-005) pour la cotisation choisie. */
  openRecordPayment(due: Due): void {
    if (this.recordPaymentDue()) {
      return;
    }
    ++this.recordPaymentSession;
    this.recordPaymentSubmitting.set(false);
    this.recordPaymentError.set(null);
    this.recordPaymentDue.set(due);
  }

  /** Ferme le formulaire, quelle que soit la cause (Échap, bouton Annuler, succès). */
  closeRecordPayment(): void {
    ++this.recordPaymentSession;
    this.recordPaymentSubmitting.set(false);
    this.recordPaymentDue.set(null);
  }

  /**
   * Confirme l'enregistrement (US-COT-005) : appelle `POST /dues/{dueId}/payments`
   * (`RglementsService.createPayment`, openapi:`createPayment`), puis remplace la
   * cotisation affichée par l'état renvoyé (montant payé, reste à payer, statut
   * recalculés côté serveur), sans recalcul local. La requête est rattachée à une
   * session de dialogue : une réponse tardive après fermeture/réouverture ne
   * referme plus un état devenu obsolète (même motif que `CampaignsListPage`, T-65).
   */
  handleRecordPayment(request: CreatePaymentRequest): void {
    const due = this.recordPaymentDue();
    if (!due || this.recordPaymentSubmitting()) {
      return;
    }
    const session = this.recordPaymentSession;
    this.recordPaymentSubmitting.set(true);
    this.recordPaymentError.set(null);

    this.paymentsService
      .createPayment(due.id, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (session !== this.recordPaymentSession) {
            return;
          }
          this.replaceDue(response.due);
          this.closeRecordPayment();
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

  private replaceDue(updatedDue: Due): void {
    const page = this.duePage();
    if (!page) {
      return;
    }
    this.duePage.set({
      ...page,
      items: page.items.map((item) => (item.id === updatedDue.id ? updatedDue : item)),
    });
  }

  private resolveRecordPaymentErrorKey(error: unknown): TranslationKey {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as ErrorResponse | undefined;
      switch (body?.code) {
        case ErrorCode.PaymentExceedsRemainingAmount:
          return 'campaigns.detail.cotisations.recordPayment.errorExceedsRemaining';
        case ErrorCode.DueAlreadyPaid:
          return 'campaigns.detail.cotisations.recordPayment.errorAlreadyPaid';
        case ErrorCode.ValidationError:
          return 'campaigns.detail.cotisations.recordPayment.errorValidation';
        case ErrorCode.ResourceNotFound:
          return 'campaigns.detail.cotisations.recordPayment.errorNotFound';
        case ErrorCode.AccessDenied:
          return 'campaigns.detail.cotisations.recordPayment.errorAccessDenied';
        default:
          return 'campaigns.detail.cotisations.recordPayment.error';
      }
    }
    return 'campaigns.detail.cotisations.recordPayment.error';
  }
}
