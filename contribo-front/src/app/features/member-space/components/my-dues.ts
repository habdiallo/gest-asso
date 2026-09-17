import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DueStatus, EspacePersonnelService } from '@api';
import type { DuePage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { formatCalendarDate } from '../member-space-dates';

const STATUS_LABELS: Record<DueStatus, string> = {
  [DueStatus.Due]: 'memberSpace.dues.status.due',
  [DueStatus.PartiallyPaid]: 'memberSpace.dues.status.partiallyPaid',
  [DueStatus.Paid]: 'memberSpace.dues.status.paid',
  [DueStatus.Overdue]: 'memberSpace.dues.status.overdue',
};

/** Cotisations personnelles, issues exclusivement de GET /me/dues (T-96). */
@Component({
  selector: 'app-my-dues',
  imports: [TranslocoPipe],
  templateUrl: './my-dues.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyDues {
  private readonly api = inject(EspacePersonnelService);
  private readonly destroyRef = inject(DestroyRef);
  private requestedPage = 0;

  readonly loading = signal(false);
  readonly loadError = signal(false);
  readonly result = signal<DuePage | null>(null);
  readonly formatAmount = formatGnfAmountDetailed;
  readonly statusLabels = STATUS_LABELS;
  readonly dueStatus = DueStatus;

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
      .listMyDues(page, 20)
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

  readonly formatDate = formatCalendarDate;
}
