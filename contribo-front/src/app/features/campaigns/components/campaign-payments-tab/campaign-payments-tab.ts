import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import type { OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RglementsService } from '@api';
import type { PaymentPage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { EmptyState } from '@shared/empty-state/empty-state';
import { DataTable } from '@shared/data-table/data-table';
import { PaginationControls } from '@shared/pagination-controls/pagination-controls';
import { PAYMENT_METHOD_OPTIONS } from '@shared/payment-method-select/payment-method-options';
import { formatCalendarDate } from '../../campaign-dates';

const PAYMENTS_PAGE_SIZE = 10;

@Component({
  selector: 'app-campaign-payments-tab',
  imports: [TranslocoPipe, EmptyState, DataTable, PaginationControls],
  templateUrl: './campaign-payments-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignPaymentsTab implements OnInit {
  private readonly paymentsService = inject(RglementsService);
  private readonly destroyRef = inject(DestroyRef);
  private requestId = 0;
  private requestedPage = 0;

  readonly campaignId = input.required<string>();
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly paymentPage = signal<PaymentPage | null>(null);
  readonly formatAmount = formatGnfAmountDetailed;
  readonly formatDate = formatCalendarDate;

  readonly previousDisabled = signal(true);
  readonly nextDisabled = signal(true);

  ngOnInit(): void {
    this.loadPage(0);
  }

  retry(): void {
    this.loadPage(this.requestedPage);
  }

  previousPage(): void {
    const page = this.paymentPage();
    if (page && page.page.number > 0 && !this.loading()) {
      this.loadPage(page.page.number - 1);
    }
  }

  nextPage(): void {
    const page = this.paymentPage();
    if (page && page.page.number + 1 < page.page.totalPages && !this.loading()) {
      this.loadPage(page.page.number + 1);
    }
  }

  methodLabel(method: string): string {
    return PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? method;
  }

  private loadPage(page: number): void {
    this.requestedPage = page;
    this.loading.set(true);
    this.loadError.set(false);
    const requestId = ++this.requestId;
    this.paymentsService
      .listPayments(page, PAYMENTS_PAGE_SIZE, undefined, undefined, this.campaignId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (requestId !== this.requestId) return;
          this.paymentPage.set(result);
          this.loading.set(false);
          this.previousDisabled.set(result.page.number === 0);
          this.nextDisabled.set(result.page.number + 1 >= result.page.totalPages);
        },
        error: () => {
          if (requestId !== this.requestId) return;
          this.loading.set(false);
          this.loadError.set(true);
        },
      });
  }
}
