import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildPlan } from './planning.mjs';
import { deduplicateAnomaly } from './dedup.mjs';
import { classifyAnomaly, compareScenario, createTicket } from './execution.mjs';
import { discoverProject } from './discovery.mjs';
import { assertSafeEnvironment, loadPolicy } from './security.mjs';
import { gitVersion, nowIso, readJson, stableId } from './utils.mjs';
import { summarize, writeRunArtifacts } from './report.mjs';
import { validateArtifacts } from './schema.mjs';

function makeRunId() {
  return `qa-${new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)}-${Math.random().toString(36).slice(2, 8)}`;
}

function readObservations(value) {
  if (!value) return {};
  const parsed = typeof value === 'string' ? JSON.parse(readFileSync(value, 'utf8')) : value;
  if (Array.isArray(parsed)) return Object.fromEntries(parsed.map(item => [item.scenarioId, item]));
  return parsed;
}

function existingAnomalies(outputRoot) {
  if (!existsSync(outputRoot)) return [];
  const values = [];
  for (const entry of requireFs().readdirSync(outputRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(outputRoot, entry.name, 'anomalies.json');
    if (existsSync(path)) values.push(...(readJson(path, {}).anomalies ?? []));
  }
  return values;
}

function requireFs() {
  return requireFsModule;
}

import * as requireFsModule from 'node:fs';

function loadResume(resumeFrom) {
  if (!resumeFrom) return { results: [], anomalies: [] };
  return {
    results: readJson(join(resumeFrom, 'test-results.json'), {}).results ?? [],
    anomalies: readJson(join(resumeFrom, 'anomalies.json'), {}).anomalies ?? [],
  };
}

export function runQa({
  root = process.cwd(),
  profile = 'smoke',
  environment,
  appVersion = gitVersion(root),
  outputRoot = join(root, 'qa/runs'),
  planPath,
  openapiPath,
  targetFeatures = [],
  observations,
  runId = makeRunId(),
  resumeFrom,
  dryRun = !observations,
} = {}) {
  const repository = resolve(root);
  const policy = loadPolicy(repository);
  const resolvedEnvironment = { ...environment, version: environment?.version ?? appVersion };
  assertSafeEnvironment(resolvedEnvironment, policy);
  if (!['smoke', 'full', 'targeted'].includes(profile)) throw new Error(`Profil QA invalide : ${profile}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(runId)) throw new Error(`runId invalide : ${runId}`);
  const inventory = discoverProject({ root: repository, planPath, openapiPath });
  const plan = buildPlan({ inventory, profile, targetFeatures });
  const resume = loadResume(resumeFrom);
  const previousAnomalies = [...existingAnomalies(join(repository, 'qa/runs')), ...resume.anomalies];
  const input = readObservations(observations);
  const results = [...resume.results];
  const anomalies = [];
  const tickets = [];
  const traceability = {};
  const resultByScenario = new Set(results.map(result => result.scenarioId));

  for (const scenario of plan.scenarios) {
    const observation = input[scenario.scenarioId];
    if (!observation || resultByScenario.has(scenario.scenarioId)) continue;
    const result = compareScenario(scenario, observation, { environment: resolvedEnvironment.name, policy });
    results.push(result);
    resultByScenario.add(scenario.scenarioId);
    const anomaly = classifyAnomaly(scenario, result, observation);
    if (!anomaly) {
      traceability[scenario.scenarioId] = { resultId: result.resultId };
      continue;
    }
    const duplicate = deduplicateAnomaly(anomaly, [...previousAnomalies, ...anomalies]);
    const persistedAnomaly = duplicate.anomaly;
    anomalies.push(persistedAnomaly);
    const ticket = duplicate.status === 'new' ? createTicket(persistedAnomaly, scenario, result) : null;
    if (ticket) tickets.push(ticket);
    traceability[scenario.scenarioId] = { resultId: result.resultId, anomalyId: persistedAnomaly.anomalyId, ticketId: ticket?.ticketId ?? null, duplicateStatus: duplicate.status };
  }

  const summary = summarize({ runId, profile, environment: resolvedEnvironment.name, plan, results, anomalies, tickets });
  const scope = {
    runId,
    createdAt: nowIso(),
    profile,
    environment: resolvedEnvironment,
    dryRun,
    targetFeatures,
    inventory,
    sources: inventory.sources,
  };
  const manifest = {
    runId,
    schemaVersion: 1,
    artifactVersion: '1.0.0',
    profile,
    environment: resolvedEnvironment,
    sources: inventory.sources,
    artifacts: ['scope.json', 'test-plan.md', 'test-results.json', 'anomalies.json', 'anomalies.md', 'tickets.json', 'tickets/', 'summary.json', 'summary.md', 'manifest.json'],
    traceability,
    resumedFrom: resumeFrom ?? null,
  };
  validateArtifacts(repository, { plan, results, anomalies, tickets, manifest });
  mkdirSync(outputRoot, { recursive: true });
  const runDir = writeRunArtifacts({ root: repository, outputRoot, runId, scope, plan, results, anomalies, tickets, summary, manifest, policy });
  return { runId, runDir, plan, results, anomalies, tickets, summary, manifest };
}
