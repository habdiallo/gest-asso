import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CatgoriesDeRevenuService } from '@api';
import type { IncomeCategory } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { ActionButton } from '@shared/action-button/action-button';
import { DataTable } from '@shared/data-table/data-table';
import { EmptyState } from '@shared/empty-state/empty-state';
import { LoadingSkeleton } from '@shared/loading-skeleton/loading-skeleton';
import { PageHeader } from '@shared/page-header/page-header';
import { PaginationControls } from '@shared/pagination-controls/pagination-controls';
import { CreateIncomeCategoryDialog } from '../components/create-income-category-dialog/create-income-category-dialog';
import { EditIncomeCategoryDialog } from '../components/edit-income-category-dialog/edit-income-category-dialog';

const PAGE_SIZE = 10;

/**
 * Écran liste des catégories de revenu (T-48), réservé à l'Administrateur
 * (US-REV-001). Appelle `GET /income-categories` (`@api`,
 * `CatgoriesDeRevenuService.listIncomeCategories`), qui renvoie les catégories
 * triées par libellé par le serveur (pas de tri/filtre applicatif ici).
 *
 * La route applicative applique `roleGuard(UserRole.Administrator)` à la
 * fois dans `app.routes.ts` et dans `income-categories.routes.ts`
 * (RG-ROLE-002, T-49) : les autres rôles sont redirigés vers `/acces-refuse`
 * avant d'atteindre cette page. Le lien de navigation n'est déjà proposé
 * qu'à l'Administrateur (`core/navigation/navigation-items.ts`).
 *
 * Propose aussi la création d'une catégorie (T-50, `CreateIncomeCategoryDialog`) :
 * libellé obligatoire, sans champ de montant (RG-REV-001, RG-REV-002). Après
 * création, la liste est rechargée depuis l'API pour rester triée par libellé
 * comme le garantit le contrat, plutôt que d'insérer la nouvelle catégorie
 * localement.
 *
 * Propose aussi la modification du libellé d'une catégorie existante (T-51,
 * `EditIncomeCategoryDialog`), avec un avertissement rappelant l'absence
 * d'effet rétroactif sur les cotisations déjà établies (US-REV-002). Après
 * modification, la liste est également rechargée depuis l'API.
 */
@Component({
  selector: 'app-income-categories-page',
  imports: [
    TranslocoPipe,
    ActionButton,
    DataTable,
    EmptyState,
    LoadingSkeleton,
    PageHeader,
    CreateIncomeCategoryDialog,
    EditIncomeCategoryDialog,
    PaginationControls,
  ],
  templateUrl: './income-categories-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeCategoriesPage {
  private readonly incomeCategoriesService = inject(CatgoriesDeRevenuService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly categories = signal<IncomeCategory[]>([]);
  readonly currentPage = signal(0);
  readonly createDialogOpen = signal(false);
  readonly editDialogOpen = signal(false);
  readonly editingCategory = signal<IncomeCategory | null>(null);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.categories().length / PAGE_SIZE)),
  );
  readonly visibleCategories = computed(() => {
    const start = this.currentPage() * PAGE_SIZE;
    return this.categories().slice(start, start + PAGE_SIZE);
  });
  readonly previousPageDisabled = computed(() => this.currentPage() === 0);
  readonly nextPageDisabled = computed(() => this.currentPage() + 1 >= this.totalPages());

  constructor() {
    this.loadCategories();
  }

  openCreateDialog(): void {
    this.createDialogOpen.set(true);
  }

  handleDialogClosed(): void {
    this.createDialogOpen.set(false);
  }

  handleCategoryCreated(): void {
    this.loadCategories();
  }

  openEditDialog(category: IncomeCategory): void {
    this.editingCategory.set(category);
    this.editDialogOpen.set(true);
  }

  handleEditDialogClosed(): void {
    this.editDialogOpen.set(false);
  }

  handleCategoryUpdated(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.currentPage.set(0);
    this.loading.set(true);
    this.loadError.set(false);
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

  previousPage(): void {
    if (!this.previousPageDisabled()) {
      this.currentPage.update((page) => page - 1);
    }
  }

  nextPage(): void {
    if (!this.nextPageDisabled()) {
      this.currentPage.update((page) => page + 1);
    }
  }
}
