import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SocialEventType } from '@api';
import type { CreateSocialFundRequest } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { AmountInput } from '@shared/amount-input/amount-input';
import type { CustomSelectOption } from '@shared/custom-select/custom-select';
import { CustomSelect } from '@shared/custom-select/custom-select';
import { socialEventTypeLabel } from '../../social-fund-labels';

/**
 * Valide que la date de fin n'est pas antérieure à la date de début
 * (RG-CAG, contrat `CreateSocialFundRequest.endDate` : "Doit être postérieure
 * ou égale à startDate."). Les deux valeurs sont des dates `format: date`
 * (chaînes `yyyy-MM-dd`), comparables lexicographiquement sans conversion.
 */
const dateRangeValidator: ValidatorFn = (group) => {
  const startDate = group.get('startDate')?.value as string;
  const endDate = group.get('endDate')?.value as string;
  return startDate && endDate && endDate < startDate ? { dateRange: true } : null;
};

/**
 * Rejette une chaîne vide ou composée uniquement d'espaces : `Validators.required`
 * seul laisse passer un titre/bénéficiaire "blanc", envoyé vide après `trim()`
 * alors que `CreateSocialFundRequest` impose `minLength: 1` et `pattern: '.*\S.*'`.
 */
function requireNonBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim().length === 0 ? { required: true } : null;
}

/**
 * Formulaire de création d'une cagnotte (T-84, US-CAG-001) : Titre, Type
 * d'événement, Description, Personne ou famille concernée, Date de début,
 * Date de fin, Objectif facultatif. Construit la requête
 * `CreateSocialFundRequest` (openapi:`createSocialFund`) et l'émet via
 * `submitted` ; n'appelle pas `POST /social-funds` lui-même, l'appel API et
 * le rafraîchissement de la liste restent à la charge du composant appelant
 * (même répartition des responsabilités que `MemberCreateForm`, T-33).
 *
 * L'objectif facultatif (`targetAmount`, T-85) est saisi avec
 * `app-amount-input` (T-19, formatage GNF en direct, valeur entière renvoyée
 * au formulaire) ; laissé vide, il est omis de la requête (voir `submit()`
 * ci-dessous), ce qui laisse `SocialFund.targetAmount` absent côté serveur.
 * Le masquage de la barre de progression qui en découle est traité côté
 * affichage, dans `social-funds-list-page.ts`/`.html` (T-85). Le masquage de
 * l'action "Créer une cagnotte" pour l'Opérateur et le Membre (T-86,
 * RG-CAG-002/003) n'est pas traité ici.
 */
@Component({
  selector: 'app-social-fund-create-form',
  imports: [ReactiveFormsModule, TranslocoPipe, AmountInput, CustomSelect],
  templateUrl: './social-fund-create-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialFundCreateForm {
  private readonly formBuilder = inject(FormBuilder);

  readonly submitting = input(false);
  readonly submitted = output<CreateSocialFundRequest>();
  readonly cancelled = output<void>();

  readonly eventTypeOptions: readonly SocialEventType[] = [
    SocialEventType.Wedding,
    SocialEventType.Baptism,
    SocialEventType.Death,
    SocialEventType.Birth,
    SocialEventType.Other,
  ];
  readonly eventTypeSelectOptions: readonly CustomSelectOption[] = this.eventTypeOptions.map(
    (eventType) => ({ value: eventType, label: socialEventTypeLabel(eventType) }),
  );

  readonly socialEventTypeLabel = socialEventTypeLabel;

  readonly form = this.formBuilder.group(
    {
      title: this.formBuilder.nonNullable.control('', [
        Validators.required,
        requireNonBlank,
        Validators.maxLength(150),
      ]),
      eventType: this.formBuilder.nonNullable.control<SocialEventType | ''>(
        '',
        Validators.required,
      ),
      description: this.formBuilder.nonNullable.control('', Validators.maxLength(1000)),
      beneficiary: this.formBuilder.nonNullable.control('', [
        Validators.required,
        requireNonBlank,
        Validators.maxLength(200),
      ]),
      startDate: this.formBuilder.nonNullable.control('', Validators.required),
      endDate: this.formBuilder.nonNullable.control('', Validators.required),
      targetAmount: this.formBuilder.control<number | null>(null, Validators.min(1)),
    },
    { validators: dateRangeValidator },
  );

  titleInvalid(): boolean {
    const control = this.form.controls.title;
    return control.invalid && control.touched;
  }

  eventTypeInvalid(): boolean {
    const control = this.form.controls.eventType;
    return control.invalid && control.touched;
  }

  beneficiaryInvalid(): boolean {
    const control = this.form.controls.beneficiary;
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
    if (this.submitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const eventType = raw.eventType as SocialEventType;
    const request: CreateSocialFundRequest = {
      title: raw.title.trim(),
      eventType,
      beneficiary: raw.beneficiary.trim(),
      startDate: raw.startDate,
      endDate: raw.endDate,
      ...(raw.description.trim() ? { description: raw.description.trim() } : {}),
      ...(raw.targetAmount !== null ? { targetAmount: raw.targetAmount } : {}),
    };
    this.submitted.emit(request);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
