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
import { DueStatus, MembresService } from '@api';
import type { DuePage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { DUE_STATUS_TRANSLATION_KEYS } from '@shared/due-status/due-status-i18n';
import { DataTable } from '@shared/data-table/data-table';
import { EmptyState } from '@shared/empty-state/empty-state';
import { PaginationControls } from '@shared/pagination-controls/pagination-controls';
import { formatCalendarDate } from '../../member-dates';

const DUES_PAGE_SIZE = 10;

/**
 * Onglet "situation des cotisations" de la fiche membre (T-28, US-MEM-003) :
 * appelle `GET /members/{memberId}/dues` (`openapi:listMemberDues`) et
 * affiche, campagne par campagne, le montant dû, le montant payé, le reste à
 * payer et le statut de la cotisation du membre, avec pagination.
 *
 * Colonnes réduites à l'ensemble métier de la maquette (T-130, RG-MEM) :
 * Campagne, Dû, Payé, Reste, Statut, quel que soit le rôle. La colonne
 * Catégorie de revenu, affichée avant T-130, a été retirée de ce tableau.
 *
 * Limite connue : l'historique des règlements (T-29) et les contributions aux
 * cagnottes (T-30) relèvent de tickets dédiés et ne sont pas affichés ici.
 */
@Component({
  selector: 'app-member-dues-tab',
  imports: [TranslocoPipe, DataTable, EmptyState, PaginationControls],
  templateUrl: './member-dues-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberDuesTab {
  private readonly membersService = inject(MembresService);
  private readonly destroyRef = inject(DestroyRef);
  private requestedPage = 0;

  readonly memberId = input.required<string>();
  /** Incrémenté par la fiche membre après un règlement pour recharger la page courante (T-130). */
  readonly refreshToken = input(0);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly duePage = signal<DuePage | null>(null);
  readonly formatAmount = formatGnfAmountDetailed;
  readonly formatDate = formatCalendarDate;
  readonly statusLabels = DUE_STATUS_TRANSLATION_KEYS;
  readonly paidStatus = DueStatus.Paid;
  readonly overdueStatus = DueStatus.Overdue;

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

  constructor() {
    effect(() => {
      this.refreshToken();
      this.loadPage(0);
    });
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
    this.membersService
      .listMemberDues(this.memberId(), page, DUES_PAGE_SIZE)
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
}
