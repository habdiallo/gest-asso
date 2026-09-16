import {
  existsSync, lstatSync, mkdirSync, readFileSync, readdirSync,
  readlinkSync, symlinkSync, writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const validName = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function stat(path) {
  try { return lstatSync(path); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}

function entries(path) {
  return existsSync(path) ? readdirSync(path).sort() : [];
}

function tree(path, prefix = '') {
  const files = new Map();
  for (const name of entries(path)) {
    const child = join(path, name);
    const key = prefix ? `${prefix}/${name}` : name;
    const info = lstatSync(child);
    if (info.isSymbolicLink()) throw new Error(`Lien inattendu : ${child}`);
    if (info.isDirectory()) {
      for (const [nestedKey, bytes] of tree(child, key)) files.set(nestedKey, bytes);
    } else if (info.isFile()) files.set(key, readFileSync(child));
    else throw new Error(`Ressource non régulière : ${child}`);
  }
  return files;
}

// Deliberately limited portable agent schema; never silently drop Claude settings.
function agent(path, profile) {
  const info = stat(path);
  if (!info?.isFile() || info.isSymbolicLink()) throw new Error(`Fichier agent réel requis : ${path}`);
  const source = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`Frontmatter agent invalide : ${path}`);
  const fields = {};
  for (const line of match[1].split('\n')) {
    const field = line.match(/^(name|description|tools|model): (.+)$/);
    if (!field || Object.hasOwn(fields, field[1])) {
      throw new Error(`Champ agent non pris en charge : ${path} : ${line}`);
    }
    fields[field[1]] = field[2];
  }
  if (!validName.test(fields.name ?? '') || fields.model !== 'inherit') {
    throw new Error(`Agent : name valide et model: inherit requis : ${path}`);
  }
  // JSON-quoted descriptions are also valid YAML and avoid ambiguous YAML parsing.
  let description;
  try { description = JSON.parse(fields.description); }
  catch { throw new Error(`description doit être une chaîne entre guillemets JSON : ${path}`); }
  if (typeof description !== 'string' || !description.trim()) {
    throw new Error(`Description agent vide : ${path}`);
  }
  const permitted = ['claudeTools', 'copilotTools', 'codexSandbox'];
  if (!profile || Object.keys(profile).some(key => !permitted.includes(key)) ||
      !['read-only', 'workspace-write'].includes(profile.codexSandbox) ||
      ![profile.claudeTools, profile.copilotTools].every(list =>
        Array.isArray(list) && list.length && list.every(tool => typeof tool === 'string' && tool.trim()))) {
    throw new Error(`Adaptation native manquante/invalide dans tooling/ai-agents.json : ${fields.name}`);
  }
  if (fields.tools !== profile.claudeTools.join(', ')) {
    throw new Error(`Outils Claude divergents de l'adaptation : ${path}`);
  }
  const instructions = match[2].trim();
  if (!instructions) throw new Error(`Instructions agent vides : ${path}`);
  return { name: fields.name, description, instructions };
}

export function synchronize(root = repository, { write = false } = {}) {
  root = resolve(root);
  const plans = [];
  const drift = [];
  const obsolete = [];
  function checkDirectory(path) {
    const info = stat(path);
    if (info && (info.isSymbolicLink() || !info.isDirectory())) {
      throw new Error(`Dossier réel requis : ${path}`);
    }
  }
  function file(path, bytes) {
    const info = stat(path);
    if (info && (info.isSymbolicLink() || !info.isFile())) throw new Error(`Fichier réel requis : ${path}`);
    if (!existsSync(path) || !readFileSync(path).equals(Buffer.from(bytes))) {
      drift.push(relative(root, path));
      plans.push(() => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, bytes); });
    }
  }
  const source = join(root, '.claude/skills');
  checkDirectory(join(root, '.claude'));
  checkDirectory(source);
  const skills = entries(source);
  for (const skill of skills) {
    if (!validName.test(skill)) throw new Error(`Nom de skill invalide : ${skill}`);
    checkDirectory(join(source, skill));
    const files = tree(join(source, skill));
    const metadata = files.get('SKILL.md')?.toString();
    const header = metadata?.match(/^---\n([\s\S]*?)\n---\n/);
    if (!header || skill.length > 64 || !header[1].match(new RegExp(`^name: ${skill}$`, 'm')) ||
        !/^description: .+/m.test(header[1])) throw new Error(`SKILL.md invalide : ${skill}`);
    const portableFields = ['name', 'description', 'license', 'compatibility', 'metadata'];
    for (const line of header[1].split('\n')) {
      const field = line.match(/^([^\s#][^:]*):/);
      if (field && !portableFields.includes(field[1])) {
        throw new Error(`Extension de skill à adapter explicitement pour les trois outils : ${skill} : ${field[1]}`);
      }
    }
    if (/!`|\$\{CLAUDE_[A-Z_]+\}|\$ARGUMENTS\b/.test(metadata.slice(header[0].length))) {
      throw new Error(`Substitution/injection Claude à adapter explicitement : ${skill}`);
    }
    for (const provider of ['.codex', '.github']) {
      const destination = join(root, provider, 'skills', skill);
      checkDirectory(join(root, provider));
      checkDirectory(join(root, provider, 'skills'));
      checkDirectory(destination);
      for (const key of tree(destination).keys()) {
        if (!files.has(key)) obsolete.push(relative(root, join(destination, key)));
      }
      for (const [key, bytes] of files) file(join(destination, key), bytes);
    }
    checkDirectory(join(root, '.agents'));
    checkDirectory(join(root, '.agents/skills'));
    const link = join(root, '.agents/skills', skill);
    const target = relative(dirname(link), join(source, skill));
    const info = stat(link);
    if (info && (!info.isSymbolicLink() || readlinkSync(link) !== target)) {
      throw new Error(`Lien à corriger explicitement : ${relative(root, link)} → ${target}`);
    }
    if (!info) {
      drift.push(relative(root, link));
      plans.push(() => { mkdirSync(dirname(link), { recursive: true }); symlinkSync(target, link); });
    }
  }
  for (const location of ['.codex/skills', '.github/skills', '.agents/skills']) {
    for (const name of entries(join(root, location))) {
      if (!skills.includes(name)) obsolete.push(`${location}/${name}`);
    }
  }

  const profiles = JSON.parse(readFileSync(join(root, 'tooling/ai-agents.json'), 'utf8'));
  if (!profiles || Array.isArray(profiles) || typeof profiles !== 'object') {
    throw new Error('tooling/ai-agents.json doit contenir un objet de profils.');
  }
  checkDirectory(join(root, '.claude/agents'));
  const agents = entries(join(root, '.claude/agents'));
  const names = [];
  for (const filename of agents) {
    const name = filename.replace(/\.md$/, '');
    if (!validName.test(name) || filename !== `${name}.md`) throw new Error(`Nom d'agent invalide : ${filename}`);
    const profile = profiles[name];
    const parsed = agent(join(root, '.claude/agents', filename), profile);
    if (parsed.name !== name) throw new Error(`Identité agent différente du fichier : ${filename}`);
    names.push(name);
    const { description, instructions } = parsed;
    for (const provider of ['.codex', '.github']) {
      checkDirectory(join(root, provider));
      checkDirectory(join(root, provider, 'agents'));
    }
    file(join(root, '.github/agents', `${name}.agent.md`),
      `---\nname: ${name}\ndescription: ${JSON.stringify(description)}\ntools: ${JSON.stringify(profile.copilotTools)}\nuser-invocable: true\ndisable-model-invocation: true\n---\n\n${instructions}\n`);
    // TOML basic strings use JSON-compatible escaping for these text fields.
    file(join(root, '.codex/agents', `${name}.toml`),
      `# Generated by scripts/sync-ai-capabilities.mjs; edit the Claude source and adapter.\nname = ${JSON.stringify(name)}\ndescription = ${JSON.stringify(description)}\nsandbox_mode = ${JSON.stringify(profile.codexSandbox)}\ndeveloper_instructions = ${JSON.stringify(instructions)}\n`);
  }
  for (const name of Object.keys(profiles)) {
    if (!names.includes(name)) throw new Error(`Adaptation sans agent Claude : ${name}`);
  }
  for (const [location, extension] of [['.codex/agents', '.toml'], ['.github/agents', '.agent.md']]) {
    for (const filename of entries(join(root, location))) {
      if (!names.some(name => filename === `${name}${extension}`)) obsolete.push(`${location}/${filename}`);
    }
  }
  if (obsolete.length) throw new Error(`Entrées obsolètes à retirer explicitement après revue :\n${obsolete.join('\n')}`);
  if (write) for (const execute of plans) execute();
  return { skills: skills.length, agents: names.length, drift };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const option = process.argv[2] ?? '--check';
    if (!['--check', '--write'].includes(option) || process.argv.length > 3) {
      throw new Error('Usage : node scripts/sync-ai-capabilities.mjs [--check|--write]');
    }
    if (option === '--write') {
      const branch = execFileSync('git', ['branch', '--show-current'], { cwd: repository, encoding: 'utf8' }).trim();
      if (!/^(front|back|fullstack|docs|infra)\/(feat|fix|refactor|perf|test|chore)-([1-9][0-9]*|local)-[a-z0-9]+(-[a-z0-9]+)*$/.test(branch) ||
          (branch.includes('-local-') && !/^(docs|infra)\//.test(branch))) {
        throw new Error('Synchronisation refusée hors branche de travail conforme ; voir CONTRIBUTING.md.');
      }
    }
    const result = synchronize(repository, { write: option === '--write' });
    if (option === '--check' && result.drift.length) {
      throw new Error(`Parité IA en échec :\n${result.drift.join('\n')}\nExécuter node scripts/sync-ai-capabilities.mjs --write sur la branche du ticket.`);
    }
    console.log(`${result.skills} skills, ${result.agents} agent(s) : ${option === '--write' ? 'synchronisés' : 'parité vérifiée'}.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
