import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatgoriesDeRevenuService } from '@api';
import type { CreateMemberRequest, IncomeCategory } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * Formulaire de création de membre (T-33, US-MEM-001) : Nom, Prénom, Nom
 * d'usage, Pays, Ville, Téléphone, Catégorie de revenu, Fonction. Charge les
 * catégories via `GET /income-categories` (`CatgoriesDeRevenuService`) pour
 * peupler le sélecteur.
 *
 * N'appelle pas `POST /members` lui-même : émet `submitted` avec la requête
 * construite, l'appel API et le rafraîchissement de la liste restant à la
 * charge du composant appelant. La validation dédiée du champ catégorie
 * (RG-MEM-002, T-34), le statut par défaut affiché (T-35), le message de
 * confirmation de création de compte (T-36) et le masquage de l'action pour
 * l'Opérateur/le Membre (T-37) ne sont pas traités ici.
 */
@Component({
  selector: 'app-member-create-form',
  imports: [ReactiveFormsModule, TranslocoPipe],
  templateUrl: './member-create-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberCreateForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly incomeCategoriesService = inject(CatgoriesDeRevenuService);
  private readonly destroyRef = inject(DestroyRef);

  readonly submitting = input(false);
  readonly submitted = output<CreateMemberRequest>();
  readonly cancelled = output<void>();

  readonly categories = signal<IncomeCategory[]>([]);
  readonly categoriesLoading = signal(true);
  readonly categoriesError = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    lastName: ['', Validators.required],
    firstName: ['', Validators.required],
    preferredName: [''],
    country: [''],
    city: [''],
    phone: [
      '',
      [
        Validators.minLength(7),
        Validators.maxLength(25),
        Validators.pattern(/^\+?[0-9][0-9 ()-]{6,24}$/),
      ],
    ],
    incomeCategoryId: ['', Validators.required],
    associationFunction: [''],
  });

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

  lastNameInvalid(): boolean {
    const control = this.form.controls.lastName;
    return control.invalid && control.touched;
  }

  firstNameInvalid(): boolean {
    const control = this.form.controls.firstName;
    return control.invalid && control.touched;
  }

  phoneInvalid(): boolean {
    const control = this.form.controls.phone;
    return control.invalid && control.touched;
  }

  incomeCategoryInvalid(): boolean {
    const control = this.form.controls.incomeCategoryId;
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

    const raw = this.form.getRawValue();
    const request: CreateMemberRequest = {
      lastName: raw.lastName,
      firstName: raw.firstName,
      incomeCategoryId: raw.incomeCategoryId,
      ...(raw.preferredName ? { preferredName: raw.preferredName } : {}),
      ...(raw.country ? { country: raw.country } : {}),
      ...(raw.city ? { city: raw.city } : {}),
      ...(raw.phone ? { phone: raw.phone } : {}),
      ...(raw.associationFunction ? { associationFunction: raw.associationFunction } : {}),
    };
    this.submitted.emit(request);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
