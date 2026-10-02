import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { discoverProject } from '../qa/agent/discovery.mjs';
import { buildPlan } from '../qa/agent/planning.mjs';
import { runQa } from '../qa/agent/orchestrator.mjs';
import { GuidedAdapter, requiresConfirmation } from '../qa/agent/adapters.mjs';
import { normalizeObservations } from '../qa/agent/observations.mjs';
import { authorizeAction, preflight } from '../qa/agent/session.mjs';

function put(root, path, content) {
  const target = join(root, path);
  mkdirSync(join(target, '..'), { recursive: true });
  writeFileSync(target, content);
}

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'contribo-qa-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  put(root, 'contribo-front/src/app/features/auth/auth.routes.ts', "export const ROUTES = [{ path: 'login' }];\n");
  put(root, 'contribo-front/src/app/features/dashboard/dashboard.routes.ts', "export const ROUTES = [{ path: 'dashboard' }];\n");
  put(root, 'contribo-front/src/app/features/members/members.routes.ts', "export const ROUTES = [{ path: 'membres' }];\n");
  put(root, 'contribo-back/src/main/resources/contribo-api.yml', 'paths:\n  /auth/login:\n    post:\n      summary: Se connecter\n      operationId: login\n  /dashboard:\n    get:\n      summary: Consulter le tableau de bord\n      operationId: getDashboard\n');
  const spec = [
    '## ADDED Requirements',
    '',
    '### Requirement: Authentification',
    '',
    '#### Scenario: Connexion nominale',
    '- **WHEN** un Administrateur saisit des identifiants valides',
    '- **THEN** la session est établie et le tableau de bord est affiché',
    '',
    '### Requirement: Membres',
    '',
    '#### Scenario: Consultation des membres',
    '- **WHEN** un Trésorier ouvre la liste des membres',
    '- **THEN** la liste des membres est affichée',
    '',
  ].join('\n');
  put(root, 'openspec/changes/plan-tests-manuels-fonctionnels/specs/manual-functional-test-plan/spec.md', spec);
  put(root, 'openspec/specs/member-management-ui/spec.md', [
    '# member-management-ui Specification',
    '',
    '## Requirements',
    '',
    '### Requirement: Réactivation d un membre',
    'Le frontend SHALL permettre de réactiver un membre inactif.',
    '',
    '#### Scenario: Réactivation par un Administrateur',
    '- **WHEN** un Administrateur réactive un membre inactif',
    '- **THEN** le membre redevient actif sans modifier son historique',
  ].join('\n'));
  put(root, 'openspec/changes/livrer-fonctionnalite-membres/tasks.md', [
    '## 1. Livraison',
    '',
    '- [x] 1.1 Livrer la fonctionnalité membres',
  ].join('\n'));
  put(root, 'qa/policy.json', JSON.stringify({ version: 1, allowedEnvironments: ['integration'], forbiddenEnvironments: ['production'], sensitiveKeys: ['password', 'token', 'authorization', 'email'], sensitiveTextPatterns: ['Bearer\\s+[A-Za-z0-9._~-]+'] }));
  return root;
}

function environment() {
  return { name: 'integration', version: 'fixture', safeForTestData: true };
}

test('discovers features, routes, API operations and stable scenarios', t => {
  const root = fixture(t);
  const inventory = discoverProject({ root });
  assert.deepEqual(inventory.features.map(feature => feature.name), ['auth', 'dashboard', 'members']);
  assert.ok(inventory.routes.some(route => route.path === 'login'));
  assert.ok(inventory.operations.some(operation => operation.operationId === 'getDashboard'));
  assert.ok(inventory.sources.some(source => source.path === 'contribo-back/src/main/resources/contribo-api.yml'));
  assert.ok(!inventory.sources.some(source => source.path === 'besoins/openapi.yaml'));
  assert.equal(inventory.planScenarios[0].scenarioId, discoverProject({ root }).planScenarios[0].scenarioId);
  assert.equal(inventory.finishedOpenSpec.scenarioCount, 1);
  assert.ok(inventory.finishedOpenSpec.changes.some(change => change.change === 'livrer-fonctionnalite-membres'));
  assert.ok(inventory.planScenarios.some(scenario => scenario.name === 'Réactivation par un Administrateur'));
});

test('builds smoke, full and targeted plans with uncovered features', t => {
  const root = fixture(t);
  const inventory = discoverProject({ root });
  const smoke = buildPlan({ inventory, profile: 'smoke' });
  const full = buildPlan({ inventory, profile: 'full' });
  const targeted = buildPlan({ inventory, profile: 'targeted', targetFeatures: ['members'] });
  assert.deepEqual(smoke.features.sort(), ['auth', 'dashboard']);
  assert.equal(full.coverage.uncoveredFeatures.length, 0);
  assert.deepEqual(targeted.features, ['members']);
  assert.ok(targeted.coverage.uncoveredFeatures.includes('auth'));
});

test('writes a dry-run without counting unexecuted scenarios', t => {
  const root = fixture(t);
  const result = runQa({ root, profile: 'full', environment: environment() });
  assert.equal(result.results.length, 0);
  assert.equal(result.summary.scenariosPrepared, 4);
  assert.equal(result.summary.scenariosExecuted, 0);
  assert.match(readFileSync(join(result.runDir, 'summary.md'), 'utf8'), /Scénarios exécutés : 0/);
  assert.ok(readFileSync(join(result.runDir, 'manifest.json'), 'utf8').includes('test-plan.md'));
});

test('qualifies failures, redacts evidence and creates a correction ticket', t => {
  const root = fixture(t);
  const scenario = buildPlan({ inventory: discoverProject({ root }), profile: 'full' }).scenarios.find(item => item.feature === 'auth');
  const result = runQa({
    root, profile: 'full', runId: 'qa-failure-one', environment: environment(),
    observations: { [scenario.scenarioId]: { expectedMatches: false, observation: 'Le tableau de bord reste vide.', evidence: [{ authorization: 'Bearer abc.def.ghi', message: 'password=secret' }], severity: 'Major', priority: 'P1', reproducible: true } },
  });
  assert.equal(result.summary.failed, 1);
  assert.equal(result.anomalies[0].classification, 'confirmed');
  assert.equal(result.tickets[0].kind, 'fix');
  const results = JSON.parse(readFileSync(join(result.runDir, 'test-results.json'), 'utf8'));
  assert.equal(results.results[0].evidence[0].authorization, '[REDACTED]');
  assert.match(readFileSync(join(result.runDir, 'tickets', `${result.tickets[0].ticketId}.md`), 'utf8'), /Tests de non-régression/);
});

test('normalizes AI observations, traces actions and redacts sensitive text', () => {
  const observations = normalizeObservations({
    'scenario-auth': {
      observation: 'Connexion avec token=secret',
      actionTrace: [{ action: 'Soumettre le formulaire', result: 'Le tableau de bord apparaît.' }],
    },
  });
  assert.equal(observations['scenario-auth'].observation, 'Connexion avec token=[REDACTED]');
  assert.equal(observations['scenario-auth'].actionTrace[0].action, 'Soumettre le formulaire');
  assert.throws(() => normalizeObservations({ 'scenario-auth': { status: 'Inconnu' } }), /scenarioId|status/);
  assert.throws(() => normalizeObservations({ 'scenario-auth': { scenarioId: 'scenario-members' } }), /correspondre/);
});

test('rejects malformed AI action traces', () => {
  assert.throws(() => normalizeObservations([{ scenarioId: 'scenario-auth', actionTrace: [{ action: 'Cliquer' }] }]), /actionTrace/);
});

test('reports a blocked browser preflight without inventing execution', async t => {
  const root = fixture(t);
  const result = await preflight({ root, environment: environment(), appUrl: 'http://localhost:4200', browserCapabilities: ['observe'] });
  assert.equal(result.status, 'blocked');
  assert.deepEqual(result.missingCapabilities, ['interact']);
});

test('blocks preflight when the application URL is unreachable', async t => {
  const root = fixture(t);
  const result = await preflight({
    root,
    environment: environment(),
    appUrl: 'http://localhost:4200',
    browserCapabilities: ['observe', 'interact'],
    fetchImpl: async () => { throw new Error('offline'); },
  });
  assert.equal(result.status, 'blocked');
  assert.equal(result.appReachable, false);
  assert.ok(result.blockers.some(blocker => blocker.includes('inaccessible')));
});

test('requires explicit confirmation for irreversible AI actions', () => {
  const scenario = { name: 'Enregistrer une contribution', context: '', steps: ['Confirmer'] };
  assert.deepEqual(authorizeAction(scenario), { allowed: false, confirmationRequired: true });
  assert.deepEqual(authorizeAction(scenario, { confirmed: true }), { allowed: true, confirmationRequired: true });
});

test('reuses an exact anomaly from a previous run', t => {
  const root = fixture(t);
  const scenario = buildPlan({ inventory: discoverProject({ root }), profile: 'full' }).scenarios[0];
  const observation = { expectedMatches: false, observation: 'Erreur reproductible', reproducible: true };
  const first = runQa({ root, profile: 'full', runId: 'qa-dedup-one', environment: environment(), observations: { [scenario.scenarioId]: observation } });
  const second = runQa({ root, profile: 'full', runId: 'qa-dedup-two', environment: environment(), observations: { [scenario.scenarioId]: observation } });
  assert.equal(first.tickets.length, 1);
  assert.equal(second.tickets.length, 0);
  assert.equal(second.manifest.traceability[scenario.scenarioId].duplicateStatus, 'exact');
});

test('resumes a run and refuses production', t => {
  const root = fixture(t);
  const plan = buildPlan({ inventory: discoverProject({ root }), profile: 'full' });
  const firstScenario = plan.scenarios[0];
  const first = runQa({ root, profile: 'full', runId: 'qa-resume', environment: environment(), observations: { [firstScenario.scenarioId]: { expectedMatches: true, observation: 'OK' } } });
  const secondScenario = plan.scenarios[1];
  const resumed = runQa({ root, profile: 'full', runId: 'qa-resume-next', resumeFrom: first.runDir, environment: environment(), observations: { [secondScenario.scenarioId]: { expectedMatches: true, observation: 'OK' } } });
  assert.equal(resumed.results.length, 2);
  assert.throws(() => runQa({ root, environment: { name: 'production', version: 'fixture', safeForTestData: true } }), /Environnement refusé/);
});

test('requires confirmation for sensitive guided actions', () => {
  const scenario = { name: 'Clôturer une campagne', context: '', steps: ['Confirmer la clôture'] };
  assert.equal(requiresConfirmation(scenario), true);
  assert.equal(new GuidedAdapter().execute(scenario).status, 'Non applicable');
  assert.equal(new GuidedAdapter({ confirm: () => true }).execute(scenario).status, 'Non applicable');
});
