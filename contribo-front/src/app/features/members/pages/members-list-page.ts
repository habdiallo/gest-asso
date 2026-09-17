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
import { MembresService } from '@api';
import type { CreateMemberRequest, MemberPage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { SessionService } from '@core/session/session.service';
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
 * textuel, pour ne pas reposer uniquement sur la couleur. Chaque ligne mène
 * à la fiche détaillée du membre (T-27, US-MEM-003).
 *
 * Vue restreinte de l'Opérateur (T-23, RG-MEM-008) : la colonne Catégorie de
 * revenu, qui porte le détail financier du membre (montants de cotisation
 * associés à la catégorie), est masquée pour le rôle Opérateur. Les autres
 * colonnes (identité, coordonnées, fonction, statut) restent affichées, car
 * elles sont nécessaires à ses opérations courantes.
 *
 * Ajoute également l'action "Ajouter un membre" (T-33, US-MEM-001) : ouvre le
 * formulaire de création dans `FormDialog` (T-15) et appelle `POST /members`
 * (`MembresService.createMember`). Cette action est masquée pour l'Opérateur
 * et le Membre (T-37, RG-MEM-001) : seuls l'Administrateur et le Trésorier la
 * déclenchent, conformément à la spec `member-management-ui`.
 */
@Component({
  selector: 'app-members-list-page',
  imports: [TranslocoPipe, RouterLink, FormDialog, MemberCreateForm],
  templateUrl: './members-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersListPage {
  private readonly membersService = inject(MembresService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionService = inject(SessionService);
  private createDialogSession = 0;

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly memberPage = signal<MemberPage | null>(null);

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
    if (!this.canCreateMember() || this.createDialogOpen()) {
      return;
    }
    ++this.createDialogSession;
    this.creating.set(false);
    this.createError.set(false);
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
