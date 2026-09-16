import { Pipe } from '@angular/core';
import type { PipeTransform } from '@angular/core';
import { fr } from '@core/i18n/fr';
import type { TranslationKey } from '@core/i18n/fr';

@Pipe({ name: 'translate' })
export class TranslatePipe implements PipeTransform {
  transform(key: TranslationKey): string {
    return fr[key];
  }
}
