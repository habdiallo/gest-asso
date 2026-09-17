import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MembresService } from '@api';
import type { CreateMemberRequest, MemberPage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { FormDialog } from '@shared/form-dialog/form-dialog';
import { MemberCreateForm } from '../components/member-create-form/member-create-form';
import { memberIsActive, memberStatusLabel } from '../members-status-labels';

/**
 * Écran liste des membres (T-21) : appelle `GET /membres` (`@api`,
 * `MembresService.listMembers`) et affiche un tableau Nom, Prénom, Nom
 * d'usage, Pays, Ville, Téléphone, Catégorie, Fonction, Statut, conformément
 * à US-MEM-002. La recherche (T-24), le filtre statut (T-25) et le filtre
 * catégorie (T-26) ne sont pas exploités ici ; seule la pagination de base
 * (page suivante/précédente sur `page`/`size`) est fournie par ce ticket, afin
 * que l'ensemble du répertoire reste accessible au-delà des 20 premiers
 * membres. La colonne Statut affiche un badge distinguant visuellement les
 * membres actifs des membres inactifs (T-22, RG-MEM-007), en plus du libellé
 * textuel, pour ne pas reposer uniquement sur la couleur.
 *
 * Limite connue : la vue restreinte de l'Opérateur (masquage du détail
 * financier, RG-MEM-008) n'est pas implémentée ici et fait l'objet du ticket
 * T-23 ; cet écran affiche les colonnes du contrat sans distinction de rôle.
 *
 * Ajoute également l'action "Ajouter un membre" (T-33, US-MEM-001) : ouvre le
 * formulaire de création dans `FormDialog` (T-15) et appelle `POST /members`
 * (`MembresService.createMember`). Le masquage de cette action pour
 * l'Opérateur et le Membre (RG-MEM-001) relève du ticket T-37 ; elle reste
 * visible ici pour tous les rôles qui accèdent à cet écran.
 */
@Component({
  selector: 'app-members-list-page',
  imports: [TranslocoPipe, FormDialog, MemberCreateForm],
  templateUrl: './members-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersListPage {
  private readonly membersService = inject(MembresService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly memberPage = signal<MemberPage | null>(null);

  readonly createDialogOpen = signal(false);
  readonly creating = signal(false);
  readonly createError = signal(false);

  readonly previousPageDisabled = computed(
    () => this.loading() || (this.memberPage()?.page.number ?? 0) === 0,
  );
  readonly nextPageDisabled = computed(() => {
    const page = this.memberPage();
    return this.loading() || !page || page.page.number + 1 >= page.page.totalPages;
  });

  readonly memberStatusLabel = memberStatusLabel;
  readonly memberIsActive = memberIsActive;

  constructor() {
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
    this.createError.set(false);
    this.createDialogOpen.set(true);
  }

  closeCreateDialog(): void {
    this.createDialogOpen.set(false);
  }

  handleCreateMember(request: CreateMemberRequest): void {
    this.creating.set(true);
    this.createError.set(false);

    this.membersService
      .createMember(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.creating.set(false);
          this.createDialogOpen.set(false);
          this.loadPage(0);
        },
        error: () => {
          this.creating.set(false);
          this.createError.set(true);
        },
      });
  }

  private loadPage(page: number): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.membersService
      .listMembers(page)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (memberPage) => {
          this.memberPage.set(memberPage);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }
}
