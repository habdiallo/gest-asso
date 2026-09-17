import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CampagnesService, CampaignStatus } from '@api';
import type { CampaignPage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatCalendarDate } from '../campaign-dates';
import { campaignStatusLabel } from '../campaign-status-labels';

/**
 * Écran liste des campagnes (T-57, `openapi:listCampaigns`) : nom, période
 * et statut, pour Administrateur/Trésorier/Opérateur (`campaigns.routes.ts`
 * restreint déjà l'accès par rôle via `roleGuard`). Le filtre par statut
 * (T-58, paramètre contractuel `status`) restreint la liste aux campagnes
 * ouvertes ou clôturées ; les campagnes à venir restent visibles via
 * l'option « Toutes ».
 *
 * Limite connue : la recherche par nom (T-59) n'est pas implémentée par ce
 * ticket.
 *
 * Les commandes de pagination restent montées et focusables pendant le
 * chargement d'une page (désactivation via `aria-disabled`, pas `disabled`),
 * afin de ne pas perdre le focus clavier posé sur le bouton actionné
 * (`.claude/rules/frontend/accessibilite.md`).
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
  private requestSequence = 0;

  readonly statusFilterOptions: readonly CampaignStatus[] = [
    CampaignStatus.Open,
    CampaignStatus.Closed,
  ];

  readonly statusFilter = signal<CampaignStatus | ''>('');
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly campaignPage = signal<CampaignPage | null>(null);

  readonly formatCalendarDate = formatCalendarDate;
  readonly campaignStatusLabel = campaignStatusLabel;

  readonly previousPageDisabled = computed(
    () => this.loading() || (this.campaignPage()?.page.number ?? 0) === 0,
  );

  readonly nextPageDisabled = computed(() => {
    const page = this.campaignPage();
    return this.loading() || !page || page.page.number + 1 >= page.page.totalPages;
  });

  constructor() {
    this.loadPage(this.requestedPage());
  }

  onStatusFilterChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as CampaignStatus | '');
    this.loadPage(0);
  }

  goToPreviousPage(): void {
    if (this.previousPageDisabled()) {
      return;
    }
    const page = this.campaignPage();
    if (page) {
      this.loadPage(page.page.number - 1);
    }
  }

  goToNextPage(): void {
    if (this.nextPageDisabled()) {
      return;
    }
    const page = this.campaignPage();
    if (page) {
      this.loadPage(page.page.number + 1);
    }
  }

  private loadPage(page: number): void {
    this.requestedPage.set(page);
    this.loading.set(true);
    this.loadError.set(false);

    // Une réponse en retard (filtre changé avant que la requête précédente
    // ne résolve) ne doit pas écraser le résultat du dernier filtre sélectionné.
    const requestId = ++this.requestSequence;

    this.campaignsService
      .listCampaigns(page, undefined, undefined, this.statusFilter() || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (campaignPage) => {
          if (requestId !== this.requestSequence) {
            return;
          }
          this.campaignPage.set(campaignPage);
          this.loading.set(false);
        },
        error: () => {
          if (requestId !== this.requestSequence) {
            return;
          }
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }
}
