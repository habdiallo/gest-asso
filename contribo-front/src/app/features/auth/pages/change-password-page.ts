import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthentificationService } from '@core/api';
import { TranslocoPipe } from '@jsverse/transloco';
import { switchMap } from 'rxjs';
import { NAVIGATION_PATHS } from '@core/navigation/navigation-paths';
import { SessionLogoutService } from '@core/session/session-logout.service';
import { SessionService } from '@core/session/session.service';
import { ActionButton } from '@shared/action-button/action-button';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmation = control.get('confirmation')?.value;
  return newPassword && confirmation && newPassword !== confirmation
    ? { passwordsMismatch: true }
    : null;
}

@Component({
  selector: 'app-change-password-page',
  imports: [ReactiveFormsModule, TranslocoPipe, ActionButton],
  templateUrl: './change-password-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authenticationService = inject(AuthentificationService);
  private readonly sessionService = inject(SessionService);
  private readonly logoutService = inject(SessionLogoutService);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(128)]],
      confirmation: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );
  readonly submitting = signal(false);
  readonly error = signal(false);

  submit(): void {
    if (this.submitting()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(false);
    this.authenticationService
      .getCsrfToken()
      .pipe(
        switchMap(() =>
          this.authenticationService.changePassword({
            newPassword: this.form.controls.newPassword.value,
          }),
        ),
      )
      .subscribe({
        next: (response) => {
          this.sessionService.setSession(response);
          this.submitting.set(false);
          void this.router.navigateByUrl(NAVIGATION_PATHS.dashboard);
        },
        error: () => {
          this.submitting.set(false);
          this.error.set(true);
        },
      });
  }

  logout(): void {
    this.logoutService.logout().subscribe(() => {
      void this.router.navigateByUrl('/login');
    });
  }
}
