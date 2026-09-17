import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CagnottesService, SocialEventType } from '@api';
import type { SocialFundPage, SocialFundSummary } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { catchError, map, of, Subject, switchMap } from 'rxjs';
import { formatGnfAmountCondensed } from '@core/formatting/currency';
import { formatSocialFundCalendarDate } from '../social-fund-dates';
import { socialEventTypeLabel, socialFundStatusLabel } from '../social-fund-labels';

/** Taille de page utilisée pour `GET /social-funds` (RG de pagination par défaut). */
const PAGE_SIZE = 20;

/**
 * Largeur affichée de la barre de progression, bornée à 100 même si
 * `progressRate` dépasse cette valeur (objectif atteint et dépassé).
 */
function progressBarWidth(progressRate: number): number {
  return Math.min(100, Math.max(0, progressRate));
}

/**
 * Écran liste des cagnottes (T-82) : appelle `GET /social-funds` (`@api`,
 * `CagnottesService`) et affiche les cagnottes sociales renvoyées par le
 * serveur. Écran/route/feature entièrement distincts de l'écran des
 * campagnes de cotisation (RG-CAG-001 : une cagnotte est indépendante d'une
 * campagne) ; aucun composant n'est partagé entre les deux.
 *
 * Le contrôle d'accès par rôle applicatif (Administrateur/Trésorier/Opérateur)
 * est porté par `roleGuard` sur la route `/cagnottes` (voir `app.routes.ts`),
 * jamais déduit ici de la fonction associative.
 *
 * La pagination (page précédente/suivante) exploite les métadonnées
 * `page.number`/`page.totalPages` renvoyées par le serveur. Le filtre par
 * type d'événement (T-83) appelle `GET /social-funds?eventType=...`
 * (paramètre `SocialFundEventTypeFilter` de `besoins/openapi.yaml`) et
 * revient à la première page à chaque changement. Les requêtes de page et
 * de filtre passent par un unique flux avec `switchMap`, afin qu'un
 * changement rapide de filtre ou de page annule la requête précédente et
 * n'affiche jamais un résultat qui ne correspond plus au filtre courant.
 * Limite connue : la recherche texte (US-CAG) n'est pas encore exploitée
 * par cet écran.
 */
@Component({
  selector: 'app-social-funds-list-page',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './social-funds-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialFundsListPage {
  private readonly socialFundsService = inject(CagnottesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly eventTypeOptions: readonly SocialEventType[] = [
    SocialEventType.Wedding,
    SocialEventType.Baptism,
    SocialEventType.Death,
    SocialEventType.Birth,
    SocialEventType.Other,
  ];

  readonly eventTypeFilter = signal<SocialEventType | ''>('');

  readonly loading = signal(true);
  readonly loadError = signal(false);
  /** Erreur d'un changement de page qui n'efface pas la liste déjà affichée. */
  readonly pageActionError = signal(false);
  /** `true` pendant le chargement d'une page suivante/précédente déjà en place. */
  readonly pageActionPending = signal(false);
  private readonly page = signal<SocialFundPage | null>(null);
  private readonly pageRequests = new Subject<{ pageNumber: number; isInitialLoad: boolean }>();

  readonly socialFunds = computed<SocialFundSummary[]>(() => this.page()?.items ?? []);
  readonly totalCount = computed<number>(() => this.page()?.page.totalElements ?? 0);
  readonly currentPageNumber = computed<number>(() => (this.page()?.page.number ?? 0) + 1);
  readonly totalPages = computed<number>(() => this.page()?.page.totalPages ?? 0);
  readonly hasPreviousPage = computed<boolean>(() => (this.page()?.page.number ?? 0) > 0);
  readonly hasNextPage = computed<boolean>(() => {
    const currentPage = this.page();
    return currentPage !== null && currentPage.page.number + 1 < currentPage.page.totalPages;
  });
  readonly previousPageDisabled = computed(
    () => !this.hasPreviousPage() || this.pageActionPending(),
  );
  readonly nextPageDisabled = computed(() => !this.hasNextPage() || this.pageActionPending());

  readonly formatAmount = formatGnfAmountCondensed;
  readonly formatCalendarDate = formatSocialFundCalendarDate;
  readonly socialFundStatusLabel = socialFundStatusLabel;
  readonly socialEventTypeLabel = socialEventTypeLabel;
  readonly progressBarWidth = progressBarWidth;

  constructor() {
    this.pageRequests
      .pipe(
        switchMap(({ pageNumber, isInitialLoad }) =>
          this.socialFundsService
            .listSocialFunds(
              pageNumber,
              PAGE_SIZE,
              undefined,
              undefined,
              this.eventTypeFilter() || undefined,
            )
            .pipe(
              map((page) => ({ page, isInitialLoad, failed: false }) as const),
              catchError(() => of({ page: null, isInitialLoad, failed: true } as const)),
            ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ page, isInitialLoad, failed }) => {
        this.loading.set(false);
        this.pageActionPending.set(false);
        if (failed) {
          if (isInitialLoad) {
            this.loadError.set(true);
          } else {
            this.pageActionError.set(true);
          }
          return;
        }
        this.page.set(page);
      });

    this.fetchPage(0, { isInitialLoad: true });
  }

  /** Charge la page précédente (RG pagination) ; ignoré en dehors des bornes ou pendant un chargement. */
  goToPreviousPage(): void {
    const currentPage = this.page();
    if (this.pageActionPending() || !currentPage || currentPage.page.number <= 0) {
      return;
    }
    this.fetchPage(currentPage.page.number - 1, { isInitialLoad: false });
  }

  /** Charge la page suivante (RG pagination) ; ignoré en dehors des bornes ou pendant un chargement. */
  goToNextPage(): void {
    const currentPage = this.page();
    if (
      this.pageActionPending() ||
      !currentPage ||
      currentPage.page.number + 1 >= currentPage.page.totalPages
    ) {
      return;
    }
    this.fetchPage(currentPage.page.number + 1, { isInitialLoad: false });
  }

  /** Applique le filtre par type d'événement (T-83) et revient à la première page. */
  onEventTypeFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.eventTypeFilter.set(value as SocialEventType | '');
    this.fetchPage(0, { isInitialLoad: false });
  }

  private fetchPage(pageNumber: number, options: { isInitialLoad: boolean }): void {
    if (options.isInitialLoad) {
      this.loading.set(true);
      this.loadError.set(false);
    } else {
      this.pageActionPending.set(true);
      this.pageActionError.set(false);
    }

    this.pageRequests.next({ pageNumber, isInitialLoad: options.isInitialLoad });
  }
}
