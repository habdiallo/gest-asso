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
import { TableauDeBordService } from '@api';
import type { DashboardResponse, ManagementDashboard, MemberDashboard } from '@api';
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
 * Limite connue : les paramètres optionnels `campaignId`/`socialFundId` de
 * l'opération (sélection d'une campagne/cagnotte particulière pour le détail
 * financier) ne sont pas exploités par ce composant générique — l'API est
 * appelée sans sélection, ce qui retourne le bilan par défaut du serveur.
 */
@Component({
  selector: 'app-dashboard-page',
  imports: [TranslocoPipe, RouterLink, EmptyState],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly dashboardService = inject(TableauDeBordService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  private readonly dashboard = signal<DashboardResponse | null>(null);

  readonly managementDashboard = computed<ManagementDashboard | null>(() => {
    const value = this.dashboard();
    return value && value.view === 'MANAGEMENT' ? value : null;
  });

  readonly memberDashboard = computed<MemberDashboard | null>(() => {
    const value = this.dashboard();
    return value && value.view === 'MEMBER' ? value : null;
  });

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

  readonly statusToneClasses = (tone: StatusTone): string => STATUS_TONE_CLASSES[tone];
  readonly statusToneDotClasses = (tone: StatusTone): string => STATUS_TONE_DOT_CLASSES[tone];

  constructor() {
    this.dashboardService
      .getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dashboard) => {
          this.dashboard.set(dashboard);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }
}
