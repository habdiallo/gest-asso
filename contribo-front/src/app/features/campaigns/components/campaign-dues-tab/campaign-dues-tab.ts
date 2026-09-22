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
import { EmptyState } from '@shared/empty-state/empty-state';
import type { CustomSelectOption } from '@shared/custom-select/custom-select';
import { CustomSelect } from '@shared/custom-select/custom-select';
import { RecordPaymentForm } from '../record-payment-form/record-payment-form';

/**
 * Onglet cotisations d'une campagne (T-61, US-COT-003, US-COT-004).
 *
 * Vue restreinte de l'Opérateur (T-62, RG-MEM-008) : la colonne Catégorie de
 * revenu, qui porte le détail financier du membre, est masquée pour le rôle
 * Opérateur, conformément à la vue limitée sans agrégat financier réservé
 * prévue par la matrice des responsabilités. Les montants dû/payé/reste et le
 * statut restent affichés : ils sont nécessaires à l'Opérateur pour ses
 * opérations courantes (consultation de la situation, enregistrement d'un
 * règlement lorsqu'il y est autorisé). Les autres rôles (Administrateur,
 * Trésorier) et l'absence de rôle conservent la colonne inchangée.
 *
 * L'enregistrement d'un nouveau règlement est également masqué sur une
 * campagne clôturée (T-81, RG-COT), quel que soit le rôle par ailleurs
 * autorisé : voir l'entrée `campaignClosed`, transmise par
 * `CampaignDetailPage` à partir du statut de la campagne.
 *
 * L'action est enfin masquée ligne par ligne sur une cotisation déjà soldée
 * (statut Payé, T-76) : sans reste à payer, aucun nouveau règlement n'est
 * possible sur cette cotisation. Ce masquage s'applique immédiatement après
 * un règlement qui solde le reste à payer (T-75 rafraîchit l'état affiché
 * avec la réponse serveur), sans attendre un rechargement de la page.
 */
@Component({
  selector: 'app-campaign-dues-tab',
  imports: [TranslocoPipe, EmptyState, FormDialog, RecordPaymentForm, CustomSelect],
  templateUrl: './campaign-dues-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignDuesTab implements OnInit {
  private readonly campaignsService = inject(CampagnesService);
  private readonly paymentsService = inject(RglementsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionService = inject(SessionService);
  private requestedPage = 0;
  private recordPaymentSession = 0;
  private readonly duesWithPaymentInFlight = new Set<string>();
  private loadRequestId = 0;

  readonly campaignId = input.required<string>();
  /** Campagne clôturée (T-81) : masque l'enregistrement d'un nouveau règlement, quel que soit le rôle par ailleurs autorisé. */
  readonly campaignClosed = input<boolean>(false);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly duePage = signal<DuePage | null>(null);
  readonly formatAmount = formatGnfAmountDetailed;
  readonly statusLabels = DUE_STATUS_TRANSLATION_KEYS;
  readonly paidStatus = DueStatus.Paid;
  readonly overdueStatus = DueStatus.Overdue;

  /** Administrateur/Trésorier/Opérateur autorisé uniquement (RG-ROLE-007 à RG-ROLE-009). */
  readonly canRecordPayments = this.sessionService.canRecordPayments;

  /**
   * Action masquée sur une campagne clôturée (T-81), quel que soit le rôle
   * par ailleurs autorisé. Ce contrôle IHM ne remplace pas l'autorisation
   * serveur (voir `api-client.md`).
   */
  readonly canRecordPaymentsNow = computed(
    () => this.canRecordPayments() && !this.campaignClosed(),
  );

  readonly recordPaymentDue = signal<Due | null>(null);
  readonly recordPaymentSubmitting = signal(false);
  readonly recordPaymentError = signal<TranslationKey | null>(null);
  /** Options du filtre de statut (T-63), dans l'ordre du cahier des charges. */
  readonly statusOptions: readonly DueStatus[] = [
    DueStatus.Due,
    DueStatus.PartiallyPaid,
    DueStatus.Paid,
    DueStatus.Overdue,
  ];
  readonly statusFilter = signal<DueStatus | ''>('');
  readonly statusSelectOptions: readonly CustomSelectOption[] = this.statusOptions.map(
    (status) => ({
      value: status,
      label: '',
      translationKey: this.statusLabels[status],
    }),
  );
  readonly showIncomeCategory = computed(() => this.sessionService.user()?.role !== 'OPERATOR');

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

  onStatusFilterChange(value: string | null): void {
    this.statusFilter.set((value ?? '') as DueStatus | '');
    this.loadPage(0);
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

  /**
   * Charge une page de cotisations. Chaque appel (pagination, changement de
   * filtre) attribue un identifiant de requête : une réponse tardive d'un
   * appel antérieur (par exemple un filtre déjà remplacé) est ignorée plutôt
   * que d'écraser le résultat du filtre courant avec des données obsolètes.
   */
  private loadPage(page: number): void {
    this.requestedPage = page;
    this.loading.set(true);
    this.loadError.set(false);
    const requestId = ++this.loadRequestId;
    this.campaignsService
      .listCampaignDues(
        this.campaignId(),
        page,
        undefined,
        undefined,
        this.statusFilter() || undefined,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (requestId !== this.loadRequestId) {
            return;
          }
          this.duePage.set(result);
          this.loading.set(false);
        },
        error: () => {
          if (requestId !== this.loadRequestId) {
            return;
          }
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }

  /**
   * Ouvre le formulaire d'enregistrement d'un règlement (T-71, US-COT-005) pour
   * la cotisation choisie. Refuse également une cotisation déjà soldée (statut
   * Payé, T-76) : le bouton correspondant est masqué dans le template, ce
   * contrôle protège l'appel direct de la méthode.
   */
  openRecordPayment(due: Due): void {
    if (!this.canRecordPaymentsNow() || due.status === this.paidStatus || this.recordPaymentDue()) {
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
   * recalculés côté serveur), sans recalcul local. L'application de cet état est
   * indépendante de la session de dialogue : fermer/rouvrir le formulaire (Échap,
   * bouton Fermer/Annuler) avant la réponse ne doit ni perdre le paiement confirmé
   * ni autoriser une seconde écriture sur la même cotisation tant que la première
   * est en cours (`duesWithPaymentInFlight`). Seul l'état visuel du dialogue
   * (soumission, erreur, fermeture) reste rattaché à la session courante.
   */
  handleRecordPayment(request: CreatePaymentRequest): void {
    const due = this.recordPaymentDue();
    if (!due || this.recordPaymentSubmitting() || this.duesWithPaymentInFlight.has(due.id)) {
      return;
    }
    const session = this.recordPaymentSession;
    this.duesWithPaymentInFlight.add(due.id);
    this.recordPaymentSubmitting.set(true);
    this.recordPaymentError.set(null);

    this.paymentsService
      .createPayment(due.id, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.duesWithPaymentInFlight.delete(due.id);
          this.replaceDue(response.due);
          if (session !== this.recordPaymentSession) {
            return;
          }
          this.closeRecordPayment();
        },
        error: (error: unknown) => {
          this.duesWithPaymentInFlight.delete(due.id);
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
