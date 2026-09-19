import type { ElementRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import type { FormControl } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CampagnesService, CampaignStatus, ErrorCode, UserRole } from '@api';
import type {
  Campaign,
  CampaignCategoryAmountInput,
  ErrorResponse,
  UpdateCampaignCategoryAmountsRequest,
} from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { SessionService } from '@core/session/session.service';
import type { TranslationKey } from '@core/i18n/translation-keys';
import { AmountInput } from '@shared/amount-input/amount-input';
import { FormDialog } from '@shared/form-dialog/form-dialog';
import { LoadingSkeleton } from '@shared/loading-skeleton/loading-skeleton';
import { formatCalendarDate } from '../campaign-dates';
import { campaignStatusLabel } from '../campaign-status-labels';
import { CampaignBilanTab } from '../components/campaign-bilan-tab/campaign-bilan-tab';
import { CampaignDuesTab } from '../components/campaign-dues-tab/campaign-dues-tab';

/** Identifiant d'un onglet de l'écran détail de campagne (T-60, US-COT-004). */
export type CampaignDetailTab = 'bareme' | 'cotisations' | 'bilan';

const CAMPAIGN_DETAIL_TABS: readonly CampaignDetailTab[] = ['bareme', 'cotisations', 'bilan'];

/**
 * Écran détail de campagne (T-60, `openapi:getCampaign`) : informations
 * générales de la campagne et trois onglets, barème, cotisations, bilan,
 * accessibles sans rechargement de page (`campaigns.routes.ts` restreint
 * déjà l'accès aux mêmes rôles que la liste via `roleGuard`).
 *
 * L'onglet cotisations (T-61) charge la situation paginée des membres via
 * `openapi:listCampaignDues`. Le bilan (T-77) affiche total attendu, total
 * encaissé et reste à encaisser à partir de `campaign.financialSummary`,
 * déjà inclus dans la réponse `openapi:getCampaign` : aucun appel réseau
 * supplémentaire n'est effectué pour cet onglet.
 *
 * La sélection d'onglet utilise le motif ARIA `tablist`/`tab`/`tabpanel` avec
 * un `tabindex` "roving" (0 pour l'onglet actif, -1 pour les autres, T-64) :
 * les flèches gauche/droite déplacent le focus et activent l'onglet visé
 * sans rechargement de page (état local `activeTab`, aucune navigation
 * `Router`), en plus du changement au clic/Entrée/Espace déjà validé (T-60).
 *
 * Formulaire de configuration du barème (T-68, `openapi:updateCampaignCategoryAmounts`) :
 * un champ de saisie de montant par catégorie de revenu déjà portée par la
 * campagne, réservé à l'Administrateur et au Trésorier, et proposé uniquement
 * tant que la campagne est à venir (`CampaignStatus.Upcoming`), conformément à
 * la contrainte contractuelle (avant la date de début, sans règlement existant).
 * Ce contrôle IHM ne remplace pas l'autorisation backend : une tentative hors
 * de cette fenêtre échoue côté serveur avec `CAMPAIGN_NOT_EDITABLE` (409),
 * affiché comme message d'erreur si elle survient malgré tout (par exemple si
 * la campagne a démarré entre le chargement de l'écran et l'enregistrement).
 * L'état retourné par l'appel remplace la campagne affichée (montants,
 * membres concernés et montants attendus recalculés), sans recalcul local.
 *
 * Signalement visuel d'une catégorie sans montant configuré (T-69) : une
 * catégorie dont le montant vaut `0` (valeur par défaut à la création de la
 * campagne, `campaign-create-form.ts`) est repérée par un badge dédié dans le
 * tableau du barème, en lecture comme en édition, avec un libellé explicite
 * en plus de la couleur (`categoryAmountUnconfigured`).
 *
 * Limite connue : le formatage GNF en direct pendant la frappe (T-70) reste un
 * ticket dédié ; ce formulaire utilise déjà `AmountInput` (T-19), qui reformate
 * en direct.
 *
 * Clôture de la campagne (T-80, US-COT-008, `openapi:closeCampaign`) : action
 * réservée à l'Administrateur et au Trésorier, proposée uniquement tant que la
 * campagne n'est pas déjà clôturée. Une boîte de confirmation explicite (le
 * dialogue générique `FormDialog`, T-15) rappelle que l'opération est
 * définitive avant l'appel à `POST /campaigns/{campaignId}/closure`. L'état
 * retourné par l'appel remplace la campagne affichée.
 *
 * Verrouillage des actions de modification sur une campagne clôturée (T-81) :
 * l'édition du barème est déjà exclue par `canEditBaremeNow` (proposée
 * uniquement tant que la campagne est à venir, donc jamais sur une campagne
 * clôturée). L'enregistrement d'un nouveau règlement est masqué par
 * `CampaignDuesTab` via l'entrée `campaignClosed`, calculée ici à partir du
 * statut de la campagne. L'ajout d'un membre concerné n'est proposé nulle
 * part après création (les membres concernés sont fixés, non modifiables,
 * à la création de la campagne, T-65) : aucune action supplémentaire à
 * désactiver pour ce ticket. Ce contrôle IHM ne remplace pas l'autorisation
 * serveur.
 */
@Component({
  selector: 'app-campaign-detail-page',
  imports: [
    TranslocoPipe,
    ReactiveFormsModule,
    AmountInput,
    CampaignDuesTab,
    CampaignBilanTab,
    FormDialog,
    LoadingSkeleton,
  ],
  templateUrl: './campaign-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly campaignsService = inject(CampagnesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionService = inject(SessionService);
  private readonly formBuilder = inject(FormBuilder);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly campaign = signal<Campaign | null>(null);
  readonly activeTab = signal<CampaignDetailTab>(CAMPAIGN_DETAIL_TABS[0]);

  readonly formatCalendarDate = formatCalendarDate;
  readonly formatGnfAmountDetailed = formatGnfAmountDetailed;
  readonly campaignStatusLabel = campaignStatusLabel;
  readonly tabs = CAMPAIGN_DETAIL_TABS;

  /** Boutons d'onglets, dans l'ordre du DOM (T-64 : focus programmatique flèches gauche/droite). */
  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  readonly categoryAmounts = computed(() => this.campaign()?.categoryAmounts ?? []);

  /**
   * Catégorie sans montant configuré dans le barème (T-69) : `0` est la
   * valeur par défaut attribuée à la création de la campagne
   * (`campaign-create-form.ts`), avant toute saisie d'un montant dédié.
   */
  categoryAmountUnconfigured(amount: number): boolean {
    return amount === 0;
  }

  /** Campagne clôturée (T-81) : transmis à `CampaignDuesTab` pour masquer l'enregistrement d'un nouveau règlement. */
  readonly campaignClosed = computed(() => this.campaign()?.status === CampaignStatus.Closed);

  /** Administrateur/Trésorier seuls : Opérateur et Membre n'éditent jamais le barème. */
  readonly canEditBareme = computed(() => {
    const role = this.sessionService.user()?.role;
    return role === UserRole.Administrator || role === UserRole.Treasurer;
  });

  /** Édition proposée uniquement avant la date de début de la campagne. */
  readonly canEditBaremeNow = computed(
    () => this.canEditBareme() && this.campaign()?.status === CampaignStatus.Upcoming,
  );

  readonly editingBareme = signal(false);
  readonly submittingBareme = signal(false);
  readonly baremeErrorMessage = signal<TranslationKey | null>(null);

  readonly baremeAmounts = this.formBuilder.array<FormControl<number | null>>([]);
  readonly baremeForm = this.formBuilder.group({ amounts: this.baremeAmounts });

  /** Invalide toute réponse encore en vol si l'écran change de campagne ou d'état d'édition. */
  private baremeRequestToken = 0;

  /** Administrateur/Trésorier seuls : Opérateur et Membre ne clôturent jamais une campagne. */
  readonly canCloseCampaign = computed(() => {
    const role = this.sessionService.user()?.role;
    return role === UserRole.Administrator || role === UserRole.Treasurer;
  });

  /** Action proposée uniquement tant que la campagne n'est pas déjà clôturée. */
  readonly canCloseCampaignNow = computed(
    () => this.canCloseCampaign() && this.campaign()?.status !== CampaignStatus.Closed,
  );

  readonly closeCampaignDialogOpen = signal(false);
  readonly closingCampaign = signal(false);
  readonly closeCampaignErrorMessage = signal<TranslationKey | null>(null);

  /** Invalide toute réponse encore en vol si l'écran change de campagne. */
  private closeCampaignRequestToken = 0;

  constructor() {
    const campaignId = this.route.snapshot.paramMap.get('campaignId');
    if (campaignId) {
      this.loadCampaign(campaignId);
    } else {
      this.loading.set(false);
      this.loadError.set(true);
    }
  }

  selectTab(tab: CampaignDetailTab): void {
    this.activeTab.set(tab);
  }

  isActiveTab(tab: CampaignDetailTab): boolean {
    return this.activeTab() === tab;
  }

  /**
   * Navigation clavier flèches gauche/droite entre onglets (T-64) : déplace
   * l'onglet actif et le focus sans rechargement de page, avec retour au
   * premier onglet après le dernier et inversement (comportement "roving
   * tabindex" du motif ARIA `tab`, cf. WAI-ARIA Authoring Practices).
   */
  onTabsKeydown(event: KeyboardEvent): void {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (delta === 0) {
      return;
    }

    event.preventDefault();
    const currentIndex = this.tabs.indexOf(this.activeTab());
    const nextIndex = (currentIndex + delta + this.tabs.length) % this.tabs.length;
    const nextTab = this.tabs[nextIndex];
    this.selectTab(nextTab);
    this.tabButtons()[nextIndex]?.nativeElement.focus();
  }

  startEditingBareme(): void {
    if (!this.canEditBaremeNow()) {
      return;
    }

    this.baremeRequestToken++;
    this.baremeAmounts.clear();
    for (const categoryAmount of this.categoryAmounts()) {
      this.baremeAmounts.push(
        this.formBuilder.control<number | null>(categoryAmount.amount, [
          Validators.required,
          Validators.min(0),
        ]),
      );
    }
    this.baremeErrorMessage.set(null);
    this.submittingBareme.set(false);
    this.editingBareme.set(true);
  }

  cancelEditingBareme(): void {
    this.baremeRequestToken++;
    this.editingBareme.set(false);
    this.submittingBareme.set(false);
    this.baremeErrorMessage.set(null);
  }

  submitBareme(): void {
    const campaign = this.campaign();
    if (!campaign || this.submittingBareme()) {
      return;
    }

    if (this.baremeForm.invalid) {
      this.baremeForm.markAllAsTouched();
      return;
    }

    const categoryAmounts = this.categoryAmounts();
    const amounts = this.baremeAmounts.getRawValue();
    const categoryAmountInputs: CampaignCategoryAmountInput[] = categoryAmounts.map(
      (categoryAmount, index) => ({
        incomeCategoryId: categoryAmount.incomeCategory.id,
        amount: amounts[index] ?? 0,
      }),
    );
    // `categoryAmounts` est typé `Set<...>` par le générateur (uniqueItems du
    // contrat), mais le corps JSON transmis doit rester un tableau : un vrai
    // `Set` se sérialiserait en `{}` (`JSON.stringify(new Set(...))`). On
    // conserve donc un tableau au moment de l'appel, avec ce transtypage vers
    // le type généré uniquement pour satisfaire le compilateur.
    const payload: UpdateCampaignCategoryAmountsRequest = {
      categoryAmounts:
        categoryAmountInputs as unknown as UpdateCampaignCategoryAmountsRequest['categoryAmounts'],
    };

    this.submittingBareme.set(true);
    this.baremeErrorMessage.set(null);
    const token = ++this.baremeRequestToken;

    this.campaignsService
      .updateCampaignCategoryAmounts(campaign.id, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedCampaign) => {
          if (token !== this.baremeRequestToken) {
            return;
          }
          this.campaign.set(updatedCampaign);
          this.submittingBareme.set(false);
          this.editingBareme.set(false);
        },
        error: (error: unknown) => {
          if (token !== this.baremeRequestToken) {
            return;
          }
          this.submittingBareme.set(false);
          this.baremeErrorMessage.set(this.resolveBaremeErrorKey(error));
        },
      });
  }

  private resolveBaremeErrorKey(error: unknown): TranslationKey {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as ErrorResponse | undefined;
      switch (body?.code) {
        case ErrorCode.CampaignNotEditable:
          return 'campaigns.detail.bareme.errorNotEditable';
        case ErrorCode.ValidationError:
          return 'campaigns.detail.bareme.errorValidation';
        case ErrorCode.ResourceNotFound:
          return 'campaigns.detail.bareme.errorNotFound';
        case ErrorCode.AccessDenied:
          return 'campaigns.detail.bareme.errorAccessDenied';
        default:
          return 'campaigns.detail.bareme.error';
      }
    }
    return 'campaigns.detail.bareme.error';
  }

  openCloseCampaignDialog(): void {
    if (!this.canCloseCampaignNow() || this.closeCampaignDialogOpen()) {
      return;
    }

    this.closeCampaignErrorMessage.set(null);
    this.closingCampaign.set(false);
    this.closeCampaignDialogOpen.set(true);
  }

  cancelCloseCampaignDialog(): void {
    this.closeCampaignRequestToken++;
    this.closeCampaignDialogOpen.set(false);
    this.closingCampaign.set(false);
    this.closeCampaignErrorMessage.set(null);
  }

  /**
   * Confirme la clôture (US-COT-008) : l'état renvoyé par le serveur est
   * appliqué même si le dialogue a été fermé (Échap, bouton Fermer/Annuler)
   * avant la réponse, pour ne pas afficher une campagne close comme ouverte.
   * Seul l'état visuel du dialogue (fermeture, erreur) reste rattaché au
   * jeton de requête courant.
   */
  confirmCloseCampaign(): void {
    const campaign = this.campaign();
    if (!campaign || this.closingCampaign()) {
      return;
    }

    this.closingCampaign.set(true);
    this.closeCampaignErrorMessage.set(null);
    const token = ++this.closeCampaignRequestToken;
    // Invalide toute mutation de barème en cours : sa réponse arrivant après
    // la clôture ne doit pas réintroduire un état de campagne antérieur
    // (souvent UPCOMING/OPEN) par-dessus la campagne désormais CLOSED.
    this.baremeRequestToken++;

    this.campaignsService
      .closeCampaign(campaign.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (closedCampaign) => {
          this.campaign.set(closedCampaign);
          if (token !== this.closeCampaignRequestToken) {
            return;
          }
          this.closingCampaign.set(false);
          this.closeCampaignDialogOpen.set(false);
        },
        error: (error: unknown) => {
          if (token !== this.closeCampaignRequestToken) {
            return;
          }
          this.closingCampaign.set(false);
          this.closeCampaignErrorMessage.set(this.resolveCloseCampaignErrorKey(error));
        },
      });
  }

  private resolveCloseCampaignErrorKey(error: unknown): TranslationKey {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as ErrorResponse | undefined;
      switch (body?.code) {
        case ErrorCode.CampaignAlreadyClosed:
          return 'campaigns.detail.close.errorAlreadyClosed';
        case ErrorCode.ResourceNotFound:
          return 'campaigns.detail.close.errorNotFound';
        case ErrorCode.AccessDenied:
          return 'campaigns.detail.close.errorAccessDenied';
        default:
          return 'campaigns.detail.close.error';
      }
    }
    return 'campaigns.detail.close.error';
  }

  private loadCampaign(campaignId: string): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.campaignsService
      .getCampaign(campaignId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (campaign) => {
          this.campaign.set(campaign);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }
}
