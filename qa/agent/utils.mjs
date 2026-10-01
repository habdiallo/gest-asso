import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export function sha256(value) {
  return createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
}

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[`*_#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugify(value) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'item';
}

export function stableId(prefix, ...parts) {
  return `${prefix}-${sha256(parts.map(normalizeText).join('|')).slice(0, 12)}`;
}

export function walkFiles(root, { extensions = [], ignored = ['node_modules', '.git', 'dist'] } = {}) {
  if (!existsSync(root)) return [];
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (ignored.includes(entry.name)) continue;
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(path, { extensions, ignored }));
    else if (!extensions.length || extensions.includes(entry.name.split('.').pop())) files.push(path);
  }
  return files.sort();
}

export function readText(path) {
  return readFileSync(path, 'utf8');
}

export function readJson(path, fallback = undefined) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readText(path));
}

export function relativePath(root, path) {
  return relative(root, path).replaceAll('\\', '/');
}

export function sourceReference(root, path, kind = 'source') {
  const content = readText(path);
  return { kind, path: relativePath(root, path), sha256: sha256(content) };
}

export function gitVersion(root) {
  try {
    const { execFileSync } = awaitImportChildProcess();
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return 'unversioned';
  }
}

function awaitImportChildProcess() {
  return requireChildProcess;
}

import * as requireChildProcess from 'node:child_process';

export function nowIso() {
  return new Date().toISOString();
}

export function unique(values) {
  return [...new Set(values)];
}

export function stableJson(value) {
  if (Array.isArray(value)) return value.map(stableJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableJson(value[key])]));
  }
  return value;
}

export function hashObject(value) {
  return sha256(stableJson(value));
}

export function isDirectory(path) {
  return existsSync(path) && statSync(path).isDirectory();
}
