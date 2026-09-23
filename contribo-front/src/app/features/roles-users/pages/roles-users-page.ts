import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserRole, UtilisateursEtRlesService } from '@api';
import type { UserAccount, UserAccountPage } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { ActionButton } from '@shared/action-button/action-button';
import { EmptyState } from '@shared/empty-state/empty-state';
import { FormDialog } from '@shared/form-dialog/form-dialog';
import type { CustomSelectOption } from '@shared/custom-select/custom-select';
import { CustomSelect } from '@shared/custom-select/custom-select';
import { Subject, catchError, of, switchMap } from 'rxjs';
import { operatorAuthorizationLabel, userRoleLabel } from '../roles-users-labels';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Écran liste des utilisateurs avec rôle applicatif affiché (T-52), réservé à
 * l'Administrateur (RG-ROLE-002, garde de route `roleGuard` dans
 * `roles-users.routes.ts`). Appelle `GET /users` (`@api`,
 * `UtilisateursEtRlesService.listUsers`) avec recherche et filtre de rôle du
 * contrat (`q`, `role`), pagination incluse. La recherche texte est débattue
 * manuellement (setTimeout) avant de déclencher `refetch$`, afin que le
 * chargement initial reste immédiat (cf. `.claude/rules/frontend/angular.md`,
 * gestion des erreurs dans la requête du `switchMap` pour permettre les
 * recherches suivantes).
 *
 * Le sélecteur de rôle applicatif (T-53) ouvre, depuis la "fiche" d'un
 * utilisateur (dialogue `app-form-dialog`, composant partagé T-15), les 4
 * rôles du contrat et appelle `PUT /users/{userId}` (`updateUserAccess`,
 * openapi:`UpdateUserAccessRequest`).
 *
 * Le contrôle `peut_enregistrer_paiements` (T-55, §2.3, RG-ROLE-007 à
 * RG-ROLE-009) réutilise la même fiche et le même appel `updateUserAccess`,
 * le contrat n'exposant pas d'opération dédiée : la case à cocher
 * n'apparaît que lorsque le rôle sélectionné dans la fiche est Opérateur,
 * initialisée à la valeur courante du compte à l'ouverture. Pour tout autre
 * rôle, `operatorCanRecordPayments` est forcé à `false`, conformément à la
 * contrainte du contrat ("operatorCanRecordPayments doit être false pour
 * tout rôle différent de OPERATOR"). La fonction associative n'est ni
 * affichée ni modifiée depuis cet écran (RG-ROLE-006, T-54).
 *
 * Limite connue : ni l'affichage de la fonction associative (T-54), ni le
 * masquage complet du contrôle `peut_enregistrer_paiements` en dehors de
 * cette fiche pour un compte non-Opérateur (T-56) ne sont couverts ici.
 *
 * Le tableau et les commandes de pagination restent montés pendant un
 * rechargement (recherche, filtre ou changement de page) : seules
 * `previousDisabled`/`nextDisabled` évoluent via `aria-disabled`, sans
 * démonter les boutons. Cela conserve la navigation clavier et le focus sur
 * le bouton actionné, conformément à `.claude/rules/frontend/accessibilite.md`.
 */
@Component({
  selector: 'app-roles-users-page',
  imports: [TranslocoPipe, ActionButton, EmptyState, FormDialog, CustomSelect],
  templateUrl: './roles-users-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesUsersPage {
  private readonly usersService = inject(UtilisateursEtRlesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly roleOptions: readonly UserRole[] = [
    UserRole.Administrator,
    UserRole.Treasurer,
    UserRole.Operator,
    UserRole.Member,
  ];
  readonly roleSelectOptions: readonly CustomSelectOption[] = this.roleOptions.map((role) => ({
    value: role,
    label: userRoleLabel(role),
  }));
  readonly roleFilterSelectOptions: readonly CustomSelectOption[] = [
    { value: '', label: '', translationKey: 'rolesUsers.roleFilterAll' },
    ...this.roleSelectOptions,
  ];
  /** Rôle pour lequel le contrôle `peut_enregistrer_paiements` (T-55) s'applique. */
  readonly operatorRole = UserRole.Operator;

  readonly searchTerm = signal('');
  readonly roleFilter = signal<UserRole | ''>('');
  readonly page = signal(0);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  private readonly result = signal<UserAccountPage | null>(null);

  readonly users = computed<UserAccount[]>(() => this.result()?.items ?? []);
  readonly pageMetadata = computed(() => this.result()?.page ?? null);
  readonly hasLoadedOnce = computed(() => this.result() !== null);
  readonly hasPreviousPage = computed(() => this.page() > 0);
  readonly hasNextPage = computed(() => {
    const metadata = this.pageMetadata();
    return metadata !== null && this.page() + 1 < metadata.totalPages;
  });
  readonly previousDisabled = computed(() => !this.hasPreviousPage() || this.loading());
  readonly nextDisabled = computed(() => !this.hasNextPage() || this.loading());

  readonly userRoleLabel = userRoleLabel;
  readonly operatorAuthorizationLabel = operatorAuthorizationLabel;

  /** Compte dont la fiche de changement de rôle (T-53) est ouverte, ou `null` si fermée. */
  readonly roleDialogAccount = signal<UserAccount | null>(null);
  /** Rôle sélectionné dans le dialogue, initialisé au rôle courant à l'ouverture. */
  readonly roleDraft = signal<UserRole | null>(null);
  /**
   * État de `peut_enregistrer_paiements` (T-55) sélectionné dans la fiche,
   * initialisé à la valeur courante du compte à l'ouverture. N'est pertinent
   * et affiché que lorsque `roleDraft()` vaut Opérateur.
   */
  readonly operatorAuthorizationDraft = signal(false);
  readonly savingRole = signal(false);
  readonly roleSaveError = signal(false);

  private readonly refetch = new Subject<void>();
  private searchDebounceHandle: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.refetch
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          this.loadError.set(false);
          return this.usersService
            .listUsers(
              this.page(),
              PAGE_SIZE,
              this.searchTerm() || undefined,
              this.roleFilter() || undefined,
            )
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        this.loading.set(false);
        if (!page) {
          this.loadError.set(true);
          return;
        }
        this.result.set(page);
        const lastPageIndex = Math.max(0, page.page.totalPages - 1);
        if (this.page() > lastPageIndex) {
          this.page.set(lastPageIndex);
          this.refetch.next();
        }
      });

    this.refetch.next();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    clearTimeout(this.searchDebounceHandle);
    this.searchDebounceHandle = setTimeout(() => {
      this.searchTerm.set(value);
      this.page.set(0);
      this.refetch.next();
    }, SEARCH_DEBOUNCE_MS);
  }

  onRoleFilterChange(value: string | null): void {
    this.roleFilter.set((value ?? '') as UserRole | '');
    this.page.set(0);
    this.refetch.next();
  }

  goToPreviousPage(): void {
    if (this.previousDisabled()) {
      return;
    }
    this.page.update((current) => current - 1);
    this.refetch.next();
  }

  goToNextPage(): void {
    if (this.nextDisabled()) {
      return;
    }
    this.page.update((current) => current + 1);
    this.refetch.next();
  }

  /** Ouvre la fiche de changement de rôle (T-53) pour le compte donné. */
  openRoleDialog(account: UserAccount): void {
    this.roleDialogAccount.set(account);
    this.roleDraft.set(account.role);
    this.operatorAuthorizationDraft.set(account.operatorCanRecordPayments);
    this.roleSaveError.set(false);
  }

  /** Ferme la fiche, quelle que soit la cause (Échap, bouton Annuler, succès). */
  closeRoleDialog(): void {
    this.roleDialogAccount.set(null);
    this.roleDraft.set(null);
    this.operatorAuthorizationDraft.set(false);
    this.roleSaveError.set(false);
    this.savingRole.set(false);
  }

  onRoleDraftChange(value: string | null): void {
    this.roleDraft.set((value ?? '') as UserRole);
  }

  /** Bascule l'état de `peut_enregistrer_paiements` (T-55) dans la fiche ouverte. */
  onOperatorAuthorizationDraftChange(event: Event): void {
    this.operatorAuthorizationDraft.set((event.target as HTMLInputElement).checked);
  }

  /**
   * Confirme le changement de rôle (US-ROLE-001) et, le cas échéant, l'état
   * de `peut_enregistrer_paiements` (T-55) : appelle `updateUserAccess` avec
   * la valeur sélectionnée dans la fiche pour un rôle Opérateur, forcée à
   * `false` sinon (contrainte du contrat).
   *
   * La requête est rattachée à `account.id` : si la fiche a été fermée puis
   * une autre ouverte entre-temps, une réponse tardive ne touche plus l'état
   * du dialogue (fermeture, `savingRole`, erreur) désormais associé à cette
   * autre fiche. En cas de succès, la liste est rechargée avec les critères
   * courants (recherche/filtre/page) plutôt qu'un remplacement local, afin
   * qu'une ligne qui ne correspond plus au filtre de rôle actif disparaisse
   * et que les métadonnées de pagination restent cohérentes.
   */
  confirmRoleChange(event: Event, account: UserAccount): void {
    event.preventDefault();
    if (this.savingRole()) {
      return;
    }
    const role = this.roleDraft();
    if (!role) {
      return;
    }

    const accountId = account.id;
    const operatorCanRecordPayments =
      role === UserRole.Operator ? this.operatorAuthorizationDraft() : false;

    this.savingRole.set(true);
    this.roleSaveError.set(false);
    this.usersService
      .updateUserAccess(accountId, { role, operatorCanRecordPayments })
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((updated) => {
        const dialogStillOpenForThisAccount = this.roleDialogAccount()?.id === accountId;
        if (dialogStillOpenForThisAccount) {
          this.savingRole.set(false);
        }
        if (!updated) {
          if (dialogStillOpenForThisAccount) {
            this.roleSaveError.set(true);
          }
          return;
        }
        if (dialogStillOpenForThisAccount) {
          this.closeRoleDialog();
        }
        this.refetch.next();
      });
  }
}
