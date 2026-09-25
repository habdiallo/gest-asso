import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DetailTabs, type DetailTab } from './detail-tabs';

@Component({
  imports: [DetailTabs],
  template: `
    <app-detail-tabs
      idPrefix="campaign"
      ariaLabel="Sections de la campagne"
      [tabs]="tabs"
      [activeId]="activeId()"
      (activeIdChange)="activeId.set($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly tabs: readonly DetailTab[] = [
    { id: 'members', label: 'Situation des membres' },
    { id: 'categories', label: 'Montants par catégorie' },
    { id: 'payments', label: 'Règlements' },
  ];
  readonly activeId = signal('members');
}

describe('DetailTabs', () => {
  it('exposes accessible tab relationships and a single tab stop', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const tabs: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(3);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-controls')).toBe('campaign-panel-members');
    expect(tabs[1].tabIndex).toBe(-1);
  });

  it('changes tabs on click and moves with arrow keys', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const tabs = fixture.nativeElement.querySelectorAll(
      '[role="tab"]',
    ) as NodeListOf<HTMLButtonElement>;
    tabs[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeId()).toBe('categories');

    tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.activeId()).toBe('payments');
  });
});
