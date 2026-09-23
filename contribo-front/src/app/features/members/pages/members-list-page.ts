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
import { MembresService, MemberStatus } from '@api';
import type { CreateMemberRequest, MemberDetails, MemberPage, MemberSummary } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { Subject, debounceTime } from 'rxjs';
import { SessionService } from '@core/session/session.service';
import { ActionButton } from '@shared/action-button/action-button';
import { ApiErrorRetry } from '@shared/api-error-retry/api-error-retry';
import { EmptyState } from '@shared/empty-state/empty-state';
import { FormDialog } from '@shared/form-dialog/form-dialog';
import { LoadingSkeleton } from '@shared/loading-skeleton/loading-skeleton';
import { PageHeader } from '@shared/page-header/page-header';
import type { CustomSelectOption } from '@shared/custom-select/custom-select';
import { CustomSelect } from '@shared/custom-select/custom-select';
import { MemberCreateForm } from '../components/member-create-form/member-create-form';
import { memberIsActive, memberStatusLabel } from '../members-status-labels';

/**
 * Écran liste des membres (T-21) : appelle `GET /membres` (`@api`,
 * `MembresService.listMembers`) et affiche un tableau Nom, Prénom, Nom
 * d'usage, Pays, Ville, Téléphone, Catégorie, Fonction, Statut, conformément
 * à US-MEM-002. La pagination de base (page suivante/précédente sur
 * `page`/`size`) est fournie par ce ticket, afin que l'ensemble du répertoire
 * reste accessible au-delà des 20 premiers membres. La colonne Statut affiche
 * un badge distinguant visuellement les membres actifs des membres inactifs
 * (T-22, RG-MEM-007), en plus du libellé textuel, pour ne pas reposer
 * uniquement sur la couleur. Chaque ligne mène à la fiche détaillée du membre
 * (T-27, US-MEM-003).
 *
 * Recherche par nom (T-24, paramètre contractuel `q` de `GET /members`) :
 * filtre côté serveur les membres dont un champ nominatif correspond à la
 * saisie. La saisie est amortie (`debounceTime`) pour ne déclencher une
 * requête qu'une fois l'utilisateur arrêté de taper. La déduplication compare
 * le terme amorti au dernier terme effectivement chargé (`lastRequestedQuery`,
 * mis à jour par tout appel à `loadPage`), afin qu'un retour à un terme déjà
 * amorti ne soit pas supprimé comme redondant si une autre requête a été
 * déclenchée dans l'intervalle. Une nouvelle recherche revient à la première
 * page. Une réponse en retard (nouvelle recherche lancée avant que la
 * précédente ne résolve) ne doit pas écraser le résultat de la dernière
 * recherche saisie (`requestSequence`).
 *
 * Filtre par statut (T-25, paramètre contractuel `status` de
 * `GET /members`) : un menu Actif/Inactif/Tous restreint la liste, revient à
 * la première page à chaque changement (`loadPage(0)`, même approche que
 * `CampaignsListPage`, T-58) et se combine avec la pagination. Une réponse
 * en retard, arrivée après un changement de filtre plus récent, est ignorée
 * via `requestSequence` afin de ne pas écraser le résultat du filtre
 * effectivement sélectionné en dernier.
 *
 * Vue restreinte de l'Opérateur (T-23, RG-MEM-008) : la colonne Catégorie de
 * revenu, qui porte le détail financier du membre (montants de cotisation
 * associés à la catégorie), est masquée pour le rôle Opérateur. Les autres
 * colonnes (identité, coordonnées, fonction, statut) restent affichées, car
 * elles sont nécessaires à ses opérations courantes.
 *
 * Filtre par catégorie de revenu (T-26) : `GET /members`
 * (`besoins/openapi.yaml`, `listMembers`) n'expose aucun paramètre de requête
 * pour filtrer par catégorie (seuls `page`, `size`, `q` et `status` existent),
 * contrairement au filtre statut qui pourra s'appuyer sur `MemberStatusFilter`.
 * Ce ticket n'invente donc pas de paramètre serveur : le filtre s'applique
 * côté client sur les membres de la page actuellement chargée, via un
 * sélecteur alimenté par les catégories réellement présentes dans cette page.
 * Masqué pour l'Opérateur, comme la colonne Catégorie qu'il pilote (RG-MEM-008).
 *
 * Ajoute également l'action "Ajouter un membre" (T-33, US-MEM-001) : ouvre le
 * formulaire de création dans `FormDialog` (T-15) et appelle `POST /members`
 * (`MembresService.createMember`). Cette action est masquée pour l'Opérateur
 * et le Membre (T-37, RG-MEM-001) : seuls l'Administrateur et le Trésorier la
 * déclenchent, conformément à la spec `member-management-ui`.
 *
 * Ouverture directe depuis les actions rapides du tableau de bord (T-117) :
 * le paramètre de requête `creer` (`?creer=1`) ouvre ce dialogue dès l'arrivée
 * sur l'écran, pour un opérateur autorisé, au lieu de l'obliger à cliquer une
 * seconde fois sur « Ajouter un membre ». Le paramètre est retiré de l'URL
 * une fois lu, pour qu'un rafraîchissement de page ne rouvre pas le dialogue.
 *
 * Après une création réussie (T-35, RG-MEM-003) : le formulaire ne propose
 * aucun champ de saisie du statut (`member-create-form.ts`, T-33) et cet
 * écran affiche, une fois le dialogue fermé, une confirmation reprenant le
 * nom du membre créé et son statut Actif par défaut, tel que renvoyé par
 * `POST /members`. Le tri alphabétique de la liste (nom puis prénom) peut
 * laisser le membre créé hors de la première page rechargée ; cette
 * confirmation reste donc le retour visible immédiat, indépendamment de sa
 * position dans le tableau.
 *
 * Cette confirmation précise également qu'un compte utilisateur a été créé
 * automatiquement pour le membre (T-36, RG-MEM-004) : la création du membre
 * entraîne toujours la création de son compte côté backend, sans champ
 * dédié dans `MemberDetails` ; le message l'annonce donc systématiquement
 * après une création réussie (clé `members.create.success`).
 */
@Component({
  selector: 'app-members-list-page',
  imports: [
    TranslocoPipe,
    RouterLink,
    ActionButton,
    ApiErrorRetry,
    EmptyState,
    FormDialog,
    LoadingSkeleton,
    PageHeader,
    CustomSelect,
    MemberCreateForm,
  ],
  templateUrl: './members-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersListPage {
  private readonly membersService = inject(MembresService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionService = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private createDialogSession = 0;
  private requestSequence = 0;
  /** Formulaire de création affiché (T-102) : relu par `retryCreateMember`. */
  private readonly createForm = viewChild<MemberCreateForm>('createForm');

  readonly nameQuery = signal('');
  private readonly nameQueryInput = new Subject<string>();
  private lastRequestedQuery = '';

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly memberPage = signal<MemberPage | null>(null);

  readonly statusFilterOptions: readonly MemberStatus[] = [
    MemberStatus.Active,
    MemberStatus.Inactive,
  ];
  readonly statusSelectOptions: readonly CustomSelectOption[] = [
    { value: '', label: '', translationKey: 'members.statusFilterAll' },
    ...this.statusFilterOptions.map((status) => ({
      value: status,
      label: memberStatusLabel(status),
    })),
  ];
  readonly statusFilter = signal<MemberStatus | ''>('');

  readonly showFinancialDetail = computed(() => this.sessionService.user()?.role !== 'OPERATOR');

  /**
   * Masquage de l'action "Ajouter un membre" pour l'Opérateur et le Membre
   * (T-37, RG-MEM-001) : seuls l'Administrateur et le Trésorier créent un
   * membre (US-MEM-001).
   */
  readonly canCreateMember = computed(() => {
    const role = this.sessionService.user()?.role;
    return role === 'ADMINISTRATOR' || role === 'TREASURER';
  });

  readonly createDialogOpen = signal(false);
  readonly creating = signal(false);
  readonly createError = signal(false);
  readonly createdConfirmation = signal<{ name: string; statusLabel: string } | null>(null);

  readonly previousPageDisabled = computed(
    () => this.loading() || (this.memberPage()?.page.number ?? 0) === 0,
  );
  readonly nextPageDisabled = computed(() => {
    const page = this.memberPage();
    return this.loading() || !page || page.page.number + 1 >= page.page.totalPages;
  });

  readonly memberStatusLabel = memberStatusLabel;
  readonly memberIsActive = memberIsActive;

  /**
   * Filtre par catégorie de revenu (T-26) : `null` signifie "toutes les
   * catégories". Les options proposées et le filtrage appliqué se limitent
   * aux membres de la page actuellement chargée, `listMembers` n'exposant
   * aucun paramètre de filtre par catégorie. La sélection est conservée
   * pendant la pagination : une catégorie absente de la nouvelle page
   * affiche une liste filtrée vide plutôt que de réafficher toutes les
   * catégories.
   */
  readonly selectedIncomeCategoryId = signal<string | null>(null);

  readonly incomeCategoryOptions = computed(() => {
    const items = this.memberPage()?.items ?? [];
    const byId = new Map<string, string>();
    for (const member of items) {
      byId.set(member.incomeCategory.id, member.incomeCategory.label);
    }
    return [...byId.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  });
  readonly incomeCategorySelectOptions = computed<readonly CustomSelectOption[]>(() => [
    { value: '', label: '', translationKey: 'members.filters.incomeCategoryAll' },
    ...this.incomeCategoryOptions().map((category) => ({
      value: category.id,
      label: category.label,
    })),
  ]);

  readonly filteredItems = computed<MemberSummary[]>(() => {
    const items = this.memberPage()?.items ?? [];
    const categoryId = this.selectedIncomeCategoryId();
    if (!categoryId) {
      return items;
    }
    return items.filter((member) => member.incomeCategory.id === categoryId);
  });

  constructor() {
    this.nameQueryInput
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value === this.lastRequestedQuery) {
          return;
        }
        this.loadPage(0);
      });

    this.loadPage(0);

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

  onNameQueryInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.nameQuery.set(value);
    this.nameQueryInput.next(value.trim());
  }

  onIncomeCategoryFilterChange(value: string | null): void {
    this.selectedIncomeCategoryId.set(value === '' ? null : value);
  }

  onStatusFilterChange(value: string | null): void {
    this.statusFilter.set((value ?? '') as MemberStatus | '');
    this.loadPage(0);
  }

  goToPreviousPage(): void {
    if (this.previousPageDisabled()) {
      return;
    }
    const page = this.memberPage();
    if (page && page.page.number > 0) {
      this.loadPage(page.page.number - 1);
    }
  }

  goToNextPage(): void {
    if (this.nextPageDisabled()) {
      return;
    }
    const page = this.memberPage();
    if (page && page.page.number + 1 < page.page.totalPages) {
      this.loadPage(page.page.number + 1);
    }
  }

  openCreateDialog(): void {
    if (!this.canCreateMember() || this.createDialogOpen()) {
      return;
    }
    ++this.createDialogSession;
    this.creating.set(false);
    this.createError.set(false);
    this.createdConfirmation.set(null);
    this.createDialogOpen.set(true);
  }

  closeCreateDialog(): void {
    ++this.createDialogSession;
    this.creating.set(false);
    this.createDialogOpen.set(false);
  }

  handleCreateMember(request: CreateMemberRequest): void {
    if (!this.createDialogOpen() || this.creating()) {
      return;
    }
    const session = this.createDialogSession;
    this.creating.set(true);
    this.createError.set(false);

    this.membersService
      .createMember(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (member: MemberDetails) => {
          this.loadPage(0);
          if (session !== this.createDialogSession) {
            return;
          }
          this.createdConfirmation.set({
            name: member.displayName,
            statusLabel: memberStatusLabel(member.status),
          });
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
  retryCreateMember(): void {
    this.createForm()?.submit();
  }

  private loadPage(page: number): void {
    this.loading.set(true);
    this.loadError.set(false);

    // Une réponse en retard (nouvelle recherche ou filtre changé avant que la
    // précédente requête ne résolve) ne doit pas écraser le résultat de la
    // dernière recherche/filtre sélectionné.
    const requestId = ++this.requestSequence;
    const query = this.nameQuery().trim();
    this.lastRequestedQuery = query;

    this.membersService
      .listMembers(page, undefined, query || undefined, this.statusFilter() || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (memberPage) => {
          if (requestId !== this.requestSequence) {
            return;
          }
          this.memberPage.set(memberPage);
          this.loading.set(false);
          // Le filtre catégorie (T-26) porte sur la page chargée, faute de
          // paramètre de catégorie dans le contrat `listMembers`. La
          // sélection reste conservée d'une page à l'autre : une catégorie
          // absente de la nouvelle page ne montre aucun membre plutôt que
          // d'afficher silencieusement toutes les catégories.
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
