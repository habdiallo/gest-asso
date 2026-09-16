const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');

const hookRoot = resolve(__dirname, '../.githooks');

function run(command, args, options = {}) {
  return spawnSync(command, args, { encoding: 'utf8', ...options });
}

function repository(t) {
  const directory = mkdtempSync(join(tmpdir(), 'contribo-workflow-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const git = (...args) => run('git', args, { cwd: directory });
  for (const args of [
    ['init', '--initial-branch=main'],
    ['config', '--local', 'user.name', 'Workflow Test'],
    ['config', '--local', 'user.email', 'workflow@example.invalid'],
    ['config', '--local', 'commit.gpgsign', 'false'],
    ['config', '--local', 'core.hooksPath', hookRoot],
  ]) {
    const result = git(...args);
    assert.equal(result.status, 0, result.stderr);
  }
  return { directory, git };
}

test('le hook refuse réellement un commit sur main et accepte la branche du ticket', (t) => {
  const { directory, git } = repository(t);
  writeFileSync(join(directory, 'ticket.txt'), 'Contenu du ticket\n');
  assert.equal(git('add', 'ticket.txt').status, 0);
  const refused = git('commit', '-m', 'Commit sur main');
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /Commit refusé/);
  assert.equal(git('switch', '-c', 'front/feat-123-ajout-membre').status, 0);
  const accepted = git('commit', '-m', 'feat(front): #123 ajouter un membre');
  assert.equal(accepted.status, 0, accepted.stderr);
  assert.equal(git('checkout', '--detach').status, 0);
  const detached = git('commit', '--allow-empty', '-m', 'HEAD détachée');
  assert.notEqual(detached.status, 0);
  assert.match(detached.stderr, /HEAD détachée/);
});

test('les branches provisoires et sans vrai numéro sont refusées au commit', (t) => {
  const { git } = repository(t);
  for (const branch of [
    'docs/chore-local-regles-git-openspec',
    'front/feat-0-ajout-membre',
    'front/feat-00-ajout-membre',
    'front/feat-0000-ajout-membre',
    'front/feat-001-ajout-membre',
    'front/feat-012-ajout-membre',
    'front/feat-US-MEM-001-ajout-membre',
    'feature/feat-123-ajout-membre',
    'front/feat-123-ajout_membre',
    'front/feat-123-Ajout-membre',
    'front/feat-123-ajout-membre-',
  ]) {
    assert.equal(git('symbolic-ref', 'HEAD', `refs/heads/${branch}`).status, 0);
    const result = git('commit', '--allow-empty', '-m', 'Commit invalide');
    assert.notEqual(result.status, 0, branch);
    assert.match(result.stderr, /Commit refusé/, branch);
  }
});

test('le hook refuse un vrai push HEAD:main et laisse le dépôt distant intact', (t) => {
  const { directory, git } = repository(t);
  const remote = join(directory, 'remote.git');
  assert.equal(run('git', ['init', '--bare', '--initial-branch=main', remote]).status, 0);
  assert.equal(git('remote', 'add', 'origin', remote).status, 0);
  assert.equal(git('switch', '-c', 'back/fix-124-refus-surpaiement').status, 0);
  assert.equal(git('commit', '--allow-empty', '-m', 'fix(back): #124 refuser le surpaiement').status, 0);
  const accepted = git('push', 'origin', 'back/fix-124-refus-surpaiement');
  assert.equal(accepted.status, 0, accepted.stderr);
  const refused = git('push', 'origin', 'HEAD:main');
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /Push refusé vers main/);
  assert.notEqual(run('git', ['--git-dir', remote, 'show-ref', '--verify', 'refs/heads/main']).status, 0);
});

test('000 autorise commits et pushes pendant l’initialisation, avec main toujours protégée', (t) => {
  const { directory, git } = repository(t);
  const remote = join(directory, 'remote.git');
  assert.equal(run('git', ['init', '--bare', '--initial-branch=main', remote]).status, 0);
  assert.equal(git('remote', 'add', 'origin', remote).status, 0);
  assert.equal(git('switch', '-c', 'docs/chore-000-regles-git-openspec').status, 0);
  const commit = git('commit', '--allow-empty', '-m', 'chore(docs): #000 initialiser les règles');
  assert.equal(commit.status, 0, commit.stderr);
  const push = git('push', 'origin', 'HEAD:docs/chore-000-regles-git-openspec');
  assert.equal(push.status, 0, push.stderr);
  const refused = git('push', 'origin', 'HEAD:main');
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /Push refusé vers main/);
});

test('un push contenant plusieurs refs est entièrement refusé si main est ciblée', () => {
  const result = run(join(hookRoot, 'pre-push'), [], {
    input: 'refs/heads/front/feat-123-ajout-membre abc refs/heads/front/feat-123-ajout-membre def\nHEAD abc refs/heads/main def\n',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Push refusé vers main/);
});

test('un refspec ne permet pas de publier main ou une branche provisoire sous un nom conforme', (t) => {
  const { directory, git } = repository(t);
  for (const source of ['main', 'docs/chore-local-workflow']) {
    assert.equal(git('symbolic-ref', 'HEAD', `refs/heads/${source}`).status, 0);
    for (const localRef of [`refs/heads/${source}`, 'HEAD']) {
      const result = run(join(hookRoot, 'pre-push'), [], {
        cwd: directory,
        input: `${localRef} abc refs/heads/docs/chore-125-regles-contribution def\n`,
      });
      assert.notEqual(result.status, 0, localRef);
      assert.match(result.stderr, /Push refusé depuis/);
    }
  }
});

test('les scopes et types autorisés passent, les noms non conformes sont refusés au push', () => {
  for (const branch of [
    'front/feat-123-ajout-membre',
    'back/fix-124-refus-surpaiement',
    'docs/chore-125-regles-contribution',
    'infra/test-126-controles-ci',
    'fullstack/refactor-127-cloture-campagne',
    'front/perf-128-liste-membres',
    'docs/chore-000-regles-git-openspec',
    'front/feat-000-socle-applicatif',
  ]) {
    const result = run(join(hookRoot, 'pre-push'), [], {
      input: `refs/heads/${branch} abc refs/heads/${branch} def\n`,
    });
    assert.equal(result.status, 0, result.stderr);
  }
  for (const branch of ['main', 'docs/chore-local-workflow', 'front/feat-0-membre', 'front/feat-00-membre', 'front/feat-0000-membre', 'front/feat-001-membre', 'front/feat-01-membre', 'front/feat-2-ajout_membre', 'unknown/feat-3-membre']) {
    const result = run(join(hookRoot, 'pre-push'), [], {
      input: `HEAD abc refs/heads/${branch} def\n`,
    });
    assert.notEqual(result.status, 0, branch);
  }
});

test('la suppression de main est refusée, celle des anciennes branches de travail reste possible', () => {
  const main = run(join(hookRoot, 'pre-push'), [], {
    input: '(delete) 000 refs/heads/main abc\n',
  });
  assert.notEqual(main.status, 0);
  const oldBranch = run(join(hookRoot, 'pre-push'), [], {
    input: '(delete) 000 refs/heads/ancienne-branche abc\n',
  });
  assert.equal(oldBranch.status, 0, oldBranch.stderr);
});

test('le contrôle CI accepte la PR conforme et refuse mauvaise cible, branche provisoire et injection', (t) => {
  const workflow = readFileSync(resolve(__dirname, '../.github/workflows/workflow-conventions.yml'), 'utf8');
  const runBlock = workflow.split('        run: |\n')[1];
  assert.ok(runBlock, 'Le workflow doit contenir le script de contrôle.');
  const script = runBlock.replace(/^          /gm, '');
  const directory = mkdtempSync(join(tmpdir(), 'contribo-ci-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const marker = join(directory, 'injection');
  for (const [branch, base, expected] of [
    ['front/feat-123-ajout-membre', 'main', 0],
    ['back/fix-124-refus-surpaiement', 'main', 0],
    ['docs/chore-000-regles-git-openspec', 'main', 0],
    ['front/feat-000-socle-applicatif', 'main', 0],
    ['docs/chore-000-regles-git-openspec', 'develop', 1],
    ['front/feat-123-ajout-membre', 'develop', 1],
    ['docs/chore-local-workflow', 'main', 1],
    ['front/feat-0-membre', 'main', 1],
    ['front/feat-00-membre', 'main', 1],
    ['front/feat-0000-membre', 'main', 1],
    ['front/feat-001-membre', 'main', 1],
    [`front/feat-123-$(touch ${marker})`, 'main', 1],
  ]) {
    const result = run('bash', ['-c', script], {
      env: { ...process.env, PR_BRANCH: branch, PR_BASE: base },
    });
    assert.equal(result.status, expected, result.stderr);
  }
  assert.equal(existsSync(marker), false, 'Une entrée de PR ne doit jamais être exécutée.');
});
