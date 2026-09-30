import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const MIN_NODE_MAJOR = 22;
export const MIN_JAVA_MAJOR = 11;
export const GENERATOR_KEY = 'contribo-api';

const frontendRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function parseJavaMajorVersion(output) {
  const match =
    output.match(/version\s+"(?:1\.)?(\d+)/i) ?? output.match(/(?:openjdk|java)\s+(\d+)/i);
  return match ? Number(match[1]) : null;
}

export function parseNodeMajorVersion(version) {
  const major = Number(version.split('.')[0]);
  return Number.isInteger(major) ? major : null;
}

export function readApiToolingConfig(root = frontendRoot) {
  const packageJson = readJson(join(root, 'package.json'));
  const packageLock = readJson(join(root, 'package-lock.json'));
  const openapiConfig = readJson(join(root, 'openapitools.json'));
  const wrapperVersion = packageJson.devDependencies?.['@openapitools/openapi-generator-cli'];
  const lockedWrapperVersion =
    packageLock.packages?.['']?.devDependencies?.['@openapitools/openapi-generator-cli'];
  const generatorVersion = openapiConfig['generator-cli']?.version;
  const generator = openapiConfig['generator-cli']?.generators?.[GENERATOR_KEY];

  if (!/^\d+\.\d+\.\d+$/.test(wrapperVersion ?? '')) {
    throw new Error('La version du wrapper OpenAPI doit être exacte dans package.json.');
  }
  if (wrapperVersion !== lockedWrapperVersion) {
    throw new Error('Le wrapper OpenAPI de package.json et package-lock.json doit être aligné.');
  }
  if (!/^\d+\.\d+\.\d+$/.test(generatorVersion ?? '')) {
    throw new Error('La version du générateur OpenAPI doit être exacte dans openapitools.json.');
  }
  if (!generator || generator.generatorName !== 'typescript-angular') {
    throw new Error(`La configuration ${GENERATOR_KEY} doit utiliser typescript-angular.`);
  }

  return { wrapperVersion, generatorVersion, generator };
}

function runJavaVersion() {
  const result = spawnSync('java', ['-version'], { encoding: 'utf8' });
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;

  if (result.error) {
    throw new Error(
      'Java est introuvable. Installez un JDK 11 ou plus récent avant la génération API.',
    );
  }
  if (result.status !== 0) {
    throw new Error(`Impossible de lire la version Java.\n${output.trim()}`);
  }

  return output;
}

export function checkRuntime({
  nodeVersion = process.versions.node,
  javaOutput = runJavaVersion(),
} = {}) {
  const nodeMajor = parseNodeMajorVersion(nodeVersion);
  if (nodeMajor === null || nodeMajor < MIN_NODE_MAJOR) {
    throw new Error(`Node.js ${MIN_NODE_MAJOR} ou plus récent est requis pour l'outillage API.`);
  }

  const javaMajor = parseJavaMajorVersion(javaOutput);
  if (javaMajor === null || javaMajor < MIN_JAVA_MAJOR) {
    throw new Error(`Java ${MIN_JAVA_MAJOR} ou plus récent est requis pour l'outillage API.`);
  }

  return { nodeMajor, javaMajor };
}

function resolveGeneratorCli() {
  try {
    return require.resolve('@openapitools/openapi-generator-cli/main.js');
  } catch {
    throw new Error('Le wrapper OpenAPI est absent. Exécutez npm ci depuis contribo-front/.');
  }
}

function checkTooling() {
  const config = readApiToolingConfig();
  const runtime = checkRuntime();
  resolveGeneratorCli();
  console.log(
    `Outillage API prêt: Node ${runtime.nodeMajor}, Java ${runtime.javaMajor}, ` +
      `wrapper ${config.wrapperVersion}, générateur ${config.generatorVersion}.`,
  );
}

function runGenerator(args) {
  checkTooling();
  const result = spawnSync(process.execPath, [resolveGeneratorCli(), ...args], {
    cwd: frontendRoot,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }
  process.exitCode = result.status ?? 1;
}

function main(command) {
  if (command === 'check') {
    checkTooling();
    return;
  }
  if (command === 'validate') {
    runGenerator(['validate', '-i', '../besoins/openapi.yaml']);
    return;
  }
  if (command === 'generate') {
    runGenerator(['generate', '--generator-key', GENERATOR_KEY]);
    return;
  }

  throw new Error('Commande attendue: check, validate ou generate.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main(process.argv[2]);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
