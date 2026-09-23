import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CagnottesService, SocialEventType } from '@api';
import type { CreateSocialFundRequest, SocialFundPage, SocialFundSummary } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { SessionService } from '@core/session/session.service';
import { ActionButton } from '@shared/action-button/action-button';
import { ApiErrorRetry } from '@shared/api-error-retry/api-error-retry';
import { EmptyState } from '@shared/empty-state/empty-state';
import { FormDialog } from '@shared/form-dialog/form-dialog';
import { LoadingSkeleton } from '@shared/loading-skeleton/loading-skeleton';
import { PageHeader } from '@shared/page-header/page-header';
import type { CustomSelectOption } from '@shared/custom-select/custom-select';
import { CustomSelect } from '@shared/custom-select/custom-select';
import { catchError, map, of, Subject, switchMap } from 'rxjs';
import { formatGnfAmountCondensed } from '@core/formatting/currency';
import { SocialFundCreateForm } from '../components/social-fund-create-form/social-fund-create-form';
import { formatSocialFundCalendarDate } from '../social-fund-dates';
import { socialEventTypeLabel, socialFundStatusLabel } from '../social-fund-labels';
import { progressBarWidth } from '../social-fund-progress';

/** Taille de page utilisée pour `GET /social-funds` (RG de pagination par défaut). */
const PAGE_SIZE = 20;

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
 * (`../social-fund-progress`, partagée avec l'écran suivi de cagnotte, T-92)
 * et le bloc `@if (socialFund.targetAmount; as targetAmount)` du template.
 */
@Component({
  selector: 'app-social-funds-list-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    ActionButton,
    ApiErrorRetry,
    EmptyState,
    FormDialog,
    LoadingSkeleton,
    PageHeader,
    CustomSelect,
    SocialFundCreateForm,
  ],
  templateUrl: './social-funds-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialFundsListPage {
  private readonly socialFundsService = inject(CagnottesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionService = inject(SessionService);
  private createDialogSession = 0;
  /** Formulaire de création affiché (T-102) : relu par `retryCreateSocialFund`. */
  private readonly createForm = viewChild<SocialFundCreateForm>('createForm');

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
  readonly eventTypeSelectOptions: readonly CustomSelectOption[] = [
    { value: '', label: '', translationKey: 'socialFunds.eventTypeFilterAll' },
    ...this.eventTypeOptions.map((eventType) => ({
      value: eventType,
      label: socialEventTypeLabel(eventType),
    })),
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

  /**
   * Applique le filtre par type d'événement (T-83) et revient à la première page.
   *
   * Correction T-114 (retours P2 de la PR #43) : vide immédiatement la page affichée
   * (`page` remis à `null`) avant d'envoyer la requête de page zéro filtrée. Cela masque
   * aussitôt la pagination (`totalPages() === 0`), ce qui empêche tout clic sur les
   * boutons "Précédent"/"Suivant" issus de l'ancien filtre pendant que la nouvelle page
   * zéro est en cours de chargement, et évite d'afficher des cagnottes qui ne
   * correspondent plus au filtre courant. Si ce chargement échoue, la page reste `null`
   * (traité comme une absence de page) plutôt que de conserver l'ancienne liste.
   *
   * Retour P3 de la revue de la PR #96 : comme `page` devient `null` dès l'appel de
   * cette méthode, `socialFunds()` devient `[]` pendant toute la durée du chargement
   * filtré. Le template distingue ce cas (`pageActionPending()` vrai) de l'état vide
   * réel en réutilisant le message `socialFunds.loading` avec `role="status"`, plutôt
   * que d'afficher `socialFunds.empty` pendant l'attente.
   */
  onEventTypeFilterChange(value: string | null): void {
    this.eventTypeFilter.set((value ?? '') as SocialEventType | '');
    this.page.set(null);
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

  /**
   * Nouvelle tentative (T-102) : redéclenche la soumission du formulaire de
   * création, qui reste affiché et éditable après l'échec, afin de renvoyer
   * la saisie courante (et non un instantané figé lors du premier envoi).
   */
  retryCreateSocialFund(): void {
    this.createForm()?.submit();
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
