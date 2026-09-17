import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CagnottesService } from '@api';
import type { SocialFundPage, SocialFundSummary } from '@api';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatGnfAmountDetailed } from '@core/formatting/currency';
import { formatSocialFundCalendarDate } from '../social-fund-dates';
import { socialEventTypeLabel, socialFundStatusLabel } from '../social-fund-labels';

/**
 * Largeur affichée de la barre de progression, bornée à 100 même si
 * `progressRate` dépasse cette valeur (objectif atteint et dépassé).
 */
function progressBarWidth(progressRate: number): number {
  return Math.min(100, Math.max(0, progressRate));
}

/**
 * Écran liste des cagnottes (T-82) : appelle `GET /social-funds` (`@api`,
 * `CagnottesService`) et affiche les cagnottes sociales renvoyées par le
 * serveur. Écran/route/feature entièrement distincts de l'écran des
 * campagnes de cotisation (RG-CAG-001 : une cagnotte est indépendante d'une
 * campagne) ; aucun composant n'est partagé entre les deux.
 *
 * Le contrôle d'accès par rôle applicatif (Administrateur/Trésorier/Opérateur)
 * est porté par `roleGuard` sur la route `/cagnottes` (voir `app.routes.ts`),
 * jamais déduit ici de la fonction associative.
 *
 * Limite connue : la pagination, la recherche et le filtre par type
 * d'événement (T-83) ne sont pas exploités par cet écran ; seule la première
 * page renvoyée par le serveur est affichée.
 */
@Component({
  selector: 'app-social-funds-list-page',
  imports: [TranslocoPipe],
  templateUrl: './social-funds-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialFundsListPage {
  private readonly socialFundsService = inject(CagnottesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  private readonly page = signal<SocialFundPage | null>(null);

  readonly socialFunds = computed<SocialFundSummary[]>(() => this.page()?.items ?? []);
  readonly totalCount = computed<number>(() => this.page()?.page.totalElements ?? 0);

  readonly formatAmount = formatGnfAmountDetailed;
  readonly formatCalendarDate = formatSocialFundCalendarDate;
  readonly socialFundStatusLabel = socialFundStatusLabel;
  readonly socialEventTypeLabel = socialEventTypeLabel;
  readonly progressBarWidth = progressBarWidth;

  constructor() {
    this.socialFundsService
      .listSocialFunds()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.page.set(page);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }
}
