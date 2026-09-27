import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import type { TranslationKey } from '@core/i18n/translation-keys';
import { ActionButton } from '@shared/action-button/action-button';
import { ApiErrorRetry } from '@shared/api-error-retry/api-error-retry';

/**
 * Agencement commun des formulaires de création et de modification d'une
 * catégorie de revenu. Le parent conserve la validation et l'appel API, ce
 * composant garantit uniquement une présentation identique et prévisible.
 */
@Component({
  selector: 'app-income-category-form',
  imports: [ReactiveFormsModule, TranslocoPipe, ActionButton, ApiErrorRetry],
  templateUrl: './income-category-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeCategoryForm {
  readonly form = input.required<FormGroup>();
  readonly labelControlId = input.required<string>();
  readonly labelErrorId = input.required<string>();
  readonly labelInvalid = input.required<boolean>();
  readonly labelRequired = input.required<TranslationKey>();
  readonly errorMessage = input<TranslationKey | null>(null);
  readonly editing = input(false);
  readonly submitting = input(false);
  readonly submitLabel = input.required<TranslationKey>();
  readonly submittingLabel = input.required<TranslationKey>();

  readonly submitted = output<void>();
  readonly cancelled = output<void>();
}
