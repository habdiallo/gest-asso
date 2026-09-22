import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StatCard } from './stat-card';

@Component({
  imports: [StatCard],
  template: `<app-stat-card icon="users" label="Membres actifs" value="86" detail="sur 91" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {}

describe('StatCard', () => {
  it('renders the supplied content and exposes the decorative icon as hidden', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Membres actifs');
    expect(root.textContent).toContain('86');
    expect(root.textContent).toContain('sur 91');
    expect(root.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
