import { assertSafeEnvironment, loadPolicy } from './security.mjs';
import { requiresConfirmation } from './adapters.mjs';
import { gitVersion } from './utils.mjs';

const requiredBrowserCapabilities = new Set(['observe', 'interact']);

export function preflight({ root, environment, appVersion = gitVersion(root), appUrl, browserCapabilities = [] } = {}) {
  const policy = loadPolicy(root);
  const resolvedEnvironment = { ...environment, version: environment?.version ?? appVersion };
  assertSafeEnvironment(resolvedEnvironment, policy);
  const capabilities = new Set(browserCapabilities);
  const missingCapabilities = [...requiredBrowserCapabilities].filter(capability => !capabilities.has(capability));
  let validUrl = false;
  if (appUrl) {
    try {
      const parsed = new URL(appUrl);
      validUrl = ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      validUrl = false;
    }
  }
  const blockers = [];
  if (!validUrl) blockers.push('URL de l application absente ou invalide.');
  if (missingCapabilities.length) blockers.push(`Capacités navigateur manquantes : ${missingCapabilities.join(', ')}.`);
  return {
    status: blockers.length ? 'blocked' : 'ready',
    environment: resolvedEnvironment,
    appUrl: appUrl ?? null,
    browserCapabilities: [...capabilities],
    missingCapabilities,
    blockers,
  };
}

export function authorizeAction(scenario, { confirmed = false } = {}) {
  if (!requiresConfirmation(scenario)) return { allowed: true, confirmationRequired: false };
  return { allowed: confirmed === true, confirmationRequired: true };
}
