const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const files = [
  path.join(root, 'README.md'),
  ...fs
    .readdirSync(path.join(root, 'docs'))
    .filter((file) => file.endsWith('.md'))
    .map((file) => path.join(root, 'docs', file)),
];
const volatileReference = /\b(?:T-\d+|US-[A-Z]+-\d+)\b/;
const failures = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (volatileReference.test(content)) {
    failures.push(path.relative(root, file));
  }
}

if (failures.length > 0) {
  console.error(`Volatile work references found in: ${failures.join(', ')}`);
  process.exit(1);
}

console.log(`Stable frontend documentation verified (${files.length} files).`);
