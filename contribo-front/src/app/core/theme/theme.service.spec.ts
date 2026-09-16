import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to the dark theme (Obsidian Midnight) when nothing is stored', () => {
    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dark');
  });

  it('reads a previously stored theme', () => {
    localStorage.setItem('contribo-theme', 'light');

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('light');
  });

  it('ignores an invalid stored value and falls back to dark', () => {
    localStorage.setItem('contribo-theme', 'sepia');

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dark');
  });

  it('toggles between dark and light', () => {
    const service = TestBed.inject(ThemeService);

    service.toggle();
    expect(service.theme()).toBe('light');

    service.toggle();
    expect(service.theme()).toBe('dark');
  });

  it('applies the theme to the document root and persists it', () => {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();

    expect(document.documentElement.dataset['theme']).toBe('dark');

    service.toggle();
    TestBed.tick();

    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(localStorage.getItem('contribo-theme')).toBe('light');
  });
});
