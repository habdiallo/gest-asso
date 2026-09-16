import { Pipe, inject } from '@angular/core';
import type { PipeTransform } from '@angular/core';
import { TranslationService } from '@core/i18n/translation.service';
import type { TranslationKey } from '@core/i18n/translation-keys';

@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(key: TranslationKey): string {
    return this.translationService.translate(key);
  }
}
