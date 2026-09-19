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
import { DueStatus, MembresService } from '@api';
import type { DuePage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { SessionService } from '@core/session/session.service';
import { DUE_STATUS_TRANSLATION_KEYS } from '@shared/due-status/due-status-i18n';
import { formatCalendarDate } from '../../member-dates';

/**
 * Onglet "situation des cotisations" de la fiche membre (T-28, US-MEM-003) :
 * appelle `GET /members/{memberId}/dues` (`openapi:listMemberDues`) et
 * affiche, campagne par campagne, le montant dû, le montant payé, le reste à
 * payer et le statut de la cotisation du membre, avec pagination.
 *
 * Vue restreinte de l'Opérateur (RG-MEM-008), par cohérence avec l'onglet
 * cotisations d'une campagne (T-62) : la colonne Catégorie de revenu, qui
 * porte un détail financier, est masquée pour ce rôle. Les montants dû/payé/
 * reste et le statut restent affichés, nécessaires à l'Opérateur pour ses
 * opérations courantes.
 *
 * Limite connue : l'historique des règlements (T-29) et les contributions aux
 * cagnottes (T-30) relèvent de tickets dédiés et ne sont pas affichés ici.
 */
@Component({
  selector: 'app-member-dues-tab',
  imports: [TranslocoPipe],
  templateUrl: './member-dues-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberDuesTab implements OnInit {
  private readonly membersService = inject(MembresService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionService = inject(SessionService);
  private requestedPage = 0;

  readonly memberId = input.required<string>();
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly duePage = signal<DuePage | null>(null);
  readonly formatAmount = formatGnfAmountDetailed;
  readonly formatDate = formatCalendarDate;
  readonly statusLabels = DUE_STATUS_TRANSLATION_KEYS;
  readonly paidStatus = DueStatus.Paid;
  readonly overdueStatus = DueStatus.Overdue;

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
      .listMemberDues(this.memberId(), page)
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
