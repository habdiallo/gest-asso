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
import { CampagnesService } from '@api';
import type { Campaign } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { formatCalendarDate } from '../campaign-dates';
import { campaignStatusLabel } from '../campaign-status-labels';
import { CampaignDuesTab } from '../components/campaign-dues-tab/campaign-dues-tab';

/** Identifiant d'un onglet de l'écran détail de campagne (T-60, US-COT-004). */
export type CampaignDetailTab = 'bareme' | 'cotisations' | 'bilan';

const CAMPAIGN_DETAIL_TABS: readonly CampaignDetailTab[] = ['bareme', 'cotisations', 'bilan'];

/**
 * Écran détail de campagne (T-60, `openapi:getCampaign`) : informations
 * générales de la campagne et trois onglets, barème, cotisations, bilan,
 * accessibles sans rechargement de page (`campaigns.routes.ts` restreint
 * déjà l'accès aux mêmes rôles que la liste via `roleGuard`).
 *
 * L'onglet cotisations (T-61) charge la situation paginée des membres via
 * `openapi:listCampaignDues`. Le bilan (T-77) reste un emplacement réservé.
 *
 * La sélection d'onglet utilise le motif ARIA `tablist`/`tab`/`tabpanel` avec
 * un `tabindex` "roving" (0 pour l'onglet actif, -1 pour les autres) afin de
 * ne pas bloquer la navigation clavier flèches gauche/droite du ticket T-64 :
 * cet écran fournit uniquement le changement d'onglet au clic/Entrée/Espace.
 */
@Component({
  selector: 'app-campaign-detail-page',
  imports: [TranslocoPipe, CampaignDuesTab],
  templateUrl: './campaign-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly campaignsService = inject(CampagnesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly campaign = signal<Campaign | null>(null);
  readonly activeTab = signal<CampaignDetailTab>(CAMPAIGN_DETAIL_TABS[0]);

  readonly formatCalendarDate = formatCalendarDate;
  readonly formatGnfAmountDetailed = formatGnfAmountDetailed;
  readonly campaignStatusLabel = campaignStatusLabel;
  readonly tabs = CAMPAIGN_DETAIL_TABS;

  readonly categoryAmounts = computed(() => this.campaign()?.categoryAmounts ?? []);

  constructor() {
    const campaignId = this.route.snapshot.paramMap.get('campaignId');
    if (campaignId) {
      this.loadCampaign(campaignId);
    } else {
      this.loading.set(false);
      this.loadError.set(true);
    }
  }

  selectTab(tab: CampaignDetailTab): void {
    this.activeTab.set(tab);
  }

  isActiveTab(tab: CampaignDetailTab): boolean {
    return this.activeTab() === tab;
  }

  private loadCampaign(campaignId: string): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.campaignsService
      .getCampaign(campaignId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (campaign) => {
          this.campaign.set(campaign);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }
}
