import { ChangeDetectionStrategy, Component, input, output, viewChildren } from '@angular/core';
import type { ElementRef } from '@angular/core';

export interface DetailTab {
  readonly id: string;
  readonly label: string;
}

@Component({
  selector: 'app-detail-tabs',
  templateUrl: './detail-tabs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailTabs {
  readonly tabs = input.required<readonly DetailTab[]>();
  readonly activeId = input.required<string>();
  readonly idPrefix = input.required<string>();
  readonly ariaLabel = input.required<string>();
  readonly activeIdChange = output<string>();

  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  isActive(tab: DetailTab): boolean {
    return tab.id === this.activeId();
  }

  select(tab: DetailTab): void {
    this.activeIdChange.emit(tab.id);
  }

  onKeydown(event: KeyboardEvent): void {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (delta === 0) {
      return;
    }

    event.preventDefault();
    const tabs = this.tabs();
    const currentIndex = tabs.findIndex((tab) => tab.id === this.activeId());
    const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    this.select(nextTab);
    this.tabButtons()[nextIndex]?.nativeElement.focus();
  }

  tabId(tab: DetailTab): string {
    return `${this.idPrefix()}-tab-${tab.id}`;
  }

  panelId(tab: DetailTab): string {
    return `${this.idPrefix()}-panel-${tab.id}`;
  }
}
