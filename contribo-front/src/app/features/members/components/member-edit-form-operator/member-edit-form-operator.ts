import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import type { OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { UpdateMemberContactRequest, MemberDetails } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { ActionButton } from '@shared/action-button/action-button';

/**
 * Variante Opérateur du formulaire de modification d'un membre (T-39,
 * RG-MEM-017) : seuls les champs non structurants (téléphone, ville, pays,
 * nom d'usage) sont modifiables. Catégorie de revenu, fonction associative,
 * rôle applicatif et statut ne sont ni affichés ni éditables dans ce
 * formulaire ; ils restent consultables en lecture seule sur la fiche membre
 * (T-27). Aucun contrôle de statut n'est exposé (RG-MEM-018), conformément à
 * la variante complète Administrateur/Trésorier (T-38).
 */
@Component({
  selector: 'app-member-edit-form-operator',
  imports: [ReactiveFormsModule, TranslocoPipe, ActionButton],
  templateUrl: './member-edit-form-operator.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberEditFormOperator implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly member = input.required<MemberDetails>();
  readonly submitting = input(false);
  readonly submitted = output<UpdateMemberContactRequest>();
  readonly cancelled = output<void>();

  readonly form = this.formBuilder.nonNullable.group({
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
  });

  ngOnInit(): void {
    const member = this.member();
    this.form.reset({
      preferredName: member.preferredName ?? '',
      country: member.country ?? '',
      city: member.city ?? '',
      phone: member.phone ?? '',
    });
    for (const key of ['country', 'city', 'phone'] as const) {
      if (member[key]) {
        this.form.controls[key].addValidators(Validators.required);
        this.form.controls[key].updateValueAndValidity();
      }
    }
  }

  fieldInvalid(key: 'country' | 'city' | 'preferredName'): boolean {
    const control = this.form.controls[key];
    return control.invalid && control.touched;
  }

  phoneInvalid(): boolean {
    const control = this.form.controls.phone;
    return control.invalid && control.touched;
  }

  buildRequest(): UpdateMemberContactRequest {
    const raw = this.form.getRawValue();
    const member = this.member();
    const request: UpdateMemberContactRequest = {};
    for (const key of ['country', 'city', 'phone'] as const) {
      if (raw[key] !== (member[key] ?? '')) {
        request[key] = raw[key];
      }
    }
    if (raw.preferredName !== (member.preferredName ?? '')) {
      request.preferredName = raw.preferredName || null;
    }
    return request;
  }

  hasChanges(): boolean {
    return Object.keys(this.buildRequest()).length > 0;
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
