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
import { MemberPaymentsTab } from '../components/member-payments-tab/member-payments-tab';
import { memberStatusLabel } from '../members-status-labels';

/** Identifiant d'un onglet de la fiche membre (T-29, US-MEM-003). */
export type MemberDetailTab = 'reglements';

/**
 * Un seul onglet est livré par ce ticket (T-29, historique des règlements).
 * Les onglets situation des cotisations (T-28) et contributions aux
 * cagnottes (T-30) restent des tickets dédiés qui étendront ce tableau ; la
 * navigation clavier flèches gauche/droite entre onglets (T-31) reste elle
 * aussi un ticket séparé.
 */
const MEMBER_DETAIL_TABS: readonly MemberDetailTab[] = ['reglements'];

/**
 * Écran fiche membre (T-27) : appelle `GET /members/{memberId}` (`@api`,
 * `MembresService.getMember`) et affiche le bloc informations personnelles
 * (Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone), catégorie de revenu,
 * fonction associative et statut, conformément à US-MEM-003. L'identifiant
 * du membre provient du paramètre de route `memberId`, atteint depuis une
 * ligne de la liste des membres (T-21).
 *
 * Onglet historique des règlements (T-29, `openapi:listPayments`) : liste,
 * du plus récent au plus ancien, les règlements du membre toutes campagnes
 * confondues, via `MemberPaymentsTab`. Le motif ARIA `tablist`/`tab`/
 * `tabpanel` est déjà posé pour accueillir les onglets à venir (T-28, T-30),
 * sans navigation clavier flèches gauche/droite (T-31, ticket séparé).
 *
 * Limite connue : la situation des cotisations et les contributions aux
 * cagnottes prévues par US-MEM-003 relèvent des tickets T-28 et T-30
 * (contenu des onglets à ajouter). La restriction de la vue Opérateur
 * (RG-MEM-008, T-23) et la variante de modification Opérateur (T-39)
 * restent à livrer. La modification complète Administrateur/Trésorier est
 * fournie par T-38.
 */
@Component({
  selector: 'app-member-detail-page',
  imports: [TranslocoPipe, RouterLink, FormDialog, MemberEditForm, MemberPaymentsTab],
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

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly notFound = signal(false);
  readonly member = signal<MemberDetails | null>(null);

  readonly activeTab = signal<MemberDetailTab>(MEMBER_DETAIL_TABS[0]);
  readonly tabs = MEMBER_DETAIL_TABS;

  readonly memberStatusLabel = memberStatusLabel;

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('memberId')),
        filter((memberId): memberId is string => memberId !== null),
        tap(() => {
          this.closeEditDialog();
          this.editSuccess.set(false);
          this.activeTab.set(MEMBER_DETAIL_TABS[0]);
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
  selectTab(tab: MemberDetailTab): void {
    this.activeTab.set(tab);
  }

  isActiveTab(tab: MemberDetailTab): boolean {
    return this.activeTab() === tab;
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
