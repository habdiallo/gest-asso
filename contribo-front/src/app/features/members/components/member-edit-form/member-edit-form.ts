import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type { OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatgoriesDeRevenuService } from '@api';
import type { UpdateMemberRequest, IncomeCategory, MemberDetails } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-member-edit-form',
  imports: [ReactiveFormsModule, TranslocoPipe],
  templateUrl: './member-edit-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberEditForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly incomeCategoriesService = inject(CatgoriesDeRevenuService);
  private readonly destroyRef = inject(DestroyRef);

  readonly member = input.required<MemberDetails>();
  readonly submitting = input(false);
  readonly submitted = output<UpdateMemberRequest>();
  readonly cancelled = output<void>();

  readonly categories = signal<IncomeCategory[]>([]);
  readonly categoriesLoading = signal(true);
  readonly categoriesError = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    lastName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/.*\S.*/)]],
    firstName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/.*\S.*/)]],
    preferredName: ['', Validators.maxLength(100)],
    country: ['', [Validators.maxLength(100), Validators.pattern(/.*\S.*/)]],
    city: ['', [Validators.maxLength(100), Validators.pattern(/.*\S.*/)]],
    phone: [
      '',
      [
        Validators.minLength(7),
        Validators.maxLength(25),
        Validators.pattern(/^\+?[0-9][0-9 ()-]{6,24}$/),
      ],
    ],
    incomeCategoryId: ['', Validators.required],
    associationFunction: ['', [Validators.maxLength(100), Validators.pattern(/.*\S.*/)]],
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

  ngOnInit(): void {
    const member = this.member();
    this.form.reset({
      lastName: member.lastName,
      firstName: member.firstName,
      preferredName: member.preferredName ?? '',
      country: member.country ?? '',
      city: member.city ?? '',
      phone: member.phone ?? '',
      incomeCategoryId: member.incomeCategory.id,
      associationFunction: member.associationFunction ?? '',
    });
    for (const key of ['country', 'city', 'phone', 'associationFunction'] as const) {
      if (member[key]) {
        this.form.controls[key].addValidators(Validators.required);
        this.form.controls[key].updateValueAndValidity();
      }
    }
  }

  fieldInvalid(key: 'country' | 'city' | 'associationFunction' | 'preferredName'): boolean {
    const control = this.form.controls[key];
    return control.invalid && control.touched;
  }

  buildRequest(): UpdateMemberRequest {
    const raw = this.form.getRawValue();
    const member = this.member();
    const request: UpdateMemberRequest = {};
    for (const key of [
      'lastName',
      'firstName',
      'country',
      'city',
      'phone',
      'associationFunction',
    ] as const) {
      if (raw[key] !== (member[key] ?? '')) {
        request[key] = raw[key];
      }
    }
    if (raw.preferredName !== (member.preferredName ?? '')) {
      request.preferredName = raw.preferredName || null;
    }
    if (raw.incomeCategoryId !== member.incomeCategory.id) {
      request.incomeCategoryId = raw.incomeCategoryId;
    }
    return request;
  }

  hasChanges(): boolean {
    return Object.keys(this.buildRequest()).length > 0;
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

    const request = this.buildRequest();
    if (!this.hasChanges()) {
      return;
    }
    this.submitted.emit(request);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
