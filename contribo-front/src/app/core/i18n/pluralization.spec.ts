import { TestBed } from '@angular/core/testing';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';
import fr from '@assets/i18n/fr.json';

describe('French pluralized translations', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { fr },
          translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
          preloadLangs: true,
        }),
      ],
      providers: [provideTranslocoMessageformat({ locales: 'fr' })],
    });
  });

  it.each([
    ['dashboard.management.scopeAllCampaignsLabel', 'count', 'campagne'],
    ['dashboard.management.scopeAllSocialFundsLabel', 'count', 'cagnotte'],
    ['dashboard.management.campaignMembers', 'count', 'membre'],
    ['dashboard.synthesis.contributorCount', 'count', 'contributeur'],
    ['socialFunds.count', 'count', 'cagnotte'],
    ['socialFunds.card.contributorCount', 'count', 'contributeur'],
    ['socialFunds.detail.contributorCount', 'count', 'contributeur'],
  ])('uses the correct form for %s', (key, parameter, singular) => {
    const transloco = TestBed.inject(TranslocoService);
    const params = (value: number): Record<string, number> => ({ [parameter]: value });

    const zero = transloco.translate(key, params(0));
    const one = transloco.translate(key, params(1));
    const many = transloco.translate(key, params(2));

    expect(zero).toContain(`0 ${singular}`);
    expect(one).toContain(`1 ${singular}`);
    expect(many).toContain(`2 ${singular}s`);
    expect(`${zero}${one}${many}`).not.toContain('(s)');
  });

  it('pluralizes each segment of the member summary independently', () => {
    const transloco = TestBed.inject(TranslocoService);

    expect(transloco.translate('members.summary', { active: 0, total: 1 })).toBe(
      '0 membre actif sur 1 membre enregistré',
    );
    expect(transloco.translate('members.summary', { active: 1, total: 2 })).toBe(
      '1 membre actif sur 2 membres enregistrés',
    );
    expect(transloco.translate('members.summary', { active: 2, total: 2 })).toBe(
      '2 membres actifs sur 2 membres enregistrés',
    );
  });

  it('pluralizes the displayed payment count without changing the total parameter', () => {
    const transloco = TestBed.inject(TranslocoService);

    expect(
      transloco.translate('dashboard.management.recentPaymentsCountLabel', {
        displayed: 0,
        total: 0,
      }),
    ).toBe('0 dernier règlement affiché sur 0');
    expect(
      transloco.translate('dashboard.management.recentPaymentsCountLabel', {
        displayed: 1,
        total: 4,
      }),
    ).toBe('1 dernier règlement affiché sur 4');
    expect(
      transloco.translate('dashboard.management.recentPaymentsCountLabel', {
        displayed: 2,
        total: 4,
      }),
    ).toBe('2 derniers règlements affichés sur 4');
  });

  it('keeps braces in dynamic names and beneficiaries', () => {
    const transloco = TestBed.inject(TranslocoService);

    expect(
      transloco.translate('dashboard.management.scopeCampaignLabel', {
        name: 'Cotisation {2026}',
      }),
    ).toBe('Campagne · Cotisation {2026}');
    expect(
      transloco.translate('socialFunds.card.subtitle', {
        beneficiary: 'Famille {Diallo',
        start: '1er janvier',
        end: '2 janvier',
      }),
    ).toBe('Famille {Diallo · Du 1er janvier au 2 janvier');
    expect(
      transloco.translate('socialFunds.detail.subtitle', {
        beneficiary: "Fête de l'{année}",
        start: '1er janvier',
        end: '2 janvier',
      }),
    ).toBe("Fête de l'{année} · Du 1er janvier au 2 janvier");
  });
});
