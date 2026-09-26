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

  it('shows the loading label visibly for visual variants', () => {
    const fixture = TestBed.createComponent(LoadingSkeleton);
    fixture.componentRef.setInput('variant', 'table');
    fixture.componentRef.setInput('label', 'Chargement des membres...');
    fixture.detectChanges();

    const visibleLabel = fixture.nativeElement.querySelector(
      'p[aria-hidden="true"]',
    ) as HTMLElement;
    expect(visibleLabel.textContent?.trim()).toBe('Chargement des membres...');
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

  it('renders the dialog variant with summary, fields and footer placeholders', () => {
    const fixture = TestBed.createComponent(LoadingSkeleton);
    fixture.componentRef.setInput('variant', 'dialog');
    fixture.componentRef.setInput('rows', 4);
    fixture.componentRef.setInput('label', 'Chargement du règlement...');
    fixture.componentRef.setInput('dialogSummaryLabels', [
      'Montant dû',
      'Déjà payé',
      'Reste à payer',
    ]);
    fixture.componentRef.setInput('dialogFieldLabels', [
      'Membre',
      'Campagne',
      'Montant',
      'Date',
      'Mode de règlement',
    ]);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelectorAll('.grid.grid-cols-3 > .space-y-2')).toHaveLength(3);
    expect(root.querySelectorAll('.grid.sm\\:grid-cols-2 > .space-y-2')).toHaveLength(4);
    expect(root.querySelector('[class*="border-t"]')).not.toBeNull();
    expect(root.textContent).toContain('Montant dû');
    expect(root.textContent).toContain('Mode de règlement');
  });

  it('renders the inline variant as a compact loading indicator', () => {
    const fixture = TestBed.createComponent(LoadingSkeleton);
    fixture.componentRef.setInput('variant', 'inline');
    fixture.componentRef.setInput('label', 'Chargement des catégories...');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.inline-flex')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.inline-flex')?.textContent).toContain(
      'Chargement des catégories',
    );
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'Chargement des catégories',
    );
  });
});
