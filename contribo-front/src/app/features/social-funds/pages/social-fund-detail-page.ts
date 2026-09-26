import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CagnottesService, ContributionsService, SocialFundStatus, UserRole } from '@api';
import type { Contribution, ContributionPage, CreateContributionRequest, SocialFund } from '@api';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { canRecordPayments } from '@core/session/payment-authorization';
import { SessionService } from '@core/session/session.service';
import { ActionButton } from '@shared/action-button/action-button';
import { EmptyState } from '@shared/empty-state/empty-state';
import { FormDialog } from '@shared/form-dialog/form-dialog';
import { LoadingSkeleton } from '@shared/loading-skeleton/loading-skeleton';
import { DataTable } from '@shared/data-table/data-table';
import { DetailMetrics } from '@shared/detail-metrics/detail-metrics';
import type { DetailMetric } from '@shared/detail-metrics/detail-metrics';
import { DetailShell } from '@shared/detail-shell/detail-shell';
import { PaginationControls } from '@shared/pagination-controls/pagination-controls';
import { ContributionCreateForm } from '../components/contribution-create-form/contribution-create-form';
import { formatSocialFundCalendarDate } from '../social-fund-dates';
import { contributionMethodLabel } from '../social-fund-payment-method-labels';
import { socialEventTypeLabel, socialFundStatusLabel } from '../social-fund-labels';
import { progressBarWidth } from '../social-fund-progress';

/** Taille de page utilisée pour `GET /social-funds/{socialFundId}/contributions`. */
const CONTRIBUTIONS_PAGE_SIZE = 10;

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
 * Action "Enregistrer une contribution" (T-89, `openapi:createContribution`) :
 * ouvre `ContributionCreateForm` (T-87) dans `FormDialog`, comme le fait
 * `SocialFundCreateForm` sur `SocialFundsListPage` (T-84). L'action est
 * masquée pour un Opérateur dont `operatorCanRecordPayments` (attribut
 * `peut_enregistrer_paiements` du contrat, T-55) vaut `false` ; l'Administrateur
 * et le Trésorier y accèdent sans condition supplémentaire, via
 * `canRecordPayments` (`@core/session/payment-authorization`), déjà utilisée
 * pour les règlements de cotisation (T-71). L'action est également masquée
 * sur une cagnotte clôturée (T-94), quel que soit le rôle par ailleurs
 * autorisé. Ce contrôle IHM ne remplace pas l'autorisation serveur (403 ou
 * 409 possible malgré tout, voir `api-client.md`).
 * Après enregistrement, la cagnotte et la première page de contributions sont
 * rafraîchies avec la réponse `ContributionCreationResponse` et un rechargement
 * de la liste, afin de refléter le nouveau total collecté et le nombre de
 * contributeurs.
 *
 * Contributions multiples d'un même membre (T-88, RG-CAG-005) : aucune
 * restriction de nombre ni de montant minimal n'est appliquée entre deux
 * contributions d'un même membre à la même cagnotte, ce que vérifie le test
 * "accepts a supplementary contribution from a member who already
 * contributed..." de `social-fund-detail-page.spec.ts`.
 *
 * Barre de progression objectif/reste à collecter (T-92, US-CAG-003) :
 * lorsque `socialFund.targetAmount` est défini, la section "Situation"
 * affiche en plus l'objectif, la même barre de progression que l'écran liste
 * (`progressBarWidth`, `../social-fund-progress`, partagée avec T-85) et le
 * reste à collecter (`remainingToTargetAmount`, fourni par le contrat,
 * toujours borné à zéro si l'objectif est dépassé). Sans objectif, seul le
 * montant collecté reste affiché, comme avant ce ticket.
 *
 * Les données de journalisation de chaque contribution restent disponibles
 * dans la réponse API, mais ne sont pas affichées dans le tableau MVP. La
 * liste conserve uniquement les données utiles au suivi métier : membre,
 * montant, mode de règlement et date.
 */
@Component({
  selector: 'app-social-fund-detail-page',
  imports: [
    TranslocoPipe,
    ActionButton,
    EmptyState,
    FormDialog,
    LoadingSkeleton,
    DataTable,
    DetailMetrics,
    DetailShell,
    PaginationControls,
    ContributionCreateForm,
  ],
  templateUrl: './social-fund-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialFundDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly socialFundsService = inject(CagnottesService);
  private readonly contributionsService = inject(ContributionsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionService = inject(SessionService);
  private readonly transloco = inject(TranslocoService);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly socialFund = signal<SocialFund | null>(null);
  readonly metrics = computed<readonly DetailMetric[]>(() => {
    const fund = this.socialFund();
    if (!fund) return [];
    return [
      {
        label: this.transloco.translate('socialFunds.detail.metrics.collected'),
        value: this.formatCollectedAmount(fund.collectedAmount),
        hint: this.transloco.translate('socialFunds.detail.metrics.collectedHint'),
      },
      {
        label: this.transloco.translate('socialFunds.detail.metrics.target'),
        value: fund.targetAmount ? this.formatCollectedAmount(fund.targetAmount) : '-',
        hint: this.transloco.translate('socialFunds.detail.metrics.targetHint'),
      },
      {
        label: this.transloco.translate('socialFunds.detail.metrics.remaining'),
        value: fund.targetAmount
          ? this.formatCollectedAmount(fund.remainingToTargetAmount ?? 0)
          : '-',
        hint: this.transloco.translate('socialFunds.detail.metrics.remainingHint'),
      },
      {
        label: this.transloco.translate('socialFunds.detail.metrics.contributors'),
        value: `${fund.contributorCount}`,
        hint: this.transloco.translate('socialFunds.detail.metrics.contributorsHint'),
      },
    ];
  });

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

  /**
   * Action "Enregistrer une contribution" (T-89) : Administrateur et
   * Trésorier sans condition, Opérateur uniquement si
   * `operatorCanRecordPayments` est `true`. Réutilise `canRecordPayments`,
   * déjà utilisée pour les règlements de cotisation (T-71), afin de ne pas
   * dupliquer cette règle d'autorisation par rôle. Masquée également sur une
   * cagnotte clôturée (T-94), quel que soit le rôle par ailleurs autorisé.
   */
  readonly canRecordContribution = computed(
    () =>
      canRecordPayments(this.sessionService.user()) &&
      this.socialFund()?.status !== SocialFundStatus.Closed,
  );

  private recordDialogSession = 0;
  readonly recordDialogOpen = signal(false);
  readonly recordingContribution = signal(false);
  readonly recordContributionError = signal(false);

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
  readonly progressBarWidth = progressBarWidth;

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

  /** Ouvre le formulaire d'enregistrement d'une contribution (T-89), réservé par `canRecordContribution`. */
  openRecordDialog(): void {
    if (!this.canRecordContribution() || this.recordDialogOpen()) {
      return;
    }
    ++this.recordDialogSession;
    this.recordingContribution.set(false);
    this.recordContributionError.set(false);
    this.recordDialogOpen.set(true);
  }

  /** Ferme le formulaire, quelle que soit la cause (Échap, bouton Annuler, succès). */
  closeRecordDialog(): void {
    ++this.recordDialogSession;
    this.recordingContribution.set(false);
    this.recordDialogOpen.set(false);
  }

  /**
   * Confirme l'enregistrement (T-89, `openapi:createContribution`) : appelle
   * `POST /social-funds/{socialFundId}/contributions`, applique la cagnotte
   * retournée (total collecté et nombre de contributeurs à jour) et recharge
   * la première page de contributions. La requête est rattachée à une session
   * de dialogue : si le formulaire a été fermé puis rouvert entre-temps, une
   * réponse tardive ne referme plus l'état devenu obsolète.
   */
  handleRecordContribution(request: CreateContributionRequest): void {
    const socialFund = this.socialFund();
    if (
      !this.canRecordContribution() ||
      !socialFund ||
      !this.recordDialogOpen() ||
      this.recordingContribution()
    ) {
      return;
    }
    const session = this.recordDialogSession;
    this.recordingContribution.set(true);
    this.recordContributionError.set(false);

    this.contributionsService
      .createContribution(socialFund.id, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (this.socialFund()?.id === response.socialFund.id) {
            this.socialFund.set(response.socialFund);
          }
          this.fetchContributionsPage(socialFund.id, 0, { isInitialLoad: false });
          if (session !== this.recordDialogSession) {
            return;
          }
          this.closeRecordDialog();
        },
        error: () => {
          if (session !== this.recordDialogSession) {
            return;
          }
          this.recordingContribution.set(false);
          this.recordContributionError.set(true);
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
