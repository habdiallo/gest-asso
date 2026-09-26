import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EspacePersonnelService } from '@api';
import type { ContributionPage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { EmptyState } from '@shared/empty-state/empty-state';
import { LoadingSkeleton } from '@shared/loading-skeleton/loading-skeleton';
import { formatCalendarDate } from '../member-space-dates';

/** Contributions personnelles aux cagnottes, issues exclusivement de GET /me/contributions (T-98). */
@Component({
  selector: 'app-my-contributions',
  imports: [TranslocoPipe, EmptyState, LoadingSkeleton],
  templateUrl: './my-contributions.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyContributions {
  private readonly api = inject(EspacePersonnelService);
  private readonly destroyRef = inject(DestroyRef);
  private requestedPage = 0;

  readonly loading = signal(false);
  readonly loadError = signal(false);
  readonly result = signal<ContributionPage | null>(null);
  readonly formatAmount = formatGnfAmountDetailed;
  readonly formatDate = formatCalendarDate;

  constructor() {
    this.loadPage(0);
  }

  loadPage(page: number): void {
    if (this.loading()) return;
    this.requestedPage = page;
    this.loading.set(true);
    this.loadError.set(false);
    this.result.set(null);
    // Aucun identifiant de membre n'est transmis : l'identité vient de la session serveur.
    this.api
      .listMyContributions(page, 20)
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

  retry(): void {
    this.loadPage(this.requestedPage);
  }
}
