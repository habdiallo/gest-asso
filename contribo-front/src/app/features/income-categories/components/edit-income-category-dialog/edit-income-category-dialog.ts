import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatgoriesDeRevenuService, ErrorCode } from '@api';
import type { ErrorResponse, IncomeCategory } from '@api';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslocoPipe } from '@jsverse/transloco';
import type { TranslationKey } from '@core/i18n/translation-keys';
import { ActionButton } from '@shared/action-button/action-button';
import { ApiErrorRetry } from '@shared/api-error-retry/api-error-retry';
import { FormDialog } from '@shared/form-dialog/form-dialog';

/** Rejette un libellé vide ou composé uniquement d'espaces (contrainte API). */
function requireNonBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim().length === 0 ? { required: true } : null;
}

/**
 * Formulaire de modification d'une catégorie de revenu (T-51), réservé à
 * l'Administrateur : un unique champ libellé obligatoire, comme à la création
 * (T-50). Appelle `PATCH /income-categories/{incomeCategoryId}` (`@api`,
 * `CatgoriesDeRevenuService.updateIncomeCategory`).
 *
 * Affiche un avertissement rappelant que la modification du libellé n'a pas
 * d'effet rétroactif sur les cotisations déjà établies avec l'ancien libellé
 * (US-REV-002) : seul le libellé affiché change, les montants et campagnes
 * passés ne sont jamais recalculés.
 *
 * S'appuie sur la surface de dialogue générique `FormDialog` (T-15), comme le
 * formulaire de création ; ce composant porte le formulaire et l'appel API.
 */
@Component({
  selector: 'app-edit-income-category-dialog',
  imports: [ReactiveFormsModule, TranslocoPipe, ActionButton, ApiErrorRetry, FormDialog],
  templateUrl: './edit-income-category-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditIncomeCategoryDialog {
  private readonly formBuilder = inject(FormBuilder);
  private readonly incomeCategoriesService = inject(CatgoriesDeRevenuService);

  /** Pilote l'ouverture/fermeture du dialogue. */
  readonly open = input(false);

  /** Catégorie à modifier ; son libellé initialise le formulaire à l'ouverture. */
  readonly category = input<IncomeCategory | null>(null);

  /** Émis à la fermeture du dialogue (bouton "Fermer", Échap ou après modification). */
  readonly closed = output<void>();

  /** Émis lorsque la catégorie a été modifiée avec succès. */
  readonly updated = output<IncomeCategory>();

  readonly form = this.formBuilder.nonNullable.group({
    label: ['', [Validators.required, requireNonBlank, Validators.maxLength(100)]],
  });

  readonly submitting = signal(false);
  readonly errorMessage = signal<TranslationKey | null>(null);

  /**
   * Invalide toute réponse PATCH encore en vol lorsque le dialogue change de
   * catégorie ou se ferme/rouvre, pour ne jamais fermer/mettre à jour le
   * dialogue rouvert sur une autre catégorie avec une réponse obsolète.
   */
  private requestToken = 0;

  constructor() {
    effect(() => {
      const category = this.category();
      const open = this.open();
      this.requestToken++;
      if (open && category) {
        this.form.reset({ label: category.label });
        this.errorMessage.set(null);
        this.submitting.set(false);
      }
    });
  }

  labelInvalid(): boolean {
    const control = this.form.controls.label;
    return control.invalid && control.touched;
  }

  submit(): void {
    const category = this.category();
    if (this.submitting() || !category) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const label = this.form.getRawValue().label.trim();
    const token = ++this.requestToken;
    this.incomeCategoriesService.updateIncomeCategory(category.id, { label }).subscribe({
      next: (updatedCategory) => {
        if (token !== this.requestToken) {
          return;
        }
        this.submitting.set(false);
        this.updated.emit(updatedCategory);
        this.closed.emit();
      },
      error: (error: unknown) => {
        if (token !== this.requestToken) {
          return;
        }
        this.submitting.set(false);
        this.errorMessage.set(this.resolveErrorKey(error));
      },
    });
  }

  private resolveErrorKey(error: unknown): TranslationKey {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as ErrorResponse | undefined;
      if (body?.code === ErrorCode.DuplicateCategoryLabel) {
        return 'incomeCategories.editDialog.duplicateLabel';
      }
      if (body?.code === ErrorCode.ResourceNotFound) {
        return 'incomeCategories.editDialog.notFound';
      }
    }
    return 'incomeCategories.editDialog.error';
  }
}
