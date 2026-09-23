import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CatgoriesDeRevenuService, CreateCampaignRequest } from '@api';
import type { CampaignCategoryAmountInput, IncomeCategory } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { ActionButton } from '@shared/action-button/action-button';
import type { CustomSelectOption } from '@shared/custom-select/custom-select';
import { CustomSelect } from '@shared/custom-select/custom-select';

/**
 * Valide que la date de fin n'est pas antérieure à la date de début
 * (T-66, RG-COT-005, contrat `CreateCampaignRequest.endDate` : "Doit être
 * postérieure ou égale à startDate."). Les deux valeurs sont des dates
 * `format: date` (chaînes `yyyy-MM-dd`), comparables lexicographiquement
 * sans conversion (même validateur que `SocialFundCreateForm`, T-84).
 */
const dateRangeValidator: ValidatorFn = (group) => {
  const startDate = group.get('startDate')?.value as string;
  const endDate = group.get('endDate')?.value as string;
  return startDate && endDate && endDate < startDate ? { dateRange: true } : null;
};

/**
 * Rejette un nom vide ou composé uniquement d'espaces : `Validators.required`
 * seul laisse passer un nom "blanc", envoyé vide après `trim()` alors que
 * `CreateCampaignRequest.name` impose `minLength: 1` et `pattern: '.*\S.*'`.
 */
function requireNonBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim().length === 0 ? { required: true } : null;
}

/**
 * Formulaire de création de campagne (T-65, US-COT-001) : Nom, Description,
 * Date de début, Date de fin, Membres concernés. Construit la requête
 * `CreateCampaignRequest` (openapi:`createCampaign`) et l'émet via
 * `submitted` ; n'appelle pas `POST /campaigns` lui-même, l'appel API et le
 * rafraîchissement de la liste restent à la charge du composant appelant
 * (même répartition des responsabilités que `SocialFundCreateForm`, T-84).
 *
 * Membres concernés : le contrat `CreateCampaignRequest.memberSelection`
 * n'expose qu'une seule valeur pour le MVP (`ALL_ACTIVE_MEMBERS`, "Périmètre
 * unique exposé par l'IHM du MVP"). Le champ est donc affiché en lecture
 * seule (aucune sélection réelle de membres n'est possible côté IHM), pas
 * masqué : il reste visible pour rappeler le périmètre appliqué à la
 * création (photographie des membres actifs, RG-COT).
 *
 * Barème (`categoryAmounts`) : le contrat impose d'envoyer, dans la même
 * requête atomique, une entrée par catégorie de revenu portée par au moins
 * un membre actif (`minItems: 1`). Ce formulaire (T-65) ne collecte pas les
 * montants du barème, ticketisés séparément (T-68, formulaire de
 * configuration du barème) : il charge les catégories via
 * `GET /income-categories` (`CatgoriesDeRevenuService`, même dépendance que
 * `MemberCreateForm`, T-33), retient celles portées par au moins un membre
 * (`memberCount > 0`) et leur associe un montant provisoire de 0 GNF pour
 * satisfaire le contrat. Le montant réel se configure ensuite via
 * `PUT /campaigns/{campaignId}/category-amounts` (T-68), possible tant que
 * la campagne n'a pas démarré et qu'aucun règlement n'existe. La soumission
 * est bloquée si aucune catégorie n'est portée par un membre actif : la
 * création d'une campagne sans aucune cotisation à établir n'est pas
 * possible côté contrat.
 */
@Component({
  selector: 'app-campaign-create-form',
  imports: [ReactiveFormsModule, TranslocoPipe, ActionButton, CustomSelect],
  templateUrl: './campaign-create-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignCreateForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly incomeCategoriesService = inject(CatgoriesDeRevenuService);
  private readonly destroyRef = inject(DestroyRef);

  readonly submitting = input(false);
  readonly submitted = output<CreateCampaignRequest>();
  readonly cancelled = output<void>();

  readonly categoriesLoading = signal(true);
  readonly categoriesError = signal(false);
  readonly memberSelectionOptions: readonly CustomSelectOption[] = [
    {
      value: 'ALL_ACTIVE_MEMBERS',
      label: '',
      translationKey: 'campaigns.create.fields.memberSelectionAllActive',
    },
  ];
  private readonly categories = signal<IncomeCategory[]>([]);

  /** Catégories effectivement portées par au moins un membre (RG contrat `categoryAmounts`). */
  readonly eligibleCategories = computed(() =>
    this.categories().filter((category) => category.memberCount > 0),
  );

  readonly noEligibleCategories = computed(
    () =>
      !this.categoriesLoading() &&
      !this.categoriesError() &&
      this.eligibleCategories().length === 0,
  );

  readonly form = this.formBuilder.group(
    {
      name: this.formBuilder.nonNullable.control('', [
        Validators.required,
        requireNonBlank,
        Validators.maxLength(150),
      ]),
      description: this.formBuilder.nonNullable.control('', Validators.maxLength(1000)),
      startDate: this.formBuilder.nonNullable.control('', Validators.required),
      endDate: this.formBuilder.nonNullable.control('', Validators.required),
    },
    { validators: dateRangeValidator },
  );

  constructor() {
    this.incomeCategoriesService
      .listIncomeCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.categoriesLoading.set(false);
        },
        error: () => {
          this.categoriesError.set(true);
          this.categoriesLoading.set(false);
        },
      });
  }

  nameInvalid(): boolean {
    const control = this.form.controls.name;
    return control.invalid && control.touched;
  }

  descriptionInvalid(): boolean {
    const control = this.form.controls.description;
    return control.invalid && control.touched;
  }

  startDateInvalid(): boolean {
    const control = this.form.controls.startDate;
    return control.invalid && control.touched;
  }

  /** Erreur propre au champ (date de fin absente), distincte de l'incohérence de plage. */
  endDateRequiredInvalid(): boolean {
    const control = this.form.controls.endDate;
    return control.invalid && control.touched;
  }

  /** Incohérence de plage (fin antérieure au début) : erreur portée par le groupe, pas le champ. */
  dateRangeInvalid(): boolean {
    return (
      Boolean(this.form.errors?.['dateRange']) &&
      this.form.controls.startDate.touched &&
      this.form.controls.endDate.touched
    );
  }

  endDateInvalid(): boolean {
    return this.endDateRequiredInvalid() || this.dateRangeInvalid();
  }

  submit(): void {
    if (this.submitting() || this.categoriesLoading() || this.noEligibleCategories()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const categoryAmounts: CampaignCategoryAmountInput[] = this.eligibleCategories().map(
      (category) => ({ incomeCategoryId: category.id, amount: 0 }),
    );
    const request: CreateCampaignRequest = {
      name: raw.name.trim(),
      startDate: raw.startDate,
      endDate: raw.endDate,
      memberSelection: CreateCampaignRequest.MemberSelectionEnum.AllActiveMembers,
      categoryAmounts: new Set(categoryAmounts),
      ...(raw.description.trim() ? { description: raw.description.trim() } : {}),
    };
    this.submitted.emit(request);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
