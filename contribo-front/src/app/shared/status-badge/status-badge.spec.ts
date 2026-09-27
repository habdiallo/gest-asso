import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StatusBadge } from './status-badge';

@Component({
  imports: [StatusBadge],
  template: '<app-status-badge label="Compte actif" tone="success" dotTestId="status-dot" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {}

describe('StatusBadge', () => {
  it('renders a consistent tone, typography and status dot', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('app-status-badge span');
    const dot = fixture.nativeElement.querySelector('[data-testid="status-dot"]');

    expect(badge.className).toContain('rounded-full');
    expect(badge.className).toContain('font-data');
    expect(badge.className).toContain('bg-success-wash');
    expect(dot).toBeTruthy();
  });
});
