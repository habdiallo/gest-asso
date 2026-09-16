import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cataloguePath = 'openspec/tickets.json';
const seedPath = 'openspec/changes/numerotation-tickets-branches/tickets.json';
const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const stepNumber = /^\d+(?:\.\d+)+$/;
const scopes = ['front', 'back', 'fullstack', 'docs', 'infra'];
const types = ['feat', 'fix', 'refactor', 'perf', 'test', 'chore'];
const positive = value => Number.isSafeInteger(value) && value > 0;

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

export function parseTicketId(value) {
  const match = String(value).match(/^(?:T-)?([1-9][0-9]*)$/);
  requireCondition(match && positive(Number(match[1])), `Ticket invalide : ${value}. Utiliser T-1 ou 1, sans zéro initial.`);
  return Number(match[1]);
}

export function readTaskDocument(root, change) {
  requireCondition(typeof change === 'string' && kebab.test(change), `Change invalide : ${change}`);
  let path = join(root, 'openspec/changes', change, 'tasks.md');
  if (!existsSync(path)) {
    const archive = join(root, 'openspec/changes/archive');
    const candidates = existsSync(archive) ? readdirSync(archive)
      .filter(name => /^\d{4}-\d{2}-\d{2}-/.test(name) && name.slice(11) === change)
      .map(name => join(archive, name, 'tasks.md')).filter(existsSync) : [];
    requireCondition(candidates.length === 1, `tasks.md absent ou archive ambiguë : ${change}`);
    path = candidates[0];
  }
  const tasks = new Map();
  for (const match of readFileSync(path, 'utf8').matchAll(/^- \[([ x])\] (\d+(?:\.\d+)+) (.+)$/gm)) {
    const [, checked, number, text] = match;
    requireCondition(!tasks.has(number), `Étape dupliquée : ${change}/${number}`);
    tasks.set(number, { number, text, done: checked === 'x', markers: [...text.matchAll(/\[T-([1-9][0-9]*)\]/g)].map(match => Number(match[1])) });
  }
  requireCondition(tasks.size > 0, `Aucune étape OpenSpec reconnue : ${change}`);
  return { path, tasks };
}

export function validateCatalogue(catalogue, { root = repository, previous } = {}) {
  requireCondition(catalogue?.schemaVersion === 1 && catalogue.tracker === 'repository-local' && catalogue.status === 'active', 'Registre local actif, schemaVersion 1 requis.');
  requireCondition(typeof catalogue.initializationActive === 'boolean', 'initializationActive doit être un booléen explicite.');
  requireCondition(Array.isArray(catalogue.tickets) && catalogue.tickets.length > 0, 'Liste de tickets vide/invalide.');
  requireCondition(Array.isArray(catalogue.prerequisiteChanges) && catalogue.prerequisiteChanges.every(change => typeof change === 'string' && kebab.test(change)), 'prerequisiteChanges invalide.');
  requireCondition(Array.isArray(catalogue.historicalInitializationTasks) && catalogue.historicalInitializationTasks.every(step => typeof step === 'string' && stepNumber.test(step)), 'historicalInitializationTasks invalide.');
  const tickets = new Map();
  const ownership = new Map();
  const documents = new Map();
  const branches = new Set();
  for (const ticket of catalogue.tickets) {
    const label = `T-${ticket.id}`;
    requireCondition(positive(ticket.id) && !tickets.has(ticket.id), `Identifiant invalide ou dupliqué : ${label}`);
    requireCondition(typeof ticket.title === 'string' && ticket.title.trim() && ['P0', 'P1', 'P2'].includes(ticket.priority), `Titre/priorité invalide : ${label}`);
    requireCondition(scopes.includes(ticket.scope) && types.includes(ticket.type) && typeof ticket.slug === 'string' && kebab.test(ticket.slug), `Scope/type/slug invalide : ${label}`);
    requireCondition(typeof ticket.change === 'string' && kebab.test(ticket.change), `Change invalide : ${label}`);
    requireCondition(['planned', 'cancelled'].includes(ticket.planningStatus), `Statut de planification invalide : ${label}`);
    requireCondition(Array.isArray(ticket.tasks) && ticket.tasks.length > 0 && ticket.tasks.every(step => typeof step === 'string' && stepNumber.test(step)) && new Set(ticket.tasks).size === ticket.tasks.length, `Étapes invalides/dupliquées : ${label}`);
    requireCondition(Array.isArray(ticket.dependencies) && ticket.dependencies.every(positive) && new Set(ticket.dependencies).size === ticket.dependencies.length, `Dépendances invalides/dupliquées : ${label}`);
    for (const [field, number] of [['branchDuringInitialization', '000'], ['branchAfterInitialization', ticket.id]]) {
      const expected = `${ticket.scope}/${ticket.type}-${number}-${ticket.slug}`;
      requireCondition(ticket[field] === expected && !branches.has(expected), `Branche incohérente ou dupliquée : ${label}, attendu ${expected}`);
      branches.add(expected);
    }
    if (!documents.has(ticket.change)) documents.set(ticket.change, readTaskDocument(root, ticket.change));
    for (const step of ticket.tasks) {
      const key = `${ticket.change}/${step}`;
      requireCondition(!ownership.has(key), `Étape rattachée à plusieurs tickets : ${key}`);
      const task = documents.get(ticket.change).tasks.get(step);
      requireCondition(task, `Étape absente : ${label} → ${key}`);
      requireCondition(task.markers.length === 1 && task.markers[0] === ticket.id, `Repère incorrect : ${key}, attendu [${label}]`);
      ownership.set(key, ticket.id);
    }
    tickets.set(ticket.id, ticket);
  }
  const identifiers = [...tickets.keys()].sort((a, b) => a - b);
  requireCondition(identifiers.every((id, index) => id === index + 1), 'Numéros manquants : conserver les tickets annulés au lieu de les supprimer.');
  requireCondition(catalogue.nextTicketId === identifiers.at(-1) + 1, 'nextTicketId doit être le prochain identifiant global disponible.');
  for (const [change, document] of documents) {
    for (const task of document.tasks.values()) {
      const owner = ownership.get(`${change}/${task.number}`);
      requireCondition(task.done || owner !== undefined, `Étape ouverte sans ticket : ${change}/${task.number}`);
      requireCondition(!task.markers.length || (task.markers.length === 1 && owner === task.markers[0]), `Repère sans correspondance : ${change}/${task.number}`);
    }
  }
  if (catalogue.historicalInitializationTasks.length) {
    const historic = documents.get('frontend-tickets-mvp-association') ?? readTaskDocument(root, 'frontend-tickets-mvp-association');
    for (const step of catalogue.historicalInitializationTasks) {
      requireCondition(historic.tasks.get(step)?.done && !ownership.has(`frontend-tickets-mvp-association/${step}`), `Étape historique 000 modifiée ou réattribuée : ${step}`);
    }
  }
  const visited = new Set();
  const active = new Set();
  function visit(id) {
    requireCondition(!active.has(id), `Cycle de dépendances : T-${id}`);
    if (visited.has(id)) return;
    active.add(id);
    const ticket = tickets.get(id);
    for (const dependency of ticket.dependencies) {
      const parent = tickets.get(dependency);
      requireCondition(parent, `Dépendance absente : T-${id} → T-${dependency}`);
      requireCondition(ticket.planningStatus === 'cancelled' || parent.planningStatus !== 'cancelled', `Dépendance annulée : T-${id} → T-${dependency}`);
      visit(dependency);
    }
    active.delete(id);
    visited.add(id);
  }
  for (const id of tickets.keys()) visit(id);
  if (previous) {
    for (const old of previous.tickets) {
      const current = tickets.get(old.id);
      requireCondition(current, `Ticket supprimé/renuméroté : T-${old.id}. Conserver une entrée cancelled.`);
      for (const field of ['scope', 'type', 'slug', 'change']) {
        requireCondition(current[field] === old[field], `Identité/branche réattribuée : T-${old.id}, champ ${field}`);
      }
      requireCondition(old.tasks.every(step => current.tasks.includes(step)), `Étapes réattribuées/renumérotées : T-${old.id}`);
    }
    requireCondition(JSON.stringify(catalogue.historicalInitializationTasks) === JSON.stringify(previous.historicalInitializationTasks), 'Historique des étapes 000 modifié.');
    const oldIds = new Set(previous.tickets.map(ticket => ticket.id));
    requireCondition([...tickets.keys()].filter(id => !oldIds.has(id)).every(id => id >= previous.nextTicketId), 'Identifiant réservé réutilisé.');
    requireCondition(catalogue.nextTicketId >= previous.nextTicketId, 'Compteur global de tickets réduit.');
  }
  return { tickets, documents };
}

export function resolveTicket(catalogue, id, { root = repository, previous } = {}) {
  const { tickets, documents } = validateCatalogue(catalogue, { root, previous });
  const ticket = tickets.get(parseTicketId(id));
  requireCondition(ticket, `Ticket inconnu : ${id}`);
  const progress = candidate => candidate.tasks.map(step => documents.get(candidate.change).tasks.get(step));
  const unfinishedDependencies = new Set();
  const visited = new Set();
  function inspectDependencies(candidate) {
    for (const dependency of candidate.dependencies) {
      if (visited.has(dependency)) continue;
      visited.add(dependency);
      const parent = tickets.get(dependency);
      if (!progress(parent).every(task => task.done)) unfinishedDependencies.add(dependency);
      inspectDependencies(parent);
    }
  }
  inspectDependencies(ticket);
  const prerequisites = catalogue.prerequisiteChanges.map(change => {
    const document = readTaskDocument(root, change);
    return { change, completeLocally: [...document.tasks.values()].every(task => task.done) };
  });
  return {
    ticket: `T-${ticket.id}`, title: ticket.title, change: ticket.change, priority: ticket.priority,
    planningStatus: ticket.planningStatus, initializationActive: catalogue.initializationActive,
    branch: catalogue.initializationActive ? ticket.branchDuringInitialization : ticket.branchAfterInitialization,
    taskFile: documents.get(ticket.change).path, tasks: progress(ticket),
    dependencies: ticket.dependencies.map(id => `T-${id}`),
    unfinishedDependencies: [...unfinishedDependencies].sort((a, b) => a - b).map(id => `T-${id}`),
    prerequisites,
    limitation: 'Avancement local des cases OpenSpec ; vérifier séparément les PR et leur présence dans la branche avant intégration.',
  };
}

export function verifySelection(selection, branch) {
  requireCondition(branch === selection.branch, `Branche incorrecte pour ${selection.ticket} : ${branch || 'HEAD détachée'}, attendu ${selection.branch}. Créer/réutiliser cette branche avant la génération.`);
  requireCondition(selection.planningStatus !== 'cancelled', `Ticket annulé : ${selection.ticket}`);
  requireCondition(!selection.unfinishedDependencies.length, `Prérequis non terminés pour ${selection.ticket} : ${selection.unfinishedDependencies.join(', ')}`);
  requireCondition(selection.prerequisites.every(item => item.completeLocally), `Changes prérequis non terminés : ${selection.prerequisites.filter(item => !item.completeLocally).map(item => item.change).join(', ')}`);
}

function gitJson(root, ref, path) {
  try { return JSON.parse(execFileSync('git', ['show', `${ref}:${path}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })); }
  catch (error) {
    if (!error.status) throw error;
    return undefined;
  }
}

export function runCli(args, root = repository) {
  const command = args[0] ?? 'check';
  let reference = 'HEAD';
  const json = args.includes('--json');
  let rest = args.slice(1).filter(arg => arg !== '--json');
  if (command === 'check' && rest[0] === '--base-ref' && rest.length === 2) {
    reference = rest[1];
    requireCondition(/^[a-zA-Z0-9][a-zA-Z0-9/_.-]*$/.test(reference), 'Référence Git de comparaison invalide.');
    execFileSync('git', ['rev-parse', '--verify', `${reference}^{commit}`], { cwd: root, stdio: 'ignore' });
    rest = [];
  }
  requireCondition(['check', 'resolve', 'verify', 'list'].includes(command) &&
    (['resolve', 'verify'].includes(command) ? rest.length === 1 : rest.length === 0),
    'Usage : node scripts/tickets.mjs check [--base-ref origin/main] | list [--json] | resolve T-1 [--json] | verify T-1 [--json]');
  const catalogue = JSON.parse(readFileSync(join(root, cataloguePath), 'utf8'));
  const previous = gitJson(root, reference, cataloguePath) ?? gitJson(root, 'HEAD', seedPath);
  if (command === 'check') {
    validateCatalogue(catalogue, { root, previous });
    return `${catalogue.tickets.length} tickets : registre, couverture, identités et branches vérifiés ; initialisation ${catalogue.initializationActive ? 'active' : 'terminée'}.`;
  }
  if (command === 'list') {
    validateCatalogue(catalogue, { root, previous });
    const rows = catalogue.tickets.map(ticket => ({ ticket: `T-${ticket.id}`, priority: ticket.priority,
      branch: catalogue.initializationActive ? ticket.branchDuringInitialization : ticket.branchAfterInitialization,
      title: ticket.title }));
    return json ? JSON.stringify(rows, null, 2) : rows.map(row => `${row.ticket} (${row.priority}) ${row.branch} — ${row.title}`).join('\n');
  }
  const selection = resolveTicket(catalogue, rest[0], { root, previous });
  if (command === 'verify') {
    const branch = execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim();
    verifySelection(selection, branch);
  }
  if (json) return JSON.stringify(selection, null, 2);
  return [
    `${selection.ticket} (${selection.priority}) : ${selection.title}`,
    `Change : ${selection.change}`,
    `Branche : ${selection.branch}`,
    `Étapes : ${selection.tasks.map(task => `${task.number}${task.done ? ' (terminée)' : ''}`).join(', ')}`,
    `Prérequis non terminés : ${selection.unfinishedDependencies.join(', ') || 'aucun ticket'}`,
    `Changes prérequis : ${selection.prerequisites.map(item => `${item.change} (${item.completeLocally ? 'terminé localement' : 'non terminé'})`).join(', ') || 'aucun'}`,
    selection.limitation,
    ...(command === 'verify' ? ['Précontrôle local réussi.'] : []),
  ].join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(runCli(process.argv.slice(2))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
