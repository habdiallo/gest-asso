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
  it('affiche le total attendu, le total encaisse et le reste a encaisser', async () => {
    const fixture = await createFixture(buildFinancialSummary());
    const root: HTMLElement = fixture.nativeElement;

    expect(root.textContent).toContain('Total attendu');
    expect(root.textContent).toContain('12 500 000 GNF');
    expect(root.textContent).toContain('Total encaissé');
    expect(root.textContent).toContain('8 375 000 GNF');
    expect(root.textContent).toContain('Reste à encaisser');
    expect(root.textContent).toContain('4 125 000 GNF');
  });

  it('affiche un message quand le bilan financier est absent (role non autorise)', async () => {
    const fixture = await createFixture(undefined);
    const root: HTMLElement = fixture.nativeElement;

    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      "Vous n'êtes pas autorisé à consulter le bilan financier de cette campagne.",
    );
    expect(root.textContent).not.toContain('Total attendu');
  });

  it('affiche un reste a encaisser nul sans le confondre avec une absence de donnee', async () => {
    const fixture = await createFixture(
      buildFinancialSummary({ collectedAmount: 12_000_000, remainingAmount: 0 }),
    );
    const root: HTMLElement = fixture.nativeElement;

    expect(root.textContent).toContain('0 GNF');
  });
});
