import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ErrorCode, MembresService } from '@api';
import type { ErrorResponse, MemberDetails } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { map } from 'rxjs';
import { memberStatusLabel } from '../members-status-labels';

/**
 * Écran fiche membre (T-27) : appelle `GET /members/{memberId}` (`@api`,
 * `MembresService.getMember`) et affiche le bloc informations personnelles
 * (Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone), catégorie de revenu,
 * fonction associative et statut, conformément à US-MEM-003. L'identifiant
 * du membre provient du paramètre de route `memberId`, atteint depuis une
 * ligne de la liste des membres (T-21).
 *
 * Limite connue : la situation des cotisations, l'historique des règlements
 * et les contributions aux cagnottes prévus par US-MEM-003 relèvent des
 * tickets T-28, T-29 et T-30 (contenu des onglets) ; cet écran n'affiche que
 * le bloc de base. La restriction de la vue Opérateur (RG-MEM-008, T-23) et
 * les actions de modification (T-31 et suivants) ne sont pas non plus
 * couvertes par ce ticket.
 */
@Component({
  selector: 'app-member-detail-page',
  imports: [TranslocoPipe, RouterLink],
  templateUrl: './member-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly membersService = inject(MembresService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly notFound = signal(false);
  readonly member = signal<MemberDetails | null>(null);

  readonly memberStatusLabel = memberStatusLabel;

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('memberId')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((memberId) => {
        if (memberId) {
          this.loadMember(memberId);
        }
      });
  }

  private loadMember(memberId: string): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.notFound.set(false);
    this.member.set(null);

    this.membersService
      .getMember(memberId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (member) => {
          this.member.set(member);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.loadError.set(true);
          this.notFound.set(isResourceNotFound(error));
        },
      });
  }
}

function isResourceNotFound(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse)) {
    return false;
  }
  const body = error.error as ErrorResponse | undefined;
  return body?.code === ErrorCode.ResourceNotFound;
}
