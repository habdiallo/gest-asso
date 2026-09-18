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
import type { CreateSocialFundRequest, SocialFundPage, SocialFundSummary } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { SessionService } from '@core/session/session.service';
import { FormDialog } from '@shared/form-dialog/form-dialog';
import { catchError, map, of, Subject, switchMap } from 'rxjs';
import { formatGnfAmountCondensed } from '@core/formatting/currency';
import { SocialFundCreateForm } from '../components/social-fund-create-form/social-fund-create-form';
import { formatSocialFundCalendarDate } from '../social-fund-dates';
import { socialEventTypeLabel, socialFundStatusLabel } from '../social-fund-labels';

/** Taille de page utilisée pour `GET /social-funds` (RG de pagination par défaut). */
const PAGE_SIZE = 20;

/**
 * Largeur affichée de la barre de progression, bornée à 100 même si
 * `progressRate` dépasse cette valeur (objectif atteint et dépassé).
 *
 * L'objectif (`targetAmount`) est facultatif (T-85, US-CAG-001). Le template
 * masque entièrement la barre et le libellé "/ objectif" via
 * `@if (socialFund.targetAmount; as targetAmount)` dans
 * `social-funds-list-page.html`, sans appeler cette fonction, dès qu'une
 * cagnotte n'a pas d'objectif défini : seul le montant collecté reste
 * affiché dans ce cas (voir le test "hides the progress bar when no target
 * amount is defined").
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
 *
 * Ajoute également l'action "Créer une cagnotte" (T-84, US-CAG-001) : ouvre
 * le formulaire de création dans `FormDialog` (T-15) et appelle
 * `POST /social-funds` (`CagnottesService.createSocialFund`,
 * openapi:`createSocialFund`). Après création, la première page est
 * rechargée avec le filtre courant afin d'afficher la nouvelle cagnotte
 * (RG-CAG-002).
 *
 * Masquage de l'action "Créer une cagnotte" pour l'Opérateur et le Membre
 * (T-86) : seuls l'Administrateur et le Trésorier créent une cagnotte
 * (US-CAG-001, spec `cagnottes-ui`). Le Membre n'accède déjà pas à cet écran
 * (`roleGuard` sur la route `/cagnottes`, voir `app.routes.ts`) ; ce
 * masquage protège en plus l'Opérateur, seul rôle non autorisé qui consulte
 * effectivement cette liste.
 *
 * Objectif facultatif (T-85) : `targetAmount` est optionnel dans
 * `CreateSocialFundRequest` (T-84, `social-fund-create-form.ts`) et dans
 * `SocialFundSummary`. Une cagnotte sans objectif n'affiche ni barre de
 * progression ni comparatif "collecté / objectif", voir `progressBarWidth`
 * ci-dessus et le bloc `@if (socialFund.targetAmount; as targetAmount)` du
 * template.
 */
@Component({
  selector: 'app-social-funds-list-page',
  imports: [RouterLink, TranslocoPipe, FormDialog, SocialFundCreateForm],
  templateUrl: './social-funds-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialFundsListPage {
  private readonly socialFundsService = inject(CagnottesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionService = inject(SessionService);
  private createDialogSession = 0;

  /**
   * Masquage de l'action "Créer une cagnotte" pour l'Opérateur et le Membre
   * (T-86) : seuls l'Administrateur et le Trésorier créent une cagnotte
   * (US-CAG-001).
   */
  readonly canCreateSocialFund = computed(() => {
    const role = this.sessionService.user()?.role;
    return role === 'ADMINISTRATOR' || role === 'TREASURER';
  });

  readonly eventTypeOptions: readonly SocialEventType[] = [
    SocialEventType.Wedding,
    SocialEventType.Baptism,
    SocialEventType.Death,
    SocialEventType.Birth,
    SocialEventType.Other,
  ];

  readonly eventTypeFilter = signal<SocialEventType | ''>('');

  readonly createDialogOpen = signal(false);
  readonly creating = signal(false);
  readonly createError = signal(false);

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

  /** Ouvre le formulaire de création de cagnotte (T-84), réservé à l'Administrateur et au Trésorier (T-86). */
  openCreateDialog(): void {
    if (!this.canCreateSocialFund() || this.createDialogOpen()) {
      return;
    }
    ++this.createDialogSession;
    this.creating.set(false);
    this.createError.set(false);
    this.createDialogOpen.set(true);
  }

  /** Ferme le formulaire, quelle que soit la cause (Échap, bouton Annuler, succès). */
  closeCreateDialog(): void {
    ++this.createDialogSession;
    this.creating.set(false);
    this.createDialogOpen.set(false);
  }

  /**
   * Confirme la création (US-CAG-001) : appelle `createSocialFund`, puis
   * recharge la première page avec le filtre courant pour afficher la
   * nouvelle cagnotte. La requête est rattachée à une session de dialogue :
   * si le formulaire a été fermé puis rouvert entre-temps, une réponse
   * tardive ne referme plus l'état devenu obsolète.
   */
  handleCreateSocialFund(request: CreateSocialFundRequest): void {
    if (!this.createDialogOpen() || this.creating()) {
      return;
    }
    const session = this.createDialogSession;
    this.creating.set(true);
    this.createError.set(false);

    this.socialFundsService
      .createSocialFund(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.fetchPage(0, { isInitialLoad: false });
          if (session !== this.createDialogSession) {
            return;
          }
          this.closeCreateDialog();
        },
        error: () => {
          if (session !== this.createDialogSession) {
            return;
          }
          this.creating.set(false);
          this.createError.set(true);
        },
      });
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
