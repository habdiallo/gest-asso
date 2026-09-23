import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FinancialCard } from './financial-card';

const collectedAmount = { text: '12,4M GNF', fullText: '12 400 000 GNF' };

function renderCard(
  options: {
    targetAmount?: { text: string; fullText: string } | null;
    progressRate?: number | null;
  } = {},
): ComponentFixture<FinancialCard> {
  const fixture = TestBed.createComponent(FinancialCard);
  fixture.componentRef.setInput('routerLink', ['/campagnes', 'campaign-id']);
  fixture.componentRef.setInput('eyebrow', '86 membres');
  fixture.componentRef.setInput('statusLabel', 'Ouverte');
  fixture.componentRef.setInput('title', 'Solidarité septembre');
  fixture.componentRef.setInput('subtitle', 'Du 1 septembre au 30 septembre 2026');
  fixture.componentRef.setInput('collectedAmount', collectedAmount);
  fixture.componentRef.setInput(
    'targetAmount',
    options.targetAmount === undefined
      ? { text: '18,5M GNF', fullText: '18 500 000 GNF' }
      : options.targetAmount,
  );
  fixture.componentRef.setInput('progressRate', options.progressRate ?? 67);
  fixture.componentRef.setInput('footerLabel', 'Encaissé');
  fixture.componentRef.setInput('footerValue', '67%');
  fixture.detectChanges();
  return fixture;
}

describe('FinancialCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialCard],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the shared financial layout, route and prototype interaction classes', () => {
    const fixture = renderCard();
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/campagnes/campaign-id');
    expect(link.classList.contains('min-h-[312px]')).toBe(false);
    expect(link.classList.contains('h-full')).toBe(false);
    expect(link.textContent).toContain('Solidarité septembre');
    expect(link.textContent).toContain('12,4M GNF');
    expect(link.textContent).toContain('18,5M GNF');
    expect(link.classList.contains('hover:-translate-y-0.5')).toBe(true);
    expect(link.classList.contains('focus-visible:ring-[3px]')).toBe(true);
    expect(
      fixture.nativeElement
        .querySelector('h2')
        ?.classList.contains('group-focus-visible:text-gold'),
    ).toBe(true);
    expect(
      link.classList.contains(
        'hover:border-[color:color-mix(in_srgb,var(--gold)_30%,var(--line))]',
      ),
    ).toBe(true);
    expect(fixture.nativeElement.querySelector('.mt-\\[22px\\]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.mt-auto')).toBeNull();
  });

  it('renders the optional objective and bounded progress bar', () => {
    const fixture = renderCard({ progressRate: 125 });
    const progressBar = fixture.nativeElement.querySelector(
      '[data-testid="financial-card-progress-bar"]',
    ) as HTMLElement;

    expect(progressBar.style.width).toBe('100%');
  });

  it('hides objective-specific content when the objective is absent', () => {
    const fixture = renderCard({ targetAmount: null, progressRate: null });
    const root: HTMLElement = fixture.nativeElement;

    expect(root.querySelector('[data-testid="financial-card-progress-bar"]')).toBeNull();
    expect(root.textContent).not.toContain('/18,5M GNF');
    expect(root.textContent).toContain('Encaissé');
  });

  it('keeps a consultation fallback when financial data is unavailable', () => {
    const fixture = renderCard({ targetAmount: null, progressRate: null });
    fixture.componentRef.setInput('collectedAmount', null);
    fixture.componentRef.setInput('financialFallback', 'Consultation uniquement');
    fixture.componentRef.setInput('footerLabel', null);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Consultation uniquement');
    expect(root.textContent).not.toContain('12,4M GNF');
    expect(root.querySelector('[data-testid="financial-card-progress-bar"]')).toBeNull();
  });
});
