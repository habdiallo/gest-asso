import { redactText, redactValue } from './security.mjs';

const statuses = new Set(['Réussi', 'Échoué', 'Bloqué', 'Non applicable']);

function fail(message) {
  throw new Error(`Observation QA invalide : ${message}`);
}

function normalizeObservation(value, key) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${key} doit être un objet.`);
  if (typeof value.scenarioId !== 'string' || !value.scenarioId.trim()) fail(`${key}.scenarioId est obligatoire.`);
  if (value.status !== undefined && !statuses.has(value.status)) fail(`${key}.status est invalide.`);
  if (value.status === undefined && value.expectedMatches !== undefined && typeof value.expectedMatches !== 'boolean') {
    fail(`${key}.expectedMatches doit être booléen.`);
  }
  if (value.actionTrace !== undefined) {
    if (!Array.isArray(value.actionTrace)) fail(`${key}.actionTrace doit être un tableau.`);
    for (const [index, step] of value.actionTrace.entries()) {
      if (!step || typeof step !== 'object' || typeof step.action !== 'string' || typeof step.result !== 'string') {
        fail(`${key}.actionTrace[${index}] doit décrire une action et son résultat.`);
      }
    }
  }
  return redactValue(value);
}

export function normalizeObservations(value) {
  if (value === undefined || value === null) return {};
  if (Array.isArray(value)) {
    return Object.fromEntries(value.map((item, index) => {
      const observation = normalizeObservation(item, `[${index}]`);
      return [observation.scenarioId, observation];
    }));
  }
  if (typeof value !== 'object') fail('la racine doit être un tableau ou un objet.');
  return Object.fromEntries(Object.entries(value).map(([scenarioId, item]) => {
    const observation = normalizeObservation({ scenarioId, ...item }, scenarioId);
    return [observation.scenarioId, observation];
  }));
}

export function redactObservationText(value) {
  return redactText(value);
}
