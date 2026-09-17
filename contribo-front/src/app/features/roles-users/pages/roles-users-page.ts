import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserRole, UtilisateursEtRlesService } from '@api';
import type { UserAccount, UserAccountPage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { Subject, catchError, of, switchMap } from 'rxjs';
import { operatorAuthorizationLabel, userRoleLabel } from '../roles-users-labels';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Écran liste des utilisateurs avec rôle applicatif affiché (T-52), réservé à
 * l'Administrateur (RG-ROLE-002, garde de route `roleGuard` dans
 * `roles-users.routes.ts`). Appelle `GET /users` (`@api`,
 * `UtilisateursEtRlesService.listUsers`) avec recherche et filtre de rôle du
 * contrat (`q`, `role`), pagination incluse. La recherche texte est débattue
 * manuellement (setTimeout) avant de déclencher `refetch$`, afin que le
 * chargement initial reste immédiat (cf. `.claude/rules/frontend/angular.md`,
 * gestion des erreurs dans la requête du `switchMap` pour permettre les
 * recherches suivantes).
 *
 * Limite connue : ni le changement de rôle (T-53), ni l'affichage de la
 * fonction associative (T-54), ni le contrôle `peut_enregistrer_paiements`
 * (T-55/T-56) ne sont exposés depuis cet écran ; seule la consultation de la
 * liste est du périmètre de ce ticket.
 *
 * Le tableau et les commandes de pagination restent montés pendant un
 * rechargement (recherche, filtre ou changement de page) : seules
 * `previousDisabled`/`nextDisabled` évoluent via `aria-disabled`, sans
 * démonter les boutons. Cela conserve la navigation clavier et le focus sur
 * le bouton actionné, conformément à `.claude/rules/frontend/accessibilite.md`.
 */
@Component({
  selector: 'app-roles-users-page',
  imports: [TranslocoPipe],
  templateUrl: './roles-users-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesUsersPage {
  private readonly usersService = inject(UtilisateursEtRlesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly roleOptions: readonly UserRole[] = [
    UserRole.Administrator,
    UserRole.Treasurer,
    UserRole.Operator,
    UserRole.Member,
  ];

  readonly searchTerm = signal('');
  readonly roleFilter = signal<UserRole | ''>('');
  readonly page = signal(0);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  private readonly result = signal<UserAccountPage | null>(null);

  readonly users = computed<UserAccount[]>(() => this.result()?.items ?? []);
  readonly pageMetadata = computed(() => this.result()?.page ?? null);
  readonly hasLoadedOnce = computed(() => this.result() !== null);
  readonly hasPreviousPage = computed(() => this.page() > 0);
  readonly hasNextPage = computed(() => {
    const metadata = this.pageMetadata();
    return metadata !== null && this.page() + 1 < metadata.totalPages;
  });
  readonly previousDisabled = computed(() => !this.hasPreviousPage() || this.loading());
  readonly nextDisabled = computed(() => !this.hasNextPage() || this.loading());

  readonly userRoleLabel = userRoleLabel;
  readonly operatorAuthorizationLabel = operatorAuthorizationLabel;

  private readonly refetch = new Subject<void>();
  private searchDebounceHandle: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.refetch
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          this.loadError.set(false);
          return this.usersService
            .listUsers(
              this.page(),
              PAGE_SIZE,
              this.searchTerm() || undefined,
              this.roleFilter() || undefined,
            )
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        this.loading.set(false);
        if (page) {
          this.result.set(page);
        } else {
          this.loadError.set(true);
        }
      });

    this.refetch.next();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    clearTimeout(this.searchDebounceHandle);
    this.searchDebounceHandle = setTimeout(() => {
      this.searchTerm.set(value);
      this.page.set(0);
      this.refetch.next();
    }, SEARCH_DEBOUNCE_MS);
  }

  onRoleFilterChange(event: Event): void {
    this.roleFilter.set((event.target as HTMLSelectElement).value as UserRole | '');
    this.page.set(0);
    this.refetch.next();
  }

  goToPreviousPage(): void {
    if (this.previousDisabled()) {
      return;
    }
    this.page.update((current) => current - 1);
    this.refetch.next();
  }

  goToNextPage(): void {
    if (this.nextDisabled()) {
      return;
    }
    this.page.update((current) => current + 1);
    this.refetch.next();
  }
}
