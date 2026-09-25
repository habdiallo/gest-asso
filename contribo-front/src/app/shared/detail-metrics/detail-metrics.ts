import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface DetailMetric {
  readonly label: string;
  readonly value: string;
  readonly hint: string;
}

@Component({
  selector: 'app-detail-metrics',
  templateUrl: './detail-metrics.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailMetrics {
  readonly items = input.required<readonly DetailMetric[]>();
}
