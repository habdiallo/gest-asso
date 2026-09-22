import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import type { OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { ControlValueAccessor } from '@angular/forms';
import { NgControl, TouchedChangeEvent } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { filter, map } from 'rxjs';

let nextInstanceId = 0;

export interface CustomSelectOption {
  readonly value: string;
  readonly label: string;
  readonly translationKey?: string;
}

/**
 * Listbox personnalisé (déclencheur + menu) conforme au rendu de
 * `design/styles.css` (`.select-trigger`/`.select-menu`/`.select-option`),
 * utilisé à la place du rendu natif du `<select>` du navigateur.
 *
 * Implémente `ControlValueAccessor` comme `shared/payment-method-select`
 * (assignation manuelle à `NgControl` pour lire l'état `touched` réel du
 * `FormControl` hôte : reset()/markAllAsTouched() ne passent pas par
 * `registerOnTouched`, un signal local dédié divergerait donc du parent).
 *
 * Le focus est déplacé manuellement entre le déclencheur et les options
 * (navigation clavier flèches/Home/End/Échap, comme `design/app.js`), et
 * l'anneau doré n'utilise que `:focus-visible` (jamais `:focus`) pour ne
 * jamais rester affiché après une sélection à la souris qui rend le focus
 * au déclencheur par script.
 */
@Component({
  selector: 'app-custom-select',
  imports: [TranslocoPipe],
  templateUrl: './custom-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomSelect implements ControlValueAccessor, OnInit {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly instanceId = `custom-select-${++nextInstanceId}`;

  readonly options = input.required<ReadonlyArray<CustomSelectOption>>();
  readonly controlId = input<string | null>(null);
  readonly label = input<string>();
  readonly placeholder = input('Sélectionner');
  readonly required = input(false);
  readonly showRequiredError = input(true);
  readonly disabledInput = input(false);
  readonly requiredErrorMessage = input('Ce champ est obligatoire.');
  /** Permet à l'appelant de piloter `aria-invalid` depuis sa propre validation de formulaire. */
  readonly ariaInvalid = input(false);
  /** Permet à l'appelant de relier son propre paragraphe d'erreur externe via `aria-describedby`. */
  readonly ariaDescribedBy = input<string | null>(null);

  readonly fieldId = computed(() => this.controlId() ?? this.instanceId);
  readonly errorId = computed(() => `${this.fieldId()}-error`);

  readonly value = model<string | null>(null);
  readonly disabled = signal(false);
  readonly open = signal(false);
  readonly activeOptionIndex = signal(0);
  readonly touchedChange = output<void>();

  readonly selectedOption = computed(
    () => this.options().find((option) => option.value === this.value()) ?? null,
  );

  private readonly touchedFallback = signal(false);
  private readonly touchedFromControl = signal<boolean | null>(null);
  readonly touched = computed(() => this.touchedFromControl() ?? this.touchedFallback());
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());

  private readonly triggerRef = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly optionButtons = viewChildren<ElementRef<HTMLButtonElement>>('optionButton');

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    const control = this.ngControl?.control;
    if (!control) {
      return;
    }

    this.touchedFromControl.set(control.touched);
    control.events
      .pipe(
        filter((event): event is TouchedChangeEvent => event instanceof TouchedChangeEvent),
        map((event) => event.touched),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((touchedValue) => this.touchedFromControl.set(touchedValue));
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  toggleOpen(): void {
    if (this.isDisabled()) {
      return;
    }
    const nextOpen = !this.open();
    this.open.set(nextOpen);
    if (nextOpen) {
      this.setActiveOptionIndex();
    }
  }

  selectOption(option: CustomSelectOption): void {
    if (this.isDisabled()) {
      return;
    }
    this.value.set(option.value);
    this.onChange(option.value);
    this.open.set(false);
    this.focusTrigger();
  }

  handleTriggerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    if (
      event.key === 'Enter' ||
      event.key === ' ' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp'
    ) {
      event.preventDefault();
      this.open.set(true);
      this.setActiveOptionIndex();
      this.focusOptionAfterOpen();
    }
  }

  handleOptionKeydown(event: KeyboardEvent, option: CustomSelectOption): void {
    const buttons = this.optionButtons().map((ref) => ref.nativeElement);
    const currentIndex = buttons.indexOf(event.target as HTMLButtonElement);

    if (buttons.length === 0) {
      return;
    }

    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      event.preventDefault();
      let nextIndex: number;
      if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = buttons.length - 1;
      } else {
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        nextIndex = (currentIndex + delta + buttons.length) % buttons.length;
      }
      this.activeOptionIndex.set(nextIndex);
      buttons[nextIndex]?.focus();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectOption(option);
    }
  }

  handleFocusOut(event: FocusEvent): void {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && this.elementRef.nativeElement.contains(nextTarget)) {
      return;
    }
    this.touchedFallback.set(true);
    this.onTouched();
    this.touchedChange.emit();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  handleGlobalEscape(): void {
    if (this.open()) {
      this.open.set(false);
      this.focusTrigger();
    }
  }

  private focusOptionAfterOpen(): void {
    setTimeout(() => {
      const buttons = this.optionButtons().map((ref) => ref.nativeElement);
      if (buttons.length === 0) {
        return;
      }
      const selectedIndex = this.options().findIndex((option) => option.value === this.value());
      const nextIndex = selectedIndex >= 0 ? selectedIndex : 0;
      this.activeOptionIndex.set(nextIndex);
      buttons[nextIndex].focus();
    });
  }

  private setActiveOptionIndex(): void {
    const selectedIndex = this.options().findIndex((option) => option.value === this.value());
    this.activeOptionIndex.set(selectedIndex >= 0 ? selectedIndex : 0);
  }

  private focusTrigger(): void {
    setTimeout(() => this.triggerRef()?.nativeElement.focus());
  }
}
