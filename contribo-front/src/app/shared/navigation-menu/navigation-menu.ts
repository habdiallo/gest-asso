import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { navigationItemsForRole } from '@core/navigation/navigation-items';
import { SessionService } from '@core/session/session.service';

@Component({
  selector: 'app-navigation-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationMenu {
  private readonly sessionService = inject(SessionService);

  readonly items = computed(() => navigationItemsForRole(this.sessionService.user()?.role ?? null));
}
