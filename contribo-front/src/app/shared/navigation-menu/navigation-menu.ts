import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { navigationItemsForRole } from '@core/navigation/navigation-items';
import { SessionService } from '@core/session/session.service';

/**
 * Orientation du rendu (T-14) : `vertical` pour la barre latérale desktop/tablette,
 * `horizontal` pour la barre de navigation basse mobile.
 */
export type NavigationMenuOrientation = 'horizontal' | 'vertical';

@Component({
  selector: 'app-navigation-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationMenu {
  private readonly sessionService = inject(SessionService);

  readonly orientation = input<NavigationMenuOrientation>('horizontal');

  readonly items = computed(() => navigationItemsForRole(this.sessionService.user()?.role ?? null));

  readonly navClasses = computed(() =>
    this.orientation() === 'vertical'
      ? 'flex flex-col gap-1'
      : 'flex flex-nowrap items-center justify-around gap-1 overflow-x-auto px-2 py-2 min-[821px]:px-6 min-[821px]:py-4',
  );

  readonly linkClasses = computed(() =>
    this.orientation() === 'vertical'
      ? 'block rounded-lg px-3 py-2 text-sm text-text-2 transition-colors hover:bg-surface-2 hover:text-text'
      : 'shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-center text-xs text-text-2 transition-colors hover:text-text min-[821px]:text-sm',
  );
}
