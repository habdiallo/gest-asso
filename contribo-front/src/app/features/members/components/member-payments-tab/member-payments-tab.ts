import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RglementsService } from '@api';
import type { Payment, PaymentPage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { EmptyState } from '@shared/empty-state/empty-state';
import { formatMemberPaymentCalendarDate } from '../../member-payment-dates';
import { memberPaymentMethodLabel } from '../../member-payment-method-labels';

/** Taille de page utilisée pour `GET /payments?memberId=...`. */
const PAYMENTS_PAGE_SIZE = 20;

/**
 * Onglet historique des règlements d'une fiche membre (T-29,
 * `openapi:listPayments`) : liste, du plus récent au plus ancien, les
 * règlements d'un membre toutes campagnes confondues (US-MEM-003), avec
 * pagination sur le même modèle que le suivi de cagnotte (T-91).
 *
 * Limite connue : ni le formulaire d'enregistrement d'un règlement (T-71 à
 * T-76), ni l'affichage de l'auteur/l'horodatage (RG-PAY-008, T-74) ne sont
 * traités ici ; cet onglet reste une consultation en lecture seule de
 * l'historique existant.
 */
@Component({
  selector: 'app-member-payments-tab',
  imports: [TranslocoPipe, EmptyState],
  templateUrl: './member-payments-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberPaymentsTab {
  private readonly paymentsService = inject(RglementsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly memberId = input.required<string>();

  readonly loading = signal(true);
  readonly loadError = signal(false);
  /** Erreur d'un changement de page qui n'efface pas la liste déjà affichée. */
  readonly pageActionError = signal(false);
  readonly pageActionPending = signal(false);
  private readonly paymentsPage = signal<PaymentPage | null>(null);

  readonly payments = computed<Payment[]>(() => this.paymentsPage()?.items ?? []);
  readonly totalCount = computed<number>(() => this.paymentsPage()?.page.totalElements ?? 0);
  readonly currentPageNumber = computed<number>(() => (this.paymentsPage()?.page.number ?? 0) + 1);
  readonly totalPages = computed<number>(() => this.paymentsPage()?.page.totalPages ?? 0);
  readonly hasPreviousPage = computed<boolean>(() => (this.paymentsPage()?.page.number ?? 0) > 0);
  readonly hasNextPage = computed<boolean>(() => {
    const currentPage = this.paymentsPage();
    return currentPage !== null && currentPage.page.number + 1 < currentPage.page.totalPages;
  });
  readonly previousPageDisabled = computed(
    () => !this.hasPreviousPage() || this.pageActionPending(),
  );
  readonly nextPageDisabled = computed(() => !this.hasNextPage() || this.pageActionPending());

  readonly formatAmount = formatGnfAmountDetailed;
  readonly formatCalendarDate = formatMemberPaymentCalendarDate;
  readonly paymentMethodLabel = memberPaymentMethodLabel;

  /** Invalide toute réponse encore en vol si l'écran change de membre affiché. */
  private requestToken = 0;

  constructor() {
    effect(() => {
      const memberId = this.memberId();
      this.paymentsPage.set(null);
      this.fetchPage(memberId, 0, { isInitialLoad: true });
    });
  }

  /** Charge la page précédente ; ignoré en dehors des bornes ou pendant un chargement. */
  goToPreviousPage(): void {
    const currentPage = this.paymentsPage();
    if (this.pageActionPending() || !currentPage || currentPage.page.number <= 0) {
      return;
    }
    this.fetchPage(this.memberId(), currentPage.page.number - 1, { isInitialLoad: false });
  }

  /** Charge la page suivante ; ignoré en dehors des bornes ou pendant un chargement. */
  goToNextPage(): void {
    const currentPage = this.paymentsPage();
    if (
      this.pageActionPending() ||
      !currentPage ||
      currentPage.page.number + 1 >= currentPage.page.totalPages
    ) {
      return;
    }
    this.fetchPage(this.memberId(), currentPage.page.number + 1, { isInitialLoad: false });
  }

  private fetchPage(
    memberId: string,
    pageNumber: number,
    options: { isInitialLoad: boolean },
  ): void {
    if (options.isInitialLoad) {
      this.loading.set(true);
      this.loadError.set(false);
    } else {
      this.pageActionPending.set(true);
      this.pageActionError.set(false);
    }
    const token = ++this.requestToken;

    this.paymentsService
      .listPayments(pageNumber, PAYMENTS_PAGE_SIZE, undefined, memberId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          if (token !== this.requestToken) {
            return;
          }
          this.loading.set(false);
          this.pageActionPending.set(false);
          this.paymentsPage.set(page);
        },
        error: () => {
          if (token !== this.requestToken) {
            return;
          }
          this.loading.set(false);
          this.pageActionPending.set(false);
          if (options.isInitialLoad) {
            this.loadError.set(true);
          } else {
            this.pageActionError.set(true);
          }
        },
      });
  }
}
