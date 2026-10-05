import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  CagnottesService,
  CampagnesService,
  CampaignStatus,
  ContributionsService,
  SocialFundStatus,
  TableauDeBordService,
  UserRole,
} from '@core/api';
import type {
  CampaignFinancialSummary,
  CampaignSummary,
  DashboardResponse,
  Contribution,
  ManagementDashboard,
  MemberDashboard,
  SocialFundSummary,
} from '@core/api';
import { TranslocoPipe } from '@jsverse/transloco';
import { EMPTY, forkJoin } from 'rxjs';
import type { Observable } from 'rxjs';
import { expand, map, reduce } from 'rxjs/operators';
import { formatGnfAmountCondensed, formatGnfAmountDetailed } from '@core/formatting/currency';
import { formatPercentage } from '@core/formatting/percentage';
import { NAVIGATION_PATHS } from '@core/navigation/navigation-paths';
import { SessionService } from '@core/session/session.service';
import { ActionButton } from '@shared/action-button/action-button';
import { CustomSelect } from '@shared/custom-select/custom-select';
import { EmptyState } from '@shared/empty-state/empty-state';
import type { CustomSelectOption } from '@shared/custom-select/custom-select';
import { LoadingSkeleton } from '@shared/loading-skeleton/loading-skeleton';
import { PageHeader } from '@shared/page-header/page-header';
import { StatusBadge } from '@shared/status-badge/status-badge';
import { formatCalendarDate, formatInstant } from '../dashboard-dates';
import {
  campaignStatusLabel,
  campaignStatusTone,
  dueStatusLabel,
  dueStatusTone,
  paymentMethodLabel,
} from '../dashboard-status-labels';

/** Largeur de barre de progression : jamais hors de [0, 100], même sur une donnée aberrante. */
function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value));
}

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
  readonly remainingAmount?: number;
  readonly progressRate?: number;
  readonly labelKey: string;
  readonly labelParams: Record<string, unknown>;
}

type DashboardContextType = 'campaign' | 'socialFund';

/**
 * Point d'entrée après connexion (T-16) : appelle `GET /dashboard` (`@core/api`,
 * `TableauDeBordService`) et affiche les indicateurs selon le discriminant
 * `view` reçu de l'API — jamais selon le rôle applicatif local, cf.
 * `.claude/rules/frontend/api-client.md` (« le contrôle IHM ne remplace pas
 * l'autorisation backend »). En particulier, la section bilan financier de
 * gestion (`financialOverview`) n'est affichée que si l'API la fournit ;
 * son absence n'est jamais interprétée comme une autorisation refusée devinée
 * côté frontend.
 *
 * Périmètre des indicateurs (T-117, T-210) : un seul contexte envoie soit
 * `campaignId`, soit `socialFundId`. L'option « Toutes les X ouvertes » omet
 * l'identifiant du contexte actif.
 * fait retourner par l'API l'agrégat correspondant (`allOpenCampaignsSummary`/
 * `allOpenSocialFundsSummary`), calculé côté serveur sur les éléments ouverts —
 * jamais recalculé côté frontend à partir d'une page partielle, cf. `api-client.md`.
 * `campaignScopeView`/`socialFundScopeView` normalisent l'élément précis ou
 * l'agrégat du contexte actif en une forme unique pour le template.
 */
@Component({
  selector: 'app-dashboard-page',
  imports: [
    TranslocoPipe,
    RouterLink,
    ActionButton,
    CustomSelect,
    EmptyState,
    LoadingSkeleton,
    PageHeader,
    StatusBadge,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly dashboardService = inject(TableauDeBordService);
  private readonly campaignsService = inject(CampagnesService);
  private readonly socialFundsService = inject(CagnottesService);
  private readonly contributionsService = inject(ContributionsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly sessionExpired = signal(false);
  readonly scopeLoading = signal(false);
  readonly scopeError = signal(false);
  readonly contributionsLoading = signal(false);
  readonly contributionsError = signal(false);
  private readonly dashboard = signal<DashboardResponse | null>(null);
  private dashboardRequestId = 0;

  readonly openCampaigns = signal<readonly CampaignSummary[]>([]);
  readonly openSocialFunds = signal<readonly SocialFundSummary[]>([]);
  readonly dashboardContextType = signal<DashboardContextType>('campaign');
  readonly dashboardContextId = signal<string>('');
  readonly recentContributions = signal<readonly Contribution[]>([]);
  private scopeListsLoaded = false;
  private scopeListsLoading = false;

  readonly contextTypeOptions: readonly CustomSelectOption[] = [
    {
      value: 'campaign',
      label: '',
      translationKey: 'dashboard.scope.typeCampaign',
    },
    {
      value: 'socialFund',
      label: '',
      translationKey: 'dashboard.scope.typeSocialFund',
    },
  ];

  readonly activeScopeOptions = computed<readonly CustomSelectOption[]>(() => {
    if (this.dashboardContextType() === 'campaign') {
      return [
        {
          value: '',
          label: '',
          translationKey: 'dashboard.scope.campaignAllOption',
        },
        ...this.openCampaigns().map((campaign) => ({ value: campaign.id, label: campaign.name })),
      ];
    }

    return [
      {
        value: '',
        label: '',
        translationKey: 'dashboard.scope.socialFundAllOption',
      },
      ...this.openSocialFunds().map((fund) => ({ value: fund.id, label: fund.title })),
    ];
  });

  readonly isCampaignContext = computed(() => this.dashboardContextType() === 'campaign');
  readonly isSocialFundContext = computed(() => this.dashboardContextType() === 'socialFund');

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

  readonly recentContributionsPreview = computed(() => this.recentContributions().slice(0, 3));

  /** Normalise le bilan de campagne précis ou agrégé en une forme unique. */
  readonly campaignScopeView = computed<CampaignScopeView | null>(() => {
    if (!this.isCampaignContext()) {
      return null;
    }
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

  /** Normalise le bilan de cagnotte précis ou agrégé en une forme unique. */
  readonly socialFundScopeView = computed<SocialFundScopeView | null>(() => {
    if (!this.isSocialFundContext()) {
      return null;
    }
    const overview = this.managementDashboard()?.financialOverview;
    if (overview?.selectedSocialFund) {
      const fund = overview.selectedSocialFund;
      return {
        title: fund.title,
        collectedAmount: fund.collectedAmount,
        targetAmount: fund.targetAmount,
        contributorCount: fund.contributorCount,
        remainingAmount: fund.remainingToTargetAmount,
        progressRate: fund.progressRate,
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
        remainingAmount:
          aggregate.targetAmount === undefined
            ? undefined
            : Math.max(aggregate.targetAmount - aggregate.collectedAmount, 0),
        progressRate: aggregate.progressRate,
        labelKey: 'dashboard.management.scopeAllSocialFundsLabel',
        labelParams: { count: aggregate.openSocialFundCount },
      };
    }
    return null;
  });

  readonly campaignMemberCount = computed(() => {
    const overview = this.managementDashboard()?.financialOverview;
    if (!this.isCampaignContext() || !overview) {
      return null;
    }
    if (overview.selectedCampaign) {
      return overview.selectedCampaign.memberCount;
    }
    return overview.allOpenCampaignsSummary?.financialSummary.dueCounts.total ?? null;
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
  readonly formatRate = formatPercentage;
  readonly formatCalendarDate = formatCalendarDate;
  readonly formatInstant = formatInstant;
  readonly campaignStatusLabel = campaignStatusLabel;
  readonly campaignStatusTone = campaignStatusTone;
  readonly dueStatusLabel = dueStatusLabel;
  readonly dueStatusTone = dueStatusTone;
  readonly paymentMethodLabel = paymentMethodLabel;
  readonly navigationPaths = NAVIGATION_PATHS;

  readonly contributionDisplayName = (contribution: Contribution): string => {
    if (contribution.member) {
      return contribution.member.displayName;
    }
    if (contribution.externalContributor) {
      return `${contribution.externalContributor.firstName} ${contribution.externalContributor.lastName}`;
    }
    return '';
  };

  /** Pourcentage de règlement d'une cotisation, dérivé des montants déjà affichés (paidAmount/dueAmount). */
  readonly dueCollectionPercentage = (dueAmount: number, paidAmount: number): number =>
    dueAmount > 0 ? clampPercentage(Math.round((paidAmount / dueAmount) * 100)) : 0;

  /** Pourcentage de collecte d'une cagnotte avec objectif, dérivé des montants déjà affichés. */
  readonly socialFundCollectionPercentage = (
    targetAmount: number,
    collectedAmount: number,
  ): number =>
    targetAmount > 0 ? clampPercentage(Math.round((collectedAmount / targetAmount) * 100)) : 0;

  constructor() {
    this.loadDashboard();
  }

  onContextTypeChange(value: string | null): void {
    const nextType: DashboardContextType = value === 'socialFund' ? 'socialFund' : 'campaign';
    this.dashboardContextType.set(nextType);
    this.dashboardContextId.set('');
    this.loadDashboard();
  }

  onContextIdChange(value: string | null): void {
    this.dashboardContextId.set(value ?? '');
    this.loadDashboard();
  }

  reconnect(): void {
    this.sessionService.clear();
    void this.router.navigateByUrl('/login');
  }

  private loadDashboard(): void {
    const requestId = ++this.dashboardRequestId;
    const contextType = this.dashboardContextType();
    const contextId = this.dashboardContextId() || undefined;
    const isInitialLoad = this.dashboard() === null;
    this.scopeError.set(false);
    this.contributionsError.set(false);
    this.recentContributions.set([]);
    if (isInitialLoad) {
      this.loading.set(true);
    } else {
      this.scopeLoading.set(true);
    }

    this.dashboardService
      .getDashboard(
        contextType === 'campaign' ? contextId : undefined,
        contextType === 'socialFund' ? contextId : undefined,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dashboard) => {
          if (requestId !== this.dashboardRequestId) {
            return;
          }
          this.dashboard.set(dashboard);
          this.loadError.set(false);
          this.sessionExpired.set(false);
          this.loading.set(false);
          this.scopeLoading.set(false);
          if (
            contextType === 'socialFund' &&
            dashboard.view === 'MANAGEMENT' &&
            dashboard.financialOverview !== undefined
          ) {
            this.loadContributions(requestId, contextId);
          } else {
            this.contributionsLoading.set(false);
          }
          if (
            dashboard.view === 'MANAGEMENT' &&
            dashboard.financialOverview !== undefined &&
            !this.scopeListsLoaded &&
            !this.scopeListsLoading
          ) {
            this.loadScopeOptions();
          }
        },
        error: (error: unknown) => {
          if (requestId !== this.dashboardRequestId) {
            return;
          }
          const isSessionExpired = error instanceof HttpErrorResponse && error.status === 401;
          this.sessionExpired.set(isSessionExpired);
          if (isInitialLoad) {
            this.loadError.set(!isSessionExpired);
          } else if (!isSessionExpired) {
            this.scopeError.set(true);
          } else {
            this.loadError.set(false);
          }
          this.loading.set(false);
          this.scopeLoading.set(false);
          this.contributionsLoading.set(false);
        },
      });
  }

  private loadContributions(requestId: number, socialFundId?: string): void {
    this.contributionsLoading.set(true);
    this.contributionsError.set(false);
    this.contributionsService
      .listContributions(0, 5, undefined, undefined, socialFundId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          if (requestId !== this.dashboardRequestId) {
            return;
          }
          this.recentContributions.set(page.items);
          this.contributionsLoading.set(false);
        },
        error: () => {
          if (requestId !== this.dashboardRequestId) {
            return;
          }
          this.contributionsLoading.set(false);
          this.contributionsError.set(true);
        },
      });
  }

  /** Options des deux contextes, chargées une seule fois. */
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
