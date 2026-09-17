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
import { CampagnesService, CampaignStatus } from '@api';
import type { CampaignPage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
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
 * La recherche par nom (T-59, paramètre contractuel `q` de
 * `GET /campaigns`) filtre côté serveur les campagnes dont le nom
 * correspond à la saisie. La saisie est amortie (`debounceTime`) pour ne
 * déclencher une requête qu'une fois l'utilisateur arrêté de taper, et
 * `distinctUntilChanged` évite une requête redondante si la valeur amortie
 * n'a pas changé. Chaque nouvelle recherche revient à la première page, se
 * combine avec le filtre de statut déjà actif et chaque campagne ouvre son
 * écran détail (T-60).
 *
 * Les commandes de pagination restent montées et focusables pendant le
 * chargement d'une page (désactivation via `aria-disabled`, pas `disabled`),
 * afin de ne pas perdre le focus clavier posé sur le bouton actionné
 * (`.claude/rules/frontend/accessibilite.md`).
 */
@Component({
  selector: 'app-campaigns-list-page',
  imports: [RouterLink, TranslocoPipe],
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
  readonly nameQuery = signal('');
  private readonly nameQueryInput = new Subject<string>();
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
    this.nameQueryInput
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadPage(0));

    this.loadPage(this.requestedPage());
  }

  onStatusFilterChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as CampaignStatus | '');
    this.loadPage(0);
  }

  onNameQueryInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.nameQuery.set(value);
    this.nameQueryInput.next(value.trim());
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
      .listCampaigns(
        page,
        undefined,
        this.nameQuery().trim() || undefined,
        this.statusFilter() || undefined,
      )
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
