import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { ActivatedRouteSnapshot } from '@angular/router';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import type { CurrentUser } from '@api';
import { ThemeToggle } from '@shared/theme-toggle/theme-toggle';
import { LogoutButton } from '@shared/logout-button/logout-button';
import { NavigationMenu } from '@shared/navigation-menu/navigation-menu';
import { NAVIGATION_PATHS } from '@core/navigation/navigation-paths';
import { SessionService } from '@core/session/session.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { filter, map } from 'rxjs';

const SIDEBAR_ROLE_LABELS: Record<CurrentUser['role'], string> = {
  ADMINISTRATOR: 'Administrateur',
  TREASURER: 'Trésorier',
  OPERATOR: 'Opérateur',
  MEMBER: 'Membre',
};

/**
 * Les titres de route suivent `Contribo <separateur> <libelle de la page>`
 * (cf. `*.routes.ts`), avec un separateur historiquement tantot tiret
 * cadratin (code point 2014), tantot tiret simple. Le fil d'Ariane (T-117)
 * n'affiche que le libelle de la page courante, la marque restant fixe dans
 * le gabarit. Le tiret cadratin est construit depuis son code point pour ne
 * pas introduire ce caractere dans le contenu du depot.
 */
const EM_DASH = String.fromCharCode(0x2014);
const BRAND_PREFIX_PATTERN = new RegExp(`^Contribo\\s*[${EM_DASH}-]\\s*`);

function stripBrandPrefix(routeTitle: string): string {
  const label = routeTitle.replace(BRAND_PREFIX_PATTERN, '').trim();
  return label || routeTitle;
}

/**
 * Lit le `title` résolu de la route active la plus profonde plutôt que
 * `document.title` (T-117) : `Title` n'applique le titre au document
 * qu'après l'évènement `NavigationEnd`, ce qui décalait le fil d'Ariane
 * d'une navigation. Le `title` du snapshot, lui, est déjà résolu à ce
 * moment-là.
 */
function currentRouteTitle(router: Router): string {
  let snapshot: ActivatedRouteSnapshot = router.routerState.snapshot.root;
  let title = snapshot.title;
  while (snapshot.firstChild) {
    snapshot = snapshot.firstChild;
    title = snapshot.title ?? title;
  }
  return title ? stripBrandPrefix(title) : '';
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggle, LogoutButton, NavigationMenu, TranslocoPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  readonly isAuthenticated = this.sessionService.isAuthenticated;
  /** Libellé du fil d'Ariane (T-117) : dérivé du titre de la route active, mis à jour à chaque navigation. */
  readonly breadcrumbLabel = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => currentRouteTitle(this.router)),
    ),
    { initialValue: currentRouteTitle(this.router) },
  );
  readonly sidebarProfile = computed(() => {
    const user = this.sessionService.user();
    if (!user) {
      return null;
    }
    const name = user.member.displayName;
    return {
      name,
      initials: name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toLocaleUpperCase('fr'),
      role: SIDEBAR_ROLE_LABELS[user.role],
    };
  });

  openSidebarProfile(): void {
    void this.router.navigateByUrl(NAVIGATION_PATHS.memberSpace);
  }
}
