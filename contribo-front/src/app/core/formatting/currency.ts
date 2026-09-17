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
 * Un montant GNF n'a jamais de décimale (RG-FMT-001). Le seul séparateur de
 * milliers admis en saisie est l'espace (affichage détaillé RG-FMT-002) :
 * une virgule ou un point est donc toujours un séparateur décimal, jamais un
 * séparateur de milliers. Leur présence doit faire refuser la saisie plutôt
 * que la réinterpréter silencieusement en fusionnant la partie entière et la
 * partie décimale (par exemple `1000,50` ne doit jamais devenir `100050`).
 */
export function containsGnfDecimalSeparator(rawValue: string): boolean {
  return /[.,]/.test(rawValue);
}

/**
 * Ne conserve que les chiffres d'une saisie de montant GNF déjà validée par
 * `containsGnfDecimalSeparator` (RG-FMT-001) : tout caractère non numérique
 * restant, comme les espaces du séparateur de milliers déjà affiché ou du
 * bruit de saisie, est retiré avant reformatage ou conversion en entier.
 */
export function sanitizeGnfAmountDigits(rawValue: string): string {
  return rawValue.replace(/\D/g, '');
}

/**
 * Formate en direct les chiffres saisis dans un champ de montant, avec les
 * mêmes séparateurs de milliers que l'affichage détaillé (RG-FMT-002), mais
 * sans le suffixe « GNF » porté séparément par le champ de saisie.
 *
 * @param digits Chiffres bruts déjà filtrés par `sanitizeGnfAmountDigits`.
 */
export function formatGnfAmountInputDigits(digits: string): string {
  if (!digits) {
    return '';
  }

  return detailedAmountFormatter.format(Number(digits));
}
