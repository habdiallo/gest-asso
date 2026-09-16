import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthentificationService } from '@api';
import { TranslatePipe } from '@shared/i18n/translate.pipe';
import type { TranslationKey } from '@core/i18n/fr';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthentificationService);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required],
  });

  readonly submitting = signal(false);
  readonly errorMessage = signal<TranslationKey | null>(null);

  identifierInvalid(): boolean {
    const control = this.form.controls.identifier;
    return control.invalid && control.touched;
  }

  passwordInvalid(): boolean {
    const control = this.form.controls.password;
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

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigateByUrl('/');
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('auth.login.error');
      },
    });
  }
}
