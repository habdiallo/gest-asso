import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MembresService } from '@api';
import type { MemberPage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { memberStatusLabel } from '../members-status-labels';

/**
 * Écran liste des membres (T-21) : appelle `GET /membres` (`@api`,
 * `MembresService.listMembers`) et affiche un tableau Nom, Prénom, Nom
 * d'usage, Pays, Ville, Téléphone, Catégorie, Fonction, Statut, conformément
 * à US-MEM-002. Aucun paramètre de recherche/filtre/pagination n'est exploité
 * ici : ce sont les périmètres des tickets T-24 (recherche), T-25 (filtre
 * statut) et T-26 (filtre catégorie). La distinction visuelle actif/inactif
 * (RG-MEM-007) relève du ticket T-22 ; seul le libellé textuel du statut est
 * affiché par cet écran.
 *
 * Limite connue : la vue restreinte de l'Opérateur (masquage du détail
 * financier, RG-MEM-008) n'est pas implémentée ici et fait l'objet du ticket
 * T-23 ; cet écran affiche les colonnes du contrat sans distinction de rôle.
 */
@Component({
  selector: 'app-members-list-page',
  imports: [TranslocoPipe],
  templateUrl: './members-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersListPage {
  private readonly membersService = inject(MembresService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly memberPage = signal<MemberPage | null>(null);

  readonly memberStatusLabel = memberStatusLabel;

  constructor() {
    this.membersService
      .listMembers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.memberPage.set(page);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }
}
