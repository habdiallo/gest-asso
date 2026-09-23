import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface FinancialCardAmount {
  readonly text: string;
  readonly fullText: string;
}

export type FinancialCardStatusTone = 'success' | 'neutral';

/** Carte financière partagée par les listes Campagnes et Cagnottes. */
@Component({
  selector: 'app-financial-card',
  imports: [RouterLink],
  templateUrl: './financial-card.html',
  styleUrl: './financial-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialCard {
  readonly routerLink = input.required<string | readonly unknown[]>();
  readonly eyebrow = input.required<string>();
  readonly statusLabel = input.required<string>();
  readonly statusTone = input<FinancialCardStatusTone>('success');
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly collectedAmount = input<FinancialCardAmount | null>(null);
  readonly targetAmount = input<FinancialCardAmount | null>(null);
  readonly progressRate = input<number | null>(null);
  readonly financialFallback = input<string | null>(null);
  readonly footerLabel = input<string | null>(null);
  readonly footerValue = input<string | null>(null);

  readonly hasProgress = computed(
    () => this.targetAmount() !== null && this.progressRate() !== null,
  );
  readonly boundedProgressRate = computed(() =>
    Math.min(100, Math.max(0, this.progressRate() ?? 0)),
  );
}
