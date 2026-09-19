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
import { CampagnesService, DueStatus } from '@api';
import type { DuePage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { SessionService } from '@core/session/session.service';
import { DUE_STATUS_TRANSLATION_KEYS } from '@shared/due-status/due-status-i18n';

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
 */
@Component({
  selector: 'app-campaign-dues-tab',
  imports: [TranslocoPipe],
  templateUrl: './campaign-dues-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignDuesTab implements OnInit {
  private readonly campaignsService = inject(CampagnesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionService = inject(SessionService);
  private requestedPage = 0;
  private loadRequestId = 0;

  readonly campaignId = input.required<string>();
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly duePage = signal<DuePage | null>(null);
  readonly formatAmount = formatGnfAmountDetailed;
  readonly statusLabels = DUE_STATUS_TRANSLATION_KEYS;
  readonly paidStatus = DueStatus.Paid;
  readonly overdueStatus = DueStatus.Overdue;

  /** Options du filtre de statut (T-63), dans l'ordre du cahier des charges. */
  readonly statusOptions: readonly DueStatus[] = [
    DueStatus.Due,
    DueStatus.PartiallyPaid,
    DueStatus.Paid,
    DueStatus.Overdue,
  ];
  readonly statusFilter = signal<DueStatus | ''>('');
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

  onStatusFilterChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as DueStatus | '');
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
}
