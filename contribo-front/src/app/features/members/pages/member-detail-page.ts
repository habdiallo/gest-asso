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
import { ErrorCode, MembresService, UserRole } from '@api';
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
 * Lecture seule pour un Opérateur non autorisé aux paiements (T-32, §2.3) :
 * `canRecordPayments` réutilise le flag `operatorCanRecordPayments` déjà
 * exposé par `SessionService` (T-13) pour signaler qu'aucune action
 * d'enregistrement de règlement ni de contribution n'est disponible pour cet
 * utilisateur. Cette route est déjà réservée à Administrateur, Trésorier et
 * Opérateur (garde `roleGuard` de `app.routes.ts`) ; l'Administrateur et le
 * Trésorier restent toujours autorisés.
 *
 * Limite connue : la situation des cotisations, l'historique des règlements
 * et les contributions aux cagnottes prévus par US-MEM-003 relèvent des
 * tickets T-28, T-29 et T-30 (contenu des onglets), qui n'existent pas encore
 * sur cet écran. Ces futurs onglets, ainsi que le formulaire d'enregistrement
 * d'un règlement (T-71), devront masquer leurs propres actions en consultant
 * `canRecordPayments` plutôt que de la revérifier différemment.
 * La variante de modification Opérateur (T-39) reste à livrer.
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
  readonly canRecordPayments = computed(() => this.sessionService.canRecordPayments());
  readonly editOpen = signal(false);
  readonly saving = signal(false);
  readonly editError = signal(false);
  readonly editSuccess = signal(false);

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
}

function isResourceNotFound(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse)) {
    return false;
  }
  const body = error.error as ErrorResponse | undefined;
  return body?.code === ErrorCode.ResourceNotFound;
}
