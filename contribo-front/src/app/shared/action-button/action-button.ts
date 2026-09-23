import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Params } from '@angular/router';

export type ActionButtonVariant = 'primary' | 'secondary' | 'danger';
export type ActionButtonType = 'button' | 'submit' | 'reset';

const ACTION_BUTTON_BASE_CLASSES =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded border border-transparent px-4 py-2 text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap cursor-pointer outline-none transition-[background-color,border-color,box-shadow,color,transform] duration-[180ms] focus-visible:border-gold focus-visible:ring-[3px] focus-visible:ring-gold-wash active:scale-[0.985] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-[0.42] disabled:transform-none disabled:shadow-none aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-[0.42] aria-disabled:transform-none aria-disabled:shadow-none';

const ACTION_BUTTON_VARIANT_CLASSES: Record<ActionButtonVariant, string> = {
  primary:
    'bg-gold text-gold-ink shadow-[inset_0_1px_rgba(255,255,255,0.35)] hover:bg-gold-hover hover:-translate-y-px hover:shadow-[0_0_20px_var(--gold-wash)] disabled:hover:transform-none aria-disabled:hover:transform-none',
  secondary:
    'border-line-strong bg-surface text-text hover:border-[color:color-mix(in_srgb,var(--gold)_45%,transparent)]',
  danger:
    'border-[color:color-mix(in_srgb,var(--error)_35%,transparent)] bg-error-wash text-error hover:border-[color:color-mix(in_srgb,var(--error)_55%,transparent)]',
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
