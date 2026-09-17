import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatgoriesDeRevenuService, ErrorCode } from '@api';
import type { ErrorResponse, IncomeCategory } from '@api';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslocoPipe } from '@jsverse/transloco';
import type { TranslationKey } from '@core/i18n/translation-keys';
import { FormDialog } from '@shared/form-dialog/form-dialog';

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
  imports: [ReactiveFormsModule, TranslocoPipe, FormDialog],
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
    label: ['', [Validators.required, Validators.maxLength(100)]],
  });

  readonly submitting = signal(false);
  readonly errorMessage = signal<TranslationKey | null>(null);

  constructor() {
    effect(() => {
      const category = this.category();
      if (this.open() && category) {
        this.form.reset({ label: category.label });
        this.errorMessage.set(null);
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

    const { label } = this.form.getRawValue();
    this.incomeCategoriesService.updateIncomeCategory(category.id, { label }).subscribe({
      next: (updatedCategory) => {
        this.submitting.set(false);
        this.updated.emit(updatedCategory);
        this.closed.emit();
      },
      error: (error: unknown) => {
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
