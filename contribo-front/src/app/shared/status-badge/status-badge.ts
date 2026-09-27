import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StatusBadgeTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const STATUS_BADGE_BASE_CLASSES =
  'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-data text-[9px] font-medium uppercase tracking-[0.1em]';

const STATUS_BADGE_TONE_CLASSES: Record<StatusBadgeTone, string> = {
  success: 'bg-success-wash text-success',
  warning: 'bg-warning-wash text-warning',
  error: 'bg-error-wash text-error',
  info: 'bg-info-wash text-info',
  neutral: 'bg-surface-2 text-text-2',
};

const STATUS_BADGE_DOT_CLASSES: Record<StatusBadgeTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  neutral: 'bg-text-3',
};

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  readonly label = input.required<string>();
  readonly tone = input<StatusBadgeTone>('neutral');
  readonly dotTestId = input<string | null>(null);

  readonly classes = computed(
    () => `${STATUS_BADGE_BASE_CLASSES} ${STATUS_BADGE_TONE_CLASSES[this.tone()]}`,
  );
  readonly dotClasses = computed(
    () => `h-1.5 w-1.5 rounded-full ${STATUS_BADGE_DOT_CLASSES[this.tone()]}`,
  );
}
