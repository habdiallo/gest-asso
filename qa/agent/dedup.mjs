import { normalizeText } from './utils.mjs';

export function deduplicateAnomaly(anomaly, existing = []) {
  const exact = existing.find(item => item.fingerprint === anomaly.fingerprint);
  if (exact) return { status: 'exact', existing: exact, anomaly: { ...anomaly, duplicateOf: exact.anomalyId } };
  const potential = existing.find(item => item.feature === anomaly.feature && normalizeText(item.expected) === normalizeText(anomaly.expected));
  if (potential) return { status: 'potential', existing: potential, anomaly: { ...anomaly, duplicateOf: potential.anomalyId } };
  return { status: 'new', anomaly };
}
