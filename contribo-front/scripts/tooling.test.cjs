const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ESLint } = require('eslint');
const { dirname, join, resolve } = require('node:path');
const { readFileSync, readdirSync } = require('node:fs');

const eslint = new ESLint();

test('le socle refuse une dépendance vers une feature, par alias et chemin relatif', async () => {
  for (const filePath of ['src/app/core/example.ts', 'src/app/shared/example.ts']) {
    for (const imported of [
      '@features/home/pages/home-page',
      '../../features/home/pages/home-page',
    ]) {
      const [result] = await eslint.lintText(
        `import type { HomePage } from '${imported}'; export type Example = HomePage;`,
        { filePath },
      );
      assert.ok(result.messages.some((message) => message.ruleId === 'no-restricted-imports'));
    }
  }
});

test('une feature refuse une dépendance vers une autre feature par alias', async () => {
  const [result] = await eslint.lintText(
    "import type { HomePage } from '@features/home/pages/home-page'; export type Example = HomePage;",
    { filePath: 'src/app/features/members/example.ts' },
  );
  assert.ok(result.messages.some((message) => message.ruleId === 'no-restricted-imports'));
});

test('une page de feature peut utiliser un élément neutre partagé', async () => {
  const [result] = await eslint.lintText(
    "import type { SharedType } from '@shared/example'; export type Example = SharedType;",
    { filePath: 'src/app/features/home/example.ts' },
  );
  assert.equal(result.errorCount, 0, JSON.stringify(result.messages));
});

test('le lint signale un label sans contrôle et un composant sans OnPush', async () => {
  const [template] = await eslint.lintText('<label>Nom</label>', {
    filePath: 'src/app/features/home/pages/example.html',
  });
  assert.ok(
    template.messages.some(
      (message) => message.ruleId === '@angular-eslint/template/label-has-associated-control',
    ),
  );
  const [component] = await eslint.lintText(
    "import { Component } from '@angular/core'; @Component({selector: 'app-example', template: ''}) export class Example {}",
    { filePath: 'src/app/features/home/pages/example.ts' },
  );
  assert.ok(
    component.messages.some(
      (message) => message.ruleId === '@angular-eslint/prefer-on-push-component-change-detection',
    ),
  );
});

test('le code généré reste exclu du lint', async () => {
  assert.equal(
    await eslint.isPathIgnored('src/app/core/api/generated/api/example.service.ts'),
    true,
  );
});

test('la frontière API est le seul point qui connaît le client généré', () => {
  const sourceRoot = resolve('src');
  const sourceFiles = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'generated') {
          visit(path);
        }
      } else if (entry.name.endsWith('.ts')) {
        sourceFiles.push(path);
      }
    }
  };
  visit(sourceRoot);

  const directImports = sourceFiles.flatMap((path) => {
    const source = readFileSync(path, 'utf8');
    if (path.endsWith('core/api/index.ts')) {
      return [];
    }
    return source.includes("'@api'") || source.includes("'@api/") || source.includes('/generated/')
      ? [path]
      : [];
  });

  assert.deepEqual(directImports, []);
});

test('le proxy Angular couvre les chemins API imbriqués sans réécriture', async () => {
  // Vérifier les motifs après leur normalisation par le builder Angular installé.
  const { loadProxyConfiguration } = require(
    join(dirname(require.resolve('@angular/build')), 'utils/load-proxy-config.js'),
  );
  const configuration = await loadProxyConfiguration(process.cwd(), 'proxy.conf.json');
  const matches = (path) =>
    Object.entries(configuration).filter(([pattern]) => new RegExp(pattern).test(path));
  for (const path of [
    '/api/v1/auth/login',
    '/api/v1/members/identifiant',
    '/api/v1/campaigns/id/dues?page=2',
  ]) {
    const entries = matches(path);
    assert.equal(entries.length, 1, path);
    assert.equal(entries[0][1].rewrite, undefined, 'Le chemin contractuel doit être conservé.');
  }
  assert.equal(matches('/assets/logo.svg').length, 0);
});
