import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, map, of, tap } from 'rxjs';
import fr from '../../../assets/i18n/fr.json';
import type { TranslationKey } from './translation-keys';

const DEFAULT_LOCALE = 'fr';
const DEFAULT_DICTIONARY: Readonly<Record<string, string>> = fr;

/**
 * Le dictionnaire par défaut (français) est intégré au bundle pour un premier
 * rendu synchrone, sans aller-retour réseau. Toute autre locale se charge à la
 * demande depuis `assets/i18n/<locale>.json` et se complète avec le français
 * pour les clés manquantes, afin qu'une traduction partielle reste utilisable.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly loadedDictionaries = new Map<string, Record<string, string>>([
    [DEFAULT_LOCALE, DEFAULT_DICTIONARY],
  ]);

  readonly locale = signal(DEFAULT_LOCALE);
  readonly dictionary = signal<Record<string, string>>(DEFAULT_DICTIONARY);

  translate(key: TranslationKey): string {
    return this.dictionary()[key] ?? key;
  }

  setLocale(locale: string): Observable<void> {
    const cached = this.loadedDictionaries.get(locale);
    if (cached) {
      this.locale.set(locale);
      this.dictionary.set(cached);
      return of(undefined);
    }

    return this.http.get<Record<string, string>>(`assets/i18n/${locale}.json`).pipe(
      map((translations) => ({ ...DEFAULT_DICTIONARY, ...translations })),
      tap((merged) => {
        this.loadedDictionaries.set(locale, merged);
        this.locale.set(locale);
        this.dictionary.set(merged);
      }),
      map(() => undefined),
      catchError(() => of(undefined)),
    );
  }
}
