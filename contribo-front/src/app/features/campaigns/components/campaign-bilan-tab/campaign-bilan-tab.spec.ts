import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { CurrencyCode } from '@api';
import type { CampaignFinancialSummary } from '@api';
import { TranslocoTestingModule } from '@jsverse/transloco';
import fr from '../../../../../assets/i18n/fr.json';
import { CampaignBilanTab } from './campaign-bilan-tab';

function buildFinancialSummary(
  overrides: Partial<CampaignFinancialSummary> = {},
): CampaignFinancialSummary {
  return {
    expectedAmount: 12_500_000,
    collectedAmount: 8_375_000,
    remainingAmount: 4_125_000,
    collectionRate: 67,
    dueCounts: { total: 86, paid: 52, partiallyPaid: 12, unpaid: 22 },
    currency: CurrencyCode.Gnf,
    ...overrides,
  };
}

async function createFixture(
  financialSummary: CampaignFinancialSummary | undefined,
): Promise<ComponentFixture<CampaignBilanTab>> {
  await TestBed.configureTestingModule({
    imports: [
      CampaignBilanTab,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
        preloadLangs: true,
      }),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(CampaignBilanTab);
  fixture.componentRef.setInput('financialSummary', financialSummary);
  fixture.detectChanges();
  return fixture;
}

describe('CampaignBilanTab', () => {
  it('affiche le total attendu, le total encaisse et le reste a encaisser en notation condensee', async () => {
    const fixture = await createFixture(buildFinancialSummary());
    const root: HTMLElement = fixture.nativeElement;

    expect(root.textContent).toContain('Total attendu');
    expect(root.textContent).toContain('Total encaissé');
    expect(root.textContent).toContain('Reste à encaisser');

    const amountSpans = root.querySelectorAll<HTMLElement>('dd > span[title]');
    expect(amountSpans).toHaveLength(3);

    const [expectedAmount, collectedAmount, remainingAmount] = Array.from(amountSpans);
    expect(expectedAmount.getAttribute('title')).toBe('12 500 000 GNF');
    expect(expectedAmount.querySelector('[aria-hidden="true"]')?.textContent).toBe('12,5M GNF');
    expect(expectedAmount.querySelector('.sr-only')?.textContent).toBe('12 500 000 GNF');

    expect(collectedAmount.getAttribute('title')).toBe('8 375 000 GNF');
    expect(collectedAmount.querySelector('[aria-hidden="true"]')?.textContent).toBe('8,4M GNF');
    expect(collectedAmount.querySelector('.sr-only')?.textContent).toBe('8 375 000 GNF');

    expect(remainingAmount.getAttribute('title')).toBe('4 125 000 GNF');
    expect(remainingAmount.querySelector('[aria-hidden="true"]')?.textContent).toBe('4,1M GNF');
    expect(remainingAmount.querySelector('.sr-only')?.textContent).toBe('4 125 000 GNF');
  });

  it("donne acces a la valeur brute en dessous du seuil de condensation via l'info-bulle", async () => {
    const fixture = await createFixture(
      buildFinancialSummary({ expectedAmount: 750, collectedAmount: 500, remainingAmount: 250 }),
    );
    const root: HTMLElement = fixture.nativeElement;

    const amountSpans = root.querySelectorAll<HTMLElement>('dd > span[title]');
    const [expectedAmount, collectedAmount, remainingAmount] = Array.from(amountSpans);

    expect(expectedAmount.getAttribute('title')).toBe('750 GNF');
    expect(expectedAmount.querySelector('[aria-hidden="true"]')?.textContent).toBe('750 GNF');
    expect(collectedAmount.getAttribute('title')).toBe('500 GNF');
    expect(remainingAmount.getAttribute('title')).toBe('250 GNF');
  });

  it('affiche un message quand le bilan financier est absent (role non autorise)', async () => {
    const fixture = await createFixture(undefined);
    const root: HTMLElement = fixture.nativeElement;

    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      "Vous n'êtes pas autorisé à consulter le bilan financier de cette campagne.",
    );
    expect(root.textContent).not.toContain('Total attendu');
  });

  it('affiche la repartition des membres par statut de paiement', async () => {
    const fixture = await createFixture(
      buildFinancialSummary({ dueCounts: { total: 86, paid: 38, partiallyPaid: 27, unpaid: 21 } }),
    );
    const root: HTMLElement = fixture.nativeElement;

    expect(root.textContent).toContain('Répartition des membres par statut');
    expect(root.textContent).toContain('Payé');
    expect(root.textContent).toContain('38');
    expect(root.textContent).toContain('Partiel');
    expect(root.textContent).toContain('27');
    expect(root.textContent).toContain('Non payé');
    expect(root.textContent).toContain('21');
    expect(root.textContent).toContain('Sur 86 membres concernés');
  });

  it('accorde le total au singulier pour un seul membre concerne', async () => {
    const fixture = await createFixture(
      buildFinancialSummary({ dueCounts: { total: 1, paid: 1, partiallyPaid: 0, unpaid: 0 } }),
    );
    const root: HTMLElement = fixture.nativeElement;

    expect(root.textContent).toContain('Sur 1 membre concerné');
    expect(root.textContent).not.toContain('Sur 1 membres concerné');
  });

  it('affiche un reste a encaisser nul sans le confondre avec une absence de donnee', async () => {
    const fixture = await createFixture(
      buildFinancialSummary({ collectedAmount: 12_000_000, remainingAmount: 0 }),
    );
    const root: HTMLElement = fixture.nativeElement;

    expect(root.textContent).toContain('0 GNF');
  });
});
