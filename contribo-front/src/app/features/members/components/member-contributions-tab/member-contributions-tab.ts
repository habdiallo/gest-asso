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
import { ContributionsService } from '@api';
import type { ContributionPage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { formatMemberCalendarDate } from '../../members-dates';
import { memberContributionMethodLabel } from '../../members-contribution-method-labels';

/**
 * Onglet "Contributions aux cagnottes" de la fiche membre (T-30, tâche 4.10,
 * US-MEM-003) : liste les contributions du membre à des cagnottes via
 * `GET /contributions?memberId=...` (`@api`, `ContributionsService.listContributions`,
 * `openapi:listContributions`), du plus récent au plus ancien, avec cagnotte,
 * montant, date et mode de règlement.
 *
 * Limite connue, hors périmètre de T-30 : les autres onglets de la fiche
 * membre (situation des cotisations T-28, historique des règlements T-29) et
 * la navigation clavier entre onglets (T-31) ne sont pas traités ici.
 */
@Component({
  selector: 'app-member-contributions-tab',
  imports: [TranslocoPipe],
  templateUrl: './member-contributions-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberContributionsTab implements OnInit {
  private readonly contributionsService = inject(ContributionsService);
  private readonly destroyRef = inject(DestroyRef);
  private requestedPage = 0;

  readonly memberId = input.required<string>();
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly result = signal<ContributionPage | null>(null);
  readonly formatAmount = formatGnfAmountDetailed;
  readonly formatDate = formatMemberCalendarDate;
  readonly methodLabel = memberContributionMethodLabel;

  readonly previousPageDisabled = computed(
    () => this.loading() || this.loadError() || (this.result()?.page.number ?? 0) === 0,
  );
  readonly nextPageDisabled = computed(() => {
    const result = this.result();
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
    const result = this.result();
    if (result && !this.previousPageDisabled()) {
      this.loadPage(result.page.number - 1);
    }
  }

  nextPage(): void {
    const result = this.result();
    if (result && !this.nextPageDisabled()) {
      this.loadPage(result.page.number + 1);
    }
  }

  private loadPage(page: number): void {
    this.requestedPage = page;
    this.loading.set(true);
    this.loadError.set(false);
    this.contributionsService
      .listContributions(page, 20, undefined, this.memberId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }
}
