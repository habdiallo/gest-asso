import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const defaultPolicy = {
  allowedEnvironments: ['local', 'integration', 'staging', 'recette'],
  forbiddenEnvironments: ['production', 'prod'],
  sensitiveKeys: ['password', 'token', 'authorization', 'cookie', 'secret', 'privatekey', 'email', 'phone'],
  sensitiveTextPatterns: ['Bearer\\s+[A-Za-z0-9._~-]+', 'eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9._-]+\\.[A-Za-z0-9._-]+'],
};

export function loadPolicy(root) {
  const path = join(root, 'qa/policy.json');
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : defaultPolicy;
}

export function assertSafeEnvironment(environment, policy = defaultPolicy) {
  if (!environment?.name || !environment?.version) throw new Error('Environnement et version obligatoires pour un run QA.');
  const name = String(environment.name).toLowerCase();
  if (policy.forbiddenEnvironments.includes(name) || !policy.allowedEnvironments.includes(name)) {
    throw new Error(`Environnement refusé pour une campagne QA : ${environment.name}`);
  }
  if (environment.safeForTestData !== true) {
    throw new Error('L environnement doit être explicitement marqué safeForTestData=true.');
  }
}

function sensitiveKey(key, policy) {
  const normalized = String(key).toLowerCase().replace(/[-_]/g, '');
  return policy.sensitiveKeys.some(item => normalized.includes(String(item).toLowerCase().replace(/[-_]/g, '')));
}

export function redactText(value, policy = defaultPolicy) {
  let output = String(value ?? '');
  for (const pattern of policy.sensitiveTextPatterns ?? []) output = output.replace(new RegExp(pattern, 'gi'), '[REDACTED]');
  output = output.replace(/(password|token|authorization|cookie|secret)\s*[:=]\s*[^\s,;]+/gi, '$1=[REDACTED]');
  return output;
}

export function redactValue(value, policy = defaultPolicy, key = '') {
  if (sensitiveKey(key, policy)) return '[REDACTED]';
  if (typeof value === 'string') return redactText(value, policy);
  if (Array.isArray(value)) return value.map(item => redactValue(item, policy));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, redactValue(childValue, policy, childKey)]));
  }
  return value;
}

export function redactEvidence(evidence, policy) {
  return redactValue(evidence ?? [], policy);
}
