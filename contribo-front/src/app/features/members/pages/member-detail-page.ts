import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ErrorCode, MemberStatus, MembresService, UserRole } from '@api';
import type { ErrorResponse, MemberDetails, UpdateMemberRequest } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';
import { SessionService } from '@core/session/session.service';
import { FormDialog } from '@shared/form-dialog/form-dialog';
import { MemberEditForm } from '../components/member-edit-form/member-edit-form';
import { memberStatusLabel } from '../members-status-labels';

/**
 * Écran fiche membre (T-27) : appelle `GET /members/{memberId}` (`@api`,
 * `MembresService.getMember`) et affiche le bloc informations personnelles
 * (Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone), catégorie de revenu,
 * fonction associative et statut, conformément à US-MEM-003. L'identifiant
 * du membre provient du paramètre de route `memberId`, atteint depuis une
 * ligne de la liste des membres (T-21).
 *
 * T-44 (US-MEM-006) ajoute l'action "Réactiver" sur un membre inactif,
 * réservée à l'Administrateur (RG-MEM-020 à RG-MEM-022) : appelle
 * `POST /members/{memberId}/reactivation` (`MembresService.reactivateMember`)
 * après confirmation explicite, symétriquement à l'action "Désactiver"
 * (T-41, sur une branche distincte, non implémentée ici).
 *
 * Limite connue : la situation des cotisations, l'historique des règlements
 * et les contributions aux cagnottes prévus par US-MEM-003 relèvent des
 * tickets T-28, T-29 et T-30 (contenu des onglets) ; cet écran n'affiche que
 * le bloc de base. La restriction de la vue Opérateur (RG-MEM-008, T-23) et
 * la variante de modification Opérateur (T-39) restent à livrer. L'action
 * "Désactiver" sur un membre actif (T-41) reste à livrer séparément.
 * La modification complète Administrateur/Trésorier est fournie par T-38.
 */
@Component({
  selector: 'app-member-detail-page',
  imports: [TranslocoPipe, RouterLink, FormDialog, MemberEditForm],
  templateUrl: './member-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly membersService = inject(MembresService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly sessionService = inject(SessionService);
  private editSession = 0;
  readonly canEdit = computed(() => {
    const role = this.sessionService.user()?.role;
    return role === UserRole.Administrator || role === UserRole.Treasurer;
  });
  readonly editOpen = signal(false);
  readonly saving = signal(false);
  readonly editError = signal(false);
  readonly editSuccess = signal(false);

  private reactivateSession = 0;
  readonly canReactivate = computed(() => {
    const role = this.sessionService.user()?.role;
    return role === UserRole.Administrator && this.member()?.status === MemberStatus.Inactive;
  });
  readonly reactivateOpen = signal(false);
  readonly reactivating = signal(false);
  readonly reactivateError = signal(false);
  readonly reactivateSuccess = signal(false);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly notFound = signal(false);
  readonly member = signal<MemberDetails | null>(null);

  readonly memberStatusLabel = memberStatusLabel;

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('memberId')),
        filter((memberId): memberId is string => memberId !== null),
        tap(() => {
          this.closeEditDialog();
          this.editSuccess.set(false);
          this.closeReactivateDialog();
          this.reactivateSuccess.set(false);
          this.loading.set(true);
          this.loadError.set(false);
          this.notFound.set(false);
          this.member.set(null);
        }),
        switchMap((memberId) =>
          this.membersService.getMember(memberId).pipe(
            map((member) => ({ member, error: null }) as const),
            catchError((error: unknown) => of({ member: null, error } as const)),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ member, error }) => {
        this.loading.set(false);
        if (error !== null) {
          this.loadError.set(true);
          this.notFound.set(isResourceNotFound(error));
          return;
        }
        this.member.set(member);
      });
  }
  openEditDialog(): void {
    if (!this.canEdit() || !this.member() || this.editOpen()) {
      return;
    }
    ++this.editSession;
    this.editError.set(false);
    this.editSuccess.set(false);
    this.editOpen.set(true);
  }

  closeEditDialog(): void {
    ++this.editSession;
    this.editOpen.set(false);
    this.saving.set(false);
  }

  updateMember(request: UpdateMemberRequest): void {
    const member = this.member();
    if (!this.canEdit() || !member || !this.editOpen() || this.saving()) {
      return;
    }
    const session = this.editSession;
    this.saving.set(true);
    this.editError.set(false);
    this.membersService
      .updateMember(member.id, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          if (this.member()?.id !== member.id) {
            return;
          }
          this.member.set(updated);
          if (session !== this.editSession) {
            return;
          }
          this.closeEditDialog();
          this.editSuccess.set(true);
        },
        error: () => {
          if (session !== this.editSession || this.member()?.id !== member.id) {
            return;
          }
          this.saving.set(false);
          this.editError.set(true);
        },
      });
  }

  openReactivateDialog(): void {
    if (!this.canReactivate() || this.reactivateOpen()) {
      return;
    }
    ++this.reactivateSession;
    this.reactivateError.set(false);
    this.reactivateSuccess.set(false);
    this.reactivateOpen.set(true);
  }

  closeReactivateDialog(): void {
    ++this.reactivateSession;
    this.reactivateOpen.set(false);
    this.reactivating.set(false);
  }

  confirmReactivate(): void {
    const member = this.member();
    if (!this.canReactivate() || !member || !this.reactivateOpen() || this.reactivating()) {
      return;
    }
    const session = this.reactivateSession;
    this.reactivating.set(true);
    this.reactivateError.set(false);
    this.membersService
      .reactivateMember(member.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reactivated) => {
          if (this.member()?.id !== member.id) {
            return;
          }
          this.member.set(reactivated);
          if (session !== this.reactivateSession) {
            return;
          }
          this.closeReactivateDialog();
          this.reactivateSuccess.set(true);
        },
        error: () => {
          if (session !== this.reactivateSession || this.member()?.id !== member.id) {
            return;
          }
          this.reactivating.set(false);
          this.reactivateError.set(true);
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
