import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NgControl } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

interface CalendarMonth {
  readonly year: number;
  readonly month: number;
}

interface CalendarDay {
  readonly iso: string;
  readonly label: number;
  readonly currentMonth: boolean;
  readonly selected: boolean;
  readonly today: boolean;
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function todayIso(): string {
  const today = new Date();
  return [today.getFullYear(), today.getMonth() + 1, today.getDate()]
    .map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, '0')))
    .join('-');
}

function todayMonth(): CalendarMonth {
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() };
}

function parseIsoDate(value: string): CalendarMonth | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day
    ? { year, month }
    : null;
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.html',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateInput implements ControlValueAccessor {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly controlId = input.required<string>();
  readonly placeholder = input('jj/mm/aaaa');
  readonly ariaLabel = input<string | null>(null);
  readonly ariaInvalid = input(false);
  readonly ariaDescribedBy = input<string | null>(null);
  readonly required = input(false);
  readonly disabledInput = input(false);

  readonly value = signal('');
  readonly open = signal(false);
  readonly disabled = signal(false);
  readonly currentMonth = signal<CalendarMonth>(todayMonth());
  readonly weekdays = WEEKDAYS;
  readonly today = todayIso();

  readonly displayValue = computed(() => {
    const parsed = parseIsoDate(this.value());
    if (!parsed) {
      return '';
    }
    const [, month, day] = this.value().split('-');
    return `${day}/${month}/${parsed.year}`;
  });

  readonly monthLabel = computed(() => {
    const current = this.currentMonth();
    const label = new Intl.DateTimeFormat('fr-FR', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(current.year, current.month, 1)));
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  readonly calendarDays = computed<readonly CalendarDay[]>(() => {
    const current = this.currentMonth();
    const firstDay = new Date(Date.UTC(current.year, current.month, 1));
    const leadingDays = (firstDay.getUTCDay() + 6) % 7;
    const selectedValue = this.value() || this.today;
    const days: CalendarDay[] = [];

    for (let index = 0; index < 42; index += 1) {
      const offset = index - leadingDays + 1;
      const date = new Date(Date.UTC(current.year, current.month, offset));
      const iso = isoDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      days.push({
        iso,
        label: date.getUTCDate(),
        currentMonth: date.getUTCMonth() === current.month,
        selected: iso === selectedValue,
        today: iso === this.today,
      });
    }
    return days;
  });

  readonly todayActionDisabled = computed(() => (this.value() || this.today) === this.today);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private readonly triggerRef = viewChild<ElementRef<HTMLButtonElement>>('trigger');

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
    const parsed = parseIsoDate(value ?? '');
    if (parsed) {
      this.currentMonth.set(parsed);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
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
    this.open.set(!this.open());
    if (this.open()) {
      const parsed = parseIsoDate(this.value());
      this.currentMonth.set(parsed ?? todayMonth());
    }
  }

  selectDate(day: CalendarDay): void {
    if (this.isDisabled()) {
      return;
    }
    this.value.set(day.iso);
    this.onChange(day.iso);
    this.onTouched();
    this.open.set(false);
    this.focusTrigger();
  }

  moveMonth(offset: number): void {
    const current = this.currentMonth();
    const next = new Date(Date.UTC(current.year, current.month + offset, 1));
    this.currentMonth.set({ year: next.getUTCFullYear(), month: next.getUTCMonth() });
  }

  clear(): void {
    if (this.isDisabled()) {
      return;
    }
    this.value.set('');
    this.onChange('');
    this.onTouched();
    this.currentMonth.set(todayMonth());
  }

  selectToday(): void {
    if (this.todayActionDisabled()) {
      return;
    }
    const parsed = parseIsoDate(this.today);
    if (parsed) {
      this.currentMonth.set(parsed);
    }
    const today = this.calendarDays().find((day) => day.iso === this.today);
    if (today) {
      this.selectDate(today);
    }
  }

  handleFocusOut(event: FocusEvent): void {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && this.elementRef.nativeElement.contains(nextTarget)) {
      return;
    }
    this.onTouched();
  }

  handleTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.toggleOpen();
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.open()) {
      this.open.set(false);
      this.focusTrigger();
    }
  }

  private isDisabled(): boolean {
    return this.disabled() || this.disabledInput();
  }

  private focusTrigger(): void {
    setTimeout(() => this.triggerRef()?.nativeElement.focus());
  }
}
