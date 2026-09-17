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
import { formatGnfAmountDetailed } from '@core/formatting/currency';

const DUE_STATUS_LABELS: Record<DueStatus, string> = {
  DUE: 'À payer',
  PARTIALLY_PAID: 'Partiellement payé',
  PAID: 'Payé',
  OVERDUE: 'En retard',
};

@Component({
  selector: 'app-campaign-dues-tab',
  templateUrl: './campaign-dues-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignDuesTab implements OnInit {
  private readonly campaignsService = inject(CampagnesService);
  private readonly destroyRef = inject(DestroyRef);
  private requestedPage = 0;

  readonly campaignId = input.required<string>();
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly duePage = signal<DuePage | null>(null);
  readonly formatAmount = formatGnfAmountDetailed;
  readonly statusLabels = DUE_STATUS_LABELS;
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
}
