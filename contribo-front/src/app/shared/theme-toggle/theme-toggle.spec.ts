import { TestBed } from '@angular/core/testing';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('shows a control to switch to the light theme when dark is active', () => {
    const fixture = TestBed.createComponent(ThemeToggle);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Passer au thème clair');
  });

  it('toggles the theme when activated and updates its own label', () => {
    const fixture = TestBed.createComponent(ThemeToggle);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-label')).toBe('Passer au thème sombre');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });
});
