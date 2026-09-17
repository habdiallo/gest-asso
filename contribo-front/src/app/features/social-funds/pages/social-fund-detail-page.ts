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
import { CagnottesService, ContributionsService } from '@api';
import type { Contribution, ContributionPage, SocialFund } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
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
 * Limite connue de ce ticket : ni la barre de progression objectif/reste à
 * collecter (T-92), ni le formulaire d'enregistrement d'une contribution
 * (T-87 à T-90), ni l'action de clôture (T-93/T-94) ne sont implémentés ici ;
 * ils restent des tickets dédiés sur ce même écran.
 */
@Component({
  selector: 'app-social-fund-detail-page',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './social-fund-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialFundDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly socialFundsService = inject(CagnottesService);
  private readonly contributionsService = inject(ContributionsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly socialFund = signal<SocialFund | null>(null);

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
