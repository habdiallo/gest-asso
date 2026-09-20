import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import type { NavigationItem } from '@core/navigation/navigation-item';
import { navigationItemsForRole } from '@core/navigation/navigation-items';
import { NAVIGATION_PATHS } from '@core/navigation/navigation-paths';
import { SessionService } from '@core/session/session.service';

/**
 * Orientation du rendu (T-14) : `vertical` pour la barre latérale desktop/tablette,
 * `horizontal` pour la barre de navigation basse mobile.
 */
export type NavigationMenuOrientation = 'horizontal' | 'vertical';

const SIDEBAR_ICONS: Readonly<Record<string, readonly string[]>> = {
  [NAVIGATION_PATHS.members]: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  ],
  [NAVIGATION_PATHS.incomeCategories]: [
    'M20.59 13.41 11 3.83V2H4v7h1.83l9.58 9.59a2 2 0 0 0 2.82 0l2.36-2.36a2 2 0 0 0 0-2.82z',
  ],
  [NAVIGATION_PATHS.campaigns]: [
    'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
    'M16 3v4M8 3v4M3 11h18',
  ],
  [NAVIGATION_PATHS.socialFunds]: [
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z',
  ],
  [NAVIGATION_PATHS.rolesAndUsers]: [
    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
    'M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  ],
  [NAVIGATION_PATHS.memberSpace]: ['M4 21a8 8 0 0 1 16 0'],
};

/**
 * Icône dédiée au lien « Tableau de bord » (T-117) : quatre carrés arrondis,
 * repris de `design/app.js` (`icons.dashboard`, quatre `<rect>`), au lieu des
 * `<path>` de contour utilisés par les autres entrées de `SIDEBAR_ICONS`.
 */
const DASHBOARD_ICON_RECT_ORIGINS: ReadonlyArray<readonly [number, number]> = [
  [3, 3],
  [14, 3],
  [3, 14],
  [14, 14],
];

/**
 * Lien ajouté en tête de la seule navigation verticale (spec
 * `desktop-sidebar-visual`, exigence « Lien de navigation vers le tableau de
 * bord ») : la navigation horizontale (barre basse mobile, hors périmètre de
 * ce change) continue de dériver directement de `navigationItemsForRole`.
 */
const DASHBOARD_ITEM: NavigationItem = {
  label: 'Tableau de bord',
  path: NAVIGATION_PATHS.dashboard,
};

@Component({
  selector: 'app-navigation-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation-menu.html',
  styleUrl: './navigation-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationMenu {
  private readonly sessionService = inject(SessionService);

  readonly orientation = input<NavigationMenuOrientation>('horizontal');

  readonly items = computed(() => navigationItemsForRole(this.sessionService.user()?.role ?? null));
  readonly iconPaths = SIDEBAR_ICONS;
  readonly dashboardIconRectOrigins = DASHBOARD_ICON_RECT_ORIGINS;
  readonly navigationPaths = NAVIGATION_PATHS;
  readonly verticalItems = computed(() =>
    this.items().length > 0 ? [DASHBOARD_ITEM, ...this.items()] : [],
  );

  readonly verticalSections = computed(() => {
    const administrative = (path: string): boolean =>
      path === NAVIGATION_PATHS.incomeCategories || path === NAVIGATION_PATHS.rolesAndUsers;
    return [
      { label: null, items: this.verticalItems().filter((item) => !administrative(item.path)) },
      {
        label: 'Administration',
        items: this.verticalItems().filter((item) => administrative(item.path)),
      },
    ].filter((section) => section.items.length > 0);
  });

  readonly navClasses = computed(() =>
    this.orientation() === 'vertical'
      ? 'sidebar-nav'
      : 'flex flex-nowrap items-center justify-around gap-1 overflow-x-auto px-2 py-2 min-[821px]:px-6 min-[821px]:py-4',
  );

  readonly linkClasses = computed(() =>
    this.orientation() === 'vertical'
      ? 'sidebar-link'
      : 'shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-center text-xs text-text-2 transition-colors hover:text-text min-[821px]:text-sm',
  );

  /**
   * Seul le lien « Tableau de bord » (`/`) exige une correspondance exacte de
   * route : sans cela, `/` préfixe toutes les autres routes authentifiées et
   * resterait actif en permanence (`RouterLinkActive` non exact).
   */
  readonly exactRouteMatch = (path: string): boolean => path === NAVIGATION_PATHS.dashboard;
}
