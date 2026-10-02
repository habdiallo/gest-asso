import { hashObject, normalizeText, nowIso, stableId } from './utils.mjs';
import { redactEvidence } from './security.mjs';

const resultStatuses = new Set(['Réussi', 'Échoué', 'Bloqué', 'Non applicable']);
const severities = new Set(['Blocker', 'Critical', 'Major', 'Minor', 'Trivial']);
const priorities = new Set(['P0', 'P1', 'P2']);

export function compareScenario(scenario, observation, { environment, policy } = {}) {
  const input = observation ?? {};
  let status = input.status;
  if (!status) status = input.expectedMatches === true ? 'Réussi' : input.expectedMatches === false ? 'Échoué' : 'Non applicable';
  if (!resultStatuses.has(status)) throw new Error(`Statut de résultat invalide : ${status}`);
  return {
    resultId: stableId('result', scenario.scenarioId, environment, nowIso()),
    scenarioId: scenario.scenarioId,
    status,
    executedAt: nowIso(),
    environment,
    actor: input.actor ?? null,
    expected: scenario.expected,
    observation: input.observation ?? '',
    evidence: redactEvidence(input.evidence ?? [], policy),
    reproducible: input.reproducible !== false,
    expectedKnown: input.expectedKnown !== false,
    technicalCause: input.technicalCause ?? null,
  };
}

export function classifyAnomaly(scenario, result, input = {}) {
  if (result.status !== 'Échoué') return null;
  const classification = result.expectedKnown && result.reproducible ? 'confirmed' : result.expectedKnown ? 'suspicion' : 'clarification';
  const severity = severities.has(input.severity) ? input.severity : 'Major';
  const priority = priorities.has(input.priority) ? input.priority : severity === 'Blocker' || severity === 'Critical' ? 'P0' : severity === 'Major' ? 'P1' : 'P2';
  const fingerprint = hashObject({
    feature: scenario.feature,
    scenarioId: scenario.scenarioId,
    condition: normalizeText(input.condition ?? scenario.context),
    expected: normalizeText(scenario.expected),
    observed: normalizeText(result.observation),
  });
  return {
    anomalyId: stableId('anomaly', fingerprint),
    fingerprint,
    scenarioId: scenario.scenarioId,
    feature: scenario.feature,
    classification,
    category: input.category ?? 'functional',
    severity,
    priority,
    title: input.title ?? `Écart dans ${scenario.feature}: ${scenario.name}`,
    condition: input.condition ?? scenario.context,
    expected: scenario.expected,
    observed: result.observation,
    environment: result.environment,
    evidence: result.evidence,
    technicalHints: input.technicalHints ?? [],
  };
}

export function createTicket(anomaly, scenario, result) {
  const confirmed = anomaly?.classification === 'confirmed';
  const ticketId = stableId(confirmed ? 'qa-ticket' : 'qa-clarification', anomaly.anomalyId);
  return {
    ticketId,
    kind: confirmed ? 'fix' : 'clarification',
    anomalyId: anomaly.anomalyId,
    scenarioId: scenario.scenarioId,
    title: anomaly.title,
    feature: scenario.feature,
    description: `Le scénario ${scenario.name} produit un écart dans l'environnement ${result.environment}.`,
    preconditions: scenario.preconditions,
    reproductionSteps: scenario.steps,
    observedBehavior: anomaly.observed,
    expectedBehavior: anomaly.expected,
    severity: anomaly.severity,
    priority: anomaly.priority,
    userImpact: confirmed ? 'Le parcours testé ne respecte pas le comportement attendu.' : 'Impact à clarifier avant correction.',
    technicalHints: anomaly.technicalHints,
    acceptanceCriteria: [
      `Le scénario ${scenario.scenarioId} respecte le résultat attendu.`,
      'Le comportement reste conforme pour les rôles et états couverts.',
    ],
    regressionTests: [scenario.scenarioId, `${scenario.scenarioId}-permissions`, `${scenario.scenarioId}-error-path`],
    evidence: result.evidence,
    references: scenario.references,
  };
}
