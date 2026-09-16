import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { parseTicketId, readTaskDocument, validateCatalogue, resolveTicket, verifySelection, runCli } from '../scripts/tickets.mjs';

function put(root, path, content) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), content);
}

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'contribo-tickets-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const frontend = 'frontend-tickets-mvp-association';
  const catalogue = { schemaVersion: 1, tracker: 'repository-local', status: 'active', initializationActive: true,
    nextTicketId: 4, prerequisiteChanges: ['initialisation-front-features'], historicalInitializationTasks: ['1.1', '1.2', '1.4'], tickets: [] };
  for (const [id, slug, change, step, scope, type, dependencies] of [
    [1, 'jetons-design', frontend, '1.3', 'front', 'feat', []],
    [2, 'themes-visuels', frontend, '1.5', 'front', 'feat', [1]],
    [3, 'authentification', 'backend-authentication', '2.1', 'back', 'fix', []],
  ]) {
    catalogue.tickets.push({ id, title: `Evolution ${slug}`, priority: 'P0', scope, type, slug, change, tasks: [step], dependencies,
      planningStatus: 'planned', branchDuringInitialization: `${scope}/${type}-000-${slug}`,
      branchAfterInitialization: `${scope}/${type}-${id}-${slug}` });
  }
  put(root, `openspec/changes/${frontend}/tasks.md`, '- [x] 1.1 Stack\n- [x] 1.2 Structure\n- [ ] 1.3 [T-1] Design\n- [x] 1.4 API\n- [ ] 1.5 [T-2] Thèmes\n');
  put(root, 'openspec/changes/backend-authentication/tasks.md', '- [ ] 2.1 [T-3] Authentification\n');
  put(root, 'openspec/changes/initialisation-front-features/tasks.md', '- [x] 1.1 Outillage\n');
  put(root, 'openspec/tickets.json', JSON.stringify(catalogue));
  return { root, catalogue, frontend, previous: structuredClone(catalogue) };
}

function editTask(root, change, transform) {
  const path = join(root, 'openspec/changes', change, 'tasks.md');
  writeFileSync(path, transform(readFileSync(path, 'utf8')));
}

test('T-1 resolves to its own step and phase-aware branch without changing files', t => {
  const { root, catalogue, frontend } = fixture(t);
  const before = readFileSync(join(root, `openspec/changes/${frontend}/tasks.md`));
  const selection = resolveTicket(catalogue, 'T-1', { root });
  assert.equal(selection.branch, 'front/feat-000-jetons-design');
  assert.deepEqual(selection.tasks.map(task => task.number), ['1.3']);
  assert.equal(selection.prerequisites[0].completeLocally, true);
  const finishedPhase = structuredClone(catalogue);
  finishedPhase.initializationActive = false;
  assert.equal(resolveTicket(finishedPhase, 1, { root }).branch, 'front/feat-1-jetons-design');
  assert.equal(catalogue.initializationActive, true);
  assert.deepEqual(readFileSync(join(root, `openspec/changes/${frontend}/tasks.md`)), before);
});

test('rejects unknown or ambiguous identifiers and unsafe change paths', t => {
  const { root, catalogue } = fixture(t);
  for (const value of ['000', 'T-01', 'T-0', '2.1', 'T-1 T-2', '--all', '9007199254740992']) {
    assert.throws(() => parseTicketId(value), /Ticket invalide/);
  }
  assert.throws(() => resolveTicket(catalogue, 'T-99', { root }), /Ticket inconnu/);
  catalogue.tickets[0].change = '../../outside';
  assert.throws(() => validateCatalogue(catalogue, { root }), /Change invalide/);
});

test('rejects duplicate tickets, inconsistent branches and initialization branch collisions', t => {
  const { root, catalogue } = fixture(t);
  const duplicate = structuredClone(catalogue);
  duplicate.tickets.push(structuredClone(duplicate.tickets[0]));
  assert.throws(() => validateCatalogue(duplicate, { root }), /Identifiant invalide ou dupliqué/);
  const mismatch = structuredClone(catalogue);
  mismatch.tickets[0].branchDuringInitialization = 'main';
  assert.throws(() => validateCatalogue(mismatch, { root }), /Branche incohérente/);
  const collision = structuredClone(catalogue);
  collision.tickets[1].slug = collision.tickets[0].slug;
  collision.tickets[1].branchDuringInitialization = collision.tickets[0].branchDuringInitialization;
  collision.tickets[1].branchAfterInitialization = 'front/feat-2-jetons-design';
  assert.throws(() => validateCatalogue(collision, { root }), /Branche incohérente ou dupliquée/);
});

test('checks covered steps, unique ownership, annotations and unassigned open work', t => {
  const { root, catalogue, frontend } = fixture(t);
  const missing = structuredClone(catalogue);
  missing.tickets[0].tasks = ['8.1'];
  assert.throws(() => validateCatalogue(missing, { root }), /Étape absente/);
  const duplicate = structuredClone(catalogue);
  duplicate.tickets[1].tasks.push('1.3');
  assert.throws(() => validateCatalogue(duplicate, { root }), /plusieurs tickets/);
  editTask(root, frontend, text => text.replace('[T-1]', '[T-2]'));
  assert.throws(() => validateCatalogue(catalogue, { root }), /Repère incorrect/);
  editTask(root, frontend, text => text.replace('1.3 [T-2]', '1.3 [T-1]') + '- [ ] 5.1 Travail nouveau\n');
  assert.throws(() => validateCatalogue(catalogue, { root }), /Étape ouverte sans ticket/);
});

test('rejects missing, cyclic and cancelled prerequisites', t => {
  const { root, catalogue } = fixture(t);
  const missing = structuredClone(catalogue);
  missing.tickets[1].dependencies = [99];
  assert.throws(() => validateCatalogue(missing, { root }), /Dépendance absente/);
  const cycle = structuredClone(catalogue);
  cycle.tickets[0].dependencies = [2];
  assert.throws(() => validateCatalogue(cycle, { root }), /Cycle de dépendances/);
  const cancelled = structuredClone(catalogue);
  cancelled.tickets[0].planningStatus = 'cancelled';
  assert.throws(() => validateCatalogue(cancelled, { root }), /Dépendance annulée/);
});

test('verify refuses another branch and waits for task completion, including transitive prerequisites', t => {
  const { root, catalogue, frontend } = fixture(t);
  let selection = resolveTicket(catalogue, 'T-2', { root });
  assert.throws(() => verifySelection(selection, 'main'), /Branche incorrecte.*front\/feat-000-themes-visuels/);
  assert.throws(() => verifySelection(selection, selection.branch), /Prérequis non terminés.*T-1/);
  editTask(root, frontend, text => text.replace('[ ] 1.3', '[x] 1.3'));
  selection = resolveTicket(catalogue, 'T-2', { root });
  assert.doesNotThrow(() => verifySelection(selection, selection.branch));
  catalogue.tickets[2].dependencies = [2];
  editTask(root, frontend, text => text.replace('[x] 1.3', '[ ] 1.3'));
  selection = resolveTicket(catalogue, 'T-3', { root });
  assert.deepEqual(selection.unfinishedDependencies, ['T-1', 'T-2']);
});

test('verify does not mistake unfinished global initialization for a satisfied prerequisite', t => {
  const { root, catalogue } = fixture(t);
  editTask(root, 'initialisation-front-features', text => text.replace('[x]', '[ ]'));
  const selection = resolveTicket(catalogue, 'T-1', { root });
  assert.throws(() => verifySelection(selection, selection.branch), /Changes prérequis non terminés/);
});

test('cancelled ticket stays reserved and cannot be implemented', t => {
  const { root, catalogue, previous } = fixture(t);
  catalogue.tickets[2].planningStatus = 'cancelled';
  assert.doesNotThrow(() => validateCatalogue(catalogue, { root, previous }));
  const selection = resolveTicket(catalogue, 'T-3', { root, previous });
  assert.throws(() => verifySelection(selection, selection.branch), /Ticket annulé/);
});

test('preserves identity even if a renumbering updates branches, annotations and dependencies consistently', t => {
  const { root, catalogue, previous, frontend } = fixture(t);
  catalogue.tickets[0].id = 2;
  catalogue.tickets[0].branchAfterInitialization = 'front/feat-2-jetons-design';
  catalogue.tickets[1].id = 1;
  catalogue.tickets[1].branchAfterInitialization = 'front/feat-1-themes-visuels';
  catalogue.tickets[1].dependencies = [2];
  editTask(root, frontend, text => text.replace(/\[T-(1|2)\]/g, (_, id) => `[T-${id === '1' ? '2' : '1'}]`));
  assert.doesNotThrow(() => validateCatalogue(catalogue, { root }));
  assert.throws(() => validateCatalogue(catalogue, { root, previous }), /Identité\/branche réattribuée/);
});

test('cannot delete an existing highest ticket or reduce the allocation counter', t => {
  const { root, catalogue, previous } = fixture(t);
  const deleted = structuredClone(catalogue);
  deleted.tickets.pop();
  deleted.nextTicketId = 3;
  assert.throws(() => validateCatalogue(deleted, { root, previous }), /Ticket supprimé\/renuméroté/);
  catalogue.nextTicketId = 3;
  assert.throws(() => validateCatalogue(catalogue, { root, previous }), /nextTicketId/);
});

test('allows new technical steps in the same ticket and allocates globally across scopes', t => {
  const { root, catalogue, previous, frontend } = fixture(t);
  catalogue.tickets[0].tasks.push('1.3.1');
  editTask(root, frontend, text => text + '- [ ] 1.3.1 [T-1] Test du ticket\n');
  catalogue.tickets.push({ ...structuredClone(catalogue.tickets[2]), id: 4, title: 'Documentation', scope: 'docs', type: 'chore',
    slug: 'documentation', change: 'documentation', tasks: ['1.1'], dependencies: [],
    branchDuringInitialization: 'docs/chore-000-documentation', branchAfterInitialization: 'docs/chore-4-documentation' });
  catalogue.nextTicketId = 5;
  put(root, 'openspec/changes/documentation/tasks.md', '- [ ] 1.1 [T-4] Documentation\n');
  assert.doesNotThrow(() => validateCatalogue(catalogue, { root, previous }));
  assert.equal(resolveTicket(catalogue, 'T-4', { root }).branch, 'docs/chore-000-documentation');
});

test('requires historical checked initialization tasks to remain checked and unassigned', t => {
  const { root, catalogue, frontend, previous } = fixture(t);
  editTask(root, frontend, text => text.replace('[x] 1.1', '[ ] 1.1'));
  assert.throws(() => validateCatalogue(catalogue, { root, previous }), /Étape ouverte sans ticket|historique 000/);
});

test('reads completed and pending work from a unique archived OpenSpec change', t => {
  const { root, catalogue, frontend } = fixture(t);
  mkdirSync(join(root, 'openspec/changes/archive'), { recursive: true });
  renameSync(join(root, 'openspec/changes', frontend), join(root, 'openspec/changes/archive', `2026-09-16-${frontend}`));
  assert.equal(resolveTicket(catalogue, 'T-1', { root }).tasks[0].done, false);
  put(root, `openspec/changes/archive/2026-09-17-${frontend}/tasks.md`, '- [ ] 1.3 [T-1] Ambigu\n');
  assert.throws(() => readTaskDocument(root, frontend), /archive ambiguë/);
});

test('CLI consultation and failed verification leave files and real fixture branch intact', t => {
  const { root, frontend } = fixture(t);
  execFileSync('git', ['init', '--initial-branch=main', root], { stdio: 'ignore' });
  const paths = ['openspec/tickets.json', `openspec/changes/${frontend}/tasks.md`];
  const before = paths.map(path => readFileSync(join(root, path)));
  assert.match(runCli(['check'], root), /3 tickets/);
  assert.equal(JSON.parse(runCli(['resolve', 'T-1', '--json'], root)).branch, 'front/feat-000-jetons-design');
  assert.equal(JSON.parse(runCli(['list', '--json'], root)).length, 3);
  assert.throws(() => runCli(['verify', 'T-1'], root), /Branche incorrecte/);
  assert.equal(execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim(), 'main');
  paths.forEach((path, index) => assert.deepEqual(readFileSync(join(root, path)), before[index]));
});
