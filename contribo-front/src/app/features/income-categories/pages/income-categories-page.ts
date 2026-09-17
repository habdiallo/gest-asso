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
 * La route applicative applique déjà `roleGuard('ADMINISTRATOR')`
 * (`app.routes.ts`) : les autres rôles sont redirigés vers `/acces-refuse`
 * avant d'atteindre cette page. La garde de rôle générique et transverse
 * (RG-ROLE-002, T-49) reste à ajouter séparément ; le lien de navigation
 * n'est déjà proposé qu'à l'Administrateur (`core/navigation/navigation-items.ts`).
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
