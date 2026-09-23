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
import {
  CagnottesService,
  CampagnesService,
  CampaignStatus,
  SocialFundStatus,
  TableauDeBordService,
  UserRole,
} from '@api';
import type {
  CampaignFinancialSummary,
  CampaignSummary,
  DashboardResponse,
  ManagementDashboard,
  MemberDashboard,
  SocialFundSummary,
} from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { EMPTY, forkJoin } from 'rxjs';
import type { Observable } from 'rxjs';
import { expand, map, reduce } from 'rxjs/operators';
import { formatGnfAmountCondensed, formatGnfAmountDetailed } from '@core/formatting/currency';
import { NAVIGATION_PATHS } from '@core/navigation/navigation-paths';
import { ActionButton } from '@shared/action-button/action-button';
import { CustomSelect } from '@shared/custom-select/custom-select';
import { EmptyState } from '@shared/empty-state/empty-state';
import { formatCalendarDate, formatInstant } from '../dashboard-dates';
import {
  campaignStatusLabel,
  campaignStatusTone,
  dueStatusLabel,
  dueStatusTone,
  paymentMethodLabel,
} from '../dashboard-status-labels';
import type { StatusTone } from '../dashboard-status-labels';

/** Largeur de barre de progression : jamais hors de [0, 100], même sur une donnée aberrante. */
function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * Classes du badge de statut pilote/fond selon la teinte (même convention que
 * `members-list-page.html`), sans exposer `[NgClass]` interdit par
 * `.claude/rules/frontend/templates.md`.
 */
const STATUS_TONE_CLASSES: Record<StatusTone, string> = {
  success: 'bg-success-wash text-success',
  warning: 'bg-warning-wash text-warning',
  error: 'bg-error-wash text-error',
  info: 'bg-info-wash text-info',
  neutral: 'bg-surface-2 text-text-2',
};

const STATUS_TONE_DOT_CLASSES: Record<StatusTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  neutral: 'bg-text-3',
};

/** Rôles autorisés à créer un membre, une campagne ou une cagnotte (même règle que leurs écrans). */
function isManagerRole(role: UserRole): boolean {
  return role === UserRole.Administrator || role === UserRole.Treasurer;
}

/** Bilan financier d'une campagne précise ou agrégé sur toutes les campagnes ouvertes, forme unique pour le template. */
interface CampaignScopeView {
  readonly financialSummary: CampaignFinancialSummary;
  readonly labelKey: string;
  readonly labelParams: Record<string, unknown>;
}

/** Bilan financier d'une cagnotte précise ou agrégé sur toutes les cagnottes ouvertes, forme unique pour le template. */
interface SocialFundScopeView {
  readonly title?: string;
  readonly collectedAmount: number;
  readonly targetAmount?: number;
  readonly contributorCount: number;
  readonly labelKey: string;
  readonly labelParams: Record<string, unknown>;
}

/**
 * Point d'entrée après connexion (T-16) : appelle `GET /dashboard` (`@api`,
 * `TableauDeBordService`) et affiche les indicateurs selon le discriminant
 * `view` reçu de l'API — jamais selon le rôle applicatif local, cf.
 * `.claude/rules/frontend/api-client.md` (« le contrôle IHM ne remplace pas
 * l'autorisation backend »). En particulier, la section bilan financier de
 * gestion (`financialOverview`) n'est affichée que si l'API la fournit ;
 * son absence n'est jamais interprétée comme une autorisation refusée devinée
 * côté frontend.
 *
 * Périmètre des indicateurs (T-117) : `campaignId`/`socialFundId` sélectionnent
 * la campagne/cagnotte dont le bilan financier (`financialOverview.selectedCampaign`
 * /`selectedSocialFund`) alimente les panneaux de synthèse ; ils n'affectent ni
 * `recentCampaigns`, ni les indicateurs non financiers du haut de page. Omettre
 * l'un ou l'autre paramètre (option « Toutes les X ouvertes » des deux sélecteurs)
 * fait retourner par l'API l'agrégat correspondant (`allOpenCampaignsSummary`/
 * `allOpenSocialFundsSummary`), calculé côté serveur sur les éléments ouverts —
 * jamais recalculé côté frontend à partir d'une page partielle, cf. `api-client.md`.
 * `campaignScopeView`/`socialFundScopeView` ci-dessous normalisent l'un ou
 * l'autre cas (élément précis vs agrégat) en une forme unique pour le template.
 */
@Component({
  selector: 'app-dashboard-page',
  imports: [TranslocoPipe, RouterLink, ActionButton, CustomSelect, EmptyState],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly dashboardService = inject(TableauDeBordService);
  private readonly campaignsService = inject(CampagnesService);
  private readonly socialFundsService = inject(CagnottesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly scopeLoading = signal(false);
  readonly scopeError = signal(false);
  private readonly dashboard = signal<DashboardResponse | null>(null);
  private dashboardRequestId = 0;

  readonly openCampaigns = signal<readonly CampaignSummary[]>([]);
  readonly openSocialFunds = signal<readonly SocialFundSummary[]>([]);
  readonly selectedCampaignId = signal<string>('');
  readonly selectedSocialFundId = signal<string>('');
  private scopeListsLoaded = false;
  private scopeListsLoading = false;

  /** Options du sélecteur « Campagne de cotisation », hors option « Toutes », gérée séparément dans le template (traduite). */
  readonly campaignScopeOptions = computed(() =>
    this.openCampaigns().map((campaign) => ({ value: campaign.id, label: campaign.name })),
  );

  /** Options du sélecteur « Cagnotte sociale », hors option de placeholder (traduite dans le template). */
  readonly socialFundScopeOptions = computed(() =>
    this.openSocialFunds().map((fund) => ({ value: fund.id, label: fund.title })),
  );

  readonly managementDashboard = computed<ManagementDashboard | null>(() => {
    const value = this.dashboard();
    return value && value.view === 'MANAGEMENT' ? value : null;
  });

  readonly memberDashboard = computed<MemberDashboard | null>(() => {
    const value = this.dashboard();
    return value && value.view === 'MEMBER' ? value : null;
  });

  /** Aperçu du tableau de bord (design/) : au plus les 3 campagnes les plus récentes, sans réduire `recentCampaigns` côté données. */
  readonly recentCampaignsPreview = computed<readonly CampaignSummary[]>(() =>
    (this.managementDashboard()?.recentCampaigns ?? []).slice(0, 3),
  );

  /** Aperçu du tableau de bord (design/) : au plus les 3 derniers règlements, sans réduire `recentPayments` côté données. */
  readonly recentPaymentsPreview = computed(() =>
    (this.managementDashboard()?.financialOverview?.recentPayments ?? []).slice(0, 3),
  );

  /** Normalise `selectedCampaign` (choix précis) ou `allOpenCampaignsSummary` (« Toutes ») en une forme unique. */
  readonly campaignScopeView = computed<CampaignScopeView | null>(() => {
    const overview = this.managementDashboard()?.financialOverview;
    if (overview?.selectedCampaign?.financialSummary) {
      return {
        financialSummary: overview.selectedCampaign.financialSummary,
        labelKey: 'dashboard.management.scopeCampaignLabel',
        labelParams: { name: overview.selectedCampaign.name },
      };
    }
    if (overview?.allOpenCampaignsSummary) {
      const aggregate = overview.allOpenCampaignsSummary;
      return {
        financialSummary: aggregate.financialSummary,
        labelKey: 'dashboard.management.scopeAllCampaignsLabel',
        labelParams: { count: aggregate.openCampaignCount },
      };
    }
    return null;
  });

  /** Normalise `selectedSocialFund` (choix précis) ou `allOpenSocialFundsSummary` (« Toutes ») en une forme unique. */
  readonly socialFundScopeView = computed<SocialFundScopeView | null>(() => {
    const overview = this.managementDashboard()?.financialOverview;
    if (overview?.selectedSocialFund) {
      const fund = overview.selectedSocialFund;
      return {
        title: fund.title,
        collectedAmount: fund.collectedAmount,
        targetAmount: fund.targetAmount,
        contributorCount: fund.contributorCount,
        labelKey: 'dashboard.management.scopeSocialFundLabel',
        labelParams: { name: fund.title },
      };
    }
    if (overview?.allOpenSocialFundsSummary) {
      const aggregate = overview.allOpenSocialFundsSummary;
      return {
        collectedAmount: aggregate.collectedAmount,
        targetAmount: aggregate.targetAmount,
        contributorCount: aggregate.contributorCount,
        labelKey: 'dashboard.management.scopeAllSocialFundsLabel',
        labelParams: { count: aggregate.openSocialFundCount },
      };
    }
    return null;
  });

  readonly canCreateMember = computed(() => {
    const role = this.managementDashboard()?.viewer.role;
    return role !== undefined && isManagerRole(role);
  });

  readonly canCreateCampaign = computed(() => {
    const role = this.managementDashboard()?.viewer.role;
    return role !== undefined && isManagerRole(role);
  });

  readonly canCreateSocialFund = computed(() => {
    const role = this.managementDashboard()?.viewer.role;
    return role !== undefined && isManagerRole(role);
  });

  readonly isAdministrator = computed(
    () => this.managementDashboard()?.viewer.role === UserRole.Administrator,
  );

  readonly formatAmount = formatGnfAmountDetailed;
  /** Montants condensés (K/M/Mds) des indicateurs de synthèse, alignés sur `design/` et les autres listes (campagnes, cagnottes). */
  readonly formatAmountCondensed = formatGnfAmountCondensed;
  readonly formatCalendarDate = formatCalendarDate;
  readonly formatInstant = formatInstant;
  readonly campaignStatusLabel = campaignStatusLabel;
  readonly campaignStatusTone = campaignStatusTone;
  readonly dueStatusLabel = dueStatusLabel;
  readonly dueStatusTone = dueStatusTone;
  readonly paymentMethodLabel = paymentMethodLabel;
  readonly navigationPaths = NAVIGATION_PATHS;

  /** Pourcentage de règlement d'une cotisation, dérivé des montants déjà affichés (paidAmount/dueAmount). */
  readonly dueCollectionPercentage = (dueAmount: number, paidAmount: number): number =>
    dueAmount > 0 ? clampPercentage(Math.round((paidAmount / dueAmount) * 100)) : 0;

  /** Pourcentage de collecte d'une cagnotte avec objectif, dérivé des montants déjà affichés. */
  readonly socialFundCollectionPercentage = (
    targetAmount: number,
    collectedAmount: number,
  ): number =>
    targetAmount > 0 ? clampPercentage(Math.round((collectedAmount / targetAmount) * 100)) : 0;

  readonly statusToneClasses = (tone: StatusTone): string => STATUS_TONE_CLASSES[tone];
  readonly statusToneDotClasses = (tone: StatusTone): string => STATUS_TONE_DOT_CLASSES[tone];

  constructor() {
    this.loadDashboard();
  }

  /** Gestionnaire du sélecteur « Campagne de cotisation » du panneau de périmètre. */
  onCampaignScopeChange(value: string | null): void {
    this.selectedCampaignId.set(value ?? '');
    this.loadDashboard();
  }

  /** Gestionnaire du sélecteur « Cagnotte sociale » du panneau de périmètre. */
  onSocialFundScopeChange(value: string | null): void {
    this.selectedSocialFundId.set(value ?? '');
    this.loadDashboard();
  }

  private loadDashboard(): void {
    const requestId = ++this.dashboardRequestId;
    const isInitialLoad = this.dashboard() === null;
    this.scopeError.set(false);
    if (isInitialLoad) {
      this.loading.set(true);
    } else {
      this.scopeLoading.set(true);
    }

    this.dashboardService
      .getDashboard(
        this.selectedCampaignId() || undefined,
        this.selectedSocialFundId() || undefined,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dashboard) => {
          if (requestId !== this.dashboardRequestId) {
            return;
          }
          this.dashboard.set(dashboard);
          this.loadError.set(false);
          this.loading.set(false);
          this.scopeLoading.set(false);
          if (
            dashboard.view === 'MANAGEMENT' &&
            dashboard.financialOverview !== undefined &&
            !this.scopeListsLoaded &&
            !this.scopeListsLoading
          ) {
            this.loadScopeOptions();
          }
        },
        error: () => {
          if (requestId !== this.dashboardRequestId) {
            return;
          }
          if (isInitialLoad) {
            this.loadError.set(true);
          } else {
            this.scopeError.set(true);
          }
          this.loading.set(false);
          this.scopeLoading.set(false);
        },
      });
  }

  /** Options des deux sélecteurs du panneau « Périmètre des indicateurs », chargées une seule fois. */
  private loadScopeOptions(): void {
    this.scopeListsLoading = true;
    const campaigns$ = this.loadAllPages((page) =>
      this.campaignsService.listCampaigns(page, 50, undefined, CampaignStatus.Open),
    );
    const socialFunds$ = this.loadAllPages((page) =>
      this.socialFundsService.listSocialFunds(page, 50, undefined, SocialFundStatus.Open),
    );

    forkJoin({ campaigns: campaigns$, socialFunds: socialFunds$ })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ campaigns, socialFunds }) => {
          this.openCampaigns.set(campaigns);
          this.openSocialFunds.set(socialFunds);
          this.scopeListsLoaded = true;
          this.scopeListsLoading = false;
        },
        error: () => {
          this.scopeListsLoading = false;
          this.scopeError.set(true);
        },
      });
  }

  private loadAllPages<T>(
    loadPage: (
      page: number,
    ) => Observable<{ items: readonly T[]; page: { number: number; totalPages: number } }>,
  ): Observable<readonly T[]> {
    return loadPage(0).pipe(
      expand((response) => {
        const nextPage = response.page.number + 1;
        return nextPage < response.page.totalPages ? loadPage(nextPage) : EMPTY;
      }),
      map((response) => response.items),
      reduce((items, pageItems) => items.concat(pageItems), [] as T[]),
    );
  }
}
