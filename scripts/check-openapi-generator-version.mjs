import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const frontPath = 'contribo-front/openapitools.json';
const backPath = 'contribo-back/pom.xml';

function readFrontVersion(root) {
  const path = join(root, frontPath);
  let parsed;
  try { parsed = JSON.parse(readFileSync(path, 'utf8')); }
  catch { throw new Error(`Fichier illisible ou JSON invalide : ${frontPath}`); }
  const version = parsed?.['generator-cli']?.version;
  if (typeof version !== 'string' || !version.trim()) {
    throw new Error(`generator-cli.version absent ou vide dans ${frontPath}`);
  }
  return version.trim();
}

function readBackVersion(root) {
  const path = join(root, backPath);
  let content;
  try { content = readFileSync(path, 'utf8'); }
  catch { throw new Error(`Fichier illisible : ${backPath}`); }
  const match = content.match(/<openapi-generator\.version>([^<]*)<\/openapi-generator\.version>/);
  const version = match?.[1]?.trim();
  if (!version) {
    throw new Error(`openapi-generator.version absent ou vide dans ${backPath}`);
  }
  return version;
}

export function checkVersions(root = repository) {
  const frontVersion = readFrontVersion(root);
  const backVersion = readBackVersion(root);
  if (frontVersion !== backVersion) {
    throw new Error(
      `Versions du générateur OpenAPI divergentes : ${frontPath} (${frontVersion}) != ${backPath} (${backVersion}). `
      + 'Aligner les deux versions dans la même PR avant toute génération.',
    );
  }
  return { frontVersion, backVersion };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { frontVersion } = checkVersions();
    console.log(`Versions du générateur OpenAPI alignées : ${frontVersion}.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
