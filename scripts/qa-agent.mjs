#!/usr/bin/env node

import { join, resolve } from 'node:path';
import { runQa } from '../qa/agent/orchestrator.mjs';
import { preflight } from '../qa/agent/session.mjs';

function parseArgs(args) {
  const options = { root: process.cwd(), profile: 'smoke', targetFeatures: [], dryRun: true, browserCapabilities: [] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--root') options.root = resolve(args[++index]);
    else if (arg === '--profile') options.profile = args[++index];
    else if (arg === '--environment') options.environment = { name: args[++index], safeForTestData: true };
    else if (arg === '--version') options.appVersion = args[++index];
    else if (arg === '--out') options.outputRoot = resolve(options.root, args[++index]);
    else if (arg === '--plan') options.planPath = resolve(options.root, args[++index]);
    else if (arg === '--openapi') options.openapiPath = resolve(options.root, args[++index]);
    else if (arg === '--target') options.targetFeatures = args[++index].split(',').map(value => value.trim()).filter(Boolean);
    else if (arg === '--observations') {
      options.observations = resolve(options.root, args[++index]);
      options.dryRun = false;
    } else if (arg === '--run-id') options.runId = args[++index];
    else if (arg === '--resume') options.resumeFrom = resolve(options.root, args[++index]);
    else if (arg === '--preflight') options.preflight = true;
    else if (arg === '--url') options.appUrl = args[++index];
    else if (arg === '--browser-capabilities') options.browserCapabilities = args[++index].split(',').map(value => value.trim()).filter(Boolean);
    else throw new Error(`Option inconnue : ${arg}`);
  }
  if (!options.environment) throw new Error('--environment est obligatoire.');
  options.outputRoot ??= join(options.root, 'qa/runs');
  return options;
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.preflight) {
    const result = await preflight(options);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.status === 'ready' ? 0 : 2;
  } else {
    const result = runQa(options);
    console.log(JSON.stringify({ runId: result.runId, runDir: result.runDir, summary: result.summary }, null, 2));
  }
} catch (error) {
  console.error(`QA run refusé : ${error.message}`);
  process.exitCode = 1;
}
