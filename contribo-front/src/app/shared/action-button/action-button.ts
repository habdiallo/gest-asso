import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Params } from '@angular/router';

export type ActionButtonVariant = 'primary' | 'secondary' | 'danger';
export type ActionButtonType = 'button' | 'submit' | 'reset';

const ACTION_BUTTON_BASE_CLASSES =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded px-4 py-2 text-[10px] font-medium uppercase tracking-[0.1em] outline-none transition-colors focus-visible:border-gold focus-visible:ring-[3px] focus-visible:ring-gold-wash disabled:pointer-events-none disabled:opacity-40';

const ACTION_BUTTON_VARIANT_CLASSES: Record<ActionButtonVariant, string> = {
  primary: 'bg-gold text-gold-ink hover:bg-gold-hover',
  secondary: 'border border-line bg-surface-2 text-text hover:border-gold-hover',
  danger: 'bg-error text-white hover:brightness-110',
};

@Component({
  selector: 'app-action-button',
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './action-button.html',
  styleUrl: './action-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionButton {
  readonly variant = input<ActionButtonVariant>('primary');
  readonly type = input<ActionButtonType>('button');
  readonly routerLink = input<string | readonly unknown[] | null>(null);
  readonly queryParams = input<Params | null>(null);
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly ariaLabel = input<string | null>(null);

  readonly classes = computed(
    () => `${ACTION_BUTTON_BASE_CLASSES} ${ACTION_BUTTON_VARIANT_CLASSES[this.variant()]}`,
  );
  readonly inactive = computed(() => this.disabled() || this.loading());
  readonly isLink = computed(() => this.routerLink() !== null);

  handleLinkClick(event: MouseEvent): void {
    if (this.inactive()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
