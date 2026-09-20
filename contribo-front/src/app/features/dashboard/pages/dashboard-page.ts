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
  CampaignSummary,
  DashboardResponse,
  ManagementDashboard,
  MemberDashboard,
  SocialFundSummary,
} from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { NAVIGATION_PATHS } from '@core/navigation/navigation-paths';
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
 * `recentCampaigns`, ni les indicateurs non financiers du haut de page. Le
 * contrat n'offrant pas d'agrégat multi-cagnottes (contrairement aux campagnes,
 * où omettre `campaignId` retourne déjà l'agrégat par défaut du serveur), le
 * sélecteur de cagnotte impose une cagnotte précise plutôt que de reproduire
 * l'option « Toutes les cagnottes ouvertes » du prototype.
 */
@Component({
  selector: 'app-dashboard-page',
  imports: [TranslocoPipe, RouterLink, EmptyState],
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
  private readonly dashboard = signal<DashboardResponse | null>(null);

  readonly openCampaigns = signal<readonly CampaignSummary[]>([]);
  readonly openSocialFunds = signal<readonly SocialFundSummary[]>([]);
  readonly selectedCampaignId = signal<string>('');
  readonly selectedSocialFundId = signal<string>('');
  private scopeListsLoaded = false;

  readonly managementDashboard = computed<ManagementDashboard | null>(() => {
    const value = this.dashboard();
    return value && value.view === 'MANAGEMENT' ? value : null;
  });

  readonly memberDashboard = computed<MemberDashboard | null>(() => {
    const value = this.dashboard();
    return value && value.view === 'MEMBER' ? value : null;
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

  /** Gestionnaire du select « Campagne de cotisation » du panneau de périmètre. */
  onCampaignScopeChange(event: Event): void {
    this.selectedCampaignId.set((event.target as HTMLSelectElement).value);
    this.loadDashboard();
  }

  /** Gestionnaire du select « Cagnotte sociale » du panneau de périmètre. */
  onSocialFundScopeChange(event: Event): void {
    this.selectedSocialFundId.set((event.target as HTMLSelectElement).value);
    this.loadDashboard();
  }

  private loadDashboard(): void {
    const isInitialLoad = this.dashboard() === null;
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
          this.dashboard.set(dashboard);
          this.loading.set(false);
          this.scopeLoading.set(false);
          if (
            dashboard.view === 'MANAGEMENT' &&
            dashboard.financialOverview !== undefined &&
            !this.scopeListsLoaded
          ) {
            this.scopeListsLoaded = true;
            this.loadScopeOptions();
          }
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
          this.scopeLoading.set(false);
        },
      });
  }

  /** Options des deux sélecteurs du panneau « Périmètre des indicateurs », chargées une seule fois. */
  private loadScopeOptions(): void {
    this.campaignsService
      .listCampaigns(0, 50, undefined, CampaignStatus.Open)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (page) => this.openCampaigns.set(page.items) });

    this.socialFundsService
      .listSocialFunds(0, 50, undefined, SocialFundStatus.Open)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (page) => this.openSocialFunds.set(page.items) });
  }
}
