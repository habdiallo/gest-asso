import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** En-tête de page partagé, aligné sur le motif `.page-head` du prototype. */
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly kicker = input<string | null>(null);
  readonly title = input.required<string>();
  readonly intro = input<string | null>(null);
}
