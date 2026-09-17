/**
 * Formatage des montants GNF (Franc Guinéen), seule devise applicative.
 *
 * RG-FMT-001 : tous les montants sont des entiers, sans sous-unité.
 * RG-FMT-002 : sur les fiches, historiques et exports, un montant est
 * toujours affiché en valeur complète avec séparateur de milliers,
 * par exemple « 1 250 000 GNF ».
 */

const GNF_SUFFIX = 'GNF';

const detailedAmountFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0,
});

/**
 * Formate un montant GNF en affichage détaillé (RG-FMT-002) : valeur
 * complète avec séparateur de milliers et suffixe « GNF ».
 *
 * @param amount Montant entier en GNF, tel que fourni par l'API.
 * @throws {Error} si `amount` n'est pas un entier (RG-FMT-001).
 */
export function formatGnfAmountDetailed(amount: number): string {
  if (!Number.isInteger(amount)) {
    throw new Error(`Un montant GNF doit être un entier : ${amount}`);
  }

  return `${detailedAmountFormatter.format(amount)} ${GNF_SUFFIX}`;
}

/**
 * Montant GNF condensé (RG-FMT-003/RG-FMT-004), avec accès à la valeur
 * brute pour un affichage complémentaire, par exemple une info-bulle.
 */
export interface CondensedGnfAmount {
  /** Libellé condensé, par exemple « 2,5M GNF ». */
  readonly text: string;
  /** Libellé détaillé équivalent, pour l'info-bulle, par exemple « 2 500 000 GNF ». */
  readonly fullText: string;
  /** Valeur brute d'origine, telle que fournie par l'API. */
  readonly rawAmount: number;
}

const CONDENSED_THOUSAND_THRESHOLD = 1_000;
const CONDENSED_MILLION_THRESHOLD = 1_000_000;
const CONDENSED_BILLION_THRESHOLD = 1_000_000_000;

const condensedValueFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
});

interface CondensedUnit {
  readonly divisor: number;
  readonly suffix: string;
  readonly separatorBeforeSuffix: string;
}

function resolveCondensedUnit(absoluteAmount: number): CondensedUnit {
  if (absoluteAmount >= CONDENSED_BILLION_THRESHOLD) {
    return { divisor: CONDENSED_BILLION_THRESHOLD, suffix: 'Mds', separatorBeforeSuffix: ' ' };
  }

  if (absoluteAmount >= CONDENSED_MILLION_THRESHOLD) {
    return { divisor: CONDENSED_MILLION_THRESHOLD, suffix: 'M', separatorBeforeSuffix: '' };
  }

  return { divisor: CONDENSED_THOUSAND_THRESHOLD, suffix: 'K', separatorBeforeSuffix: '' };
}

/**
 * Formate un montant GNF en affichage condensé (RG-FMT-003) pour les
 * listes, tableaux de bord et bilans : notation K / M / Mds avec au
 * maximum une décimale. En dessous de 1 000 GNF, la valeur complète est
 * conservée sans suffixe (RG-FMT-004). La valeur brute et le libellé
 * détaillé restent accessibles pour une info-bulle.
 *
 * @param amount Montant entier en GNF, tel que fourni par l'API.
 * @throws {Error} si `amount` n'est pas un entier (RG-FMT-001).
 */
export function formatGnfAmountCondensed(amount: number): CondensedGnfAmount {
  const fullText = formatGnfAmountDetailed(amount);

  if (Math.abs(amount) < CONDENSED_THOUSAND_THRESHOLD) {
    return { text: fullText, fullText, rawAmount: amount };
  }

  const unit = resolveCondensedUnit(Math.abs(amount));
  const condensedValue = condensedValueFormatter.format(amount / unit.divisor);
  const text = `${condensedValue}${unit.separatorBeforeSuffix}${unit.suffix} ${GNF_SUFFIX}`;

  return { text, fullText, rawAmount: amount };
}
