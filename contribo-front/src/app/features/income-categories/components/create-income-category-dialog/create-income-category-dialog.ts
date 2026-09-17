import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatgoriesDeRevenuService, ErrorCode } from '@api';
import type { ErrorResponse, IncomeCategory } from '@api';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslocoPipe } from '@jsverse/transloco';
import type { TranslationKey } from '@core/i18n/translation-keys';
import { FormDialog } from '@shared/form-dialog/form-dialog';

/**
 * Formulaire de création d'une catégorie de revenu (T-50), réservé à
 * l'Administrateur : un unique champ libellé obligatoire (RG-REV-001), sans
 * champ de montant (RG-REV-002), une catégorie n'ayant pas de montant de
 * cotisation permanent. Appelle `POST /income-categories` (`@api`,
 * `CatgoriesDeRevenuService.createIncomeCategory`).
 *
 * S'appuie sur la surface de dialogue générique `FormDialog` (T-15) ; ce
 * composant porte le formulaire et l'appel API, `FormDialog` reste neutre.
 */
@Component({
  selector: 'app-create-income-category-dialog',
  imports: [ReactiveFormsModule, TranslocoPipe, FormDialog],
  templateUrl: './create-income-category-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateIncomeCategoryDialog {
  private readonly formBuilder = inject(FormBuilder);
  private readonly incomeCategoriesService = inject(CatgoriesDeRevenuService);

  /** Pilote l'ouverture/fermeture du dialogue. */
  readonly open = input(false);

  /** Émis à la fermeture du dialogue (bouton "Fermer", Échap ou après création). */
  readonly closed = output<void>();

  /** Émis lorsque la catégorie a été créée avec succès. */
  readonly created = output<IncomeCategory>();

  readonly form = this.formBuilder.nonNullable.group({
    label: ['', [Validators.required, Validators.maxLength(100)]],
  });

  readonly submitting = signal(false);
  readonly errorMessage = signal<TranslationKey | null>(null);

  labelInvalid(): boolean {
    const control = this.form.controls.label;
    return control.invalid && control.touched;
  }

  submit(): void {
    if (this.submitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const { label } = this.form.getRawValue();
    this.incomeCategoriesService.createIncomeCategory({ label }).subscribe({
      next: (category) => {
        this.submitting.set(false);
        this.form.reset({ label: '' });
        this.created.emit(category);
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
        return 'incomeCategories.createDialog.duplicateLabel';
      }
    }
    return 'incomeCategories.createDialog.error';
  }
}
