import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatCardIcon = 'users' | 'user-plus' | 'campaigns' | 'members';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {
  readonly icon = input.required<StatCardIcon>();
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly detail = input<string | null>(null);
}
