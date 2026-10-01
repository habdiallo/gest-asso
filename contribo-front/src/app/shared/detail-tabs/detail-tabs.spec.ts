import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DetailTabs, type DetailTab } from './detail-tabs';

@Component({
  imports: [DetailTabs],
  template: `
    <app-detail-tabs
      idPrefix="campaign"
      ariaLabel="Sections de la campagne"
      [tabs]="tabs()"
      [activeId]="activeId()"
      (activeIdChange)="activeId.set($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly tabs = signal<readonly DetailTab[]>([
    { id: 'dues', label: 'Cotisations' },
    { id: 'payments', label: 'Règlements' },
    { id: 'contributions', label: 'Contributions' },
  ]);
  readonly activeId = signal('dues');
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
    expect(tabs[0].getAttribute('aria-controls')).toBe('campaign-panel-dues');
    expect(tabs[1].tabIndex).toBe(-1);
    expect(tabs[0].classList.contains('border-gold-hover')).toBe(true);
    expect(tabs[1].classList.contains('border-gold-hover')).toBe(false);

    const tabList = fixture.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
    expect(tabList.className).toContain('overflow-x-auto');
    expect(tabs[0].className).toContain('min-h-11');
  });

  it('uses a denser fallback when three labels are too long for one row', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.tabs.set([
      { id: 'members', label: 'Situation des membres' },
      { id: 'categories', label: 'Montants par catégorie' },
      { id: 'payments', label: 'Règlements' },
    ]);
    fixture.componentInstance.activeId.set('members');
    fixture.detectChanges();

    const tabList = fixture.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
    expect(tabList.className).toContain('overflow-x-auto');
  });

  it('uses the visible mobile label as the accessible name', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.tabs.set([
      { id: 'members', label: 'Situation des membres', mobileLabel: 'Membres' },
      { id: 'categories', label: 'Montants par catégorie', mobileLabel: 'Catégories' },
      { id: 'payments', label: 'Règlements', mobileLabel: 'Règlements' },
    ]);
    fixture.componentInstance.activeId.set('members');
    fixture.detectChanges();

    const tabList = fixture.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
    const tabs = fixture.nativeElement.querySelectorAll(
      '[role="tab"]',
    ) as NodeListOf<HTMLButtonElement>;
    expect(tabList.className).toContain('overflow-x-auto');
    expect(tabs[0].getAttribute('aria-label')).toBeNull();
    expect(tabs[0].textContent).toContain('Situation des membres');
    expect(tabs[1].getAttribute('aria-label')).toBeNull();
    expect(tabs[1].textContent).toContain('Montants par catégorie');
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
    expect(fixture.componentInstance.activeId()).toBe('payments');

    tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.activeId()).toBe('contributions');
  });
});
