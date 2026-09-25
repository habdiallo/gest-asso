import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PaginationControls } from './pagination-controls';

@Component({
  imports: [PaginationControls],
  template: `
    <app-pagination-controls
      [currentPage]="2"
      [totalPages]="3"
      [previousDisabled]="previousDisabled()"
      navigationLabel="Pagination des contributions"
      previousLabel="Précédent"
      nextLabel="Suivant"
      [statusLabel]="status()"
      (previousPage)="previous.set(previous() + 1)"
      (nextPage)="next.set(next() + 1)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly previous = signal(0);
  readonly next = signal(0);
  readonly status = signal('Page 2 sur 3');
  readonly previousDisabled = signal(false);
}

describe('PaginationControls', () => {
  it('renders status and emits the requested direction', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(fixture.nativeElement.textContent).toContain('Page 2 sur 3');
    buttons[0].click();
    buttons[1].click();
    expect(fixture.componentInstance.previous()).toBe(1);
    expect(fixture.componentInstance.next()).toBe(1);
  });

  it('disables a pagination direction at a boundary', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.previousDisabled.set(true);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[0].getAttribute('aria-disabled')).toBe('true');
  });
});
