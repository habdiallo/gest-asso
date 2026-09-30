import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { checkVersions } from '../scripts/check-openapi-generator-version.mjs';

function put(root, path, content) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), content);
}

function fixture(t, { frontVersion = '7.25.0', backVersion = '7.25.0' } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'contribo-openapi-version-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  put(root, 'contribo-front/openapitools.json', JSON.stringify({
    'generator-cli': { version: frontVersion },
  }));
  put(root, 'contribo-back/pom.xml', `<?xml version="1.0"?>\n<project>\n    <properties>\n        <openapi-generator.version>${backVersion}</openapi-generator.version>\n    </properties>\n</project>\n`);
  return root;
}

test('matching versions pass and are returned', t => {
  const root = fixture(t, { frontVersion: '7.25.0', backVersion: '7.25.0' });
  assert.deepEqual(checkVersions(root), { frontVersion: '7.25.0', backVersion: '7.25.0' });
});

test('diverging versions fail with an explicit message', t => {
  const root = fixture(t, { frontVersion: '7.25.0', backVersion: '7.15.0' });
  assert.throws(() => checkVersions(root), /divergentes.*7\.25\.0.*7\.15\.0/s);
});

test('missing frontend version fails explicitly', t => {
  const root = mkdtempSync(join(tmpdir(), 'contribo-openapi-version-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  put(root, 'contribo-front/openapitools.json', JSON.stringify({ 'generator-cli': {} }));
  put(root, 'contribo-back/pom.xml', '<project><properties><openapi-generator.version>7.25.0</openapi-generator.version></properties></project>');
  assert.throws(() => checkVersions(root), /generator-cli\.version absent/);
});

test('missing backend version fails explicitly', t => {
  const root = mkdtempSync(join(tmpdir(), 'contribo-openapi-version-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  put(root, 'contribo-front/openapitools.json', JSON.stringify({ 'generator-cli': { version: '7.25.0' } }));
  put(root, 'contribo-back/pom.xml', '<project><properties></properties></project>');
  assert.throws(() => checkVersions(root), /openapi-generator\.version absent/);
});

test('missing frontend file fails explicitly', t => {
  const root = mkdtempSync(join(tmpdir(), 'contribo-openapi-version-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  put(root, 'contribo-back/pom.xml', '<project><properties><openapi-generator.version>7.25.0</openapi-generator.version></properties></project>');
  assert.throws(() => checkVersions(root), /Fichier illisible ou JSON invalide/);
});
