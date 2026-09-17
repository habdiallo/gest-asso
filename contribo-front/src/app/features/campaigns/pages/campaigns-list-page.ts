import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CampagnesService } from '@api';
import type { CampaignPage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatCalendarDate } from '../campaign-dates';
import { campaignStatusLabel } from '../campaign-status-labels';

/**
 * Écran liste des campagnes (T-57, `openapi:listCampaigns`) : nom, période
 * et statut, pour Administrateur/Trésorier/Opérateur (`campaigns.routes.ts`
 * restreint déjà l'accès par rôle via `roleGuard`).
 *
 * Limites connues : le filtre par statut (T-58) et la recherche par nom
 * (T-59) ne sont pas implémentés par ce ticket ; seule la pagination de
 * base (page suivante/précédente) est fournie ici.
 */
@Component({
  selector: 'app-campaigns-list-page',
  imports: [TranslocoPipe],
  templateUrl: './campaigns-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignsListPage {
  private readonly campaignsService = inject(CampagnesService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly requestedPage = signal(0);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly campaignPage = signal<CampaignPage | null>(null);

  readonly formatCalendarDate = formatCalendarDate;
  readonly campaignStatusLabel = campaignStatusLabel;

  constructor() {
    this.loadPage(this.requestedPage());
  }

  goToPreviousPage(): void {
    const page = this.campaignPage();
    if (page && page.page.number > 0) {
      this.loadPage(page.page.number - 1);
    }
  }

  goToNextPage(): void {
    const page = this.campaignPage();
    if (page && page.page.number + 1 < page.page.totalPages) {
      this.loadPage(page.page.number + 1);
    }
  }

  private loadPage(page: number): void {
    this.requestedPage.set(page);
    this.loading.set(true);
    this.loadError.set(false);

    this.campaignsService
      .listCampaigns(page)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (campaignPage) => {
          this.campaignPage.set(campaignPage);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }
}
