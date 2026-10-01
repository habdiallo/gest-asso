import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { redactValue } from './security.mjs';
import { validateArtifacts } from './schema.mjs';

function markdownPlan(plan) {
  return [`# Plan QA ${plan.profile}`, '', `Généré le ${plan.generatedAt}`, '', '## Couverture', '', `Features couvertes : ${plan.coverage.coveredFeatures.join(', ') || 'aucune'}`, `Features non couvertes : ${plan.coverage.uncoveredFeatures.join(', ') || 'aucune'}`, '', '## Scénarios', '', ...plan.scenarios.flatMap(scenario => [
    `### ${scenario.scenarioId} - ${scenario.name}`,
    `- Feature : ${scenario.feature}`,
    `- Priorité : ${scenario.priority}`,
    `- Statut initial : ${scenario.status}`,
    `- Préconditions : ${scenario.preconditions.join('; ') || 'à définir'}`,
    `- Données : ${scenario.data.join('; ') || 'à définir'}`,
    '- Étapes :',
    ...scenario.steps.map((step, index) => `  ${index + 1}. ${step}`),
    `- Résultat attendu : ${scenario.expected}`,
    `- Références : ${scenario.references.map(reference => reference.path ?? reference).join(', ') || 'aucune'}`,
    '',
  ])].join('\n');
}

function markdownAnomalies(anomalies, tickets) {
  if (!anomalies.length) return '# Anomalies\n\nAucune anomalie détectée sur ce run.\n';
  return ['# Anomalies', '', ...anomalies.flatMap(anomaly => [
    `## ${anomaly.anomalyId} - ${anomaly.title}`,
    `- Classification : ${anomaly.classification}`,
    `- Sévérité : ${anomaly.severity}`,
    `- Priorité : ${anomaly.priority}`,
    `- Feature : ${anomaly.feature}`,
    `- Scénario : ${anomaly.scenarioId}`,
    `- Ticket : ${tickets.find(ticket => ticket.anomalyId === anomaly.anomalyId)?.ticketId ?? 'aucun'}`,
    `- Attendu : ${anomaly.expected}`,
    `- Observé : ${anomaly.observed || 'non renseigné'}`,
    '',
  ])].join('\n');
}

function markdownTicket(ticket) {
  return [`# ${ticket.title}`, '', `- Type : ${ticket.kind}`, `- Feature : ${ticket.feature}`, `- Sévérité : ${ticket.severity}`, `- Priorité : ${ticket.priority}`, '', '## Description', '', ticket.description, '', '## Préconditions', '', ...ticket.preconditions.map(item => `- ${item}`), '', '## Reproduction', '', ...ticket.reproductionSteps.map((item, index) => `${index + 1}. ${item}`), '', '## Comportement observé', '', ticket.observedBehavior, '', '## Comportement attendu', '', ticket.expectedBehavior, '', '## Critères d acceptance', '', ...ticket.acceptanceCriteria.map(item => `- ${item}`), '', '## Tests de non-régression', '', ...ticket.regressionTests.map(item => `- ${item}`), ''].join('\n');
}

function markdownSummary(summary) {
  const severityLines = Object.entries(summary.anomaliesBySeverity).map(([severity, count]) => `- ${severity} : ${count}`);
  return [`# Synthèse QA`, '', `- Run : ${summary.runId}`, `- Profil : ${summary.profile}`, `- Environnement : ${summary.environment}`, `- Scénarios préparés : ${summary.scenariosPrepared}`, `- Scénarios exécutés : ${summary.scenariosExecuted}`, `- Tests réussis : ${summary.passed}`, `- Tests échoués : ${summary.failed}`, `- Tests bloqués : ${summary.blocked}`, `- Tests non applicables : ${summary.notApplicable}`, `- Anomalies détectées : ${summary.anomaliesDetected}`, '', '## Répartition par sévérité', '', ...(severityLines.length ? severityLines : ['- Aucune']), '', '## Tickets créés', '', ...(summary.tickets.length ? summary.tickets.map(ticket => `- ${ticket}`) : ['- Aucun']), '', '## Risques et blocages', '', ...(summary.blockers.length ? summary.blockers.map(item => `- ${item}`) : ['- Aucun']), '', '## Zones à investiguer', '', ...(summary.uncoveredFeatures.length ? summary.uncoveredFeatures.map(item => `- ${item}`) : ['- Aucune']), ''].join('\n');
}

export function summarize({ runId, profile, environment, plan, results, anomalies, tickets }) {
  const byStatus = status => results.filter(result => result.status === status).length;
  const anomaliesBySeverity = Object.fromEntries(['Blocker', 'Critical', 'Major', 'Minor', 'Trivial'].map(severity => [severity, anomalies.filter(anomaly => anomaly.severity === severity).length]));
  return {
    runId,
    profile,
    environment,
    scenariosPrepared: plan.scenarios.length,
    scenariosExecuted: results.length,
    passed: byStatus('Réussi'),
    failed: byStatus('Échoué'),
    blocked: byStatus('Bloqué'),
    notApplicable: byStatus('Non applicable'),
    anomaliesDetected: anomalies.length,
    anomaliesBySeverity,
    tickets: tickets.map(ticket => ticket.ticketId),
    blockers: results.filter(result => result.status === 'Bloqué').map(result => `${result.scenarioId}: ${result.observation || 'dépendance indisponible'}`),
    uncoveredFeatures: plan.coverage.uncoveredFeatures,
  };
}

export function writeRunArtifacts({ root, outputRoot, runId, scope, plan, results, anomalies, tickets, summary, manifest, policy }) {
  const runDir = join(outputRoot, runId);
  const ticketDir = join(runDir, 'tickets');
  mkdirSync(ticketDir, { recursive: true });
  const safe = value => JSON.stringify(redactValue(value, policy), null, 2) + '\n';
  const artifacts = {
    'scope.json': scope,
    'anomalies.json': { runId, anomalies },
    'tickets.json': { runId, tickets },
    'test-results.json': { runId, results },
    'summary.json': summary,
    'manifest.json': manifest,
  };
  for (const [name, content] of Object.entries(artifacts)) writeFileSync(join(runDir, name), safe(content));
  writeFileSync(join(runDir, 'test-plan.md'), markdownPlan(plan));
  writeFileSync(join(runDir, 'anomalies.md'), markdownAnomalies(anomalies, tickets));
  writeFileSync(join(runDir, 'summary.md'), markdownSummary(summary));
  for (const ticket of tickets) writeFileSync(join(ticketDir, `${ticket.ticketId}.md`), markdownTicket(ticket));
  return runDir;
}
