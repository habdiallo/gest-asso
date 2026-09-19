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
import { MemberContributionsTab } from '../components/member-contributions-tab/member-contributions-tab';
import { MemberDuesTab } from '../components/member-dues-tab/member-dues-tab';
import { MemberEditForm } from '../components/member-edit-form/member-edit-form';
import { MemberPaymentsTab } from '../components/member-payments-tab/member-payments-tab';
import { memberIsActive, memberStatusLabel } from '../members-status-labels';

/** Identifiant d'un onglet de la fiche membre (US-MEM-003). */
export type MemberDetailTab = 'informations' | 'cotisations' | 'reglements' | 'contributions';

/**
 * Onglets "Situation des cotisations" (T-28), "Historique des règlements"
 * (T-29) et "Contributions aux cagnottes" (T-30) livrés par ces tickets. La
 * navigation clavier flèches gauche/droite entre onglets (T-31) reste un
 * ticket séparé.
 */
const MEMBER_DETAIL_TABS: readonly MemberDetailTab[] = [
  'informations',
  'cotisations',
  'reglements',
  'contributions',
];

/**
 * Écran fiche membre (T-27) : appelle `GET /members/{memberId}` (`@api`,
 * `MembresService.getMember`) et affiche le bloc informations personnelles
 * (Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone), catégorie de revenu,
 * fonction associative et statut, conformément à US-MEM-003. L'identifiant
 * du membre provient du paramètre de route `memberId`, atteint depuis une
 * ligne de la liste des membres (T-21).
 *
 * Onglets (US-MEM-003) : "Informations" reprend le bloc de base ;
 * "Situation des cotisations" (T-28) charge `openapi:listMemberDues` via
 * `MemberDuesTab` ; "Historique des règlements" (T-29) liste, du plus récent
 * au plus ancien, les règlements du membre toutes campagnes confondues via
 * `MemberPaymentsTab` ; "Contributions aux cagnottes" (T-30) liste, du plus
 * récent au plus ancien, les contributions du membre via
 * `MemberContributionsTab`. Activation au clic ou par Entrée/Espace, sans
 * navigation clavier flèches gauche/droite (T-31, ticket séparé).
 *
 * Action "Désactiver" (T-41, US-MEM-005) : appelle `POST
 * /members/{memberId}/deactivation` (`MembresService.deactivateMember`) pour
 * un membre actif, réservée à l'Administrateur, et remplace le membre affiché
 * par la réponse (statut Inactif), en conservant visibles les sections
 * historiques déjà livrées (cotisations, règlements, contributions). La
 * boîte de confirmation avant envoi (RG-MEM-016, T-42) reste à livrer sur un
 * ticket distinct.
 *
 * Action "Réactiver" (T-44, US-MEM-006) : appelle `POST
 * /members/{memberId}/reactivation` (`MembresService.reactivateMember`) pour
 * un membre inactif, réservée à l'Administrateur, après confirmation
 * explicite (RG-MEM-020 à RG-MEM-022). Le masquage mutuel avec l'action
 * "Désactiver" selon le statut courant (T-46) et le masquage pour les rôles
 * Trésorier/Opérateur/Membre (T-47) restent à livrer sur des tickets distincts.
 * La restriction de la vue Opérateur (RG-MEM-008, T-23) et la variante de
 * modification Opérateur (T-39) restent à livrer. La modification complète
 * Administrateur/Trésorier est fournie par T-38.
 */
@Component({
  selector: 'app-member-detail-page',
  imports: [
    TranslocoPipe,
    RouterLink,
    FormDialog,
    MemberEditForm,
    MemberDuesTab,
    MemberPaymentsTab,
    MemberContributionsTab,
  ],
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

  private deactivateSession = 0;
  readonly canDeactivate = computed(() => {
    const role = this.sessionService.user()?.role;
    return (
      role === UserRole.Administrator &&
      memberIsActive(this.member()?.status ?? MemberStatus.Inactive)
    );
  });
  readonly deactivating = signal(false);
  readonly deactivateError = signal(false);
  readonly deactivateSuccess = signal(false);

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
          ++this.deactivateSession;
          this.deactivating.set(false);
          this.deactivateError.set(false);
          this.deactivateSuccess.set(false);
          this.closeReactivateDialog();
          this.reactivateSuccess.set(false);
          this.loading.set(true);
          this.loadError.set(false);
          this.notFound.set(false);
          this.member.set(null);
          this.activeTab.set(MEMBER_DETAIL_TABS[0]);
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

  deactivateMember(): void {
    const member = this.member();
    if (!this.canDeactivate() || !member || this.deactivating()) {
      return;
    }
    const session = ++this.deactivateSession;
    this.deactivating.set(true);
    this.deactivateError.set(false);
    this.deactivateSuccess.set(false);
    this.membersService
      .deactivateMember(member.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          if (session !== this.deactivateSession || this.member()?.id !== member.id) {
            return;
          }
          this.member.set(updated);
          this.deactivating.set(false);
          this.deactivateSuccess.set(true);
        },
        error: () => {
          if (session !== this.deactivateSession || this.member()?.id !== member.id) {
            return;
          }
          this.deactivating.set(false);
          this.deactivateError.set(true);
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
