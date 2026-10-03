const percentageFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
});

/**
 * Formate un taux métier pour l'affichage sans altérer la valeur numérique
 * utilisée par les calculs ou les largeurs de progression.
 */
export function formatPercentage(rate: number): string {
  if (!Number.isFinite(rate)) {
    throw new Error(`Un taux doit être un nombre fini : ${rate}`);
  }

  const roundedRate = Math.round((rate + Number.EPSILON) * 10) / 10;
  const displayRate = rate < 100 && roundedRate >= 100 ? Math.floor(rate * 10) / 10 : roundedRate;

  return percentageFormatter.format(displayRate);
}
