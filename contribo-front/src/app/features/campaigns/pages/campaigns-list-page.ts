import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CampagnesService, CampaignStatus, UserRole } from '@api';
import type { CampaignPage, CreateCampaignRequest } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { SessionService } from '@core/session/session.service';
import { ApiErrorRetry } from '@shared/api-error-retry/api-error-retry';
import { EmptyState } from '@shared/empty-state/empty-state';
import { FormDialog } from '@shared/form-dialog/form-dialog';
import { LoadingSkeleton } from '@shared/loading-skeleton/loading-skeleton';
import type { CustomSelectOption } from '@shared/custom-select/custom-select';
import { CustomSelect } from '@shared/custom-select/custom-select';
import { Subject, debounceTime } from 'rxjs';
import { CampaignCreateForm } from '../components/campaign-create-form/campaign-create-form';
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
 * déclencher une requête qu'une fois l'utilisateur arrêté de taper. La
 * déduplication compare le terme amorti au terme effectivement chargé par
 * la dernière requête (`lastRequestedNameQuery`, mis à jour par tout appel
 * à `loadPage`), pas au dernier terme émis dans le flux de saisie : un
 * changement de statut déclenché pendant l'amortissement charge déjà le
 * terme courant, donc un retour ultérieur à un terme précédemment amorti
 * ne doit pas être supprimé comme redondant. Chaque nouvelle recherche
 * revient à la première page, se combine avec le filtre de statut déjà
 * actif et chaque campagne ouvre son écran détail (T-60).
 *
 * Les commandes de pagination restent montées et focusables pendant le
 * chargement d'une page (désactivation via `aria-disabled`, pas `disabled`),
 * afin de ne pas perdre le focus clavier posé sur le bouton actionné
 * (`.claude/rules/frontend/accessibilite.md`).
 *
 * Ajoute également l'action "Créer une campagne" (T-65, US-COT-001) : ouvre
 * le formulaire de création dans `FormDialog` (T-15) et appelle
 * `POST /campaigns` (`CampagnesService.createCampaign`,
 * openapi:`createCampaign`). Après création, la première page est
 * rechargée avec les filtres courants afin d'afficher la nouvelle campagne.
 *
 * Masquage de l'action "Créer une campagne" pour l'Opérateur et le Membre
 * (T-67) : seuls l'Administrateur et le Trésorier créent une campagne
 * (US-COT-001, spec `campaigns-ui`), même approche que `SocialFundsListPage`
 * (T-84/T-86). Le Membre n'accède déjà pas à cet écran (`roleGuard` sur la
 * route `/campagnes`, voir `app.routes.ts`) ; ce masquage protège en plus
 * l'Opérateur, seul rôle non autorisé qui consulte effectivement cette liste.
 *
 * Ouverture directe depuis les actions rapides du tableau de bord (T-117) :
 * le paramètre de requête `creer` (`?creer=1`) ouvre ce dialogue dès l'arrivée
 * sur l'écran, pour un rôle autorisé, au lieu d'obliger un second clic sur
 * « Créer une campagne ». Le paramètre est retiré de l'URL une fois lu, pour
 * qu'un rafraîchissement de page ne rouvre pas le dialogue.
 */
@Component({
  selector: 'app-campaigns-list-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    ApiErrorRetry,
    EmptyState,
    FormDialog,
    LoadingSkeleton,
    CustomSelect,
    CampaignCreateForm,
  ],
  templateUrl: './campaigns-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignsListPage {
  private readonly campaignsService = inject(CampagnesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionService = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private createDialogSession = 0;
  /** Formulaire de création affiché (T-102) : relu par `retryCreateCampaign`. */
  private readonly createForm = viewChild<CampaignCreateForm>('createForm');

  private readonly requestedPage = signal(0);
  private requestSequence = 0;

  /**
   * Masquage de l'action "Créer une campagne" pour l'Opérateur et le Membre
   * (T-67) : seuls l'Administrateur et le Trésorier créent une campagne
   * (US-COT-001).
   */
  readonly canCreateCampaign = computed(() => {
    const role = this.sessionService.user()?.role;
    return role === UserRole.Administrator || role === UserRole.Treasurer;
  });

  readonly createDialogOpen = signal(false);
  readonly creating = signal(false);
  readonly createError = signal(false);

  readonly statusFilterOptions: readonly CampaignStatus[] = [
    CampaignStatus.Open,
    CampaignStatus.Closed,
  ];
  readonly statusSelectOptions: readonly CustomSelectOption[] = [
    { value: '', label: '', translationKey: 'campaigns.list.statusFilterAll' },
    ...this.statusFilterOptions.map((status) => ({
      value: status,
      label: campaignStatusLabel(status),
    })),
  ];

  readonly statusFilter = signal<CampaignStatus | ''>('');
  readonly nameQuery = signal('');
  private readonly nameQueryInput = new Subject<string>();
  private lastRequestedNameQuery = '';
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
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value === this.lastRequestedNameQuery) {
          return;
        }
        this.loadPage(0);
      });

    this.loadPage(this.requestedPage());

    if (this.route.snapshot.queryParamMap.get('creer') === '1') {
      this.openCreateDialog();
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { creer: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  onStatusFilterChange(value: string | null): void {
    this.statusFilter.set((value ?? '') as CampaignStatus | '');
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

  /** Ouvre le formulaire de création de campagne (T-65), réservé à l'Administrateur et au Trésorier (T-67). */
  openCreateDialog(): void {
    if (!this.canCreateCampaign() || this.createDialogOpen()) {
      return;
    }
    ++this.createDialogSession;
    this.creating.set(false);
    this.createError.set(false);
    this.createDialogOpen.set(true);
  }

  /** Ferme le formulaire, quelle que soit la cause (Échap, bouton Annuler, succès). */
  closeCreateDialog(): void {
    ++this.createDialogSession;
    this.creating.set(false);
    this.createDialogOpen.set(false);
  }

  /**
   * Confirme la création (US-COT-001) : appelle `createCampaign`, puis
   * recharge la première page avec les filtres courants pour afficher la
   * nouvelle campagne. La requête est rattachée à une session de dialogue :
   * si le formulaire a été fermé puis rouvert entre-temps, une réponse
   * tardive ne referme plus l'état devenu obsolète.
   */
  handleCreateCampaign(request: CreateCampaignRequest): void {
    if (!this.createDialogOpen() || this.creating()) {
      return;
    }
    const session = this.createDialogSession;
    this.creating.set(true);
    this.createError.set(false);

    this.campaignsService
      .createCampaign(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadPage(0);
          if (session !== this.createDialogSession) {
            return;
          }
          this.closeCreateDialog();
        },
        error: () => {
          if (session !== this.createDialogSession) {
            return;
          }
          this.creating.set(false);
          this.createError.set(true);
        },
      });
  }

  /**
   * Nouvelle tentative (T-102) : redéclenche la soumission du formulaire de
   * création, qui reste affiché et éditable après l'échec, afin de renvoyer
   * la saisie courante (et non un instantané figé lors du premier envoi).
   */
  retryCreateCampaign(): void {
    this.createForm()?.submit();
  }

  private loadPage(page: number): void {
    this.requestedPage.set(page);
    this.loading.set(true);
    this.loadError.set(false);

    // Une réponse en retard (filtre changé avant que la requête précédente
    // ne résolve) ne doit pas écraser le résultat du dernier filtre sélectionné.
    const requestId = ++this.requestSequence;
    const nameQuery = this.nameQuery().trim();
    this.lastRequestedNameQuery = nameQuery;

    this.campaignsService
      .listCampaigns(page, undefined, nameQuery || undefined, this.statusFilter() || undefined)
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
