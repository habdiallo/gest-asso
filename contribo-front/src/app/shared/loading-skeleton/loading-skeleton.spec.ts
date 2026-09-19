import { TestBed } from '@angular/core/testing';
import { LoadingSkeleton } from './loading-skeleton';

describe('LoadingSkeleton', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoadingSkeleton],
    });
  });

  it('announces the loading label to assistive technology via role="status"', () => {
    const fixture = TestBed.createComponent(LoadingSkeleton);
    fixture.componentRef.setInput('variant', 'table');
    fixture.componentRef.setInput('label', 'Chargement des membres...');
    fixture.detectChanges();

    const status: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');
    expect(status.textContent?.trim()).toBe('Chargement des membres...');
  });

  it('hides the decorative skeleton shapes from assistive technology', () => {
    const fixture = TestBed.createComponent(LoadingSkeleton);
    fixture.componentRef.setInput('variant', 'grid');
    fixture.componentRef.setInput('rows', 4);
    fixture.componentRef.setInput('label', 'Chargement des cagnottes...');
    fixture.detectChanges();

    const hiddenNodes: NodeListOf<HTMLElement> =
      fixture.nativeElement.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenNodes.length).toBeGreaterThan(0);
  });

  it('renders one skeleton row per unit for the table variant', () => {
    const fixture = TestBed.createComponent(LoadingSkeleton);
    fixture.componentRef.setInput('variant', 'table');
    fixture.componentRef.setInput('rows', 5);
    fixture.componentRef.setInput('label', 'Chargement des membres...');
    fixture.detectChanges();

    const rows: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(
      '[aria-hidden="true"] > div.animate-pulse',
    );
    expect(rows.length).toBe(5);
  });

  it('renders the detail variant with a header and field placeholders', () => {
    const fixture = TestBed.createComponent(LoadingSkeleton);
    fixture.componentRef.setInput('variant', 'detail');
    fixture.componentRef.setInput('rows', 3);
    fixture.componentRef.setInput('label', 'Chargement de la fiche...');
    fixture.detectChanges();

    const fields: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(
      '.grid.grid-cols-1 > div.rounded-card',
    );
    expect(fields.length).toBe(3);
  });
});
