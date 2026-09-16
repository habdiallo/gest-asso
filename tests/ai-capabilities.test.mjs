import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readlinkSync, existsSync, rmSync, symlinkSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { synchronize } from '../scripts/sync-ai-capabilities.mjs';

function put(root, path, content) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), content);
}

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'contribo-ai-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  put(root, '.claude/skills/review/SKILL.md', '---\nname: review\ndescription: Review a diff\n---\nRead references/context.md.\n');
  put(root, '.claude/skills/review/references/context.md', 'Nested project context.\n');
  put(root, '.claude/skills/review/assets/sample.bin', Buffer.from([0, 255, 42]));
  put(root, '.claude/agents/reviewer.md', '---\nname: reviewer\ndescription: "Review a diff"\ntools: Read, Grep\nmodel: inherit\n---\n\nReview without edits.\n');
  put(root, 'tooling/ai-agents.json', JSON.stringify({ reviewer: {
    claudeTools: ['Read', 'Grep'], copilotTools: ['read', 'search'], codexSandbox: 'read-only',
  } }));
  return root;
}

test('synchronizes complete resources and native profiles; second pass has no drift', t => {
  const root = fixture(t);
  const result = synchronize(root, { write: true });
  assert.equal(result.skills, 1);
  assert.equal(result.agents, 1);
  assert.ok(result.drift.length);
  for (const provider of ['.github', '.codex']) {
    assert.equal(readFileSync(join(root, provider, 'skills/review/references/context.md'), 'utf8'), 'Nested project context.\n');
    assert.deepEqual(readFileSync(join(root, provider, 'skills/review/assets/sample.bin')), Buffer.from([0, 255, 42]));
  }
  assert.equal(readlinkSync(join(root, '.agents/skills/review')), '../../.claude/skills/review');
  assert.match(readFileSync(join(root, '.codex/agents/reviewer.toml'), 'utf8'), /sandbox_mode = "read-only"/);
  assert.match(readFileSync(join(root, '.github/agents/reviewer.agent.md'), 'utf8'), /tools: \["read","search"\]/);
  assert.deepEqual(synchronize(root).drift, []);
});

test('check identifies changed and missing resources without repairing them', t => {
  const root = fixture(t);
  synchronize(root, { write: true });
  put(root, '.github/skills/review/references/context.md', 'Drift');
  rmSync(join(root, '.codex/skills/review/assets/sample.bin'));
  assert.deepEqual(synchronize(root).drift.sort(), ['.codex/skills/review/assets/sample.bin', '.github/skills/review/references/context.md']);
  assert.equal(readFileSync(join(root, '.github/skills/review/references/context.md'), 'utf8'), 'Drift');
  assert.equal(existsSync(join(root, '.codex/skills/review/assets/sample.bin')), false);
});

test('unknown agent adapter blocks all writes', t => {
  const root = fixture(t);
  put(root, 'tooling/ai-agents.json', '{}');
  assert.throws(() => synchronize(root, { write: true }), /Adaptation native manquante/);
  assert.equal(existsSync(join(root, '.github')), false);
});

test('Claude-only skill execution settings require an explicit adaptation', t => {
  const root = fixture(t);
  const path = join(root, '.claude/skills/review/SKILL.md');
  writeFileSync(path, readFileSync(path, 'utf8').replace('description: Review a diff', 'description: Review a diff\ncontext: fork'));
  assert.throws(() => synchronize(root, { write: true }), /Extension de skill à adapter.*context/);
  assert.equal(existsSync(join(root, '.github')), false);
});

test('unsupported Claude fields are rejected instead of losing their restrictions', t => {
  const root = fixture(t);
  const path = join(root, '.claude/agents/reviewer.md');
  writeFileSync(path, readFileSync(path, 'utf8').replace('model: inherit', 'model: inherit\npermissionMode: plan'));
  assert.throws(() => synchronize(root, { write: true }), /Champ agent non pris en charge.*permissionMode/);
  assert.equal(existsSync(join(root, '.codex')), false);
});

test('obsolete resources and profiles require explicit cleanup', t => {
  const root = fixture(t);
  synchronize(root, { write: true });
  put(root, '.github/skills/review/old.md', 'Preserve this file');
  put(root, '.codex/agents/old.toml', 'Preserve this profile');
  assert.throws(() => synchronize(root, { write: true }), /Entrées obsolètes/);
  assert.equal(readFileSync(join(root, '.github/skills/review/old.md'), 'utf8'), 'Preserve this file');
  assert.equal(existsSync(join(root, '.codex/agents/old.toml')), true);
});

test('refuses an unexpected discovery link', t => {
  const root = fixture(t);
  mkdirSync(join(root, '.agents/skills'), { recursive: true });
  symlinkSync('../../missing', join(root, '.agents/skills/review'));
  assert.throws(() => synchronize(root, { write: true }), /Lien à corriger explicitement/);
});

test('refuses a dangling native profile symlink before writing its target', t => {
  const root = fixture(t);
  mkdirSync(join(root, '.codex/agents'), { recursive: true });
  const outside = join(root, 'unexpected-output');
  symlinkSync(outside, join(root, '.codex/agents/reviewer.toml'));
  assert.throws(() => synchronize(root, { write: true }), /Fichier réel requis/);
  assert.equal(existsSync(outside), false);
});

test('CLI refuses generation on main', t => {
  const root = fixture(t);
  mkdirSync(join(root, 'scripts'));
  copyFileSync(new URL('../scripts/sync-ai-capabilities.mjs', import.meta.url), join(root, 'scripts/sync-ai-capabilities.mjs'));
  execFileSync('git', ['init', '--initial-branch=main', root], { stdio: 'ignore' });
  const result = spawnSync(process.execPath, ['scripts/sync-ai-capabilities.mjs', '--write'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /hors branche de travail conforme/);
  assert.equal(existsSync(join(root, '.github')), false);
});
