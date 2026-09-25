import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTable {
  readonly caption = input.required<string>();
  readonly busy = input(false);
}
