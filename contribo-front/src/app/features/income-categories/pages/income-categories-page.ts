import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CatgoriesDeRevenuService } from '@api';
import type { IncomeCategory } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatInstant } from '../income-categories-dates';

/**
 * Écran liste des catégories de revenu (T-48), réservé à l'Administrateur
 * (US-REV-001). Appelle `GET /income-categories` (`@api`,
 * `CatgoriesDeRevenuService.listIncomeCategories`), qui renvoie les catégories
 * triées par libellé par le serveur (pas de tri/filtre applicatif ici).
 *
 * Limite connue : cette page ne restreint pas encore elle-même l'accès aux
 * autres rôles applicatifs — la garde de route dédiée (T-49) reste à ajouter
 * séparément, et le lien de navigation n'est déjà proposé qu'à l'Administrateur
 * (`core/navigation/navigation-items.ts`).
 */
@Component({
  selector: 'app-income-categories-page',
  imports: [TranslocoPipe],
  templateUrl: './income-categories-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeCategoriesPage {
  private readonly incomeCategoriesService = inject(CatgoriesDeRevenuService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly categories = signal<IncomeCategory[]>([]);

  readonly formatInstant = formatInstant;

  constructor() {
    this.incomeCategoriesService
      .listIncomeCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }
}
