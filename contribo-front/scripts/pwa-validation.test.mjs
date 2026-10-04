import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const frontendRoot = resolve(import.meta.dirname, '..');

function readText(relativePath) {
  return readFileSync(resolve(frontendRoot, relativePath), 'utf8');
}

function readPngDimensions(relativePath) {
  const buffer = readFileSync(resolve(frontendRoot, relativePath));
  assert.equal(buffer.readUInt32BE(0), 0x89504e47, `${relativePath} must be a PNG`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test('publishes an installable Contribo manifest with required icons', () => {
  const manifest = JSON.parse(readText('public/manifest.webmanifest'));
  assert.equal(manifest.name, 'Contribo');
  assert.equal(manifest.short_name, 'Contribo');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.start_url, '/login');

  for (const size of [192, 512]) {
    const icon = manifest.icons.find((entry) => entry.sizes === `${size}x${size}`);
    assert.ok(icon, `manifest must declare a ${size}x${size} icon`);
    assert.equal(icon.type, 'image/png');
    assert.ok(existsSync(resolve(frontendRoot, 'public', icon.src)));
    assert.deepEqual(readPngDimensions(resolve('public', icon.src)), {
      width: size,
      height: size,
    });
  }
});

test('enables the service worker only for production builds', () => {
  const angularConfig = JSON.parse(readText('angular.json'));
  const build = angularConfig.projects['contribo-front'].architect.build.configurations;
  assert.equal(build.production.serviceWorker, 'ngsw-config.json');
  assert.equal(build.development.serviceWorker, undefined);

  const appConfig = readText('src/app/app.config.ts');
  assert.match(appConfig, /provideServiceWorker\('ngsw-worker\.js'/);
  assert.match(appConfig, /enabled: !isDevMode\(\)/);
});

test('does not configure API or private data caching', () => {
  const serviceWorkerConfig = JSON.parse(readText('ngsw-config.json'));
  assert.equal(serviceWorkerConfig.dataGroups, undefined);
  assert.doesNotMatch(JSON.stringify(serviceWorkerConfig), /\/api\//);
  assert.doesNotMatch(JSON.stringify(serviceWorkerConfig), /cookie|token|session/i);
});

test('keeps mobile zoom available while avoiding the small-input trigger', () => {
  const index = readText('src/index.html');
  const styles = readText('src/styles.css');
  assert.match(index, /name="viewport" content="width=device-width, initial-scale=1"/);
  assert.doesNotMatch(index, /maximum-scale\s*=/);
  assert.match(styles, /@media \(max-width: 47\.999rem\)/);
  assert.match(styles, /font-size: 16px/);
});
