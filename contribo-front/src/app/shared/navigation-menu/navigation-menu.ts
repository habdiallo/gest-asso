import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
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
  [NAVIGATION_PATHS.more]: ['M5 12h.01M12 12h.01M19 12h.01'],
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
 * Lien ajouté en tête des navigations authentifiées. Les autres destinations
 * restent dérivées du rôle applicatif courant.
 */
const DASHBOARD_ITEM: NavigationItem = {
  label: 'Tableau de bord',
  path: NAVIGATION_PATHS.dashboard,
};

const MOBILE_DASHBOARD_ITEM: NavigationItem = {
  label: 'Accueil',
  path: NAVIGATION_PATHS.dashboard,
};

const MOBILE_MORE_ITEM: NavigationItem = {
  label: 'Plus',
  path: NAVIGATION_PATHS.more,
};

const MOBILE_PRIMARY_PATHS = new Set<string>([
  NAVIGATION_PATHS.members,
  NAVIGATION_PATHS.campaigns,
  NAVIGATION_PATHS.socialFunds,
]);

@Component({
  selector: 'app-navigation-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation-menu.html',
  styleUrl: './navigation-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationMenu {
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);

  readonly orientation = input<NavigationMenuOrientation>('horizontal');

  /**
   * Chemin courant, sans requête ni fragment. Signal pour que le composant OnPush
   * recalcule l'état actif mobile à chaque navigation.
   */
  private readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.split(/[?#]/, 1)[0]),
    ),
    { initialValue: this.router.url.split(/[?#]/, 1)[0] },
  );

  readonly items = computed(() => navigationItemsForRole(this.sessionService.user()?.role ?? null));
  readonly iconPaths = SIDEBAR_ICONS;
  readonly dashboardIconRectOrigins = DASHBOARD_ICON_RECT_ORIGINS;
  readonly navigationPaths = NAVIGATION_PATHS;
  readonly verticalItems = computed(() =>
    this.items().length > 0 ? [DASHBOARD_ITEM, ...this.items()] : [],
  );
  readonly mobileItems = computed(() => {
    const roleItems = this.items();
    if (roleItems.length === 0) {
      return [];
    }

    const primaryItems = roleItems.filter((item) => MOBILE_PRIMARY_PATHS.has(item.path));
    return [MOBILE_DASHBOARD_ITEM, ...primaryItems, MOBILE_MORE_ITEM];
  });

  readonly mobileLabel = (item: NavigationItem): string =>
    item.path === NAVIGATION_PATHS.campaigns ? 'Campagnes' : item.label;

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
      : 'mobile-nav flex flex-nowrap items-center justify-center gap-0 overflow-x-auto px-0 py-2 min-[1181px]:gap-1 min-[1181px]:px-6 min-[1181px]:py-4',
  );

  readonly linkClasses = computed(() =>
    this.orientation() === 'vertical'
      ? 'sidebar-link'
      : 'mobile-nav-link min-w-0 flex-1 rounded-[var(--radius-icon)] px-1 py-2 text-center text-xs text-text-2 transition-colors hover:text-text min-[1181px]:flex-none min-[1181px]:text-sm',
  );

  /**
   * Seul le lien « Tableau de bord » (`/dashboard`) exige une correspondance
   * exacte de route : sans cela, son chemin préfixerait les autres routes
   * authentifiées et resterait actif en permanence (`RouterLinkActive` non
   * exact).
   */
  readonly exactRouteMatch = (path: string): boolean => path === NAVIGATION_PATHS.dashboard;

  readonly isMobileItemActive = (path: string): boolean => {
    const currentPath = this.currentPath();
    if (path === NAVIGATION_PATHS.dashboard) {
      return currentPath === path;
    }
    if (path === NAVIGATION_PATHS.more) {
      return [
        NAVIGATION_PATHS.more,
        NAVIGATION_PATHS.memberSpace,
        NAVIGATION_PATHS.rolesAndUsers,
        NAVIGATION_PATHS.incomeCategories,
      ].some(
        (destination) => currentPath === destination || currentPath.startsWith(`${destination}/`),
      );
    }
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };
}
