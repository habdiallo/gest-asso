import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CagnottesService, ContributionsService, SocialFundStatus, UserRole } from '@api';
import type { Contribution, ContributionPage, SocialFund } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { SessionService } from '@core/session/session.service';
import { FormDialog } from '@shared/form-dialog/form-dialog';
import { formatSocialFundCalendarDate } from '../social-fund-dates';
import { contributionMethodLabel } from '../social-fund-payment-method-labels';
import { socialEventTypeLabel, socialFundStatusLabel } from '../social-fund-labels';

/** Taille de page utilisée pour `GET /social-funds/{socialFundId}/contributions`. */
const CONTRIBUTIONS_PAGE_SIZE = 20;

/**
 * Écran suivi de cagnotte (T-91, `openapi:getSocialFund` +
 * `openapi:listSocialFundContributions`) : total collecté, nombre de
 * contributeurs distincts et liste des contributions, pour l'Administrateur,
 * le Trésorier et l'Opérateur (US-CAG-003). Route enfant de `/cagnottes`
 * (`social-funds.routes.ts`), protégée par le même `roleGuard` que la liste,
 * posé sur la route parente dans `app.routes.ts`.
 *
 * Action de clôture (T-93, `openapi:closeSocialFund`) : réservée à
 * l'Administrateur et au Trésorier, visible uniquement tant que la cagnotte
 * est ouverte, avec confirmation explicite avant l'appel API (US-CAG-004).
 *
 * Limite connue de ce ticket : ni la barre de progression objectif/reste à
 * collecter (T-92), ni le formulaire d'enregistrement d'une contribution
 * (T-87 à T-90) ne sont implémentés ici. Le masquage de l'action
 * d'enregistrement de contribution sur une cagnotte clôturée (T-94) reste un
 * ticket dédié ; ce ticket n'affiche déjà aucune telle action sur cet écran.
 */
@Component({
  selector: 'app-social-fund-detail-page',
  imports: [RouterLink, TranslocoPipe, FormDialog],
  templateUrl: './social-fund-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialFundDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly socialFundsService = inject(CagnottesService);
  private readonly contributionsService = inject(ContributionsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionService = inject(SessionService);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly socialFund = signal<SocialFund | null>(null);

  /** Réservée à l'Administrateur et au Trésorier (T-93, US-CAG-004). */
  private readonly canCloseSocialFundRole = computed(() => {
    const role = this.sessionService.user()?.role;
    return role === UserRole.Administrator || role === UserRole.Treasurer;
  });

  /** Action visible uniquement tant que la cagnotte est ouverte. */
  readonly canCloseSocialFund = computed(
    () => this.canCloseSocialFundRole() && this.socialFund()?.status === SocialFundStatus.Open,
  );

  private closeSocialFundSession = 0;
  readonly closeDialogOpen = signal(false);
  readonly closingSocialFund = signal(false);
  readonly closeSocialFundError = signal(false);

  readonly contributionsLoading = signal(true);
  readonly contributionsLoadError = signal(false);
  /** Erreur d'un changement de page qui n'efface pas la liste déjà affichée. */
  readonly contributionsPageActionError = signal(false);
  readonly contributionsPageActionPending = signal(false);
  private readonly contributionsPage = signal<ContributionPage | null>(null);

  readonly contributions = computed<Contribution[]>(() => this.contributionsPage()?.items ?? []);
  readonly contributionsTotalCount = computed<number>(
    () => this.contributionsPage()?.page.totalElements ?? 0,
  );
  readonly contributionsCurrentPageNumber = computed<number>(
    () => (this.contributionsPage()?.page.number ?? 0) + 1,
  );
  readonly contributionsTotalPages = computed<number>(
    () => this.contributionsPage()?.page.totalPages ?? 0,
  );
  readonly contributionsHasPreviousPage = computed<boolean>(
    () => (this.contributionsPage()?.page.number ?? 0) > 0,
  );
  readonly contributionsHasNextPage = computed<boolean>(() => {
    const currentPage = this.contributionsPage();
    return currentPage !== null && currentPage.page.number + 1 < currentPage.page.totalPages;
  });
  readonly contributionsPreviousPageDisabled = computed(
    () => !this.contributionsHasPreviousPage() || this.contributionsPageActionPending(),
  );
  readonly contributionsNextPageDisabled = computed(
    () => !this.contributionsHasNextPage() || this.contributionsPageActionPending(),
  );

  readonly formatCollectedAmount = formatGnfAmountDetailed;
  readonly formatCalendarDate = formatSocialFundCalendarDate;
  readonly socialFundStatusLabel = socialFundStatusLabel;
  readonly socialEventTypeLabel = socialEventTypeLabel;
  readonly contributionMethodLabel = contributionMethodLabel;

  constructor() {
    const socialFundId = this.route.snapshot.paramMap.get('socialFundId');
    if (socialFundId) {
      this.loadSocialFund(socialFundId);
      this.fetchContributionsPage(socialFundId, 0, { isInitialLoad: true });
    } else {
      this.loading.set(false);
      this.loadError.set(true);
      this.contributionsLoading.set(false);
      this.contributionsLoadError.set(true);
    }
  }

  /** Charge la page précédente de contributions ; ignoré en dehors des bornes ou pendant un chargement. */
  goToPreviousContributionsPage(): void {
    const socialFundId = this.route.snapshot.paramMap.get('socialFundId');
    const currentPage = this.contributionsPage();
    if (
      !socialFundId ||
      this.contributionsPageActionPending() ||
      !currentPage ||
      currentPage.page.number <= 0
    ) {
      return;
    }
    this.fetchContributionsPage(socialFundId, currentPage.page.number - 1, {
      isInitialLoad: false,
    });
  }

  /** Charge la page suivante de contributions ; ignoré en dehors des bornes ou pendant un chargement. */
  goToNextContributionsPage(): void {
    const socialFundId = this.route.snapshot.paramMap.get('socialFundId');
    const currentPage = this.contributionsPage();
    if (
      !socialFundId ||
      this.contributionsPageActionPending() ||
      !currentPage ||
      currentPage.page.number + 1 >= currentPage.page.totalPages
    ) {
      return;
    }
    this.fetchContributionsPage(socialFundId, currentPage.page.number + 1, {
      isInitialLoad: false,
    });
  }

  /** Ouvre la confirmation de clôture ; ignoré hors droit ou dialogue déjà ouvert. */
  openCloseDialog(): void {
    if (!this.canCloseSocialFund() || this.closeDialogOpen()) {
      return;
    }
    ++this.closeSocialFundSession;
    this.closeSocialFundError.set(false);
    this.closeDialogOpen.set(true);
  }

  /**
   * Ferme la confirmation sans appeler l'API (bouton Annuler, Échap ou
   * fermeture native). Ignorée tant qu'une clôture est en cours : `FormDialog`
   * ne bloque pas nativement son bouton Fermer ni Échap pendant une requête,
   * donc cette garde évite qu'une fermeture démarre une seconde clôture
   * simultanée avant que la première n'ait répondu.
   */
  closeCloseDialog(): void {
    if (this.closingSocialFund()) {
      return;
    }
    ++this.closeSocialFundSession;
    this.closeDialogOpen.set(false);
  }

  /** Appelle `POST /social-funds/{socialFundId}/closure` après confirmation explicite. */
  confirmCloseSocialFund(): void {
    const socialFund = this.socialFund();
    if (
      !this.canCloseSocialFund() ||
      !socialFund ||
      !this.closeDialogOpen() ||
      this.closingSocialFund()
    ) {
      return;
    }
    const session = this.closeSocialFundSession;
    this.closingSocialFund.set(true);
    this.closeSocialFundError.set(false);

    this.socialFundsService
      .closeSocialFund(socialFund.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          if (this.socialFund()?.id !== socialFund.id) {
            return;
          }
          this.socialFund.set(updated);
          if (session !== this.closeSocialFundSession) {
            return;
          }
          this.closeDialogOpen.set(false);
          this.closingSocialFund.set(false);
        },
        error: () => {
          if (session !== this.closeSocialFundSession) {
            return;
          }
          this.closingSocialFund.set(false);
          this.closeSocialFundError.set(true);
        },
      });
  }

  private loadSocialFund(socialFundId: string): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.socialFundsService
      .getSocialFund(socialFundId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (socialFund) => {
          this.socialFund.set(socialFund);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }

  private fetchContributionsPage(
    socialFundId: string,
    pageNumber: number,
    options: { isInitialLoad: boolean },
  ): void {
    if (options.isInitialLoad) {
      this.contributionsLoading.set(true);
      this.contributionsLoadError.set(false);
    } else {
      this.contributionsPageActionPending.set(true);
      this.contributionsPageActionError.set(false);
    }

    this.contributionsService
      .listSocialFundContributions(socialFundId, pageNumber, CONTRIBUTIONS_PAGE_SIZE)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.contributionsLoading.set(false);
          this.contributionsPageActionPending.set(false);
          this.contributionsPage.set(page);
        },
        error: () => {
          this.contributionsLoading.set(false);
          this.contributionsPageActionPending.set(false);
          if (options.isInitialLoad) {
            this.contributionsLoadError.set(true);
          } else {
            this.contributionsPageActionError.set(true);
          }
        },
      });
  }
}
