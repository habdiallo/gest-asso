import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableauDeBordService } from '@api';
import type { DashboardResponse, ManagementDashboard, MemberDashboard } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { formatCalendarDate, formatInstant } from '../dashboard-dates';
import {
  campaignStatusLabel,
  dueStatusLabel,
  paymentMethodLabel,
} from '../dashboard-status-labels';

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
  imports: [TranslocoPipe],
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
  readonly dueStatusLabel = dueStatusLabel;
  readonly paymentMethodLabel = paymentMethodLabel;

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
