import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { normalizeText, readText, relativePath, sourceReference, stableId, walkFiles } from './utils.mjs';

const roleNames = ['Administrateur', 'Trésorier', 'Opérateur', 'Membre'];
const featureAliases = [
  ['auth', ['connexion', 'session', 'mot de passe', 'authentification']],
  ['dashboard', ['tableau de bord', 'dashboard']],
  ['members', ['membre', 'membres']],
  ['income-categories', ['catégorie', 'categories de revenu', 'revenu']],
  ['campaigns', ['campagne', 'cotisation', 'règlement']],
  ['social-funds', ['cagnotte', 'contribution']],
  ['roles-users', ['utilisateur', 'rôle', 'roles']],
  ['member-space', ['espace personnel', 'mes cotisations', 'mes contributions']],
  ['account', ['compte personnel', 'déconnexion']],
  ['shell', ['navigation', 'menu', 'accès refusé']],
];

export function inferFeature(text) {
  const normalized = normalizeText(text);
  const match = featureAliases.find(([, aliases]) => aliases.some(alias => normalized.includes(normalizeText(alias))));
  return match?.[0] ?? 'cross-feature';
}

function parseOpenApi(root, path) {
  if (!existsSync(path)) return [];
  const lines = readText(path).split(/\r?\n/);
  const operations = [];
  let currentPath = null;
  let currentMethod = null;
  for (const line of lines) {
    const pathMatch = line.match(/^  (\/[^:]+):\s*$/);
    if (pathMatch) {
      currentPath = pathMatch[1];
      currentMethod = null;
      continue;
    }
    const methodMatch = line.match(/^    (get|post|put|patch|delete|head|options):\s*$/i);
    if (methodMatch && currentPath) {
      currentMethod = methodMatch[1].toUpperCase();
      operations.push({ path: currentPath, method: currentMethod, feature: inferFeature(`${currentPath} ${currentMethod}`) });
      continue;
    }
    if (currentMethod && operations.length) {
      const operation = operations.at(-1);
      const id = line.match(/^      operationId:\s*(\S+)/);
      const summary = line.match(/^      summary:\s*(.+)$/);
      const tags = line.match(/^      tags:\s*\[([^\]]+)\]/);
      if (id) operation.operationId = id[1];
      if (summary) operation.summary = summary[1].trim();
      if (tags) operation.tags = tags[1].split(',').map(tag => tag.trim());
      if (operation.summary || operation.operationId) operation.feature = inferFeature(`${operation.path} ${operation.summary ?? ''} ${operation.tags ?? ''}`);
    }
  }
  return operations;
}

function parseRoutes(root, featureRoot) {
  const routes = [];
  for (const path of walkFiles(featureRoot, { extensions: ['ts'] }).filter(file => file.endsWith('.routes.ts'))) {
    const content = readText(path);
    for (const match of content.matchAll(/path:\s*['"]([^'"]*)['"]/g)) {
      routes.push({ feature: featureRoot.split('/').at(-1), path: match[1], source: sourceReference(root, path, 'route') });
    }
  }
  return routes;
}

function parseScenarioDocument(root, path, referenceKind) {
  if (!existsSync(path)) return [];
  const content = readText(path);
  const scenarios = [];
  const expression = /### Requirement:\s*(.+?)\n[\s\S]*?#### Scenario:\s*(.+?)\n([\s\S]*?)(?=\n#### Scenario:|\n### Requirement:|\n## |$)/g;
  for (const match of content.matchAll(expression)) {
    const [, requirement, name, body] = match;
    const when = body.match(/\*\*WHEN\*\*\s+(.+)/)?.[1]?.trim() ?? '';
    const then = body.match(/\*\*THEN\*\*\s+(.+)/)?.[1]?.trim() ?? '';
    const fullText = `${requirement} ${name} ${body}`;
    const feature = inferFeature(fullText);
    const identity = referenceKind === 'openspec-spec' ? [feature, name, relativePath(root, path)] : [feature, name];
    scenarios.push({
      scenarioId: stableId('scenario', ...identity),
      feature,
      name: name.trim(),
      context: requirement.trim(),
      preconditions: [],
      data: [],
      steps: [when ? `Préparer la situation : ${when}` : 'Préparer les préconditions du scénario', then ? `Observer : ${then}` : 'Comparer le comportement observé au résultat attendu'],
      expected: then || 'Le comportement observé respecte les règles référencées.',
      priority: ['auth', 'dashboard'].includes(feature) ? 'P0' : 'P1',
      status: 'Planned',
      references: [{ kind: referenceKind, path: relativePath(root, path), anchor: name.trim() }],
      roles: roleNames.filter(role => normalizeText(fullText).includes(normalizeText(role))),
    });
  }
  return scenarios;
}

function parsePlanScenarios(root, planPath) {
  return parseScenarioDocument(root, planPath, 'plan');
}

function finishedChanges(root) {
  const changesRoot = join(root, 'openspec/changes');
  if (!existsSync(changesRoot)) return [];
  return readdirSync(changesRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const change = entry.name;
      const tasksPath = join(changesRoot, change, 'tasks.md');
      if (!existsSync(tasksPath)) return null;
      const tasks = readFileSync(tasksPath, 'utf8').match(/^- \[([ xX])\] /gm) ?? [];
      if (!tasks.length || tasks.some(task => !task.toLowerCase().startsWith('- [x]'))) return null;
      return {
        change,
        tasksPath: relativePath(root, tasksPath),
        proposalPath: existsSync(join(changesRoot, change, 'proposal.md')) ? relativePath(root, join(changesRoot, change, 'proposal.md')) : null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.change.localeCompare(b.change));
}

function finishedOpenSpecScenarios(root) {
  const specsRoot = join(root, 'openspec/specs');
  if (!existsSync(specsRoot)) return [];
  return walkFiles(specsRoot, { extensions: ['md'] })
    .map(path => parseScenarioDocument(root, path, 'openspec-spec'))
    .flat();
}

export function discoverProject({ root, planPath = join(root, 'openspec/changes/plan-tests-manuels-fonctionnels/specs/manual-functional-test-plan/spec.md'), openapiPath = join(root, 'besoins/openapi.yaml') }) {
  const featureRoot = join(root, 'contribo-front/src/app/features');
  const features = existsSync(featureRoot)
    ? readdirSync(featureRoot, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => {
      const path = join(featureRoot, entry.name);
      return { name: entry.name, path: relativePath(root, path), routes: parseRoutes(root, path), files: walkFiles(path, { extensions: ['ts', 'html', 'css'] }).map(file => relativePath(root, file)) };
    }).sort((a, b) => a.name.localeCompare(b.name))
    : [];
  const operations = parseOpenApi(root, openapiPath);
  const planScenarios = parsePlanScenarios(root, planPath);
  const completedChanges = finishedChanges(root);
  const finishedScenarios = finishedOpenSpecScenarios(root);
  const scenarios = [...new Map([...planScenarios, ...finishedScenarios].map(scenario => [scenario.scenarioId, scenario])).values()];
  const sourcePaths = [
    planPath,
    openapiPath,
    ...finishedScenarios.map(scenario => join(root, scenario.references[0].path)),
    ...completedChanges.flatMap(change => [change.tasksPath, change.proposalPath].filter(Boolean).map(path => join(root, path))),
    ...features.flatMap(feature => feature.routes.map(route => join(root, route.source.path))),
  ];
  const uniqueSourcePaths = [...new Set(sourcePaths)].filter(existsSync);
  return {
    discoveredAt: new Date().toISOString(),
    features,
    routes: features.flatMap(feature => feature.routes),
    operations,
    roles: roleNames,
    permissions: ['route access', 'operatorCanRecordPayments', 'financial actions', 'personal data isolation'],
    states: ['Planned', 'Réussi', 'Échoué', 'Bloqué', 'Non applicable'],
    dependencies: features.map(feature => ({ feature: feature.name, dependsOn: feature.name === 'shell' ? ['auth'] : [] })),
    planScenarios: scenarios,
    finishedOpenSpec: {
      changes: completedChanges,
      scenarioCount: finishedScenarios.length,
      sources: finishedScenarios.map(scenario => scenario.references[0].path),
    },
    sources: uniqueSourcePaths.map(path => sourceReference(root, path)),
  };
}
