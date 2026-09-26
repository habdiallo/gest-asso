import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-detail-shell',
  imports: [RouterLink],
  templateUrl: './detail-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailShell {
  readonly backRouterLink = input.required<string | readonly unknown[]>();
  readonly backLabel = input.required<string>();
  readonly kicker = input.required<string>();
  readonly title = input.required<string>();
  readonly intro = input.required<string>();
  /** Allows detail pages with a custom hero card while retaining the shell and back link. */
  readonly showHero = input(true);
}
