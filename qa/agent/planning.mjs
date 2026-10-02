import { stableId } from './utils.mjs';

const smokeFeatures = new Set(['auth', 'dashboard', 'shell']);

function syntheticScenario(feature, inventory) {
  const route = inventory.routes.find(item => item.feature === feature);
  return {
    scenarioId: stableId('scenario', feature, 'availability'),
    feature,
    name: `Disponibilité de ${feature}`,
    context: 'Vérifier que la fonctionnalité découverte est accessible dans le périmètre du run.',
    preconditions: ['Environnement de recette déclaré et accessible'],
    data: [],
    steps: [`Ouvrir la route ${route?.path ?? feature}`, 'Observer le chargement et l état fonctionnel'],
    expected: 'La fonctionnalité est accessible et son état est explicite.',
    priority: 'P1',
    status: 'Planned',
    references: route?.source ? [route.source] : [],
    roles: inventory.roles,
  };
}

function selectedFeatures(inventory, profile, targetFeatures = []) {
  const names = inventory.features.map(feature => feature.name);
  if (profile === 'smoke') return names.filter(name => smokeFeatures.has(name));
  if (profile === 'targeted') {
    const selected = new Set(targetFeatures);
    for (const dependency of inventory.dependencies) if (selected.has(dependency.feature)) dependency.dependsOn.forEach(item => selected.add(item));
    return names.filter(name => selected.has(name));
  }
  return names;
}

export function buildPlan({ inventory, profile = 'smoke', targetFeatures = [] }) {
  const features = selectedFeatures(inventory, profile, targetFeatures);
  const scenarios = inventory.planScenarios.filter(scenario => features.includes(scenario.feature));
  for (const feature of features) {
    if (!scenarios.some(scenario => scenario.feature === feature)) scenarios.push(syntheticScenario(feature, inventory));
  }
  const covered = new Set(scenarios.map(scenario => scenario.feature));
  return {
    profile,
    generatedAt: new Date().toISOString(),
    features,
    scenarios: scenarios.sort((a, b) => a.scenarioId.localeCompare(b.scenarioId)),
    coverage: {
      coveredFeatures: [...covered].sort(),
      uncoveredFeatures: inventory.features.map(feature => feature.name).filter(name => !covered.has(name)).sort(),
      reasons: inventory.features.filter(feature => !covered.has(feature.name)).map(feature => ({ feature: feature.name, reason: `Hors périmètre du profil ${profile}` })),
    },
  };
}
