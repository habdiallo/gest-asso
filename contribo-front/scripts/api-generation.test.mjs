import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MIN_JAVA_MAJOR,
  MIN_NODE_MAJOR,
  checkRuntime,
  parseJavaMajorVersion,
  parseNodeMajorVersion,
  readApiToolingConfig,
} from './api-generation.mjs';

test('parse les versions Java usuelles', () => {
  assert.equal(parseJavaMajorVersion('openjdk version "21.0.8" 2025-07-15'), 21);
  assert.equal(parseJavaMajorVersion('openjdk 11.0.28 2025-07-15'), 11);
  assert.equal(parseJavaMajorVersion('java version "1.8.0_452"'), 8);
  assert.equal(parseJavaMajorVersion('sortie inconnue'), null);
});

test('parse et contrôle la version Node', () => {
  assert.equal(parseNodeMajorVersion('24.14.1'), 24);
  assert.equal(parseNodeMajorVersion('invalid'), null);
  assert.throws(
    () => checkRuntime({ nodeVersion: `${MIN_NODE_MAJOR - 1}.0.0`, javaOutput: 'openjdk 21.0.1' }),
    /Node.js/,
  );
});

test('accepte le runtime minimal documenté', () => {
  const result = checkRuntime({
    nodeVersion: `${MIN_NODE_MAJOR}.0.0`,
    javaOutput: `openjdk ${MIN_JAVA_MAJOR}.0.0`,
  });

  assert.deepEqual(result, { nodeMajor: MIN_NODE_MAJOR, javaMajor: MIN_JAVA_MAJOR });
});

test('les versions du wrapper et du générateur restent explicites et verrouillées', () => {
  const config = readApiToolingConfig();

  assert.match(config.wrapperVersion, /^\d+\.\d+\.\d+$/);
  assert.match(config.generatorVersion, /^\d+\.\d+\.\d+$/);
  assert.equal(config.generator.generatorName, 'typescript-angular');
});
