import type { ElementRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';

/** Option affichée par `CustomSelect` : `value` est la donnée, `label` le texte visible. */
export interface CustomSelectOption {
  readonly value: string;
  readonly label: string;
}

let sequence = 0;

/**
 * Sélecteur à liste déroulante personnalisée (T-117), pour les écrans où le rendu
 * natif de `<select>` (menu non stylable) diverge trop de `design/styles.css`
 * (`.custom-select`, `.select-trigger`, `.select-menu`). Suit le motif ARGP
 * "Listbox" (déclencheur `button` + `role="listbox"`) plutôt qu'un `<select>`
 * natif : la navigation clavier (flèches, Origine/Fin, Échap, focus restitué au
 * déclencheur) et le focus visible restent assurés manuellement ci-dessous,
 * conformément à `.claude/rules/frontend/accessibilite.md`.
 *
 * Le composant reste neutre sur la donnée : l'appelant fournit `options` et lie
 * `value` en `model()` (T-117, contrat bidirectionnel), sans connaître de
 * formulaire ou d'écran précis.
 */
@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class CustomSelect {
  readonly options = input.required<readonly CustomSelectOption[]>();
  readonly value = model<string>('');
  /** Nom accessible du déclencheur, utilisé quand aucun `<label for>` externe n'existe déjà. */
  readonly ariaLabel = input<string>('');
  /** `id` du déclencheur : à associer à un `<label for>` externe existant. */
  readonly triggerId = input<string>(`contribo-select-${++sequence}`);

  private readonly rootElement = viewChild<ElementRef<HTMLElement>>('root');
  private readonly optionButtons = viewChildren<ElementRef<HTMLButtonElement>>('optionButton');

  readonly listboxId = `${this.triggerId()}-listbox`;
  readonly open = signal(false);

  readonly selectedIndex = computed(() => {
    const current = this.value();
    return this.options().findIndex((option) => option.value === current);
  });

  readonly selectedLabel = computed(() => {
    const index = this.selectedIndex();
    return index >= 0 ? this.options()[index].label : '';
  });

  toggle(): void {
    if (this.open()) {
      this.close(true);
    } else {
      this.openMenu();
    }
  }

  openMenu(): void {
    if (this.open()) {
      return;
    }
    this.open.set(true);
    queueMicrotask(() => this.focusOption(Math.max(this.selectedIndex(), 0)));
  }

  close(focusTrigger: boolean): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    if (focusTrigger) {
      this.rootElement()
        ?.nativeElement.querySelector<HTMLButtonElement>('[data-select-trigger]')
        ?.focus();
    }
  }

  selectOption(option: CustomSelectOption): void {
    this.value.set(option.value);
    this.close(true);
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.openMenu();
    }
  }

  onOptionKeydown(event: KeyboardEvent, index: number): void {
    const buttons = this.optionButtons();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusOption(Math.min(index + 1, buttons.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusOption(Math.max(index - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        this.focusOption(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusOption(buttons.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        this.close(true);
        break;
      case 'Tab':
        this.close(false);
        break;
    }
  }

  onDocumentClick(event: Event): void {
    if (!this.open()) {
      return;
    }
    const root = this.rootElement()?.nativeElement;
    if (root && !root.contains(event.target as Node)) {
      this.close(false);
    }
  }

  private focusOption(index: number): void {
    this.optionButtons()[index]?.nativeElement.focus();
  }
}
