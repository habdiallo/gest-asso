#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const args = process.argv.slice(2);

function readOption(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

const referencePath = readOption('--reference');
const mirrorPath = readOption('--mirror');

if (!referencePath || !mirrorPath) {
  console.error('Usage: node scripts/check-deployment-repo-parity.mjs --reference <file> --mirror <file>');
  process.exit(2);
}

function normalize(content) {
  return content.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
}

try {
  const [reference, mirror] = await Promise.all([
    readFile(referencePath, 'utf8'),
    readFile(mirrorPath, 'utf8'),
  ]);

  if (normalize(reference) !== normalize(mirror)) {
    console.error(`Deployment files differ:\n- ${referencePath}\n- ${mirrorPath}`);
    process.exit(1);
  }

  console.log(`Deployment files are synchronized:\n- ${referencePath}\n- ${mirrorPath}`);
} catch (error) {
  console.error(`Unable to read deployment files: ${error.message}`);
  process.exit(2);
}
