import { readFileSync } from 'node:fs';

const statuses = new Set(['Réussi', 'Échoué', 'Bloqué', 'Non applicable']);
const severities = new Set(['Blocker', 'Critical', 'Major', 'Minor', 'Trivial']);

function required(value, fields, label) {
  for (const field of fields) if (value?.[field] === undefined || value?.[field] === null) throw new Error(`${label}.${field} est obligatoire.`);
}

export function validateArtifacts(root, { plan, results, anomalies, tickets, manifest }) {
  required(plan, ['profile', 'features', 'scenarios', 'coverage'], 'plan');
  for (const scenario of plan.scenarios) required(scenario, ['scenarioId', 'feature', 'steps', 'expected', 'priority', 'status'], 'scenario');
  for (const result of results) {
    required(result, ['resultId', 'scenarioId', 'status', 'executedAt', 'environment'], 'result');
    if (!statuses.has(result.status)) throw new Error(`Statut invalide : ${result.status}`);
  }
  for (const anomaly of anomalies) {
    required(anomaly, ['anomalyId', 'fingerprint', 'scenarioId', 'classification', 'severity', 'priority'], 'anomaly');
    if (!severities.has(anomaly.severity)) throw new Error(`Sévérité invalide : ${anomaly.severity}`);
  }
  for (const ticket of tickets) required(ticket, ['ticketId', 'title', 'feature', 'description', 'severity', 'priority', 'acceptanceCriteria', 'regressionTests'], 'ticket');
  required(manifest, ['runId', 'schemaVersion', 'profile', 'environment', 'artifacts', 'traceability'], 'manifest');
  if (manifest.schemaVersion !== 1) throw new Error('Version de schéma QA non supportée.');
  JSON.parse(readFileSync(new URL('../schemas/qa-artifacts.schema.json', import.meta.url), 'utf8'));
  return true;
}
