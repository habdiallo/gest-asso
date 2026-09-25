import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination-controls',
  templateUrl: './pagination-controls.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationControls {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly previousDisabled = input(false);
  readonly nextDisabled = input(false);
  readonly navigationLabel = input.required<string>();
  readonly previousLabel = input.required<string>();
  readonly nextLabel = input.required<string>();
  readonly statusLabel = input.required<string>();
  readonly previousPage = output<void>();
  readonly nextPage = output<void>();
}
